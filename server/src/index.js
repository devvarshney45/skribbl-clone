// index.js
// Entry point for the Express + Socket.IO backend server.
// Sets up middleware, routes, and starts listening on the configured port.

require('dotenv').config();

const express = require('express');
const http    = require('http');
const cors    = require('cors');
const { Server } = require('socket.io');

const { initDB } = require('./db/database');
const roomRoutes           = require('./routes/roomRoutes');
const { setupSocketHandler } = require('./socket/socketHandler');

// ---------------------------------------------------------------------------
// Create Express app and HTTP server
// ---------------------------------------------------------------------------
const app    = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Allow requests from the frontend dev server (and production URL)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173', // Vite preview
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json()); // Parse JSON request bodies

// ---------------------------------------------------------------------------
// REST API routes
// ---------------------------------------------------------------------------
app.use('/api/rooms', roomRoutes);

// Health check — useful for deployment platforms
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Socket.IO setup
// ---------------------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Allow WebSocket upgrades and fallback to long-polling
  transports: ['websocket', 'polling'],
});

// Register all socket event handlers
setupSocketHandler(io);

// ---------------------------------------------------------------------------
// Start the server only after database is ready
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initDB();
    
    server.listen(PORT, () => {
      console.log(`\n🎨 Skribbl Clone backend running on http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Client URL  : ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
