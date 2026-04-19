// Game.tsx
// Redesigned with a "Senior Level" highly-polished game board.
// Orchestrates the Canvas, Chat, Scoreboard, and top-bar info in a premium layout.

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
        <span className="text-3xl font-black tracking-[0.2em] uppercase text-indigo-400 drop-shadow-sm">
          {word || "WAITING..." }
        </span>
      );
    }

    return (
      <div className="flex gap-2">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-9 h-12 flex items-center justify-center border-b-4 text-3xl font-black uppercase transition-all duration-500 ${
              char === ' ' ? 'border-transparent mx-2' : 'border-slate-800 text-white animate-fade-in'
            }`}
          >
            {char !== '_' ? char : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#03040b] bg-mesh text-white overflow-hidden flex flex-col">
      {/* Top Navigation / Status Bar */}
      <header className="h-20 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">Session Progress</span>
            <div className="text-2xl font-black tracking-tighter">
              {round} <span className="text-xs text-slate-700 mx-1">/</span> <span className="text-slate-500">{totalRounds}</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/5" />
          
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">Game Clock</span>
            <div className={`text-2xl font-mono font-black tabular-nums ${timeLeft < 15 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
              {timeLeft}<span className="text-xs ml-0.5">S</span>
            </div>
          </div>
        </div>

        {/* Word Display (Center) */}
        <div className="hidden md:flex items-center justify-center flex-grow">
          <div className="glass px-10 py-3 rounded-2xl border-white/5 shadow-inner">
            {renderWordDisplay()}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right flex flex-col hidden lg:flex">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Studio Code</span>
            <span className="font-mono font-bold text-slate-300 tracking-widest">{roomCode}</span>
          </div>
          <div className="w-11 h-11 glass border-white/10 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
            <span className="text-xl">⚙️</span>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-grow p-5 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Sidebar: Scoreboard */}
        <aside className="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1 h-1/4 lg:h-auto animate-fade-in">
          <Scoreboard />
        </aside>

        {/* Center Section: Canvas & Controls */}
        <section className="flex-grow flex flex-col order-1 lg:order-2 h-full gap-4 relative">
          <div className="flex-grow flex items-center justify-center relative">
            <div className="w-full h-full glass rounded-[2.5rem] p-4 border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
              {/* Dynamic progress timer bar */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft < 15 ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${(timeLeft / 80) * 100}%` }}
                />
              </div>
              
              <div className="flex-grow relative w-full h-full rounded-2xl overflow-hidden bg-white/5">
                <Canvas />
              </div>
            </div>

            {/* Floating Toolbar for Drawer */}
            {isMyTurn && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
                <Toolbar />
              </div>
            )}
          </div>
          
          {/* Subtle instructions / status */}
          <div className="flex justify-between items-center px-4">
             <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.25em]">Precision Canvas v2.4</span>
             <span className="text-[9px] font-black text-indigo-500/50 uppercase tracking-[0.25em]">
               {isMyTurn ? "You are the master artist" : "Observe and decode the art"}
             </span>
          </div>
        </section>

        {/* Right Sidebar: Chat */}
        <aside className="w-full lg:w-80 flex-shrink-0 order-3 h-1/4 lg:h-auto animate-fade-in delay-200">
          <Chat />
        </aside>

      </main>

      {/* Overlays & Modals */}
      <WordModal />
      <GameOver />

      {/* Mobile-Only Word Display */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 glass px-8 py-3 rounded-full z-30 shadow-2xl border-white/10 animate-fade-in">
        {renderWordDisplay()}
      </div>
    </div>
  );
};

export default Game;
