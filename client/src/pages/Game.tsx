// Game.tsx
// Orchestrates the high-end "Studio Edition" game board.

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
    word,
    drawTime
  } = useGame();

  const isMyTurn = playerId === currentDrawerId && phase === 'drawing';

  const renderWordDisplay = () => {
    if (isMyTurn || phase === 'roundEnd') {
      return (
        <span className="text-4xl font-black tracking-[0.25em] uppercase text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          {word || "CURATING..." }
        </span>
      );
    }

    return (
      <div className="flex gap-3">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-10 h-14 flex items-center justify-center border-b-4 text-4xl font-black uppercase transition-all duration-700 ${
              char === ' ' ? 'border-transparent mx-3' : 'border-slate-800 text-white/90 animate-fade-in'
            }`}
          >
            {char !== '_' ? char : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#03040b] bg-mesh text-white overflow-hidden flex flex-col relative font-sans">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[20%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header: Session Intelligence */}
      <header className="h-24 flex items-center justify-between px-10 bg-black/40 backdrop-blur-2xl border-b border-white/5 z-30 shadow-2xl">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 pl-0.5">Session Roster</span>
            <div className="text-3xl font-black tracking-tighter tabular-nums flex items-baseline gap-1.5">
              {round} <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest italic">of</span> <span className="text-slate-500">{totalRounds}</span>
            </div>
          </div>
          
          <div className="h-12 w-px bg-white/5" />
          
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 pl-0.5">Chronometer</span>
            <div className={`text-3xl font-mono font-black tabular-nums tracking-tight ${timeLeft < 15 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
              {timeLeft}<span className="text-[10px] ml-1 font-black text-slate-700 uppercase">Sec</span>
            </div>
          </div>
        </div>

        {/* Word Centerpiece */}
        <div className="hidden md:flex items-center justify-center flex-grow mx-8">
          <div className="glass px-12 py-4 rounded-[2rem] border-white/5 shadow-3xl transform transition-all hover:scale-105">
            {renderWordDisplay()}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden xl:flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1.5">Studio Link</span>
            <span className="font-mono font-black text-slate-300 tracking-[0.2em] text-xs px-3 py-1 bg-white/5 rounded-lg border border-white/5">{roomCode}</span>
          </div>
          <button className="w-12 h-12 glass border-white/10 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:bg-white/10 hover:-translate-y-1 active:scale-90">
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </header>

      {/* Main Studio Floor */}
      <main className="flex-grow p-4 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden relative z-20">
        
        {/* Left: Global Rankings */}
        <aside className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1 h-32 lg:h-full animate-fade-in relative z-10 hidden xl:block">
          <Scoreboard />
        </aside>

        {/* Center: The Canvas Exhibition */}
        <section className="flex-grow flex flex-col order-1 lg:order-2 h-[60%] lg:h-full gap-6 relative z-0">
          <div className="flex-grow flex items-center justify-center relative">
            <div className="w-full h-full glass rounded-[3rem] p-5 border-white/5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col group transition-all hover:border-white/10">
              
              {/* Progress Aura (Top Bar) */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-white/2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(99,102,241,0.5)] ${
                    timeLeft < 15 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-indigo-600 shadow-indigo-600/50'
                  }`}
                  style={{ width: `${(timeLeft / drawTime) * 100}%` }}
                />
              </div>
              
              {/* Actual Canvas */}
              <div className="flex-grow relative w-full h-full rounded-[2rem] overflow-hidden bg-[#0a0a0f]/50 border border-white/5">
                <Canvas />
              </div>
            </div>

            {/* Float Controls for Active Drawer */}
            {isMyTurn && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40">
                <Toolbar />
              </div>
            )}
          </div>
          
          {/* Metadata Footer */}
          <div className="flex justify-between items-center px-8 opacity-40">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Engine v2.4.1 Studio Edit</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.3em] font-mono">
                  {isMyTurn ? "DIRECTOR MODE ACTIVE" : "SYNCHRONIZING RECEPTORS"}
                </span>
                <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`} />
             </div>
          </div>
        </section>

        {/* Right: Studio Intercom */}
        <aside className="w-full lg:w-96 flex-shrink-0 order-3 h-[40%] lg:h-full animate-fade-in delay-200">
          <Chat />
        </aside>

      </main>

      {/* High-Z Overlays */}
      <WordModal />
      <GameOver />

      {/* Mobile Word Support */}
      {phase !== 'waiting' && phase !== '' && (
        <div className="md:hidden absolute top-28 left-1/2 -translate-x-1/2 glass px-8 py-3 rounded-full z-40 shadow-3xl border-white/10 animate-fade-in pointer-events-none scale-90 border-t-indigo-500/50">
          {renderWordDisplay()}
        </div>
      )}
    </div>
  );
};

export default Game;
