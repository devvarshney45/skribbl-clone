import { io } from "socket.io-client";

console.log("Starting E2E Socket Match...");

// 1. Establish connections
const alice = io("http://localhost:3001");
const bob = io("http://localhost:3001");

let roomCode = null;
let chosenWord = null;

const timeout = setTimeout(() => {
   console.error("TEST TIMED OUT!");
   process.exit(1);
}, 25000);

async function init() {
  console.log("Creating room via POST to /api/rooms...");
  try {
      const res = await fetch("http://localhost:3001/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              hostName: "Alice",
              isPublic: true,
              settings: { rounds: 1, drawTime: 15 }
          })
      });
      const data = await res.json();
      roomCode = data.roomCode;
      console.log(`[API] Room created successfully. Code: ${roomCode}`);
      
      console.log(`[Alice] Socket emitting create_room...`);
      alice.emit("create_room", { playerName: "Alice", roomCode });
  } catch (err) {
      console.error(err);
      process.exit(1);
  }
}

alice.on("room_created", (data) => {
    console.log(`[Bob] Connecting and joining room ${roomCode}...`);
    bob.emit("join_room", { playerName: "Bob", roomCode });
});

alice.on("player_joined", async (data) => {
    console.log(`[Alice] Noticed that ${data.player.name} joined!`);
    console.log("[Alice] Emitting 'player_ready' and 'start_game' in 1s...");
    setTimeout(() => {
       alice.emit("player_ready", { roomCode });
       bob.emit("player_ready", { roomCode });
       alice.emit("start_game", { roomCode });
    }, 1000);
});

alice.on("word_options", (data) => {
    console.log(`[Alice -> Drawer] Received word options:`, data.words);
    chosenWord = data.words[0];
    console.log(`[Alice] Choosing word: ${chosenWord}`);
    alice.emit("word_chosen", { roomCode, word: chosenWord });
});

bob.on("game_state", (data) => {
    if (data.phase === "drawing") {
        console.log(`[Bob -> Guesser] Game phase = drawing. Word length: ${data.wordLength}.`);
        console.log(`[Bob] Emitting a bad guess: "wrong_word"`);
        bob.emit("guess", { roomCode, text: "wrong_word" });
        console.log(`[Bob] Waiting for drawTime (15s) to expire naturally to test 'Game Over'...`);
    }
});

bob.on("timer_update", (data) => {
    if (data.timeLeft % 5 === 0) {
        console.log(`[Timer] ${data.timeLeft} seconds left...`);
    }
});

bob.on("chat_message", (data) => {
    if (data.text === "wrong_word") {
        console.log(`[Bob] Successfully saw my own bad guess in chat.`);
    }
});

bob.on("round_end", (data) => {
    console.log(`\n[Game] Round Ended normally via Timer! Word was: ${data.word}`);
});

bob.on("game_over", (data) => {
    console.log("\n====== E2E TEST SUCCESS! ======");
    console.log("Winner:", data.winner ? data.winner.name : "Tie");
    console.log("Final Leaderboard:");
    data.leaderboard.forEach((p, idx) => {
       console.log(`   #${idx+1} ${p.name} - ${p.score} pts`);
    });
    console.log("===============================\n");
    clearTimeout(timeout);
    process.exit(0);
});

bob.on("error", (err) => console.error("[Bob] Socket Error:", err.message));
alice.on("error", (err) => console.error("[Alice] Socket Error:", err.message));

// Start the sequence
init();
