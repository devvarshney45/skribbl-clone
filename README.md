# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game — a clone of skribbl.io built for a professional internship technical round.

## 🚀 Live Demo

> Coming soon — deployment in progress.

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS (dark theme) |
| Backend | Node.js + Express |
| WebSockets | Socket.IO |
| Database | PostgreSQL via `pg` (Neon) |

---

## 📁 Folder Structure

```
skribbl-clone/
├── server/           ← Express + Socket.IO backend
│   └── src/
│       ├── classes/  ← OOP: Player, Room, Game
│       ├── routes/   ← REST API
│       ├── db/       ← PostgreSQL setup + seed
│       └── socket/   ← All socket events
└── client/           ← React + TypeScript frontend
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        └── context/
```

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/skribbl-clone.git
cd skribbl-clone
```

### 2. Start the backend
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:3001
```

### 3. Start the frontend
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 4. Open the game
Open two browser tabs at `http://localhost:5173` and enjoy!

---

## 🔌 WebSocket Events Reference

| Event | Direction | Description |
|---|---|---|
| `create_room` | Client → Server | Host creates a new room |
| `room_created` | Server → Client | Room code & info returned |
| `join_room` | Client → Server | Player joins existing room |
| `player_joined` | Server → Room | All players see updated list |
| `player_ready` | Client → Server | Player marks themselves ready |
| `start_game` | Client → Server | Host starts the game |
| `round_start` | Server → Room | Drawer gets word options, others get blanks |
| `word_chosen` | Client → Server | Drawer picks a word |
| `game_state` | Server → Room | Current hints, phase, timer |
| `draw_start` | Client → Server | Pen down on canvas |
| `draw_move` | Client → Server | Mouse dragging |
| `draw_end` | Client → Server | Pen lifted |
| `draw_data` | Server → Room | Broadcasts drawing to everyone else |
| `canvas_clear` | Client ↔ Server | Clear the canvas |
| `draw_undo` | Client ↔ Server | Undo last stroke |
| `guess` | Client → Server | Player guesses the word |
| `guess_result` | Server → Room | Correct/wrong result |
| `chat` | Client → Server | Normal chat message |
| `chat_message` | Server → Room | Broadcast chat |
| `timer_update` | Server → Room | Countdown tick every second |
| `round_end` | Server → Room | Round over, word revealed, scores shown |
| `game_over` | Server → Room | Final leaderboard |
| `player_left` | Server → Room | Player disconnected |

---

## 🏗 Architecture Overview

```
Browser Tab 1 (Drawer)          Browser Tab 2 (Guesser)
       │                                  │
       │──── Socket.IO ──────────────────►│
       │                                  │
       └──────────────── Express Server ──┘
                              │
                         PostgreSQL DB
                    (rooms, players, words)
```

- All game logic lives on the **server** in memory (Room, Game, Player classes)
- PostgreSQL stores persistent data (scores, rooms, word list)
- Socket.IO handles all real-time communication
- React context manages frontend state

---

## 🎮 Features

- ✅ Create / Join rooms with a 6-character code
- ✅ Real-time drawing canvas with color picker and brush sizes
- ✅ Undo stroke and clear canvas
- ✅ Word selection modal (3 choices, 10s to pick)
- ✅ Animated countdown timer (green → yellow → red)
- ✅ Hint system (reveals letters at 30s intervals)
- ✅ Scoring — faster guess = more points
- ✅ Shareable invite link
- ✅ Reconnection handling
- ✅ Game over screen with confetti + leaderboard

## ☁️ Deployment (Render + Neon)

### Backend (Render)
1. Link your GitHub repo to Render.
2. Set Build Command: `cd server && npm install`
3. Set Start Command: `cd server && node src/index.js`
4. Add Environment Variables:
   - `DATABASE_URL`: Your actual Neon connection string.
   - `PORT`: `3001`
   - `CLIENT_URL`: Your frontend URL.
   - `NODE_ENV`: `production`

### Frontend (Render/Vercel)
1. Set Build Command: `cd client && npm install && npm run build`
2. Set Publish Directory: `client/dist`

---

Built with ❤️ as an internship project.
