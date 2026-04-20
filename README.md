# Skribbl.io Clone 🎨

This is a full-stack, real-time multiplayer drawing and guessing game built as my submission for the Round 2 Technical Assignment. It replicates the core loop of Skribbl.io while adding a few extra features like bots, custom avatars, and a dedicated voting system.

[![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node.js-Express-green.svg?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black.svg?style=flat&logo=socketdotio)](https://socket.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)

---

## Live Links
- **Frontend (Vercel):** [https://skribbl.devvarshney.me/](https://skribbl.devvarshney.me/)
- **Backend (Render):** [https://skribbl-clone-yaf6.onrender.com](https://skribbl-clone-yaf6.onrender.com)
- **Repository:** [GitHub](https://github.com/devvarshney45/skribbl-clone)

---

## 🚀 Features Mapped to Assignment

I made sure to cover all the "Must-haves", "Should-haves", and a handful of the "Bonus Ideas" from the assignment brief. 

### Core Gameplay
- **Real-time Drawing Synchronization:** Canvas strokes are batched and broadcasted via WebSockets for zero-lag drawing.
- **Room Management:** Players can easily create private lobby links or join existing public rooms.
- **Turn-based Loop:** The server manages who is currently drawing, tracks the round timer, handles hint reveals, and scores players based on how fast they guess.

### The Bonus Additions
- **Smart AI Bots:** Easily test the game flow solo by adding bots to the room. They act as dummy players to keep the logic running.
- **Hidden Word Mode:** A hardcore difficulty setting the host can toggle. It completely hides the word length (e.g., `_ _ _`) so guessers have absolutely no clues.
- **Emoji Avatars:** Made a hash function that generates a deterministic emoji avatar for every player. If a player disconnects and reconnects, they get the exact same avatar back.
- **Votekick System:** Standard moderation tool. If more than 50% of the room votes to kick someone, the server boots them and cleans up their socket/database footprint.
- **Auto-Host Promotion:** If the room host unexpectedly disconnects, the server automatically promotes another human player to host so the lobby isn't soft-locked.
- **Destination-Out Eraser:** Didn't just paint the background color over strokes. I hooked into the canvas context to properly erase path data.

---

## 🏗️ Architecture

The backend is built around Object-Oriented principles. Instead of spaghetti socket handlers, the entire game state lives in encapsulated `Room`, `Game`, and `Player` class instances in Node's memory. 

PostgreSQL is used primarily to store permanent records like the word list dictionary and metadata, keeping the fast-paced game loop entirely in-memory for speed.

```mermaid
graph LR
    C[React Client] <-->|Socket.IO| S[Node.js Events]
    S <-->|CRUD| DB[(Postgres Database)]
    S <-->|State Updates| M((Game, Room, Player Classes))
```

---

## 💻 Local Setup

The project is structured as a monorepo (`/client` and `/server`). 

**Prerequisites:**
- Node.js (v18+)
- Local or remote PostgreSQL instance

**1. Clone & Install**
```bash
git clone https://github.com/devvarshney45/skribbl-clone.git
cd skribbl-clone
npm run install-all
```

**2. Environment Variables (`server/.env`)**
```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@host/neondb
```

**3. Run the App**
To boot both the React frontend and the Express/Socket backend at the same time:
```bash
npm run dev
```

---

*Built by Dev Varshney (6397003690)*
