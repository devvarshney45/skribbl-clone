// seed.js
// Inserts 100+ words into the words table, organized by category.
// Run with: npm run seed
// Safe to run multiple times — skips words that already exist.

const db = require('./database');

// ---------------------------------------------------------------------------
// Word list — 5 categories, 20+ words each
// ---------------------------------------------------------------------------
const wordList = [
  // Animals
  { word: 'elephant',    category: 'animals' },
  { word: 'giraffe',     category: 'animals' },
  { word: 'penguin',     category: 'animals' },
  { word: 'dolphin',     category: 'animals' },
  { word: 'kangaroo',    category: 'animals' },
  { word: 'cheetah',     category: 'animals' },
  { word: 'octopus',     category: 'animals' },
  { word: 'flamingo',    category: 'animals' },
  { word: 'crocodile',   category: 'animals' },
  { word: 'butterfly',   category: 'animals' },
  { word: 'gorilla',     category: 'animals' },
  { word: 'peacock',     category: 'animals' },
  { word: 'hamster',     category: 'animals' },
  { word: 'jellyfish',   category: 'animals' },
  { word: 'rhinoceros',  category: 'animals' },
  { word: 'parrot',      category: 'animals' },
  { word: 'hedgehog',    category: 'animals' },
  { word: 'porcupine',   category: 'animals' },
  { word: 'chameleon',   category: 'animals' },
  { word: 'seahorse',    category: 'animals' },

  // Food
  { word: 'pizza',       category: 'food' },
  { word: 'spaghetti',   category: 'food' },
  { word: 'sushi',       category: 'food' },
  { word: 'hamburger',   category: 'food' },
  { word: 'ice cream',   category: 'food' },
  { word: 'pancake',     category: 'food' },
  { word: 'burrito',     category: 'food' },
  { word: 'croissant',   category: 'food' },
  { word: 'avocado',     category: 'food' },
  { word: 'pineapple',   category: 'food' },
  { word: 'watermelon',  category: 'food' },
  { word: 'broccoli',    category: 'food' },
  { word: 'cheesecake',  category: 'food' },
  { word: 'dumpling',    category: 'food' },
  { word: 'pretzel',     category: 'food' },
  { word: 'donut',       category: 'food' },
  { word: 'taco',        category: 'food' },
  { word: 'macaron',     category: 'food' },
  { word: 'smoothie',    category: 'food' },
  { word: 'nachos',      category: 'food' },

  // Objects
  { word: 'umbrella',    category: 'objects' },
  { word: 'telescope',   category: 'objects' },
  { word: 'backpack',    category: 'objects' },
  { word: 'piano',       category: 'objects' },
  { word: 'compass',     category: 'objects' },
  { word: 'microscope',  category: 'objects' },
  { word: 'hourglass',   category: 'objects' },
  { word: 'lighthouse',  category: 'objects' },
  { word: 'mailbox',     category: 'objects' },
  { word: 'scissors',    category: 'objects' },
  { word: 'calculator',  category: 'objects' },
  { word: 'skateboard',  category: 'objects' },
  { word: 'sunglasses',  category: 'objects' },
  { word: 'headphones',  category: 'objects' },
  { word: 'thermometer', category: 'objects' },
  { word: 'toothbrush',  category: 'objects' },
  { word: 'flashlight',  category: 'objects' },
  { word: 'parachute',   category: 'objects' },
  { word: 'trophy',      category: 'objects' },
  { word: 'stopwatch',   category: 'objects' },

  // Actions
  { word: 'swimming',    category: 'actions' },
  { word: 'juggling',    category: 'actions' },
  { word: 'sleeping',    category: 'actions' },
  { word: 'skydiving',   category: 'actions' },
  { word: 'surfing',     category: 'actions' },
  { word: 'cooking',     category: 'actions' },
  { word: 'painting',    category: 'actions' },
  { word: 'dancing',     category: 'actions' },
  { word: 'climbing',    category: 'actions' },
  { word: 'fishing',     category: 'actions' },
  { word: 'gardening',   category: 'actions' },
  { word: 'meditating',  category: 'actions' },
  { word: 'skateboarding', category: 'actions' },
  { word: 'knitting',    category: 'actions' },
  { word: 'hiking',      category: 'actions' },
  { word: 'diving',      category: 'actions' },
  { word: 'texting',     category: 'actions' },
  { word: 'laughing',    category: 'actions' },
  { word: 'sneezing',    category: 'actions' },
  { word: 'yawning',     category: 'actions' },

  // Places
  { word: 'library',     category: 'places' },
  { word: 'volcano',     category: 'places' },
  { word: 'igloo',       category: 'places' },
  { word: 'pyramid',     category: 'places' },
  { word: 'waterfall',   category: 'places' },
  { word: 'castle',      category: 'places' },
  { word: 'jungle',      category: 'places' },
  { word: 'aquarium',    category: 'places' },
  { word: 'stadium',     category: 'places' },
  { word: 'museum',      category: 'places' },
  { word: 'harbor',      category: 'places' },
  { word: 'canyon',      category: 'places' },
  { word: 'greenhouse',  category: 'places' },
  { word: 'cathedral',   category: 'places' },
  { word: 'cabin',       category: 'places' },
  { word: 'treehouse',   category: 'places' },
  { word: 'laboratory',  category: 'places' },
  { word: 'observatory', category: 'places' },
  { word: 'marketplace', category: 'places' },
  { word: 'submarine',   category: 'places' },
];

// ---------------------------------------------------------------------------
// Insert words — use INSERT OR IGNORE so we can safely re-run this script
// ---------------------------------------------------------------------------
const insertWord = db.prepare(`
  INSERT OR IGNORE INTO words (word, category) VALUES (?, ?)
`);

// Use a transaction for faster bulk insert
const insertAll = db.transaction((words) => {
  for (const entry of words) {
    insertWord.run(entry.word, entry.category);
  }
});

insertAll(wordList);

// Count how many words are now in the database
const count = db.prepare('SELECT COUNT(*) as total FROM words').get();
console.log(`[Seed] Done! Database now has ${count.total} words.`);
