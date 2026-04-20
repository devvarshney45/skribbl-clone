const { io } = require("socket.io-client");
const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("create_room", { playerName: "HostMan", roomCode: "TESTER", isPrivate: false });
});

let roomCode = "TESTER";

socket.on("room_created", (data) => {
  console.log("Room created! Adding bot...");
  socket.emit("add_bot", { roomCode: data.roomCode });
});

socket.on("player_list", (data) => {
  console.log("Player List updated:", data.players.map(p => p.name));
  const hasBot = data.players.some(p => p.isBot);
  if (hasBot && data.players.length === 2) {
    console.log("Bot added! Starting game...");
    socket.emit("start_game", { roomCode });
  }
});

socket.on("game_state", (data) => {
  console.log("Game phase changed:", data.phase);
});

socket.on("hint_update", (data) => {
  console.log("Hint updated:", data.wordHints.join(' '));
});

socket.on("draw_line", (stroke) => {
  console.log("Bot draw line received!");
  // If we receive this, bots are drawing successfully!
  // Disconnect to end test
  console.log("SUCCESS! Bot simulation verified.");
  process.exit(0);
});

setTimeout(() => { console.log("Test timeout"); process.exit(1); }, 10000);
