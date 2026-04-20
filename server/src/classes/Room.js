// Room.js
// Represents a game room (lobby).
// Holds all the players in a Map and exposes helper methods.

class Room {
  constructor({ id, code, hostId, settings, isPrivate = false }) {
    this.id = id;           // UUID for this room
    this.code = code;        // 6-char code players type to join
    this.hostId = hostId;    // player ID of the host
    this.isPrivate = isPrivate; // NEW

    // Default game settings — can be changed by the host in the lobby
    this.settings = {
      maxPlayers: settings?.maxPlayers || 8,
      rounds: settings?.rounds || 3,
      drawTime: settings?.drawTime || 80,  // seconds per turn
      wordCount: settings?.wordCount || 3, // number of word choices shown
      hints: settings?.hints || 2,         // number of hints revealed
    };

    // Map of playerId → Player object for fast lookups
    this.players = new Map();

    // Room status: 'waiting' | 'playing' | 'finished'
    this.status = 'waiting';
    this.lastActive = Date.now();

    // Strokes drawn so far in the current round (used for replay on join)
    this.currentStrokes = [];
  }

  // ---------------------------------------------------------------------------
  // isPublicAndAvailable()
  // Returns true if room is public, not full, and not started
  // ---------------------------------------------------------------------------
  isPublicAndAvailable() {
    return (
      !this.isPrivate && 
      this.players.size < this.settings.maxPlayers && 
      this.status === 'waiting'
    );
  }

  // ---------------------------------------------------------------------------
  // addPlayer(player)
  // Adds a Player instance to the room's player map.
  // ---------------------------------------------------------------------------
  addPlayer(player) {
    this.players.set(player.id, player);
  }

  // ---------------------------------------------------------------------------
  // addBot()
  // Adds a bot player to the room.
  // ---------------------------------------------------------------------------
  addBot() {
    const Player = require('./Player');
    const { v4: uuidv4 } = require('uuid');
    
    // Generate a random bot name
    const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Echo', 'Bot Zeta'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    
    const bot = new Player({
      id: uuidv4(),
      name: botName,
      socketId: `bot_${uuidv4()}`,
      roomId: this.id,
      isBot: true
    });
    
    // Bots are always ready
    bot.isReady = true;
    this.addPlayer(bot);
    
    return bot;
  }

  // ---------------------------------------------------------------------------
  // removePlayer(playerId)
  // Removes a player from the room. Returns the removed Player (or undefined).
  // ---------------------------------------------------------------------------
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    this.players.delete(playerId);
    return player;
  }

  // ---------------------------------------------------------------------------
  // getPlayer(playerId)
  // Finds and returns a single player by their ID.
  // ---------------------------------------------------------------------------
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  // ---------------------------------------------------------------------------
  // getPlayers()
  // Returns all players as a plain array (safe to iterate and emit).
  // ---------------------------------------------------------------------------
  getPlayers() {
    return Array.from(this.players.values());
  }

  // ---------------------------------------------------------------------------
  // getPlayerBySocketId(socketId)
  // Finds a player by their current Socket.IO socket ID.
  // Used when a socket event fires and we only know the socket ID.
  // ---------------------------------------------------------------------------
  getPlayerBySocketId(socketId) {
    for (const player of this.players.values()) {
      if (player.socketId === socketId) return player;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // isFull()
  // Returns true if no more players can join.
  // ---------------------------------------------------------------------------
  isFull() {
    return this.players.size >= this.settings.maxPlayers;
  }

  // ---------------------------------------------------------------------------
  // resetRound()
  // Resets per-round state for all players and clears drawn strokes.
  // ---------------------------------------------------------------------------
  resetRound() {
    for (const player of this.players.values()) {
      player.resetRound();
    }
    this.currentStrokes = [];
  }

  // ---------------------------------------------------------------------------
  // toJSON()
  // Returns a plain object representation for safe serialization.
  // ---------------------------------------------------------------------------
  toJSON() {
    return {
      id: this.id,
      code: this.code,
      hostId: this.hostId,
      settings: this.settings,
      isPrivate: this.isPrivate,
      status: this.status,
      players: this.getPlayers().map((p) => p.toJSON()),
    };
  }
}

module.exports = Room;
