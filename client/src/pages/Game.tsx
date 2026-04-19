// Game.tsx
// Senior-Level UI: Fully mobile-responsive multiplayer layout.

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
  
  // Mobile Tab State: 'canvas' | 'chat' | 'players'
  const [mobileTab, setMobileTab] = useState<'canvas' | 'chat' | 'players'>('canvas');

  const renderWordHints = () => {
    if (isMyTurn || phase === 'roundEnd') {
      return (
        <span className="text-lg md:text-2xl font-black tracking-[0.2em] uppercase text-brand-secondary truncate max-w-[200px] md:max-w-none">
          {word || 'DRAWING...'}
        </span>
      );
    }
    return (
      <div className="flex gap-1 md:gap-1.5 flex-wrap justify-center">
        {wordHints.map((char, i) => (
          <div
            key={i}
            className={`w-5 h-7 flex items-center justify-center border-b-2 text-sm font-black uppercase transition-all duration-700 ${
              char === ' ' ? 'border-transparent mx-0.5 w-3' : 'border-slate-700 text-white/90'
            }`}
          >
            {char !== '_' ? char : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-screen bg-mesh-pro text-white flex flex-col relative font-sans select-none overflow-hidden">
      
      {/* ── HEADER ────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-3 md:px-8 bg-bg-panel/60 backdrop-blur-2xl border-b border-white/5 z-30 shrink-0">
        {/* Left: Round + Timer */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Round</span>
            <div className="text-base font-black tabular-nums leading-none">
              {round}<span className="text-slate-700 mx-0.5">/</span><span className="text-slate-500">{totalRounds}</span>
            </div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Timer</span>
            <div className={`text-base font-mono font-black tabular-nums leading-none ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-brand-secondary'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Center: Word */}
        <div className="flex-grow flex justify-center px-2 overflow-hidden">
          {renderWordHints()}
        </div>

        {/* Right: Room Code */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Room</span>
          <span className="font-mono font-black text-brand-secondary text-[10px] tracking-widest">{roomCode}</span>
        </div>
      </header>

      {/* ── TIMER PROGRESS BAR ────────────────────── */}
      <div className="h-0.5 bg-white/5 shrink-0">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft < 10 ? 'bg-rose-500' : 'bg-brand-secondary'
          }`}
          style={{ width: `${(timeLeft / Math.max(1, drawTime)) * 100}%` }}
        />
      </div>

      {/* ── MOBILE TAB BAR ────────────────────────── */}
      <div className="flex lg:hidden shrink-0 bg-bg-panel/60 backdrop-blur-md border-b border-white/5">
        {(['canvas', 'chat', 'players'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              mobileTab === tab
                ? tab === 'canvas'
                  ? 'bg-brand-primary/20 text-brand-primary border-b-2 border-brand-primary'
                  : tab === 'chat'
                  ? 'bg-brand-secondary/20 text-brand-secondary border-b-2 border-brand-secondary'
                  : 'bg-white/10 text-white border-b-2 border-white/40'
                : 'text-slate-600'
            }`}
          >
            {tab === 'canvas' ? '🎨 Canvas' : tab === 'chat' ? '💬 Chat' : '🏆 Board'}
          </button>
        ))}
      </div>

      {/* ── MAIN BODY ─────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden min-h-0">

        {/* SCOREBOARD - Desktop: always visible | Mobile: tab */}
        <aside className={`w-64 xl:w-72 shrink-0 border-r border-white/5 overflow-hidden ${
          mobileTab === 'players' ? 'flex w-full' : 'hidden'
        } lg:flex flex-col`}>
          <Scoreboard />
        </aside>

        {/* CANVAS COLUMN */}
        <section className={`flex-grow flex flex-col min-w-0 overflow-hidden ${
          mobileTab === 'canvas' ? 'flex' : 'hidden'
        } lg:flex`}>
          
          {/* Canvas itself - fills all remaining space */}
          <div className="flex-grow relative overflow-hidden bg-white/[0.01]">
            <Canvas />

            {/* Critical time warning */}
            {timeLeft > 0 && timeLeft <= 9 && phase === 'drawing' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-pop-in">
                <div className="px-5 py-2 bg-rose-500/90 backdrop-blur-xl rounded-2xl flex items-center gap-3 shadow-2xl shadow-rose-500/40 border border-white/20">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Time!</span>
                  <span className="text-xl font-mono font-black text-white animate-pulse">{timeLeft}</span>
                </div>
              </div>
            )}

            {/* Status bar at bottom of canvas */}
            <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.5em]">Encrypted Stream</span>
              <span className={`text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 ${isMyTurn ? 'text-brand-secondary' : 'text-slate-600'}`}>
                <div className={`w-1 h-1 rounded-full ${isMyTurn ? 'bg-brand-secondary animate-pulse' : 'bg-slate-700'}`} />
                {isMyTurn ? 'DRAWING' : 'GUESSING'}
              </span>
            </div>
          </div>

          {/* TOOLBAR — lives BELOW the canvas, not on top of it */}
          <Toolbar />
        </section>

        {/* CHAT COLUMN - Desktop: always visible | Mobile: tab */}
        <aside className={`w-80 xl:w-96 shrink-0 border-l border-white/5 overflow-hidden ${
          mobileTab === 'chat' ? 'flex w-full' : 'hidden'
        } lg:flex flex-col`}>
          <Chat />
        </aside>
      </div>

      {/* ── MODALS / OVERLAYS ─────────────────────── */}
      <WordModal />
      <GameOver />
      <PhaseOverlay />
    </div>
  );
};

export default Game;
