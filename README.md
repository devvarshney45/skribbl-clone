<div align="center">
  <img src="https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif" width="100" />
  <h1>🎨 Real-Time Skribbl.io Clone</h1>
  <p><b>A highly scalable, event-driven multiplayer drawing arena built for production.</b></p>

  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![Node](https://img.shields.io/badge/Node.js-24-green.svg?style=flat&logo=nodedotjs)](https://nodejs.org/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black.svg?style=flat&logo=socketdotio)](https://socket.io/)
  [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
</div>

---

## 📖 Overview
This repository contains a full-stack, real-time multiplayer drawing and guessing game engineered to replicate and modernize the classic `skribbl.io` architecture. 

Designed for a technical engineering assessment, this project emphasizes **low-latency WebSocket transmission**, **Object-Oriented backend state management**, and a **premium Glassmorphism UI** optimized for all viewport sizes.

🌍 **Live Production URL:** [https://skribbl-clone-yaf6.onrender.com](https://skribbl-clone-yaf6.onrender.com) *(Hosted via Render)*

---

## 🏗️ System Architecture

The core philosophy separates real-time ephemeral game state from persistent data storage, operating primarily via a robust Event-Driven Architecture (EDA).

### 🧩 Core Mechanics
* **Canvas Synchronization**: Client strokes are mapped to Cartesian coordinates, batched, and emitted via `Socket.IO`. The Engine utilizes `destination-out` composite operations for precise eraser tooling against translucent backgrounds.
* **OOP State Container**: The Node.js server maintains live match contexts via transient `Room`, `Game`, and `Player` class instances stored in memory heaps, minimizing DB round-trips during live matches.
* **Persisted Truth (Postgres)**: Scores, Host Authority, and dynamic Word Dictionaries are written to PostgreSQL (Neon Node) for permanent ledgering and crash recovery.
* **Auto-Routing**: Graceful disconnection intercepts auto-promote alternate human players to room hosts after a 10s transient networking grace period.

```mermaid
graph LR
    C[React Client] <-->|WebSockets| S[Node.js Server]
    S <-->|CRUD| DB[(PostgreSQL)]
    S <-->|In-Memory Map| M((Game State Classes))
```

---

## ⚡ Technical Stack

| Layer | Technologies | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Component rendering, UI Context, localized buffering. |
| **Styling** | Tailwind CSS (JIT) | Responsive design tokens, atomic classes, Glassmorphism. |
| **Backend API** | Node.js, Express.js | Route handling, HTTP lifecycle, Static Asset Delivery. |
| **Real-Time** | Socket.IO (ws long-polling) | Event broadcasting, presence tracking, stream sync. |
| **Database** | PostgreSQL (Neon), `pg` pool | ACID-compliant storage for users, dicts, and metadata. |

---

## ✨ Enterprise Features
Beyond the required MVP scope, this architecture introduces several advanced mechanics:

* 🛡️ **Democratic Governance**: True >50% consensus Votekick algorithm linked to hard database connection culling (blocks cache-spoofing).
* 🕵️ **Hardcore 'Hidden' Mode**: Cryptographic masking of word lengths (`_ _ _`) replaced by a pure state-blind UI block to prevent meta-gaming.
* 🎭 **Deterministic Entity Hashing**: Player Avatars utilize a strict Unicode sum-hash against their session UUIDs to perfectly maintain identity continuity through random internet disconnects.
* 🤖 **Bot Simulation Engine**: Algorithmic bots can be provisioned into the lobby for isolated testing scenarios and scaling benchmarks.
* 📊 **Smart Interpolation Timer**: Clock verification is authoritative on the server, destroying clock-drift exploits.

---

## 🛠️ Local Development & Deployment

### Prerequisites
* **Node.js**: v18.x or higher
* **npm**: v9+
* **PostgreSQL**: Accessible local or remote instance

### 1. Installation
Clone the repository and install all localized workspaces. We utilize a root-level script tree for unified command orchestration.
```bash
git clone https://github.com/devvarshney45/skribbl-clone.git
cd skribbl-clone
npm run install-all
```

### 2. Environment Configuration
Populate the environmental variables in `./server/.env`:
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@host/neondb
```

### 3. Execution
Launch the entire monorepo simultaneously:
```bash
npm run dev
# -> Client UI mounts to http://localhost:5173
# -> Express / Socket Listener mounts to http://localhost:3001
```

### 4. Automated Build Hook (Production)
For unified platforms like Render, the app exposes an aggressive `postinstall` hook that natively builds the frontend Vite asset chain and binds it statically to Express.
```bash
npm run render-build # Equivalent to Production CI/CD prep
npm start            # Executes server/src/index.js (Static fallback active)
```

---

## 📡 Essential Socket Protocol (API Surface)

| Channel Event | Payload Definition | Description |
| :--- | :--- | :--- |
| `create_room` | `{ settings: Object, isPrivate: bool }` | Provisions a new Class memory instance. |
| `word_chosen` | `{ word: string }` | Emitted by Active Drawer. Initiates countdown. |
| `draw_data` | `{ type: string, x: float, y: float, ... }`| Primary binary stream multiplexed to subscribers. |
| `guess_result` | `{ correct: bool, playerId: string }` | Score allocation event broadcasted globally. |
| `vote_kick` | `{ targetPlayerId: string }` | Registers user against internal consensus threshold. |

---

<div align="center">
  <sub>Engineered for Performance by Dev Varshney.</sub><br/>
  <sub>Code Assessment Confidential © 2026</sub>
</div>
