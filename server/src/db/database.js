// database.js
// Sets up the SQLite database using better-sqlite3.
// Creates all tables if they don't already exist.

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Resolve the database file path from .env (defaults to ./skribbl.db)
const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || 'skribbl.db');

// Open (or create) the SQLite database file
const db = new Database(dbPath);

// Enable WAL mode for better performance with concurrent reads
db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------------------
// Create all tables
// ---------------------------------------------------------------------------

function createTables() {
  // rooms table: stores each game room
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id          TEXT PRIMARY KEY,       -- UUID
      code        TEXT UNIQUE NOT NULL,   -- 6-char room code shown to players
      host_id     TEXT NOT NULL,          -- socket ID of the host
      settings    TEXT NOT NULL,          -- JSON string: rounds, drawTime, etc.
      status      TEXT DEFAULT 'waiting', -- waiting | playing | finished
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // players table: stores each player in a room
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id        TEXT PRIMARY KEY,         -- UUID
      name      TEXT NOT NULL,            -- display name chosen by player
      room_id   TEXT NOT NULL,            -- foreign key to rooms.id
      score     INTEGER DEFAULT 0,        -- cumulative score across all rounds
      is_host   INTEGER DEFAULT 0,        -- 1 if this player created the room
      socket_id TEXT NOT NULL             -- current socket.io connection ID
    )
  `);

  // words table: the word list used for drawing rounds
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      word     TEXT NOT NULL,             -- the actual word
      category TEXT NOT NULL              -- animals, food, objects, actions, places
    )
  `);

  // game_sessions table: tracks the active game for a room
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id                 TEXT PRIMARY KEY,   -- UUID
      room_id            TEXT NOT NULL,      -- foreign key to rooms.id
      current_round      INTEGER DEFAULT 1,  -- which round we are on
      current_drawer_id  TEXT,               -- player ID of current drawer
      started_at         DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('[DB] All tables created / verified successfully.');
}

// Run table creation immediately when this module is first imported
createTables();

// Export the db instance so other files can run queries
module.exports = db;
