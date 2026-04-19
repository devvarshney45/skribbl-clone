const io = require('socket.io-client');
const assert = require('assert');

const URL = 'https://skribbl.devvarshney.me'; // or local: http://localhost:5000 if not live

const alpha = io(URL);
const beta = io(URL);

let roomCode = null;
let currentWord = null;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runTest() {
  console.log('[Test] Starting E2E...');
  
  // 1. Alpha creates room
  alpha.emit('create_room', { playerName: 'Alpha', roomCode: 'TEST12', isPrivate: true });
  
  await new Promise(resolve => {
    alpha.on('room_created', (data) => {
      roomCode = data.roomCode;
      console.log('[Alpha] Created room:', roomCode);
      resolve();
    });
  });

  // 2. Beta joins room
  beta.emit('join_room', { playerName: 'Beta', roomCode });

  await new Promise(resolve => {
    beta.on('joined_room', () => {
      console.log('[Beta] Joined room!');
      resolve();
    });
  });

  // 3. Both mark ready
  alpha.emit('player_ready', { roomCode });
  beta.emit('player_ready', { roomCode });
  
  await sleep(1000); // Give it a sec
  alpha.emit('start_game', { roomCode });
  console.log('[Test] Game Started');

  // 4. Alpha receives word options
  await new Promise(resolve => {
    alpha.on('round_start', (data) => {
      console.log('[Alpha] Round started, data:', Object.keys(data));
      if (data.options) {
        console.log('[Alpha] Word options received:', data.options);
        // Alpha chooses the 1st word
        alpha.emit('word_chosen', { roomCode, word: data.options[0] });
        currentWord = data.options[0];
        resolve();
      }
    });
  });

  await sleep(500);

  // 5. Beta guesses the word
  console.log('[Beta] Sending guess for:', currentWord);
  beta.emit('guess', { roomCode, text: currentWord });

  await new Promise(resolve => {
    beta.on('guess_result', (data) => {
      if (data.correct) {
        console.log('[Beta] GUESS WAS CORRECT! SUCCESS');
        resolve();
      }
    });
  });

  // 6. Wait for Round 2 to start for Beta
  console.log('[Test] Waiting for Round 2 transition...');
  
  await new Promise(resolve => {
    beta.on('round_start', (data) => {
      console.log('[Beta] Round 2 started! Data:', Object.keys(data));
      if (data.options) {
        console.log('[Beta] Word options received in Round 2:', data.options);
        console.log('[Test] ALL SYSTEMS GO! ROUND 2 WORD OPTIONS WORK.');
        resolve();
      }
    });
  });

  console.log('[Test] 🏆 E2E TEST COMPLETED SUCCESSFULLY.');
  process.exit(0);
}

// Add error catchers
alpha.on('error', (e) => console.log('Alpha Error', e));
beta.on('error', (e) => console.log('Beta Error', e));

runTest().catch(console.error);
