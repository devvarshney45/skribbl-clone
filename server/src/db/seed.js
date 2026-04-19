// seed.js
// Inserts words into the database only if table is empty
// Run this once: node src/db/seed.js

const { pool, initDB } = require('./database')

const words = [
  // Animals
  { word: 'elephant', category: 'animals' },
  { word: 'penguin', category: 'animals' },
  { word: 'giraffe', category: 'animals' },
  { word: 'dolphin', category: 'animals' },
  { word: 'kangaroo', category: 'animals' },
  { word: 'cheetah', category: 'animals' },
  { word: 'gorilla', category: 'animals' },
  { word: 'flamingo', category: 'animals' },
  { word: 'crocodile', category: 'animals' },
  { word: 'butterfly', category: 'animals' },

  // Food
  { word: 'pizza', category: 'food' },
  { word: 'hamburger', category: 'food' },
  { word: 'spaghetti', category: 'food' },
  { word: 'sushi', category: 'food' },
  { word: 'icecream', category: 'food' },
  { word: 'pancake', category: 'food' },
  { word: 'chocolate', category: 'food' },
  { word: 'sandwich', category: 'food' },
  { word: 'broccoli', category: 'food' },
  { word: 'cupcake', category: 'food' },

  // Objects
  { word: 'umbrella', category: 'objects' },
  { word: 'telescope', category: 'objects' },
  { word: 'backpack', category: 'objects' },
  { word: 'scissors', category: 'objects' },
  { word: 'keyboard', category: 'objects' },
  { word: 'headphones', category: 'objects' },
  { word: 'lamp', category: 'objects' },
  { word: 'compass', category: 'objects' },
  { word: 'calculator', category: 'objects' },
  { word: 'microscope', category: 'objects' },

  // Actions
  { word: 'swimming', category: 'actions' },
  { word: 'climbing', category: 'actions' },
  { word: 'dancing', category: 'actions' },
  { word: 'painting', category: 'actions' },
  { word: 'cooking', category: 'actions' },
  { word: 'sleeping', category: 'actions' },
  { word: 'running', category: 'actions' },
  { word: 'reading', category: 'actions' },
  { word: 'singing', category: 'actions' },
  { word: 'jumping', category: 'actions' },

  // Places
  { word: 'library', category: 'places' },
  { word: 'airport', category: 'places' },
  { word: 'hospital', category: 'places' },
  { word: 'volcano', category: 'places' },
  { word: 'lighthouse', category: 'places' },
  { word: 'museum', category: 'places' },
  { word: 'stadium', category: 'places' },
  { word: 'desert', category: 'places' },
  { word: 'waterfall', category: 'places' },
  { word: 'castle', category: 'places' }
]

const seedWords = async () => {
  await initDB()

  // Check if words already exist so we don't duplicate
  const existing = await pool.query('SELECT COUNT(*) FROM words')
  if (parseInt(existing.rows[0].count) > 0) {
    console.log('Words already seeded, skipping...')
    process.exit(0)
  }

  // Insert each word one by one
  for (const item of words) {
    await pool.query(
      'INSERT INTO words (word, category) VALUES ($1, $2)',
      [item.word, item.category]
    )
  }

  console.log(`✅ Seeded ${words.length} words successfully`)
  process.exit(0)
}

seedWords().catch(console.error)
