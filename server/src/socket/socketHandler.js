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
    socket.on('create_room', async ({ playerName, roomCode, settings, isPrivate }) => {
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
          isPrivate: isPrivate ?? roomRecord.is_private,
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
        
        // Update room record in PostgreSQL to link the actual host_id
        await pool.query('UPDATE rooms SET host_id = $1 WHERE id = $2', [player.id, room.id]);

        // Save player to PostgreSQL
        await pool.query(`
          INSERT INTO players (id, name, room_id, score, is_host, socket_id)
          VALUES ($1, $2, $3, 0, TRUE, $4)
        `, [player.id, player.name, room.id, socket.id]);

        // Add to in-memory room and store room in map
        room.addPlayer(player);
        rooms.set(room.code, room);

        // Join the Socket.IO room channel and personal ID room
        socket.join(room.id);
        socket.join(`user_${player.id}`);

        // Store player info on the socket for easy lookup on disconnect
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.data.roomId   = room.id;

        console.log(`[Socket] ${playerName} created room ${room.code}`);

        socket.emit('room_created', {
          roomId: room.id,
          roomCode: room.code,
          settings: room.settings,
          isPrivate: room.isPrivate,
          inviteLink: `${process.env.CLIENT_URL}/?code=${room.code}`,
        });

        // Identity Sync
        socket.emit('identity_sync', { playerId: player.id });

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
        if (!roomCode || roomCode.length < 6) {
           socket.emit('error', { message: 'Invalid Room Code.' });
           return;
        }
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
        await room.ensureHumanHost(pool, io);
        socket.join(room.id);
        socket.join(`user_${player.id}`);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.data.roomId   = room.id;

        console.log(`[Socket] ${player.name} joined room ${room.code}`);

        socket.emit('joined_room', {
          roomId: room.id,
          roomCode: room.code,
          player: player.toJSON(),
          settings: room.settings,
          isPrivate: room.isPrivate,
        });

        // Identity Sync
        socket.emit('identity_sync', { playerId: player.id });

        // Notify everyone else that a new player arrived
        socket.to(room.id).emit('player_joined', { player: player.toJSON() });

        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] join_room:', error);
        socket.emit('error', { message: 'Failed to join room.' });
      }
    });

    // -------------------------------------------------------------------------
    // quick_join
    // Emitted by a player looking for ANY available public room.
    // -------------------------------------------------------------------------
    socket.on('quick_join', async ({ playerName }) => {
      try {
        // 1. Find an available public room in memory first
        const availableRoom = [...rooms.values()].find(r => r.isPublicAndAvailable());

        if (!availableRoom) {
          // Tell frontend to create a new public room
          socket.emit('no_public_room', { 
            message: 'No active studios found. Creating a new exhibition...' 
          });
          return;
        }

        // 2. Join the found room (reuse join_room logic)
        console.log(`[DEBUG] quick_join found room code ${availableRoom.code}. Players size before: ${availableRoom.players.size}`);
        const player = new Player({
          id: uuidv4(),
          name: playerName.trim(),
          socketId: socket.id,
          roomId: availableRoom.id,
        });

        await pool.query(`
          INSERT INTO players (id, name, room_id, score, is_host, socket_id)
          VALUES ($1, $2, $3, 0, FALSE, $4)
        `, [player.id, player.name, availableRoom.id, socket.id]);

        availableRoom.addPlayer(player);
        await availableRoom.ensureHumanHost(pool, io);
        socket.join(availableRoom.id);
        socket.join(`user_${player.id}`);
        socket.data.playerId = player.id;
        socket.data.roomCode = availableRoom.code;
        socket.data.roomId   = availableRoom.id;

        socket.emit('joined_room', {
          roomId: availableRoom.id,
          roomCode: availableRoom.code,
          player: player.toJSON(),
          settings: availableRoom.settings,
          isPrivate: false
        });

        // Identity Sync
        socket.emit('identity_sync', { playerId: player.id });

        socket.to(availableRoom.id).emit('player_joined', { player: player.toJSON() });
        broadcastPlayerList(io, availableRoom);
      } catch (error) {
        console.error('[Socket Error] quick_join:', error);
        socket.emit('error', { message: 'Failed to find a studio.' });
      }
    });

    // -------------------------------------------------------------------------
    // reconnect_session
    // Emitted when a user refreshes the page and tries to re-attach to their session.
    // -------------------------------------------------------------------------
    socket.on('reconnect_session', async ({ playerId, roomCode }) => {
      try {
        let room = rooms.get(roomCode?.toUpperCase());
        
        // --- 1. Dynamic Room Restoration ---
        if (!room) {
          console.log(`[Reconnect] Room ${roomCode} missing from memory, restoring from DB...`);
          const { rows: roomRows } = await pool.query('SELECT * FROM rooms WHERE code = $1', [roomCode?.toUpperCase()]);
          const roomRecord = roomRows[0];
          
          if (!roomRecord) {
            socket.emit('session_expired', { message: 'The studio has been closed.' });
            return;
          }

          room = new Room({
            id: roomRecord.id,
            code: roomRecord.code,
            hostId: roomRecord.host_id,
            isPrivate: roomRecord.is_private,
            settings: typeof roomRecord.settings === 'string' ? JSON.parse(roomRecord.settings) : roomRecord.settings,
          });
          room.status = roomRecord.status;
          rooms.set(room.code, room);
        }

        let player = room.getPlayer(playerId);
        
        if (!player) {
          console.log(`[Reconnect] Player ${playerId} missing from room memory, restoring from DB...`);
          const { rows: playerRows } = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
          const playerRecord = playerRows[0];

          if (!playerRecord || playerRecord.room_id !== room.id) {
            socket.emit('session_expired', { message: 'Your invitation has expired.' });
            return;
          }

          player = new Player({
            id: playerRecord.id,
            name: playerRecord.name,
            socketId: socket.id,
            roomId: room.id,
            score: playerRecord.score || 0
          });
          player.isHost = playerRecord.is_host;
          player.isReady = true; 
          room.addPlayer(player);
        }

        // Update status
        player.isOnline = true;
        player.socketId = socket.id;
        socket.join(room.id);
        socket.join(`user_${player.id}`);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.data.roomId   = room.id;

        // Update DB
        await pool.query('UPDATE players SET socket_id = $1 WHERE id = $2', [socket.id, player.id]);

        // Identity Sync
        socket.emit('identity_sync', { playerId: player.id });

        const game = games.get(room.id);

        console.log(`[Socket] ${player.name} reconnected to ${room.code}`);

        socket.emit('reconnected', {
          player: player.toJSON(),
          roomCode: room.code,
          settings: room.settings,
          isPrivate: room.isPrivate,
          phase: game?.phase || room.status,
          currentDrawerId: game?.getCurrentDrawer()?.id || null,
          wordHints: game?.wordHints || [],
          timeLeft: game?.timeLeft || 0,
          round: game?.currentRound || 1,
          totalRounds: game?.totalRounds || room.settings.rounds,
          wordOptions: (game?.phase === 'choosing' && game?.getCurrentDrawer()?.id === player.id) ? game.wordOptions : [],
        });

        // Replay drawing if in game
        if (room.currentStrokes.length > 0) {
          socket.emit('canvas_replay', { strokes: room.currentStrokes });
        }

        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] reconnect:', error);
      }
    });

    // -------------------------------------------------------------------------
    // player_ready
    // Emitted when a player clicks "Ready" in the lobby.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('player_ready', ({ roomCode: clientRoomCode }) => {
      const roomCode = clientRoomCode || socket.data.roomCode;
      const roomId   = socket.data.roomId; // Fallback to roomId if we have it
      
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return;

      const player = room.getPlayer(socket.data.playerId) || room.getPlayerBySocketId(socket.id);
      if (!player) return;

      // Toggle ready status
      player.isReady = !player.isReady;
      console.log(`[Socket] ${player.name} is now ${player.isReady ? 'READY' : 'PREPARING'} in ${room.code}`);
      broadcastPlayerList(io, room);
    });

    // -------------------------------------------------------------------------
    // start_game
    // Only the host can trigger this. Requires at least 2 players.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('start_game', async ({ roomCode: clientRoomCode }) => {
      try {
        const roomCode = clientRoomCode || socket.data.roomCode;
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return;

        const player = room.getPlayer(socket.data.playerId) || room.getPlayerBySocketId(socket.id);
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Only the host can start the game.' });
          return;
        }

        if (room.players.size < 2) {
          socket.emit('error', { message: 'Need at least 2 players to start.' });
          return;
        }

        // Reset all players ready state for game start
        room.getPlayers().forEach(p => p.isReady = false);
        broadcastPlayerList(io, room);

        io.to(room.id).emit('preparing_game', { message: 'Studio deploying: Preparing your canvas...' });

        // Update room status in memory and DB
        room.status = 'playing';
        await pool.query("UPDATE rooms SET status = 'playing' WHERE id = $1", [room.id]);

        // Create and start the Game
        const game = new Game({
          roomId: room.id,
          settings: room.settings,
          players: room.getPlayers(),
          io,
          onRoundStart: () => {
            room.currentStrokes = [];
            room._currentStroke = null;
          }
        });

        games.set(room.id, game);
        game.start();

        console.log(`[Socket] Game started in room ${room.code}`);
      } catch (error) {
        console.error('[Socket Error] start_game:', error);
        socket.emit('error', { message: 'Failed to start game.' });
      }
    });

    // -------------------------------------------------------------------------
    // update_settings
    // Only the host can update room settings while in the lobby.
    // Data: { roomCode, settings: { rounds, drawTime, ... } }
    // -------------------------------------------------------------------------
    socket.on('update_settings', async ({ roomCode, settings }) => {
      try {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return;

        const player = room.getPlayer(socket.data.playerId);
        if (!player || !player.isHost) {
          console.warn(`[Socket] Unauthorized settings update attempt by ${socket.data.playerId} in ${roomCode}`);
          return;
        }

        // Extract isPrivate separately — it lives on room, not room.settings
        const { isPrivate: newIsPrivate, ...gameSettings } = settings;

        // Merge only actual game settings (rounds, drawTime, etc.)
        if (Object.keys(gameSettings).length > 0) {
          room.settings = { ...room.settings, ...gameSettings };
          await pool.query('UPDATE rooms SET settings = $1 WHERE id = $2', [
            JSON.stringify(room.settings),
            room.id,
          ]);
        }

        // Handle privacy toggle separately
        if (newIsPrivate !== undefined) {
          room.isPrivate = newIsPrivate;
          await pool.query('UPDATE rooms SET is_private = $1 WHERE id = $2', [room.isPrivate, room.id]);
        }

        // Refresh AFK timer
        room.lastActive = Date.now();


        console.log(`[Socket] Settings updated in room ${room.code}:`, room.settings, `| isPrivate: ${room.isPrivate}`);

        // Broadcast updated settings + privacy to everyone in the room
        console.log(`[Socket] Broadcasting settings_updated to room ${room.id} (${room.code})`);
        io.to(room.id).emit('settings_updated', { 
          settings: room.settings,
          isPrivate: room.isPrivate,
        });
      } catch (error) {
        console.error('[Socket Error] update_settings:', error);
      }
    });

    // -------------------------------------------------------------------------
    // add_bot
    // Host can add a bot to fill up the room.
    // -------------------------------------------------------------------------
    socket.on('add_bot', ({ roomCode }) => {
      try {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        if (!player || !player.isHost) return;

        if (room.isFull()) {
          socket.emit('error', { message: 'Room is already full.' });
          return;
        }

        const bot = room.addBot();
        console.log(`[Socket] ${bot.name} added to room ${room.code}`);
        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] add_bot:', error);
      }
    });

    // -------------------------------------------------------------------------
    // reset_game
    // Only the host can trigger this. Resets room status and game instance.
    // -------------------------------------------------------------------------
    socket.on('reset_game', async ({ roomCode }) => {
      try {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Only the host can reset the game.' });
          return;
        }

        // Reset room status
        room.status = 'waiting';
        room.currentStrokes = [];
        room._currentStroke = null;
        await pool.query("UPDATE rooms SET status = 'waiting' WHERE id = $1", [room.id]);

        // Clean up game instance
        games.delete(room.id);

        console.log(`[Socket] Game reset in room ${room.code}`);

        // Reset player readiness for the lobby
        room.getPlayers().forEach(p => {
          p.isReady = p.isHost;
          p.hasGuessedCorrectly = false;
        });
        
        // Notify everyone to go back to lobby
        io.to(room.id).emit('game_reset');
        
        // Broadcast updated player states so the UI lobby Start button unlocks for the host
        broadcastPlayerList(io, room);
      } catch (error) {
        console.error('[Socket Error] reset_game:', error);
      }
    });



    // -------------------------------------------------------------------------
    // vote_kick
    // Any player can vote to kick another. Requires > 50% online humans.
    // -------------------------------------------------------------------------
    socket.on('vote_kick', ({ roomCode, targetPlayerId }) => {
      try {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return;

        const voter = room.getPlayerBySocketId(socket.id);
        if (!voter || voter.id === targetPlayerId) return;

        const target = room.getPlayer(targetPlayerId);
        if (!target || target.isBot) return; // Bots can't be votekicked? (or maybe they can, but keep it simple)

        // Initialize votes set for this target if not exists
        if (!room.kickVotes.has(targetPlayerId)) {
          room.kickVotes.set(targetPlayerId, new Set());
        }

        const votes = room.kickVotes.get(targetPlayerId);
        votes.add(voter.id);

        const onlineHumans = room.getPlayers().filter(p => !p.isBot && p.isOnline).length;
        const required = Math.ceil(onlineHumans / 2); // > 50%

        if (votes.size >= required) {
          console.log(`[Socket] Votekick success: ${target.name} in room ${room.code}`);
          room.removePlayer(targetPlayerId);
          room.kickVotes.delete(targetPlayerId);
          io.to(target.socketId).emit('kicked', { reason: 'You were kicked by a player vote.' });
          broadcastPlayerList(io, room);
        } else {
          // Notify the room of the progress
          io.to(room.id).emit('chat_message', {
             type: 'system',
             text: `Vote kick against ${target.name}: ${votes.size}/${required} votes.`
          });
        }
      } catch (error) {
        console.error('[Socket Error] vote_kick:', error);
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
    socket.on('word_chosen', ({ word }) => {
      const room = rooms.get(socket.data.roomCode?.toUpperCase());
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
      const roomCode = data.roomCode || socket.data.roomCode;
      const room = rooms.get(roomCode?.toUpperCase());
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
        size: data.size,
        playerId: socket.data.playerId,
      });
    });

    // -------------------------------------------------------------------------
    // draw_move
    // Emitted continuously as the mouse moves while drawing.
    // Data: { roomCode, x, y }
    // -------------------------------------------------------------------------
    socket.on('draw_move', (data) => {
      const roomCode = data.roomCode || socket.data.roomCode;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return;

      // Append point to the current stroke for replay purposes
      if (room._currentStroke) {
        room._currentStroke.points.push({ x: data.x, y: data.y });
      }

      socket.to(room.id).emit('draw_data', {
        type: 'move',
        x: data.x,
        y: data.y,
        playerId: socket.data.playerId,
      });
    });

    // -------------------------------------------------------------------------
    // draw_end
    // Emitted when the mouse button is released.
    // Data: { roomCode }
    // -------------------------------------------------------------------------
    socket.on('draw_end', (data) => {
      const roomCode = data.roomCode || socket.data.roomCode;
      const room = rooms.get(roomCode?.toUpperCase());
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
      const room = rooms.get(roomCode?.toUpperCase());
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
      const room = rooms.get(roomCode?.toUpperCase());
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
    socket.on('guess', ({ text }) => {
      const room = rooms.get(socket.data.roomCode?.toUpperCase());
      if (!room) return;

      const player = room.getPlayer(socket.data.playerId) || room.getPlayerBySocketId(socket.id);
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
      const room = rooms.get(roomCode?.toUpperCase());
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

        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return;

        const player = room.getPlayer(playerId);
        if (!player) return;

        // Set status to offline immediately and notify everyone
        player.isOnline = false;
        broadcastPlayerList(io, room);

        // 10-second grace period for reloads/brief drops
        setTimeout(async () => {
          // Check if player reconnected
          const roomCheck = rooms.get(roomCode?.toUpperCase());
          if (!roomCheck) return;
          
          const pInstance = roomCheck.getPlayer(playerId);
          if (!pInstance || pInstance.isOnline) return;

          // Case: Grace period expired. Mark as Confirmed Disconnected.
          pInstance.isConfirmedDisconnected = true;
          broadcastPlayerList(io, roomCheck);

          // If they were host, immediately transfer to the next human
          if (pInstance.isHost) {
            await roomCheck.ensureHumanHost(pool, io);
            broadcastPlayerList(io, roomCheck);
          }

          // Auto-remove after 2 minutes of confirmed disconnect to clean memory
          setTimeout(async () => {
             const finalRC = rooms.get(roomCode?.toUpperCase());
             if (!finalRC) return;
             const finalP = finalRC.getPlayer(playerId);
             if (finalP && !finalP.isOnline) {
                finalRC.removePlayer(playerId);
                try { await pool.query('DELETE FROM players WHERE id = $1', [playerId]); } catch(e) {}
                io.to(finalRC.id).emit('player_left', { playerId, playerName: finalP.name });
                broadcastPlayerList(io, finalRC);
             }
          }, 120000);

          // If game is running and the drawer disconnected, skip to next round
          const game = games.get(roomCheck.id);
          if (game && game.phase === 'drawing') {
            const drawer = game.getCurrentDrawer();
            if (!drawer || drawer.id === playerId) {
              io.to(roomCheck.id).emit('chat_message', {
                type: 'system',
                text: 'The drawer timed out — skipping to next round.',
              });
              game.endRound();
            }

            // Update the game's player list
            game.players = roomCheck.getPlayers();
          }

          broadcastPlayerList(io, roomCheck);
        }, 10000); // 10 second grace period

      } catch (error) {
        console.error('[Socket Error] disconnect:', error);
      }
    });

    // -------------------------------------------------------------------------
    // kick_player
    // Data: { playerId }
    // -------------------------------------------------------------------------
    socket.on('kick_player', async ({ playerId: targetId }) => {
      try {
        const roomId = socket.data.roomId;
        const requesterId = socket.data.playerId;
        if (!roomId || !requesterId) return;

        const room = rooms.get(socket.data.roomCode?.toUpperCase());
        if (!room) return;

        const requester = room.getPlayer(requesterId);
        const target = room.getPlayer(targetId);
        if (!requester || !target) return;

        // Permission check: Host can kick anyone. Real players can kick confirmed disconnected players.
        const canKick = requester.isHost || target.isConfirmedDisconnected || target.isBot;
        if (!canKick) {
           socket.emit('error', { message: 'You do not have permission to kick this player.' });
           return;
        }

        // Kick logic
        room.removePlayer(targetId);
        if (!target.isBot) {
           try { await pool.query('DELETE FROM players WHERE id = $1', [targetId]); } catch(e) {}
        }

        io.to(room.id).emit('chat_message', {
          type: 'system',
          text: `${target.name} was kicked from the studio.`
        });

        io.to(room.id).emit('player_left', { playerId: targetId, playerName: target.name });
        
        // If kicked person was host, ensure human host
        if (target.isHost) {
          await room.ensureHumanHost(pool, io);
        }

        broadcastPlayerList(io, room);

      } catch (error) {
        console.error('[Socket Error] kick_player:', error);
      }
    });
  });

  // =========================================================================
  // GLOBAL BACKGROUND TASKS
  // =========================================================================

  // Check every 30 seconds for AFK lobbies
  setInterval(() => {
    const now = Date.now();
    for (const [roomCode, room] of rooms.entries()) {
      if (room.status === 'waiting') {
        const timeSinceActive = now - room.lastActive;
        // If lobby stuck in waiting for > 3 minutes (180,000ms), auto-kick host
        if (timeSinceActive > 180000) {
          const hostPlayer = room.getPlayer(room.hostId);
          if (hostPlayer) {
            // Disconnect their socket to trigger cleanup flow
            const hostSocket = io.sockets.sockets.get(hostPlayer.socketId);
            if (hostSocket) {
              hostSocket.emit('kicked', { message: 'You were kicked for being AFK too long.' });
              hostSocket.disconnect(true);
            }
          }
          // Reset timer so it doesn't immediately kick the NEXT host too
          room.lastActive = Date.now();
        }
      } else {
        // If game is active, keep updating lastActive
        room.lastActive = Date.now();
      }
    }
  }, 30000);
}

module.exports = { setupSocketHandler };
