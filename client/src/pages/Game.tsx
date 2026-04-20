// Game.tsx — Bulletproof mobile-first layout

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
    currentDrawerId, playerId, word, drawTime,
  } = useGame();

  const isDrawer = playerId === currentDrawerId;
  const isDrawing = phase === 'drawing';
  const [tab, setTab] = useState<'canvas' | 'chat' | 'board'>('canvas');
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleQuitConfirm = () => {
    window.location.href = '/';
  };

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Standard browser blocking alert
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const renderWordDisplay = () => {
    if (isDrawer || phase === 'roundEnd') {
      return (
        <span className="text-base md:text-2xl font-black tracking-widest uppercase text-brand-secondary truncate max-w-[160px] sm:max-w-xs md:max-w-none">
          {word || 'DRAWING…'}
        </span>
      );
    }
    return (
      <div className="flex gap-1 flex-wrap justify-center max-w-[180px] sm:max-w-sm md:max-w-none">
        {wordHints.map((char, i) => (
          <span
            key={i}
            className={`inline-block w-4 sm:w-5 text-center text-sm sm:text-base font-black uppercase border-b-2 leading-7 transition-all ${
              char === ' ' ? 'border-transparent w-2' : 'border-slate-600 text-white'
            }`}
          >
            {char !== '_' ? char : ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-screen bg-mesh-pro text-white flex flex-col font-sans select-none overflow-hidden">

      {/* ── HEADER ─────────────────────────── */}
      <header className="shrink-0 h-12 sm:h-14 flex items-center justify-between px-3 sm:px-6 bg-bg-panel/70 backdrop-blur-2xl border-b border-white/5 z-20">
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">Round</p>
            <p className="text-sm sm:text-base font-black tabular-nums leading-tight">
              {round}<span className="text-slate-700 mx-0.5 text-xs">/</span><span className="text-slate-500 text-sm">{totalRounds}</span>
            </p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">Timer</p>
            <p className={`text-sm sm:text-base font-mono font-black tabular-nums leading-tight ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-brand-secondary'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-2 overflow-hidden">
          {renderWordDisplay()}
        </div>

        <div className="shrink-0 text-right flex items-center gap-4">
          <div className="hidden sm:block">
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">Room</p>
            <p className="text-[10px] font-mono font-black text-brand-secondary tracking-wider">{roomCode}</p>
          </div>
          <button 
            onClick={() => setShowQuitModal(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-rose-500/10"
            title="Quit Game"
          >
            <span className="text-lg">🚪</span>
          </button>
        </div>
      </header>

      {/* ── TIMER BAR ──────────────────────── */}
      <div className="shrink-0 h-0.5 bg-white/5">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-brand-secondary'}`}
          style={{ width: `${(timeLeft / Math.max(1, drawTime)) * 100}%` }}
        />
      </div>

      {/* ── MOBILE TAB BAR ─────────────────── */}
      <div className="shrink-0 flex lg:hidden border-b border-white/5 bg-bg-panel/50">
        {(['canvas', 'chat', 'board'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t ? 'text-white border-b-2 border-brand-primary bg-brand-primary/10' : 'text-slate-600'
            }`}
          >
            {t === 'canvas' ? '🎨 Draw' : t === 'chat' ? '💬 Chat' : '🏆 Score'}
          </button>
        ))}
      </div>

      {/* ── PANELS ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Scoreboard */}
        <div className={`${tab === 'board' ? 'flex' : 'hidden'} lg:flex w-full lg:w-64 xl:w-72 shrink-0 flex-col border-r border-white/5 overflow-hidden`}>
          <Scoreboard />
        </div>

        {/* Canvas column (NEVER has toolbar inside) */}
        <div className={`${tab === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0 overflow-hidden`}>
          <div className="flex-1 relative overflow-hidden">
            <Canvas />
            {/* Low-time alert */}
            {timeLeft > 0 && timeLeft <= 8 && isDrawing && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="px-4 py-1.5 bg-rose-500 rounded-full flex items-center gap-2 shadow-xl shadow-rose-500/40">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">TIME!</span>
                  <span className="text-base font-mono font-black text-white">{timeLeft}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className={`${tab === 'chat' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 xl:w-96 shrink-0 flex-col border-l border-white/5 overflow-hidden`}>
          <Chat />
        </div>
      </div>

      {/* ── TOOLBAR (below ALL panels, never overlaps canvas) ── */}
      <Toolbar />

      {/* ── OVERLAYS ───────────────────────── */}
      <WordModal />
      <GameOver />
      <PhaseOverlay />
      {/* ── QUIT MODAL ────────────────────── */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
          <div className="bg-bg-main border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 text-3xl mb-4 border border-rose-500/30">
              🚪
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Leave Arena?</h2>
            <p className="text-sm font-black text-slate-400 mb-8">
              Are you sure you want to quit this match? Your points will be lost.
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowQuitModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleQuitConfirm}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 text-white rounded-xl font-black uppercase tracking-widest transition-all"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
