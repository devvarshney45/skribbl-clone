// database.js
// This file connects to PostgreSQL using the pg library
// and creates all tables needed for the game

const { Pool } = require('pg')
require('dotenv').config()

// Pool manages multiple database connections automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon cloud database
  }
})

// This function creates all tables if they don't exist yet
const initDB = async () => {

  // rooms table — stores each game room
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id VARCHAR(50) PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      host_id VARCHAR(50) NOT NULL,
      settings JSONB NOT NULL DEFAULT '{}',
      status VARCHAR(20) DEFAULT 'waiting',
      is_private BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Ensure is_private column exists (Migration for existing tables)
  await pool.query(`
    ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE
  `)

  // players table — stores each player in a room
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE CASCADE,
      score INTEGER DEFAULT 0,
      is_host BOOLEAN DEFAULT FALSE,
      socket_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // words table — stores all drawable words
  await pool.query(`
    CREATE TABLE IF NOT EXISTS words (
      id SERIAL PRIMARY KEY,
      word VARCHAR(100) NOT NULL,
      category VARCHAR(50) DEFAULT 'general'
    )
  `)

  // game_sessions table — tracks active game state
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id VARCHAR(50) PRIMARY KEY,
      room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE CASCADE,
      current_round INTEGER DEFAULT 1,
      current_drawer_id VARCHAR(50),
      status VARCHAR(20) DEFAULT 'active',
      started_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Auto-seed: guarantee we have drawing words
  const existing = await pool.query('SELECT COUNT(*) FROM words')
  if (parseInt(existing.rows[0].count) === 0) {
    const fallbackWords = [
      'apple', 'dog', 'painting', 'submarine', 'pizza', 'guitar', 'moon', 'telescope', 'laptop', 'skyscraper'
    ]
    for (const word of fallbackWords) {
      await pool.query('INSERT INTO words (word, category) VALUES ($1, $2)', [word, 'general'])
    }
    console.log('✅ Database auto-seeded with standard drawing words.')
  }

  console.log('✅ All PostgreSQL tables created successfully')
}

module.exports = { pool, initDB }
