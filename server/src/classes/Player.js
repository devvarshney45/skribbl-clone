// Player.js
// Represents a single player in the game.
// Each player has a name, score, and state for the current round.

class Player {
  constructor({ id, name, socketId, roomId, isBot = false }) {
    this.id = id;               // unique UUID for this player
    this.name = name;            // display name chosen by the player
    this.socketId = socketId;    // current Socket.IO connection ID
    this.roomId = roomId;        // which room this player belongs to
    this.score = 0;              // cumulative score across all rounds
    this.hasGuessedCorrectly = false; // did this player guess right this round?
    this.isReady = false;        // has the player clicked "Ready" in the lobby?
    this.isHost = false;         // is this player the room host?
    this.isBot = isBot;          // is this player a bot?
    this.isOnline = true;        // is the player currently connected via socket?
    this.isConfirmedDisconnected = false; // NEW: True after 10s of being offline
    this.avatar = this.getRandomAvatar(); // NEW
  }

  getRandomAvatar() {
    const avatars = ['🦊', '🐱', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦖', '🦄'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  // ---------------------------------------------------------------------------
  // addScore(points)
  // Called when a player guesses correctly. Adds points to their total score.
  // ---------------------------------------------------------------------------
  addScore(points) {
    this.score += points;
  }

  // ---------------------------------------------------------------------------
  // resetRound()
  // Called at the start of every new round to clear per-round state.
  // ---------------------------------------------------------------------------
  resetRound() {
    this.hasGuessedCorrectly = false;
  }

  // ---------------------------------------------------------------------------
  // toJSON()
  // Returns a plain object safe to send over Socket.IO to clients.
  // We never send the socketId to other players — that's private.
  // ---------------------------------------------------------------------------
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      roomId: this.roomId,
      score: this.score,
      hasGuessedCorrectly: this.hasGuessedCorrectly,
      isReady: this.isReady,
      isHost: this.isHost,
      isBot: this.isBot,
      isOnline: this.isOnline,
      isConfirmedDisconnected: this.isConfirmedDisconnected,
      avatar: this.avatar,
    };
  }
}

module.exports = Player;
