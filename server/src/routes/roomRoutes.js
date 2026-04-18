// roomRoutes.js
// REST API endpoints for room management.
// Used by the frontend before the player connects via Socket.IO.

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

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
router.post('/', (req, res) => {
  const { hostName, settings } = req.body;

  // Validate input
  if (!hostName || hostName.trim() === '') {
    return res.status(400).json({ error: 'hostName is required' });
  }

  const roomId   = uuidv4();
  const hostId   = uuidv4(); // placeholder; real host ID assigned on socket join
  let   roomCode = generateRoomCode();

  // Make sure the generated code doesn't already exist
  let attempts = 0;
  while (db.prepare('SELECT id FROM rooms WHERE code = ?').get(roomCode) && attempts < 10) {
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

  // Insert the new room into SQLite
  db.prepare(`
    INSERT INTO rooms (id, code, host_id, settings, status)
    VALUES (?, ?, ?, ?, 'waiting')
  `).run(roomId, roomCode, hostId, JSON.stringify(finalSettings));

  console.log(`[API] Room created — code: ${roomCode}, id: ${roomId}`);

  return res.status(201).json({ roomId, roomCode });
});

// ---------------------------------------------------------------------------
// GET /api/rooms/:code
// Returns basic info about a room by its code.
// Used by the frontend to pre-validate join before connecting to socket.
// ---------------------------------------------------------------------------
router.get('/:code', (req, res) => {
  const { code } = req.params;

  const room = db
    .prepare('SELECT id, code, status, settings FROM rooms WHERE code = ?')
    .get(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Parse the JSON settings string back into an object
  room.settings = JSON.parse(room.settings);

  // Include current player count
  const playerCount = db
    .prepare('SELECT COUNT(*) as count FROM players WHERE room_id = ?')
    .get(room.id).count;

  return res.json({ ...room, playerCount });
});

// ---------------------------------------------------------------------------
// GET /api/rooms/:code/join
// Checks whether a player CAN join a room (exists, not full, not in progress).
// ---------------------------------------------------------------------------
router.get('/:code/join', (req, res) => {
  const { code } = req.params;

  const room = db
    .prepare('SELECT id, status, settings FROM rooms WHERE code = ?')
    .get(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ canJoin: false, reason: 'Room not found' });
  }

  if (room.status === 'playing') {
    return res.status(403).json({ canJoin: false, reason: 'Game already in progress' });
  }

  const settings     = JSON.parse(room.settings);
  const playerCount  = db
    .prepare('SELECT COUNT(*) as count FROM players WHERE room_id = ?')
    .get(room.id).count;

  if (playerCount >= settings.maxPlayers) {
    return res.status(403).json({ canJoin: false, reason: 'Room is full' });
  }

  return res.json({ canJoin: true, roomId: room.id });
});

module.exports = router;
