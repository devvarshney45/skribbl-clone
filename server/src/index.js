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

// ---------------------------------------------------------------------------
// CORS & Security Configuration
// ---------------------------------------------------------------------------
const rawClientUrl = process.env.CLIENT_URL;
const normalizedClientUrl = rawClientUrl ? rawClientUrl.replace(/\/$/, '') : null;

const allowedOrigins = [
  normalizedClientUrl,
  'https://skribbl.devvarshney.me',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const sanitizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(ao => ao.replace(/\/$/, '') === sanitizedOrigin) || 
                     sanitizedOrigin.startsWith('http://localhost:') ||
                     sanitizedOrigin.endsWith('.onrender.com'); // Allow Render environments

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Access Denied: ${origin}`);
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------------------------------------------------------------------
// REST API routes
// ---------------------------------------------------------------------------
app.use('/api/rooms', roomRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', domain: 'skribbl.devvarshney.me', client: normalizedClientUrl });
});

// ---------------------------------------------------------------------------
// Static Frontend Delivery (For all-in-one Render deployment)
// ---------------------------------------------------------------------------
const path = require('path');

// Serve the compiled React application statically
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Catch-all route to serve index.html for React Router compatibility
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// ---------------------------------------------------------------------------
// Socket.IO setup
// ---------------------------------------------------------------------------
const io = new Server(server, {
  cors: corsOptions, // Use the same robust options
  transports: ['websocket', 'polling'],
});

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
