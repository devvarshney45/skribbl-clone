// roomRoutes.js
// REST API endpoints for room management.
// Used by the frontend before the player connects via Socket.IO.

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');

const router = express.Router();

// ---------------------------------------------------------------------------
// Helper: generate a random 6-character uppercase room code (e.g. "AB3X7K")
// ---------------------------------------------------------------------------
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ---------------------------------------------------------------------------
// POST /api/rooms
// Creates a new room in the database.
// Body: { hostName, settings? }
// Returns: { roomId, roomCode }
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { hostName, settings, isPrivate = false } = req.body;

    // Validate input
    if (!hostName || hostName.trim() === '') {
      return res.status(400).json({ error: 'hostName is required' });
    }

    const roomId   = uuidv4();
    const hostId   = uuidv4(); // placeholder; real host ID assigned on socket join
    let   roomCode = generateRoomCode();

    // Make sure the generated code doesn't already exist
    let attempts = 0;
    while (attempts < 10) {
      const { rows } = await pool.query('SELECT id FROM rooms WHERE code = $1', [roomCode]);
      if (rows.length === 0) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    // Default settings merged with any provided overrides
    const defaultSettings = {
      maxPlayers: 8,
      rounds: 3,
      drawTime: 80,
      wordCount: 3,
      hints: 2,
    };
    const finalSettings = { ...defaultSettings, ...(settings || {}) };

    // Insert the new room into PostgreSQL
    await pool.query(`
      INSERT INTO rooms (id, code, host_id, settings, status, is_private)
      VALUES ($1, $2, $3, $4, 'waiting', $5)
    `, [roomId, roomCode, hostId, JSON.stringify(finalSettings), isPrivate]);

    console.log(`[API] Room created — code: ${roomCode}, id: ${roomId}, private: ${isPrivate}`);

    return res.status(201).json({ 
      roomId, 
      roomCode,
      inviteLink: `${process.env.CLIENT_URL}/?code=${roomCode}`
    });
  } catch (error) {
    console.error('[API Error] POST /api/rooms:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/rooms/:code
// Returns basic info about a room by its code.
// Used by the frontend to pre-validate join before connecting to socket.
// ---------------------------------------------------------------------------
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { rows } = await pool.query(
      'SELECT id, code, status, settings FROM rooms WHERE code = $1',
      [code.toUpperCase()]
    );
    const room = rows[0];

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Settings are stored as JSONB in PostgreSQL, so they might already be an object
    // but JSON.parse is safer if it's passed as a string/json from some drivers.
    // However, pg-types usually handles JSONB automatically.
    // If it's already an object, use it; if not, parse it.
    if (typeof room.settings === 'string') {
      room.settings = JSON.parse(room.settings);
    }

    // Include current player count
    const { rows: playerRows } = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE room_id = $1',
      [room.id]
    );
    const playerCount = parseInt(playerRows[0].count);

    return res.json({ ...room, playerCount });
  } catch (error) {
    console.error('[API Error] GET /api/rooms/:code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/rooms/:code/join
// Checks whether a player CAN join a room (exists, not full, not in progress).
// ---------------------------------------------------------------------------
router.get('/:code/join', async (req, res) => {
  try {
    const { code } = req.params;

    const { rows } = await pool.query(
      'SELECT id, status, settings FROM rooms WHERE code = $1',
      [code.toUpperCase()]
    );
    const room = rows[0];

    if (!room) {
      return res.status(404).json({ canJoin: false, reason: 'Room not found' });
    }

    if (room.status === 'playing') {
      return res.status(403).json({ canJoin: false, reason: 'Game already in progress' });
    }

    const settings = typeof room.settings === 'string' ? JSON.parse(room.settings) : room.settings;
    
    const { rows: playerRows } = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE room_id = $1',
      [room.id]
    );
    const playerCount = parseInt(playerRows[0].count);

    if (playerCount >= settings.maxPlayers) {
      return res.status(403).json({ canJoin: false, reason: 'Room is full' });
    }

    return res.json({ canJoin: true, roomId: room.id });
  } catch (error) {
    console.error('[API Error] GET /api/rooms/:code/join:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/rooms/public
// Returns list of available public rooms for Quick Join.
// ---------------------------------------------------------------------------
router.get('/public', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        r.code, 
        r.settings, 
        r.is_private,
        (SELECT COUNT(*) FROM players p WHERE p.room_id = r.id) as player_count,
        COALESCE(p.name, 'Anonymous') as host_name
      FROM rooms r
      LEFT JOIN players p ON p.id = r.host_id
      WHERE r.status = 'waiting' 
      AND (SELECT COUNT(*) FROM players p2 WHERE p2.room_id = r.id) > 0
      ORDER BY player_count DESC
      LIMIT 20
    `);
    res.json({ rooms: rows });
  } catch (error) {
    console.error('[API Error] GET /api/rooms/public:', error);
    res.status(500).json({ error: 'Could not fetch public studios' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/rooms/find/public (DEPRECATED: use /public instead)
// Logic: Find a room that is waiting, is public, and is not full.
// ---------------------------------------------------------------------------
router.get('/find/public', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.code, r.settings, (SELECT COUNT(*) FROM players p WHERE p.room_id = r.id) as player_count
      FROM rooms r
      WHERE r.status = 'waiting' 
      AND r.is_private = FALSE
      ORDER BY RANDOM()
      LIMIT 1
    `);

    const room = rows[0];
    if (!room) {
      return res.status(404).json({ error: 'No public studios available. Create one!' });
    }

    const settings = typeof room.settings === 'string' ? JSON.parse(room.settings) : room.settings;
    if (parseInt(room.player_count) >= settings.maxPlayers) {
      // If the random one is full, just return empty for now (simplified)
      return res.status(404).json({ error: 'All studios are currently full.' });
    }

    return res.json({ roomCode: room.code });
  } catch (error) {
    console.error('[API Error] GET /api/rooms/find/public:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
