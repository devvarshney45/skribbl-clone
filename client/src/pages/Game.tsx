// Game.tsx
// Redesigned for absolute spatial efficiency.
// Maximizes the canvas area while keeping essential sidebars sleek.

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
        <span className="text-xl md:text-3xl font-black tracking-[0.2em] uppercase text-indigo-400 drop-shadow-sm">
          {word || "CURATING..." }
        </span>
      );
    }

    return (
      <div className="flex gap-2">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-7 h-10 md:w-9 md:h-12 flex items-center justify-center border-b-2 md:border-b-4 text-xl md:text-2xl font-black uppercase transition-all duration-700 ${
              char === ' ' ? 'border-transparent mx-2' : 'border-slate-800 text-white/90 animate-fade-in'
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
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-[40%] h-[15%] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header - Very compact for vertical space */}
      <header className="h-14 md:h-18 flex items-center justify-between px-6 md:px-10 bg-black/40 backdrop-blur-xl border-b border-white/5 z-30 shadow-xl">
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Session</span>
            <div className="text-xl md:text-2xl font-black tracking-tighter tabular-nums leading-none">
              {round} <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest italic mx-1">/</span> <span className="text-slate-500">{totalRounds}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/5" />
          
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Time</span>
            <div className={`text-xl md:text-2xl font-mono font-black tabular-nums tracking-tight leading-none ${timeLeft < 15 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
              {timeLeft}<span className="text-[10px] ml-0.5 font-black text-slate-700 uppercase">S</span>
            </div>
          </div>
        </div>

        {/* Word Centerpiece - Compact */}
        <div className="hidden md:flex items-center justify-center flex-grow mx-4">
          <div className="glass px-10 py-2 rounded-2xl border-white/5 shadow-xl">
            {renderWordDisplay()}
          </div>
        </div>

        {/* Room Info */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden xl:flex flex-col">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Studio Code</span>
            <span className="font-mono font-black text-slate-300 tracking-widest text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/5">{roomCode}</span>
          </div>
          <button className="w-9 h-9 md:w-11 md:h-11 glass border-white/10 rounded-xl flex items-center justify-center shadow-lg transition-all hover:bg-white/10 active:scale-90">
            <span className="text-base md:text-lg">⚙️</span>
          </button>
        </div>
      </header>

      {/* Main Studio Floor - Optimized gaps and padding */}
      <main className="flex-grow p-3 md:p-5 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden relative z-20">
        
        {/* Left: Rankings - Compact width */}
        <aside className="hidden xl:flex w-64 flex-shrink-0 animate-fade-in relative z-10 flex flex-col">
          <Scoreboard />
        </aside>

        {/* Center: The Canvas - Maximum area */}
        <section className="flex-grow flex flex-col h-full gap-4 relative z-0 min-w-0">
          <div className="flex-grow flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-full glass rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-4 border-white/5 shadow-3xl relative overflow-hidden flex flex-col group transition-all hover:border-white/10">
              
              {/* Progress Aura (Top Bar) */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft < 15 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  }`}
                  style={{ width: `${(timeLeft / drawTime) * 100}%` }}
                />
              </div>
              
              {/* Canvas Area */}
              <div className="flex-grow relative w-full h-full rounded-[1rem] md:rounded-[1.5rem] overflow-hidden bg-[#0a0a0f]/40 border border-white/2">
                <Canvas />
              </div>
            </div>

            {/* Drawing Tools Overlay */}
            {isMyTurn && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transform scale-90 md:scale-100">
                <Toolbar />
              </div>
            )}
          </div>
          
          {/* Metadata Footer - Tighter */}
          <div className="flex justify-between items-center px-4 opacity-40">
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em]">Studio v2.4</span>
             </div>
             <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] font-mono">
                {isMyTurn ? "DIRECTOR MODE" : "RECEIVING PACKETS"}
             </span>
          </div>
        </section>

        {/* Right: Chat - Compact width */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col h-full animate-fade-in delay-200">
          <Chat />
        </aside>

      </main>

      {/* Modals */}
      <WordModal />
      <GameOver />

      {/* Mobile Word View */}
      {phase !== 'waiting' && phase !== '' && (
        <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 glass px-6 py-1.5 rounded-full z-40 shadow-2xl border-white/10 animate-fade-in pointer-events-none scale-90">
          {renderWordDisplay()}
        </div>
      )}
    </div>
  );
};

export default Game;
