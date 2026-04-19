// socketHandler.js
// The heart of the real-time game — handles every Socket.IO event.
// All game state (rooms, active games) is kept in memory via Maps.
// PostgreSQL is used only for persistence (scores, room records).

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const Player = require('../classes/Player');
const Room   = require('../classes/Room');
const Game   = require('../classes/Game');

// ---------------------------------------------------------------------------
// In-memory stores — these live for the lifetime of the server process
// ---------------------------------------------------------------------------
const rooms = new Map(); // roomCode → Room instance
const games = new Map(); // roomId   → Game instance

// ---------------------------------------------------------------------------
// Helper: emit the current player list to everyone in the room
// ---------------------------------------------------------------------------
function broadcastPlayerList(io, room) {
  io.to(room.id).emit('player_list', {
    players: room.getPlayers().map((p) => p.toJSON()),
  });
}

// ---------------------------------------------------------------------------
// Main export — called once with the Socket.IO server instance
// ---------------------------------------------------------------------------
function setupSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // =========================================================================
    // ROOM EVENTS
    // =========================================================================

    // -------------------------------------------------------------------------
    // create_room
    // Emitted by the host when they land on the lobby page.
    // Data: { playerName, roomCode, settings? }
    // -------------------------------------------------------------------------
    socket.on('create_room', async ({ playerName, roomCode, settings }) => {
      try {
        // Look up the room record that was created via the REST API
        const { rows } = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode]);
        const roomRecord = rows[0];

        if (!roomRecord) {
          socket.emit('error', { message: 'Room not found. Please create again.' });
          return;
        }

        // Create the in-memory Room object
        const room = new Room({
          id: roomRecord.id,
          code: roomRecord.code,
          hostId: null, // will be set to the player's id below
          settings: typeof roomRecord.settings === 'string' ? JSON.parse(roomRecord.settings) : roomRecord.settings,
        });

        // Create the host Player object
        const player = new Player({
          id: uuidv4(),
          name: playerName.trim(),
          socketId: socket.id,
          roomId: room.id,
        });
        player.isHost  = true;
        player.isReady = true; // host is always ready

        // Set hostId on the room
        room.hostId = player.id;

        // Save player to PostgreSQL
        await pool.query(`
          INSERT INTO players (id, name, room_id, score, is_host, socket_id)
          VALUES ($1, $2, $3, 0, TRUE, $4)
        `, [player.id, player.name, room.id, socket.id]);

        // Add to in-memory room and store room in map
        room.addPlayer(player);
        rooms.set(room.code, room);

        // Join the Socket.IO room channel
        socket.join(room.id);

        // Store player info on the socket for easy lookup on disconnect
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;

        console.log(`[Socket] ${playerName} created room ${room.code}`);

        socket.emit('room_created', {
          roomId: room.id,
          roomCode: room.code,
          player: player.toJSON(),
          settings: room.settings,
        });

        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] create_room:', error);
        socket.emit('error', { message: 'Failed to create room.' });
      }
    });

    // -------------------------------------------------------------------------
    // join_room
    // Emitted by a player joining an existing room.
    // Data: { playerName, roomCode }
    // -------------------------------------------------------------------------
    socket.on('join_room', async ({ playerName, roomCode }) => {
      try {
        const room = rooms.get(roomCode?.toUpperCase());

        if (!room) {
          socket.emit('error', { message: 'Room not found.' });
          return;
        }

        if (room.status === 'playing') {
          // Allow reconnection if same name exists in this room
          const existing = room.getPlayers().find(
            (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
          );
          if (existing) {
            // Update socket ID for the reconnected player
            existing.socketId = socket.id;
            socket.join(room.id);
            socket.data.playerId = existing.id;
            socket.data.roomCode = room.code;

            // Update socket_id in DB
            await pool.query('UPDATE players SET socket_id = $1 WHERE id = $2', [socket.id, existing.id]);

            const game = games.get(room.id);

            socket.emit('reconnected', {
              player: existing.toJSON(),
              roomCode: room.code,
              settings: room.settings,
              gamePhase: game?.phase || 'waiting',
              currentDrawerId: game?.getCurrentDrawer()?.id || null,
              wordHints: game?.wordHints || [],
              timeLeft: game?.timeLeft || 0,
              round: game?.currentRound || 1,
              totalRounds: game?.totalRounds || room.settings.rounds,
            });

            // Re-send the current canvas strokes so they can see what was drawn
            if (room.currentStrokes.length > 0) {
              socket.emit('canvas_replay', { strokes: room.currentStrokes });
            }

            io.to(room.id).emit('chat_message', {
              type: 'system',
              text: `${existing.name} reconnected.`,
            });

            broadcastPlayerList(io, room);
            return;
          }

          socket.emit('error', { message: 'Game already in progress.' });
          return;
        }

        if (room.isFull()) {
          socket.emit('error', { message: 'Room is full.' });
          return;
        }

        // Create new Player
        const player = new Player({
          id: uuidv4(),
          name: playerName.trim(),
          socketId: socket.id,
          roomId: room.id,
        });

        // Save to PostgreSQL
        await pool.query(`
          INSERT INTO players (id, name, room_id, score, is_host, socket_id)
          VALUES ($1, $2, $3, 0, FALSE, $4)
        `, [player.id, player.name, room.id, socket.id]);

        room.addPlayer(player);
        socket.join(room.id);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;

        console.log(`[Socket] ${player.name} joined room ${room.code}`);

        socket.emit('joined_room', {
          roomId: room.id,
          roomCode: room.code,
          player: player.toJSON(),
          settings: room.settings,
        });

        // Notify everyone else that a new player arrived
        socket.to(room.id).emit('player_joined', { player: player.toJSON() });

        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] join_room:', error);
        socket.emit('error', { message: 'Failed to join room.' });
      }
    });

    // -------------------------------------------------------------------------
    // player_ready
    // Emitted when a player clicks "Ready" in the lobby.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('player_ready', ({ roomCode }) => {
      const room   = rooms.get(roomCode);
      if (!room) return;

      const player = room.getPlayerBySocketId(socket.id);
      if (!player) return;

      player.isReady = true;
      broadcastPlayerList(io, room);
    });

    // -------------------------------------------------------------------------
    // start_game
    // Only the host can trigger this. Requires at least 2 players.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('start_game', async ({ roomCode }) => {
      try {
        const room   = rooms.get(roomCode);
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Only the host can start the game.' });
          return;
        }

        if (room.players.size < 2) {
          socket.emit('error', { message: 'Need at least 2 players to start.' });
          return;
        }

        // Update room status in memory and DB
        room.status = 'playing';
        await pool.query("UPDATE rooms SET status = 'playing' WHERE id = $1", [room.id]);

        // Create and start the Game
        const game = new Game({
          roomId: room.id,
          settings: room.settings,
          players: room.getPlayers(),
          io,
        });

        games.set(room.id, game);
        game.start();

        console.log(`[Socket] Game started in room ${room.code}`);
      } catch (error) {
        console.error('[Socket Error] start_game:', error);
        socket.emit('error', { message: 'Failed to start game.' });
      }
    });

    // =========================================================================
    // GAME STATE EVENTS
    // =========================================================================

    // -------------------------------------------------------------------------
    // word_chosen
    // Emitted by the drawer after selecting a word from the modal.
    // Data: { roomCode, word }
    // -------------------------------------------------------------------------
    socket.on('word_chosen', ({ roomCode, word }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const game = games.get(room.id);
      if (!game) return;

      // Only the current drawer can choose the word
      const drawer = game.getCurrentDrawer();
      if (!drawer || drawer.socketId !== socket.id) return;

      game.chooseWord(word);
    });

    // =========================================================================
    // DRAWING EVENTS
    // =========================================================================

    // -------------------------------------------------------------------------
    // draw_start
    // Emitted when the drawer presses the mouse button down.
    // Data: { roomCode, x, y, color, brushSize }
    // -------------------------------------------------------------------------
    socket.on('draw_start', (data) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      // Start a new stroke object and store it
      const stroke = {
        type: 'start',
        x: data.x, y: data.y,
        color: data.color,
        brushSize: data.brushSize,
        points: [],
      };

      // Keep reference so we can append move points to it
      room._currentStroke = stroke;
      room.currentStrokes.push(stroke);

      // Broadcast to everyone except the sender
      socket.to(room.id).emit('draw_data', {
        type: 'start',
        x: data.x, y: data.y,
        color: data.color,
        brushSize: data.brushSize,
      });
    });

    // -------------------------------------------------------------------------
    // draw_move
    // Emitted continuously as the mouse moves while drawing.
    // Data: { roomCode, x, y }
    // -------------------------------------------------------------------------
    socket.on('draw_move', (data) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      // Append point to the current stroke for replay purposes
      if (room._currentStroke) {
        room._currentStroke.points.push({ x: data.x, y: data.y });
      }

      socket.to(room.id).emit('draw_data', {
        type: 'move',
        x: data.x,
        y: data.y,
      });
    });

    // -------------------------------------------------------------------------
    // draw_end
    // Emitted when the mouse button is released.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('draw_end', (data) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      room._currentStroke = null;

      socket.to(room.id).emit('draw_data', { type: 'end' });
    });

    // -------------------------------------------------------------------------
    // canvas_clear
    // Clears all strokes — only the current drawer can do this.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('canvas_clear', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.currentStrokes = [];
      room._currentStroke = null;

      // Broadcast clear to everyone in the room
      io.to(room.id).emit('canvas_cleared');
    });

    // -------------------------------------------------------------------------
    // draw_undo
    // Removes the last stroke from the stored history and tells clients to redraw.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('draw_undo', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      // Remove the last stroke
      if (room.currentStrokes.length > 0) {
        room.currentStrokes.pop();
      }

      // Tell everyone to replay from scratch (cleanest approach for undo)
      io.to(room.id).emit('canvas_replay', { strokes: room.currentStrokes });
    });

    // =========================================================================
    // CHAT & GUESS EVENTS
    // =========================================================================

    // -------------------------------------------------------------------------
    // guess
    // Emitted when a player types something in the chat during a game.
    // Data: { roomCode, text }
    // -------------------------------------------------------------------------
    socket.on('guess', ({ roomCode, text }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.getPlayerBySocketId(socket.id);
      if (!player) return;

      const game = games.get(room.id);

      // If no active game or not in drawing phase, treat as normal chat
      if (!game || game.phase !== 'drawing') {
        io.to(room.id).emit('chat_message', {
          type: 'chat',
          playerName: player.name,
          text,
        });
        return;
      }

      // Process guess through the Game class
      const result = game.handleGuess(player, text);

      if (result && result.correct) {
        // Announce the correct guess to everyone
        io.to(room.id).emit('guess_result', {
          correct: true,
          playerName: player.name,
          playerId: player.id,
          points: result.points,
          players: room.getPlayers().map((p) => p.toJSON()),
        });

        // Also emit as a special chat message (shown in green)
        io.to(room.id).emit('chat_message', {
          type: 'correct',
          playerName: player.name,
          text: `${player.name} guessed the word!`,
        });
      } else {
        // Drawer shouldn't see other guesses (they already know the word)
        const drawer = game.getCurrentDrawer();
        if (player.id !== drawer?.id && !player.hasGuessedCorrectly) {
          io.to(room.id).emit('chat_message', {
            type: 'chat',
            playerName: player.name,
            text,
          });
        }
      }
    });

    // -------------------------------------------------------------------------
    // chat
    // Normal chat message (outside of guessing context, e.g. lobby).
    // Data: { roomCode, text }
    // -------------------------------------------------------------------------
    socket.on('chat', ({ roomCode, text }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.getPlayerBySocketId(socket.id);
      if (!player) return;

      io.to(room.id).emit('chat_message', {
        type: 'chat',
        playerName: player.name,
        text,
      });
    });

    // =========================================================================
    // DISCONNECT
    // =========================================================================

    // -------------------------------------------------------------------------
    // disconnect
    // When a socket drops, we remove them from the room and clean up.
    // If the host leaves, we assign a new host.
    // -------------------------------------------------------------------------
    socket.on('disconnect', async () => {
      try {
        console.log(`[Socket] Disconnected: ${socket.id}`);

        const { playerId, roomCode } = socket.data;
        if (!playerId || !roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const player = room.removePlayer(playerId);
        if (!player) return;

        // Remove from PostgreSQL
        await pool.query('DELETE FROM players WHERE id = $1', [playerId]);

        // Notify the room
        io.to(room.id).emit('player_left', { playerId, playerName: player.name });
        io.to(room.id).emit('chat_message', {
          type: 'system',
          text: `${player.name} left the game.`,
        });

        // If nobody is left, clean up the room entirely
        if (room.players.size === 0) {
          rooms.delete(roomCode);
          games.delete(room.id);
          await pool.query('DELETE FROM rooms WHERE id = $1', [room.id]);
          console.log(`[Socket] Room ${roomCode} is empty — cleaned up.`);
          return;
        }

        // If the host left, assign a new host (first player in the list)
        if (player.isHost) {
          const newHost = room.getPlayers()[0];
          if (newHost) {
            newHost.isHost = true;
            room.hostId = newHost.id;
            await pool.query('UPDATE players SET is_host = TRUE WHERE id = $1', [newHost.id]);
            await pool.query('UPDATE rooms SET host_id = $1 WHERE id = $2', [newHost.id, room.id]);

            io.to(room.id).emit('chat_message', {
              type: 'system',
              text: `${newHost.name} is now the host.`,
            });
          }
        }

        // If game is running and the drawer disconnected, skip to next round
        const game = games.get(room.id);
        if (game && game.phase === 'drawing') {
          const drawer = game.getCurrentDrawer();
          if (!drawer || drawer.id === playerId) {
            io.to(room.id).emit('chat_message', {
              type: 'system',
              text: 'The drawer left — skipping to next round.',
            });
            game.endRound();
          }

          // Update the game's player list
          game.players = room.getPlayers();
        }

        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] disconnect:', error);
      }
    });
  });
}

module.exports = { setupSocketHandler };
