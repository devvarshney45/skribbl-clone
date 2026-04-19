// Game.js
// Controls the entire game flow for one room:
//   - Round progression
//   - Word selection
//   - Timer with hint reveals
//   - Score calculation
//   - Game over logic

const { pool } = require('../db/database');

class Game {
  constructor({ roomId, settings, players, io, onRoundStart }) {
    this.roomId = roomId;          // which room this game belongs to
    this.io = io;                  // Socket.IO server instance (for broadcasting)
    this.settings = settings;      // { rounds, drawTime, wordCount, hints }
    this.onRoundStart = onRoundStart; // Callback to clear server room state

    // All players in turn order (array of Player objects)
    this.players = players;

    // Round tracking
    this.totalRounds = settings.rounds;
    this.currentRound = 1;

    // Drawer tracking — index into this.players array
    this.currentDrawerIndex = 0;

    // Word state
    this.currentWord = null;        // the actual word string
    this.wordHints = [];            // array of chars or '_', e.g. ['_','p','_','e']
    this.wordOptions = [];          // currently offered choices for the drawer

    // Timer
    this.timerInterval = null;       // setInterval handle
    this.timeLeft = settings.drawTime;

    // Phase: 'choosing' | 'drawing' | 'roundEnd' | 'gameOver'
    this.phase = 'choosing';

    // Track how many players have guessed correctly this round
    this.correctGuessCount = 0;

    // Track guess order for scoring (1st guesser gets most points)
    this.guessOrder = 0;
  }

  // ---------------------------------------------------------------------------
  // start()
  // Kicks off the very first round.
  // ---------------------------------------------------------------------------
  async start() {
    console.log(`[Game] Starting game in room ${this.roomId}`);
    await this.startRound();
  }

  // ---------------------------------------------------------------------------
  // startRound()
  // Sets up everything needed for one drawing round:
  //   1. Reset all player round state
  //   2. Pick the drawer
  //   3. Fetch 3 random word choices from DB
  //   4. Emit word choices to drawer, blank hints to everyone else
  // ---------------------------------------------------------------------------
  async startRound() {
    this.phase = 'choosing';
    this.currentWord = null;
    this.wordHints = [];
    this.correctGuessCount = 0;
    this.guessOrder = 0;
    this.timeLeft = this.settings.drawTime;

    // Reset per-round flags on every player
    for (const player of this.players) {
      player.resetRound();
    }

    // Clear server strokes and notify clients
    if (this.onRoundStart) {
      this.onRoundStart();
    }
    this.io.to(this.roomId).emit('canvas_cleared');

    // Figure out who is drawing this turn
    const drawer = this.players[this.currentDrawerIndex];
    if (!drawer) {
      console.error('[Game] No drawer found — ending game.');
      this.endGame();
      return;
    }

    console.log(`[Game] Round ${this.currentRound}/${this.totalRounds} — Drawer: ${drawer.name}`);

    try {
      // Pull random words from the database
      const { rows } = await pool.query(
        'SELECT word FROM words ORDER BY RANDOM() LIMIT $1',
        [this.settings.wordCount]
      );
      let fetchedOptions = rows.map((row) => row.word);
      if (fetchedOptions.length === 0) {
        fetchedOptions = ['apple', 'dog', 'painting'];
      }
      this.wordOptions = fetchedOptions;

      // Tell everyone else that a round is starting (no word revealed yet)
      this.io.to(this.roomId).emit('round_start', {
        round: this.currentRound,
        totalRounds: this.totalRounds,
        drawerId: drawer.id,
        drawerName: drawer.name,
        wordLength: 0, // will update once word is chosen
      });

      // RELIABILITY FIX: Use the latest socket ID from the player object 
      // which is updated on every reconnection/join.
      this.io.to(`user_${drawer.id}`).emit('word_options', {
        words: this.wordOptions,
        round: this.currentRound,
        totalRounds: this.totalRounds,
        drawerName: drawer.name,
      });

      // Auto-pick a word if the drawer doesn't choose within 10 seconds
      this.wordChoiceTimeout = setTimeout(() => {
        if (!this.currentWord) {
          console.log(`[Game] Drawer ${drawer.name} did not pick — auto-selecting.`);
          this.chooseWord(this.wordOptions[0]);
        }
      }, 10000);
    } catch (error) {
      console.error('[Game Error] Failed to fetch words:', error);
      this.endGame();
    }
  }

