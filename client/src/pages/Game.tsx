// Game.tsx
// Master-Level UI: Absolute vertical containment (100dvh).
// Features specialized scaling for high-interaction pictionary play.

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
    roomCode, phase, timeLeft, wordHints, round, totalRounds,
    currentDrawerId, playerId, word, drawTime
  } = useGame();

  const isMyTurn = playerId === currentDrawerId && phase === 'drawing';

  const renderWordDisplay = () => {
    if (isMyTurn || phase === 'roundEnd') {
      return (
        <span className="text-xl md:text-3xl font-black tracking-[0.2em] uppercase text-brand-secondary drop-shadow-[0_0_10px_rgba(45,212,191,0.2)]">
          {word || "CURATING..." }
        </span>
      );
    }
    return (
      <div className="flex gap-2">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-6 h-8 md:w-9 md:h-11 flex items-center justify-center border-b-2 md:border-b-4 text-lg md:text-2xl font-black uppercase transition-all duration-700 ${
              char === ' ' ? 'border-transparent mx-2' : 'border-slate-800 text-white/90'
            }`}
          >
            {char !== '_' ? char : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-screen bg-mesh-pro text-white overflow-hidden flex flex-col relative font-sans">
      
      {/* 1. Pro HUD Header (Compact 8-10vh) */}
      <header className="h-14 md:h-18 flex items-center justify-between px-6 md:px-10 bg-bg-panel/60 backdrop-blur-xl border-b border-white/5 z-30 shrink-0 shadow-2xl">
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Session</span>
            <div className="text-xl md:text-2xl font-black tracking-tighter tabular-nums leading-none">
              {round} <span className="text-[10px] text-slate-700 font-bold px-1">/</span> <span className="text-slate-500">{totalRounds}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/5" />
          
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Chronos</span>
            <div className={`text-xl md:text-2xl font-mono font-black tabular-nums tracking-tighter leading-none ${timeLeft < 15 ? 'text-brand-accent animate-pulse' : 'text-brand-highlight'}`}>
              {timeLeft}<span className="text-[10px] ml-0.5 font-black text-slate-700 uppercase">S</span>
            </div>
          </div>
        </div>

        {/* Word Centerpiece (Desktop) */}
        <div className="hidden lg:flex items-center justify-center flex-grow mx-8">
           {renderWordDisplay()}
        </div>

        {/* Room HUD Status */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden xl:flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Studio Code</span>
            <span className="font-mono font-black text-brand-secondary tracking-widest text-[9px] px-3 py-1 bg-white/3 rounded border border-white/5">{roomCode}</span>
          </div>
          <button className="w-9 h-9 md:w-11 md:h-11 panel-card rounded-xl flex items-center justify-center shadow-lg transition-all hover:bg-white/5 active:scale-95">
            <span className="text-base">⚙️</span>
          </button>
        </div>
      </header>

      {/* 2. Primary Exhibition Floor (90-92vh) */}
      <main className="flex-grow p-3 md:p-5 flex flex-col lg:flex-row gap-4 h-full overflow-hidden relative z-20">
        
        {/* Left HUD: Artist Stats (Compact) */}
        <aside className="hidden xl:flex w-64 shrink-0 h-full animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Scoreboard />
        </aside>

        {/* Center HUD: The Exhibition Plane (Maximized) */}
        <section className="flex-grow flex flex-col h-full gap-3 relative z-0 min-w-0 animate-pop-in">
          <div className="flex-grow flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-full panel rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-4 border-white/5 shadow-2xl relative overflow-hidden flex flex-col group transition-all hover:border-white/10">
              
              {/* Dynamic Progress Aura */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/2 overflow-hidden z-20">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft < 15 ? 'bg-brand-accent shadow-[0_0_15px_rgba(251,113,133,0.4)]' : 'bg-brand-secondary shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                  }`}
                  style={{ width: `${(timeLeft / Math.max(1, drawTime)) * 100}%` }}
                />
              </div>
              
              {/* Canvas Matrix */}
              <div className="flex-grow relative w-full h-full rounded-[1.25rem] md:rounded-[1.75rem] overflow-hidden bg-bg-main/80 border border-white/2">
                <Canvas />
              </div>

               {/* Integrated Drawing Instruments */}
               {isMyTurn && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transform scale-90 md:scale-100 animate-slide-up">
                    <Toolbar />
                  </div>
                )}
            </div>
          </div>
          
          {/* Metadata Footer (Tight) */}
          <div className="flex justify-between items-center px-4 opacity-30 shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.5em]">Neural Sync Protocol v2.5.0</span>
             </div>
             <span className="text-[7px] font-black text-brand-secondary uppercase tracking-[0.4em] font-mono">
                {isMyTurn ? "TRANSMISSION: ACTIVE" : "SIGNAL: ENCRYPTED"}
             </span>
          </div>
        </section>

        {/* Right HUD: Intercom (Chat) */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col h-full animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Chat />
        </aside>

      </main>

      {/* Protocol Layers (Modals) */}
      <WordModal />
      <GameOver />

      {/* Mobile-Only Word Interface */}
      {(phase === 'drawing' || phase === 'choosing' || phase === 'roundEnd') && (
        <div className="lg:hidden absolute top-16 left-1/2 -translate-x-1/2 panel px-6 py-2 rounded-full z-40 shadow-2xl animate-pop-in pointer-events-none border-brand-secondary/20">
          {renderWordDisplay()}
        </div>
      )}
    </div>
  );
};

export default Game;
