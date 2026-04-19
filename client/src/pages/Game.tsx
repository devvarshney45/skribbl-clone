// Game.tsx
// Senior-Level UI: Ultra-responsive multiplayer layout with refined mobile behaviors.

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Canvas from '../components/Canvas';
import Chat from '../components/Chat';
import Scoreboard from '../components/Scoreboard';
import Toolbar from '../components/Toolbar';
import WordModal from '../components/WordModal';
import GameOver from '../components/GameOver';
import PhaseOverlay from '../components/PhaseOverlay';

const Game: React.FC = () => {
  const { 
    roomCode, phase, timeLeft, wordHints, round, totalRounds,
    currentDrawerId, playerId, word, drawTime
  } = useGame();
  const isMyTurn = playerId === currentDrawerId && (phase === 'drawing' || phase === 'choosing');
  
  // Mobile Tab State
  const [mobileView, setMobileView] = useState<'chat' | 'players'>('chat');

  const renderWordDisplay = () => {
    if (isMyTurn || phase === 'roundEnd') {
      return (
        <span className="text-xl md:text-3xl font-black tracking-[0.2em] uppercase text-brand-secondary drop-shadow-[0_0_10px_rgba(45,212,191,0.2)]">
          {word || "DRAWING..." }
        </span>
      );
    }
    return (
      <div className="flex gap-1 md:gap-2">
        {wordHints.map((char, i) => (
          <div 
            key={i} 
            className={`w-5 h-7 md:w-9 md:h-11 flex items-center justify-center border-b-2 md:border-b-4 text-sm md:text-2xl font-black uppercase transition-all duration-700 ${
              char === ' ' ? 'border-transparent mx-1' : 'border-slate-800 text-white/90'
            }`}
          >
            {char !== '_' ? char : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-screen bg-mesh-pro text-white overflow-hidden flex flex-col relative font-sans select-none">
      
      {/* 1. Header (Compact) */}
      <header className="h-14 md:h-20 flex items-center justify-between px-4 md:px-10 bg-bg-panel/40 backdrop-blur-2xl border-b border-white/5 z-30 shrink-0 shadow-xl">
        <div className="flex items-center gap-4 md:gap-10">
          <div className="flex flex-col">
            <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-0.5 md:mb-1">Round</span>
            <div className="text-base md:text-2xl font-black tabular-nums leading-none">
              {round}<span className="text-[10px] text-slate-700 mx-1">/</span><span className="text-slate-500">{totalRounds}</span>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/5 hidden md:block" />
          
          <div className="flex flex-col">
            <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-0.5 md:mb-1">Timer</span>
            <div className={`text-base md:text-2xl font-mono font-black tabular-nums leading-none ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-brand-secondary'}`}>
              {timeLeft}<span className="text-[8px] md:text-[10px] ml-0.5 font-black text-slate-700">S</span>
            </div>
          </div>
        </div>

        {/* Word Display (Floating/Center) */}
        <div className="flex-grow flex justify-center px-4 max-w-[50%] md:max-w-none">
           {renderWordDisplay()}
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="text-right hidden sm:flex flex-col">
            <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Code</span>
            <span className="font-mono font-black text-brand-secondary tracking-widest text-[8px] md:text-[10px]">{roomCode}</span>
          </div>
          <div className="w-8 h-8 md:w-11 md:h-11 panel-card rounded-xl flex items-center justify-center border-white/5 opacity-50">
            <span className="text-xs">⚙️</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-center gap-2 p-2 bg-bg-panel/40 backdrop-blur-md border-b border-white/5 shrink-0">
        <button 
          onClick={() => setMobileView('chat')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileView === 'chat' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white/5 text-slate-500'}`}
        >
          Intercom
        </button>
        <button 
          onClick={() => setMobileView('players')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileView === 'players' ? 'bg-brand-secondary text-bg-main shadow-lg shadow-brand-secondary/20' : 'bg-white/5 text-slate-500'}`}
        >
          Leaderboard
        </button>
      </div>

      {/* 2. Main Layout Matrix */}
      <main className="flex-grow flex flex-col lg:flex-row gap-0 lg:gap-4 lg:p-4 overflow-hidden min-h-0">
        
        {/* Left HUD (Scoreboard) */}
        <aside className={`w-full lg:w-72 shrink-0 ${mobileView === 'players' ? 'flex' : 'hidden'} lg:flex flex-col`}>
          <Scoreboard />
        </aside>

        {/* Center (Canvas) */}
        <section className="flex-grow flex flex-col relative z-0 min-w-0 min-h-0">
          <div className="flex-grow flex flex-col min-h-0 bg-bg-card/30 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative group">
            
            {/* Top Bar (Word & Timer) */}
            <div className="h-16 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 z-20 shrink-0">
              <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Secret Transmission</span>
                  {renderWordDisplay()}
              </div>
              
              <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Session Pulse</span>
                      <div className="flex gap-1 mt-1">
                          {[1,2,3,4,5].map(i => (
                              <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-brand-secondary/40' : 'bg-white/5'}`} />
                          ))}
                      </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-xl">⏱️</span>
                      <span className={`font-mono font-black text-xl ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                          {timeLeft}s
                      </span>
                  </div>
              </div>
            </div>

            {/* Progress Bar (Timer) */}
            <div className="absolute top-16 left-0 w-full h-0.5 bg-white/5 z-30">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft < 10 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-brand-secondary shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                }`}
                style={{ width: `${(timeLeft / Math.max(1, drawTime)) * 100}%` }}
              />
            </div>

            {/* High-Visibility Timer Watchdog (Appears when time < 10s) */}
            {timeLeft > 0 && timeLeft < 10 && phase === 'drawing' && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-pop-in pointer-events-none">
                <div className="px-8 py-3 bg-rose-500/90 backdrop-blur-xl rounded-[2rem] flex items-center gap-6 shadow-3xl shadow-rose-500/30 border border-white/20 scale-125">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic leading-none">Critical</span>
                      <span className="text-[12px] font-black text-white uppercase tracking-tighter">Time Low</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rose-500 font-mono font-black text-2xl animate-pulse shadow-xl">
                       {timeLeft}
                    </div>
                </div>
              </div>
            )}

            <div className="flex-grow relative bg-white/[0.02]">
              <Canvas />
            </div>

            {/* Toolbar (Only for drawer) */}
            {isMyTurn && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] transform scale-90 md:scale-100 origin-bottom hover:scale-105 transition-transform">
                <Toolbar />
              </div>
            )}

            {/* Status Indicator */}
            <div className="absolute bottom-4 right-6 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] italic">Encrypted Stream</span>
            </div>
          </div>

          {/* Turn Notify (Small) */}
          <div className="h-8 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md rounded-b-[2rem] border-x border-b border-white/5 shrink-0 mx-4 mt-0">
             <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.5em]">Neural Engine v4.0 Active</span>
             <div className="flex items-center gap-4">
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isMyTurn ? 'text-brand-secondary animate-pulse' : 'text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isMyTurn ? 'bg-brand-secondary' : 'bg-slate-700'}`} />
                    {isMyTurn ? "UPLOADING BRUSH DATA..." : "SYNCING GUESSES..."}
                </span>
             </div>
          </div>
        </section>

        {/* Right HUD (Chat) */}
        <aside className={`w-full lg:w-96 shrink-0 animate-slide-left ${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex flex-col`} style={{ animationDelay: '200ms' }}>
          <Chat />
        </aside>
      </main>

      {/* Protocol Layers */}
      <WordModal />
      <GameOver />
      <PhaseOverlay />
    </div>
  );
};

export default Game;