  // ---------------------------------------------------------------------------
  // chooseWord(word)
  // Called when the drawer picks a word (or when auto-pick fires).
  // Builds the blank hint array and starts the countdown timer.
  // ---------------------------------------------------------------------------
  chooseWord(word) {
    // Clear the auto-pick timeout if it's still pending
    clearTimeout(this.wordChoiceTimeout);

    // Safety fallback to prevent crashes if word is ever undefined
    const safeWord = word || 'emergency';

    this.currentWord = safeWord;
    this.wordOptions = []; // Clear options once chosen
    this.phase = 'drawing';

    // Build hint array: spaces stay as spaces, letters become '_'
    // e.g. "ice cream" → ['_','_','_',' ','_','_','_','_','_']
    this.wordHints = safeWord.split('').map((char) => {
      if (char === ' ') return ' ';
      return '_';
    });

    console.log(`[Game] Word chosen: "${word}" — starting timer`);

    // Broadcast the word length and blank hints to everyone in the room
    this.io.to(this.roomId).emit('game_state', {
      phase: 'drawing',
      wordHints: this.wordHints,
      wordLength: word.length,
      timeLeft: this.timeLeft,
    });

    // Start the countdown
    this.startTimer();
  }

  // ---------------------------------------------------------------------------
  // startTimer()
  // Counts down every second. At 30s and 60s remaining, reveals hint letters.
  // When time hits 0, ends the round automatically.
  // ---------------------------------------------------------------------------
  startTimer() {
    // Safety: clear any existing timer
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.timeLeft -= 1;

      // Emit tick to everyone in the room
      this.io.to(this.roomId).emit('timer_update', { timeLeft: this.timeLeft });

      // Hint reveal logic
      const drawTime = this.settings.drawTime;

      // First hint: when 2/3 of time is gone (e.g. at 26s left if drawTime=80)
      const firstHintAt  = Math.floor(drawTime * (1 / 3));
      // Second hint: when 5/6 of time is gone (e.g. at 13s left if drawTime=80)
      const secondHintAt = Math.floor(drawTime * (1 / 6));

      if (this.timeLeft === firstHintAt) {
        this.revealHintLetter();
      }
      if (this.timeLeft === secondHintAt) {
        this.revealHintLetter();
      }

      // Time is up — end the round
      if (this.timeLeft <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  // ---------------------------------------------------------------------------
  // revealHintLetter()
  // Picks one random unrevealed letter position and reveals it.
  // Emits updated hints to the room (but NOT to the drawer).
  // ---------------------------------------------------------------------------
  revealHintLetter() {
    if (!this.currentWord) return;

    // Collect indices of positions that are still '_' (not yet revealed)
    const hiddenIndices = [];
    for (let i = 0; i < this.wordHints.length; i++) {
      if (this.wordHints[i] === '_') hiddenIndices.push(i);
    }

    if (hiddenIndices.length === 0) return; // Nothing left to reveal

    // Pick a random hidden index and reveal it
    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    this.wordHints[randomIndex] = this.currentWord[randomIndex];

    console.log(`[Game] Hint revealed: ${this.wordHints.join(' ')}`);

    // Send updated hints to everyone (the drawer already knows the word)
    this.io.to(this.roomId).emit('hint_update', { wordHints: this.wordHints });
  }

  // ---------------------------------------------------------------------------
  // handleGuess(player, guessText)
  // Called when a player submits a chat guess.
  // Returns true if the guess was correct, false otherwise.
  // ---------------------------------------------------------------------------
  handleGuess(player, guessText) {
    // Drawer can't guess their own word
    if (player.id === this.players[this.currentDrawerIndex]?.id) return false;

    // This player already guessed correctly this round
    if (player.hasGuessedCorrectly) return false;

    // Compare guess case-insensitively and ignore extra whitespace
    const normalizedGuess = guessText.trim().toLowerCase();
    const normalizedWord  = this.currentWord?.trim().toLowerCase();

    if (normalizedGuess === normalizedWord) {
      // ✅ Correct guess!
      this.guessOrder += 1;
      player.hasGuessedCorrectly = true;

      // Points formula: 300 for first, -10 for each subsequent
      const points = Math.max(50, 300 - (this.guessOrder - 1) * 10);
      player.addScore(points);
      this.correctGuessCount += 1;

      console.log(`[Game] ${player.name} guessed correctly (#${this.guessOrder}) — +${points} pts`);

      // Check if all non-drawer players have guessed correctly
      const nonDrawers = this.players.filter(
        (p) => p.id !== this.players[this.currentDrawerIndex]?.id
      );
      const allGuessed = nonDrawers.every((p) => p.hasGuessedCorrectly);

      if (allGuessed) {
        console.log('[Game] Everyone guessed! Ending round early.');
        // Small delay so the last guesser's "Correct!" message shows before round ends
        setTimeout(() => this.endRound(), 1500);
      }

      return { correct: true, points, guessOrder: this.guessOrder };
    }

    return { correct: false };
  }

  // ---------------------------------------------------------------------------
  // endRound()
  // Stops the timer, gives the drawer their bonus points,
  // saves scores to PostgreSQL, and emits round_end to the room.
  // Then advances to the next round or ends the game.
  // ---------------------------------------------------------------------------
  async endRound() {
    // Stop the countdown — only run endRound logic once
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    } else {
      return; // Already ended
    }

    this.phase = 'roundEnd';

    const drawer = this.players[this.currentDrawerIndex];

    // Drawer gets 20 points per correct guesser (0 if nobody guessed)
    if (drawer && this.correctGuessCount > 0) {
      const drawerPoints = this.correctGuessCount * 20;
      drawer.addScore(drawerPoints);
      console.log(`[Game] Drawer ${drawer.name} earns +${drawerPoints} pts`);
    }

    // Save all player scores to the PostgreSQL database
    await this.saveScoresToDB();

    // Prepare leaderboard snapshot sorted by score (highest first)
    const leaderboard = this.players
      .map((p) => p.toJSON())
      .sort((a, b) => b.score - a.score);

    // Broadcast round end to everyone in the room
    this.io.to(this.roomId).emit('round_end', {
      word: this.currentWord,
      leaderboard,
      round: this.currentRound,
      totalRounds: this.totalRounds,
    });

    console.log(`[Game] Round ${this.currentRound} ended. Word was: "${this.currentWord}"`);

    // Wait 4 seconds before starting next round (so players can read the reveal)
    setTimeout(() => this.nextRound(), 4000);
  }

  // ---------------------------------------------------------------------------
  // nextRound()
  // Advances the drawer index and round counter.
  // If all rounds are done, calls endGame() instead.
  // ---------------------------------------------------------------------------
  async nextRound() {
    // 1. Check if the current cycle of players is finished
    this.currentDrawerIndex++;

    if (this.currentDrawerIndex >= this.players.length) {
      // Entire cycle of players finished drawing once each
      this.currentDrawerIndex = 0;
      this.currentRound++;
    }

    // 2. Check if we've completed the last round
    if (this.currentRound > this.totalRounds) {
      console.log(`[Game] All ${this.totalRounds} rounds completed — ending game.`);
      this.endGame();
    } else {
      // Start the next person's drawing turn
      await this.startRound();
    }
  }

  // ---------------------------------------------------------------------------
  // endGame()
  // Emits final leaderboard and winner to the room.
  // Cleans up any remaining timers.
  // ---------------------------------------------------------------------------
  endGame() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.phase = 'gameOver';

    const leaderboard = this.players
      .map((p) => p.toJSON())
      .sort((a, b) => b.score - a.score);

    const winner = leaderboard[0] || null;

    console.log(`[Game] Game over in room ${this.roomId}. Winner: ${winner?.name}`);

    this.io.to(this.roomId).emit('game_over', {
      winner,
      leaderboard,
    });
  }

  // ---------------------------------------------------------------------------
  // saveScoresToDB()
  // Persists each player's current cumulative score to the PostgreSQL players table.
  // ---------------------------------------------------------------------------
  async saveScoresToDB() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const player of this.players) {
        await client.query('UPDATE players SET score = $1 WHERE id = $2', [player.score, player.id]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Game Error] Failed to save scores:', error);
    } finally {
      client.release();
    }
  }

  // ---------------------------------------------------------------------------
  // getCurrentDrawer()
  // Helper to get the drawer Player object.
  // ---------------------------------------------------------------------------
  getCurrentDrawer() {
    return this.players[this.currentDrawerIndex] || null;
  }
}

module.exports = Game;
