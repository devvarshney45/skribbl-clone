// GameOver.tsx — Mobile-first podium screen

import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const GameOver: React.FC = () => {
  const { phase, players, winner, resetGame, playerId } = useGame();
  const navigate = useNavigate();

  if (phase !== 'gameOver') return null;

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const isHost = players.find(p => p.id === playerId)?.isHost || false;

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    'border-yellow-500/30 bg-yellow-500/5 shadow-yellow-500/10',
    'border-slate-400/30 bg-slate-400/5 shadow-slate-400/10',
    'border-orange-600/30 bg-orange-600/5 shadow-orange-600/10',
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-bg-main/97 backdrop-blur-2xl animate-fade-in">
      <div className="min-h-full w-full flex flex-col items-center px-4 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-slide-up w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black tracking-[0.4em] text-rose-400 uppercase">Final Results</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter leading-none text-white">
            GAME <span className="text-white/15">OVER</span>
          </h1>
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] mt-3">
            Scores Calculated • Thanks for playing!
          </p>
        </div>

        {/* Podium — stacked on mobile, side-by-side on desktop */}
        <div className="w-full max-w-2xl space-y-3 sm:space-y-4 mb-8 sm:mb-12 animate-pop-in">
          {sorted.slice(0, 5).map((p, i) => (
            <div
              key={p.id}
              className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${podiumColors[i] || 'border-white/5 bg-white/2'} shadow-lg transition-all`}
            >
              {/* Rank medal */}
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl">
                {medals[i] || <span className="text-base font-black text-slate-600">#{i + 1}</span>}
              </div>

              {/* Name + score */}
              <div className="flex-1 min-w-0">
                <p className={`font-black italic truncate ${i === 0 ? 'text-xl sm:text-2xl text-white' : 'text-base sm:text-lg text-white/80'}`}>
                  {p.name}
                  {p.id === playerId && <span className="text-[10px] ml-2 text-brand-secondary font-black not-italic">(You)</span>}
                </p>
                {i === 0 && (
                  <p className="text-[9px] font-black text-yellow-500/70 uppercase tracking-widest">Winner</p>
                )}
              </div>

              {/* Score */}
              <div className={`shrink-0 px-4 py-2 rounded-xl font-mono font-black ${
                i === 0 ? 'bg-yellow-500/10 text-yellow-400 text-base' : 'bg-white/5 text-slate-400 text-sm'
              }`}>
                {p.score} <span className="text-[9px]">pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-md animate-slide-up">
          {isHost ? (
            <button
              onClick={resetGame}
              className="w-full sm:w-auto flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-[0.3em] active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
            >
              PLAY AGAIN ➔
            </button>
          ) : (
            <div className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 py-4 px-6 bg-white/3 rounded-2xl border border-white/5">
              <span className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Waiting for host to restart…</span>
            </div>
          )}
          <button
            onClick={() => { sessionStorage.clear(); navigate('/'); window.location.reload(); }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.4em] text-slate-600 hover:text-slate-300 transition-all uppercase border border-white/5 hover:border-white/10"
          >
            LEAVE
          </button>
        </div>

      </div>
    </div>
  );
};

export default GameOver;
