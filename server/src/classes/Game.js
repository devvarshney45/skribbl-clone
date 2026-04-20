// Game.js
// Controls the entire game flow for one room:
//   - Round progression
//   - Word selection
//   - Timer with hint reveals
//   - Score calculation
//   - Game over logic

const { pool } = require('../db/database');

// Senior Level Sketch Registry: Maps words to geometric instructions
const sketchRegistry = {
  apple: [
    { type: 'circle', x: 400, y: 350, r: 80, color: '#ef4444' }, // body
    { type: 'line', x1: 400, y1: 270, x2: 410, y2: 240, color: '#10b981' }, // stem
  ],
  moon: [
    { type: 'circle', x: 400, y: 300, r: 100, color: '#fef3c7' }, // glow
    { type: 'circle', x: 430, y: 280, r: 80, color: '#000000' }, // shadow (crescent effect) - wait, canvas is usually white/bg, but we just draw the shape
  ],
  sun: [
    { type: 'circle', x: 400, y: 300, r: 80, color: '#f59e0b' },
    { type: 'line', x1: 400, y1: 200, x2: 400, y2: 150, color: '#f59e0b' },
    { type: 'line', x1: 400, y1: 400, x2: 400, y2: 450, color: '#f59e0b' },
    { type: 'line', x1: 300, y1: 300, x2: 250, y2: 300, color: '#f59e0b' },
    { type: 'line', x1: 500, y1: 300, x2: 550, y2: 300, color: '#f59e0b' },
  ],
  skyscraper: [
    { type: 'rect', x: 350, y: 150, w: 100, h: 400, color: '#3b82f6' },
    { type: 'rect', x: 370, y: 200, w: 20, h: 20, color: '#fbbf24' },
    { type: 'rect', x: 410, y: 200, w: 20, h: 20, color: '#fbbf24' },
  ],
  pizza: [
    { type: 'circle', x: 400, y: 300, r: 120, color: '#fbbf24' }, // crust
    { type: 'circle', x: 360, y: 270, r: 15, color: '#ef4444' }, // pepperoni
    { type: 'circle', x: 440, y: 330, r: 15, color: '#ef4444' },
    { type: 'circle', x: 370, y: 350, r: 15, color: '#ef4444' },
  ],
  dog: [
    { type: 'rect', x: 300, y: 350, w: 180, h: 90, color: '#78350f' }, // body
    { type: 'rect', x: 440, y: 300, w: 70, h: 70, color: '#78350f' }, // head
    { type: 'line', x1: 310, y1: 440, x2: 310, y2: 480, color: '#78350f' }, // legs
    { type: 'line', x1: 470, y1: 440, x2: 470, y2: 480, color: '#78350f' },
  ],
  telescope: [
    { type: 'rect', x: 300, y: 250, w: 250, h: 40, color: '#64748b' },
    { type: 'line', x1: 425, y1: 290, x2: 400, y2: 350, color: '#64748b' },
    { type: 'line', x1: 425, y1: 290, x2: 450, y2: 350, color: '#64748b' },
  ],
  submarine: [
    { type: 'rect', x: 300, y: 300, w: 250, h: 100, color: '#facc15' },
    { type: 'circle', x: 350, y: 350, r: 15, color: '#0ea5e9' },
    { type: 'circle', x: 425, y: 350, r: 15, color: '#0ea5e9' },
    { type: 'rect', x: 400, y: 260, w: 40, h: 40, color: '#facc15' },
  ],
  house: [
    { type: 'rect', x: 350, y: 350, w: 100, h: 100, color: '#f97316' }, // base
    { type: 'line', x1: 350, y1: 350, x2: 400, y2: 300, color: '#ef4444' }, // roof-left
    { type: 'line', x1: 400, y1: 300, x2: 450, y2: 350, color: '#ef4444' }, // roof-right
    { type: 'rect', x: 385, y: 400, w: 30, h: 50, color: '#78350f' }, // door
  ],
  tree: [
    { type: 'rect', x: 390, y: 400, w: 20, h: 100, color: '#78350f' }, // trunk
    { type: 'circle', x: 400, y: 350, r: 60, color: '#22c55e' }, // leaves
  ],
  car: [
    { type: 'rect', x: 300, y: 350, w: 200, h: 70, color: '#3b82f6' }, // body
    { type: 'circle', x: 340, y: 420, r: 20, color: '#000000' }, // wheel1
    { type: 'circle', x: 460, y: 420, r: 20, color: '#000000' }, // wheel2
  ],
  flower: [
    { type: 'line', x1: 400, y1: 450, x2: 400, y2: 350, color: '#10b981' }, // stem
    { type: 'circle', x: 400, y: 320, r: 25, color: '#f59e0b' }, // center
    { type: 'circle', x: 400, y: 300, r: 20, color: '#f43f5e' }, // petal top
  ],
  laptop: [
    { type: 'rect', x: 320, y: 380, w: 160, h: 20, color: '#64748b' }, // base
    { type: 'rect', x: 330, y: 250, w: 140, h: 130, color: '#94a3b8' }, // screen
  ],
  sword: [
    { type: 'rect', x: 390, y: 400, w: 20, h: 80, color: '#78350f' }, // handle
    { type: 'rect', x: 350, y: 390, w: 100, h: 10, color: '#78350f' }, // crossguard
    { type: 'line', x1: 400, y1: 390, x2: 400, y2: 100, color: '#cbd5e1' }, // blade
  ],
  cloud: [
    { type: 'circle', x: 350, y: 250, r: 40, color: '#f8fafc' },
    { type: 'circle', x: 400, y: 230, r: 50, color: '#f8fafc' },
    { type: 'circle', x: 450, y: 250, r: 40, color: '#f8fafc' },
  ],
  mountain: [
    { type: 'line', x1: 150, y1: 500, x2: 400, y2: 150, color: '#475569' }, // left slope
    { type: 'line', x1: 400, y1: 150, x2: 650, y2: 500, color: '#475569' }, // right slope
    { type: 'line', x1: 350, y1: 220, x2: 450, y2: 220, color: '#ffffff' }, // snow peak base
  ],
  computer: [
    { type: 'rect', x: 250, y: 150, w: 300, h: 200, color: '#1e293b' }, // monitor
    { type: 'rect', x: 380, y: 350, w: 40, h: 50, color: '#334155' }, // stand
    { type: 'rect', x: 330, y: 400, w: 140, h: 10, color: '#334155' }, // base
  ],
  tree: [
    { type: 'rect', x: 385, y: 350, w: 30, h: 100, color: '#78350f' }, // trunk
    { type: 'circle', x: 400, y: 300, r: 60, color: '#15803d' }, // leaves
    { type: 'circle', x: 360, y: 320, r: 50, color: '#15803d' },
    { type: 'circle', x: 440, y: 320, r: 50, color: '#15803d' },
  ],
  car: [
    { type: 'rect', x: 300, y: 350, w: 200, h: 60, color: '#3b82f6' }, // body
    { type: 'rect', x: 340, y: 310, w: 120, h: 40, color: '#60a5fa' }, // roof
    { type: 'circle', x: 340, y: 410, r: 20, color: '#1e293b' }, // wheels
    { type: 'circle', x: 460, y: 410, r: 20, color: '#1e293b' },
  ],
  star: [
    { type: 'line', x1: 400, y1: 200, x2: 450, y2: 350, color: '#facc15' },
    { type: 'line', x1: 450, y1: 350, x2: 300, y2: 250, color: '#facc15' },
    { type: 'line', x1: 300, y1: 250, x2: 500, y2: 250, color: '#facc15' },
    { type: 'line', x1: 500, y1: 250, x2: 350, y2: 350, color: '#facc15' },
    { type: 'line', x1: 350, y1: 350, x2: 400, y2: 200, color: '#facc15' },
  ],
};

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
        options: this.wordOptions // Bulletproof delivery
      });

      // RELIABILITY FIX: Use the latest socket ID from the player object 
      // which is updated on every reconnection/join.
      this.io.to(`user_${drawer.id}`).emit('word_options', {
        words: this.wordOptions,
        round: this.currentRound,
        totalRounds: this.totalRounds,
        drawerName: drawer.name,
      });

      // If bot is drawing, they auto-select instantly
      if (drawer.isBot) {
        setTimeout(() => {
          if (this.phase === 'choosing' && this.wordOptions.length > 0) {
            this.chooseWord(this.wordOptions[0]);
          }
        }, 1500);
      } else {
        // Introduce a visual countdown timer for word selection (10 seconds)
        this.choosingTimeLeft = 10;
        this.io.to(this.roomId).emit('timer_update', { timeLeft: this.choosingTimeLeft });
        
        this.wordChoiceInterval = setInterval(() => {
          this.choosingTimeLeft -= 1;
          this.io.to(this.roomId).emit('timer_update', { timeLeft: this.choosingTimeLeft });
          
          if (this.choosingTimeLeft <= 0) {
            clearInterval(this.wordChoiceInterval);
            this.wordChoiceInterval = null;
            if (!this.currentWord) {
              console.log(`[Game] Drawer ${drawer.name} did not pick — auto-selecting.`);
              this.chooseWord(this.wordOptions && this.wordOptions.length > 0 ? this.wordOptions[0] : 'emergency');
            }
          }
        }, 1000);
      }

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
    // Clear the auto-pick timer
    if (this.wordChoiceInterval) {
        clearInterval(this.wordChoiceInterval);
        this.wordChoiceInterval = null;
    }

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

    // Provide the actual word to the drawer immediately for UI display
    const drawer = this.getCurrentDrawer();
    if (drawer && !drawer.isBot) {
        this.io.to(`user_${drawer.id}`).emit('word_selected', { word: safeWord });
    }

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
    if (this.botDrawingInterval) clearInterval(this.botDrawingInterval);
    if (this.botGuessingInterval) clearInterval(this.botGuessingInterval);

    this.setupBotSimulators();

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

      // Points formula heavily based on time remaining:
      // Max 300 points from time ratio, plus a flat bonus for being an early guesser (up to 100)
      const timeRatio = Math.max(0, this.timeLeft / this.settings.drawTime); // 0.0 to 1.0
      const timePoints = Math.floor(timeRatio * 300);
      const orderBonus = Math.max(0, 100 - (this.guessOrder - 1) * 20); // 100 for 1st, 80 for 2nd...
      
      const points = Math.max(10, timePoints + orderBonus);
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
    if (this.botDrawingInterval) {
      clearInterval(this.botDrawingInterval);
      this.botDrawingInterval = null;
    }
    if (this.botGuessingInterval) {
      clearInterval(this.botGuessingInterval);
      this.botGuessingInterval = null;
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
    if (this.botDrawingInterval) clearInterval(this.botDrawingInterval);
    if (this.botGuessingInterval) clearInterval(this.botGuessingInterval);
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
  // setupBotSimulators()
  // Handles bot drawing simulation and random guessing.
  // ---------------------------------------------------------------------------
  setupBotSimulators() {
    const drawer = this.getCurrentDrawer();
    
    // 1. Bot Drawing Simulation (Enhanced Keyword-Aware Intelligence)
    if (drawer && drawer.isBot) {
      const sketchData = sketchRegistry[this.currentWord?.toLowerCase()];
      let stepIndex = 0;
      let instructionIndex = 0;

      if (sketchData) {
        // Case A: Keyword-Aware Intelligent Drawing
        this.botDrawingInterval = setInterval(() => {
          const instruction = sketchData[instructionIndex];
          if (!instruction) {
             clearInterval(this.botDrawingInterval);
             return;
          }

          let x, y;
          const t = stepIndex * 0.2;
          const size = instruction.size || 6;

          // Re-draw instructions as smooth paths
          if (instruction.type === 'circle') {
             x = instruction.x + Math.cos(t) * instruction.r;
             y = instruction.y + Math.sin(t) * instruction.r;
          } else if (instruction.type === 'rect') {
             // Basic rect path tracing: 0.25 segments per side
             if (t < Math.PI/2) { // Top
                x = instruction.x + (t/(Math.PI/2)) * instruction.w;
                y = instruction.y;
             } else if (t < Math.PI) { // Right
                x = instruction.x + instruction.w;
                y = instruction.y + ((t-Math.PI/2)/(Math.PI/2)) * instruction.h;
             } else if (t < 1.5*Math.PI) { // Bottom
                x = instruction.x + instruction.w - ((t-Math.PI)/(Math.PI/2)) * instruction.w;
                y = instruction.y + instruction.h;
             } else { // Left
                x = instruction.x;
                y = instruction.y + instruction.h - ((t-1.5*Math.PI)/(Math.PI/2)) * instruction.h;
             }
          } else if (instruction.type === 'line') {
             const progress = Math.min(1, t / Math.PI);
             x = instruction.x1 + (instruction.x2 - instruction.x1) * progress;
             y = instruction.y1 + (instruction.y2 - instruction.y1) * progress;
          }

          if (stepIndex === 0) {
            this.io.to(this.roomId).emit('draw_data', {
              type: 'start', x, y, color: instruction.color, size, playerId: drawer.id
            });
          } else {
            this.io.to(this.roomId).emit('draw_data', {
              type: 'move', x, y, playerId: drawer.id
            });
          }

          stepIndex++;
          // High fidelity: switch instructions every ~25 points for smoother transitions
          if (stepIndex > 25) {
             this.io.to(this.roomId).emit('draw_data', { type: 'end', playerId: drawer.id });
             instructionIndex++;
             stepIndex = 0;
             if (instructionIndex >= sketchData.length) {
                // If it's a bot, it might stop or start over
                if (Math.random() > 0.6) {
                   clearInterval(this.botDrawingInterval);
                   return;
                }
                instructionIndex = 0;
             }
          }
        }, 55); // Slightly slower for more organic feel

      } else {
        // Case B: Sophisticated "Canvas Blobs" (Improved Fallback)
        let patternStep = 0;
        const colors = ['#f8fafc', '#e2e8f0', '#cbd5e1']; // Draft-style colors
        const centerX = 400;
        const centerY = 300;

        this.botDrawingInterval = setInterval(() => {
          if (patternStep > 40) {
              this.io.to(this.roomId).emit('draw_data', { type: 'end', playerId: drawer.id });
              patternStep = 0;
              return;
          }

          // Draw a rough central blob to simulate "roughing out" the shape
          const r = 40 + Math.random() * 60;
          const t = patternStep * 0.3;
          const x = centerX + Math.cos(t) * r;
          const y = centerY + Math.sin(t) * r;

          if (patternStep === 0) {
            this.io.to(this.roomId).emit('draw_data', { type: 'start', x, y, color: colors[0], size: 4, playerId: drawer.id });
          } else {
            this.io.to(this.roomId).emit('draw_data', { type: 'move', x, y, playerId: drawer.id });
          }
          patternStep++;
        }, 80);
      }
    }
    
    // 2. Bot Guessing Simulation (Reactive Intelligence)
    const startTime = Date.now();
    const GUESSING_DELAY_MS = 8000; // 8 second hard delay

    const dummyWords = ['apple', 'cat', 'house', 'tree', 'sun', 'moon', 'fish', 'bird', 'car', 'book', 'pizza', 'star'];
    this.botGuessingInterval = setInterval(() => {
      // Hard Delay: Do nothing for the first 8 seconds
      if (Date.now() - startTime < GUESSING_DELAY_MS) return;

      const guessingBots = this.players.filter(p => p.isBot && p.id !== drawer?.id && !p.hasGuessedCorrectly);
      
      guessingBots.forEach(bot => {
        // Reduced frequency for a more natural feel (25% check chance)
        if (Math.random() > 0.25) return;
        
        const timeRatio = (this.settings.drawTime - this.timeLeft) / this.settings.drawTime; 
        
        // QUADRATIC PROBABILITY: Chance remains extremely low early on and ramps up significantly late
        // Formula: 0.02 base + (ratio^2 * 0.65)
        let correctChance = 0.02 + (timeRatio * timeRatio * 0.65); 
        
        // HINT REACTIVITY: Massive boost if hints are heavily revealed
        const revealedHints = this.wordHints.filter(h => h !== '_').length;
        const totalLetters = this.currentWord?.length || 1;
        if (revealedHints / totalLetters > 0.4) {
             correctChance += 0.30; 
        }

        let guessWord = '';
        if (Math.random() < correctChance && this.currentWord) {
          guessWord = this.currentWord;
        } else {
          guessWord = dummyWords[Math.floor(Math.random() * dummyWords.length)];
        }
        
        const result = this.handleGuess(bot, guessWord);
        
        if (result?.correct) {
          this.io.to(this.roomId).emit('chat_message', { type: 'correct', playerName: bot.name, text: 'guessed the word!' });
          this.io.to(this.roomId).emit('player_guessed', { playerId: bot.id, points: result.points, guessOrder: result.guessOrder });
        } else {
          this.io.to(this.roomId).emit('chat_message', { type: 'chat', playerName: bot.name, text: guessWord });
        }
      });
    }, 1500); 
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
