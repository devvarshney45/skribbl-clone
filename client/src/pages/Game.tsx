// Game.tsx
// The main game board page.
// Orchestrates the Canvas, Chat, Scoreboard, and top-bar info.

import React from 'react';
import { useGame } from '../context/GameContext';
import Canvas from '../components/Canvas';
import Chat from '../components/Chat';
import Scoreboard from '../components/Scoreboard';
import Toolbar from '../components/Toolbar';
import WordModal from '../components/WordModal';
import GameOver from '../components/GameOver';

const Game: React.FC = () => {
  const { 
    roomCode, 
    phase, 
    timeLeft, 
    wordHints, 
    round, 
    totalRounds,
    currentDrawerId,
    playerId,
    word
  } = useGame();

  const isMyTurn = playerId === currentDrawerId && phase === 'drawing';

  // ---------------------------------------------------------------------------
  // Helper: Format labels for the word blanks (e.g. "_ _ a _ _")
  // ---------------------------------------------------------------------------
  const renderWordDisplay = () => {
    if (isMyTurn || phase === 'roundEnd') {
      return (
        <span className="text-2xl font-black tracking-[0.3em] uppercase text-purple-400">
          {word || "WAITING..."}
        </span>
      );
    }

    return (
      <div className="flex gap-2">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-8 h-10 flex items-center justify-center border-b-4 text-2xl font-black uppercase transition-all ${
              char === ' ' ? 'border-transparent mx-2' : 'border-gray-700 text-white'
            }`}
          >
            {char !== '_' ? char : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Top Navigation / Status Bar */}
      <header className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800 shadow-xl z-20">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Round</span>
            <div className="text-xl font-bold tracking-tighter">
              {round} <span className="text-xs text-gray-700">/ {totalRounds}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gray-800" />
          
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Time Left</span>
            <div className={`text-xl font-mono font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Word Display (Center) */}
        <div className="hidden md:flex items-center justify-center flex-grow">
          {renderWordDisplay()}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Room Code</span>
            <span className="font-mono font-bold text-gray-300">{roomCode}</span>
          </div>
          <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors">
            ⚙️
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-grow p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Side: Scoreboard */}
        <aside className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1 h-1/3 lg:h-auto">
          <Scoreboard />
        </aside>

        {/* Center Side: Canvas & Toolbar */}
        <section className="flex-grow flex flex-col order-1 lg:order-2 h-full">
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-4xl h-full flex flex-col justify-center">
              {/* Progress bar timer (visual only) */}
              <div className="w-full h-2 bg-gray-900 rounded-full mb-2 overflow-hidden border border-gray-800">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft < 15 ? 'bg-red-500' : timeLeft < 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(timeLeft / 80) * 100}%` }}
                />
              </div>
              <Canvas />
              <Toolbar />
            </div>
          </div>
        </section>

        {/* Right Side: Chat */}
        <aside className="w-full lg:w-80 flex-shrink-0 order-3 h-1/3 lg:h-auto">
          <Chat />
        </aside>

      </main>

      {/* Modals & Overlays */}
      <WordModal />
      <GameOver />

      {/* Mobile Center Word (shows only on small screens) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur border border-gray-800 px-6 py-2 rounded-full z-30 shadow-2xl">
        {renderWordDisplay()}
      </div>
    </div>
  );
};

export default Game;
