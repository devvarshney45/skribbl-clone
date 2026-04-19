// Game.tsx
// Final Transformation: Pro HUD Layout.
// Contained within 100dvh with absolute spatial containment.

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
        <span className="text-2xl md:text-3xl font-black tracking-[0.3em] uppercase text-brand-secondary drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
          {word || "CURATING..." }
        </span>
      );
    }
    return (
      <div className="flex gap-2">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-7 h-10 md:w-10 md:h-12 flex items-center justify-center border-b-4 text-xl md:text-2xl font-black uppercase transition-all duration-700 ${
              char === ' ' ? 'border-transparent mx-2' : 'border-slate-800 text-white/95'
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
      
      {/* 1. Pro Header (Approx 8-10vh) */}
      <header className="h-14 md:h-20 flex items-center justify-between px-6 md:px-10 bg-bg-panel/80 backdrop-blur-xl border-b border-white/5 z-30 shadow-2xl shrink-0">
        <div className="flex items-center gap-6 md:gap-12">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Rotation</span>
            <div className="text-xl md:text-3xl font-black tracking-tighter tabular-nums leading-none">
              {round} <span className="text-sm text-slate-800 px-1 font-bold">/</span> <span className="text-slate-600">{totalRounds}</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/5" />
          
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Chronos</span>
            <div className={`text-xl md:text-3xl font-mono font-black tabular-nums tracking-tighter leading-none ${timeLeft < 15 ? 'text-brand-accent animate-pulse' : 'text-brand-highlight'}`}>
              {timeLeft}<span className="text-[10px] ml-0.5 font-black text-slate-800 uppercase">S</span>
            </div>
          </div>
        </div>

        {/* Dynamic Word Center (Desktop) */}
        <div className="hidden lg:flex items-center justify-center flex-grow mx-8">
          <div className="bg-bg-main/50 px-10 py-3 rounded-2xl border border-white/5 shadow-inner">
            {renderWordDisplay()}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden xl:flex flex-col">
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Studio Code</span>
            <span className="font-mono font-black text-brand-secondary tracking-widest text-[10px] px-3 py-1 bg-white/3 rounded border border-white/5">{roomCode}</span>
          </div>
          <button className="w-10 h-10 panel-card rounded-xl flex items-center justify-center transition-all hover:bg-white/5 active:scale-90">
            <span className="text-lg">⚙️</span>
          </button>
        </div>
      </header>

      {/* 2. Primary Exhibition Floor (Approx 90-92vh) */}
      <main className="flex-grow p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden relative z-20 h-full">
        
        {/* Left HUD: Standings */}
        <aside className="hidden xl:flex w-72 shrink-0 h-full animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Scoreboard />
        </aside>

        {/* Center Arena: Tactical Canvas */}
        <section className="flex-grow flex flex-col h-full gap-4 relative z-0 min-w-0 animate-pop-in">
          <div className="flex-grow flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-full panel rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 border-white/5 shadow-3xl relative overflow-hidden flex flex-col group">
              
              {/* Dynamic Progress Aura */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-white/2 overflow-hidden z-10">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft < 15 ? 'bg-brand-accent shadow-[0_0_20px_rgba(251,113,133,0.5)]' : 'bg-brand-secondary shadow-[0_0_20px_rgba(45,212,191,0.5)]'
                  }`}
                  style={{ width: `${(timeLeft / drawTime) * 100}%` }}
                />
              </div>
              
              {/* Actual Canvas */}
              <div className="flex-grow relative w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-bg-main/80 border border-white/2 shadow-inner">
                <Canvas />
              </div>

               {/* Drawing Controls Integrated into the Pane */}
               {isMyTurn && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 transform scale-90 md:scale-100 animate-slide-up">
                    <Toolbar />
                  </div>
                )}
            </div>
          </div>
          
          {/* HUD Metadata Footer */}
          <div className="flex justify-between items-center px-6 opacity-40 shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em]">Neural Interface v2.5.0</span>
             </div>
             <span className="text-[8px] font-black text-brand-secondary uppercase tracking-[0.4em] font-mono">
                {isMyTurn ? "TRANSMISSION ACTIVE" : "SYNCHRONIZING RECEPTORS"}
             </span>
          </div>
        </section>

        {/* Right HUD: Intercom */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col h-full animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Chat />
        </aside>

      </main>

      {/* Overlay Protocol Layers */}
      <WordModal />
      <GameOver />

      {/* Mobile-Only Word HUD */}
      {phase !== 'waiting' && phase !== '' && (
        <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 panel-card px-8 py-2 rounded-full z-40 shadow-2xl animate-pop-in pointer-events-none border-t-brand-secondary/30">
          {renderWordDisplay()}
        </div>
      )}
    </div>
  );
};

export default Game;
