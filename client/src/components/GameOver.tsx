// GameOver.tsx
// Final Transformation: Podium Exhibition.

import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const GameOver: React.FC = () => {
  const { phase, players, winner, resetGame, playerId } = useGame();
  const navigate = useNavigate();

  if (phase !== 'gameOver') return null;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const me = players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-main/98 backdrop-blur-2xl animate-fade-in overflow-hidden h-[100dvh]">
      <div className="w-full max-w-5xl text-center relative z-10 py-10">
        
        {/* Pro Header */}
        <div className="mb-12 md:mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-3 px-6 py-2 mb-8 panel rounded-full border border-white/10 opacity-80">
            <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(251,113,133,0.5)]" />
            <span className="text-[10px] font-black tracking-[0.4em] text-brand-accent uppercase">
               Final Results
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black italic text-gradient-pro tracking-tighter leading-none mb-4">
             GAME <span className="opacity-20 text-slate-500">OVER</span>
          </h1>
          <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.5em] mt-6">Scores Calculated • Thanks for playing!</p>
        </div>

        {/* Tactical Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end px-4 md:px-8 max-w-5xl mx-auto animate-pop-in">
            {/* 2nd Place */}
            {sortedPlayers[1] && (
                <div className="order-2 md:order-1 panel p-8 md:p-10 rounded-[2.5rem] border-white/5 relative group transition-all hover:bg-bg-panel/60 h-fit">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Runner Up</div>
                    <div className="text-xl md:text-2xl font-black text-white/95 mb-4 px-2 max-w-[150px] md:max-w-[180px] mx-auto overflow-hidden text-ellipsis whitespace-nowrap italic">{sortedPlayers[1].name}</div>
                    <div className="inline-block bg-white/5 px-6 py-2 rounded-full text-[10px] font-mono font-black text-brand-secondary">{sortedPlayers[1].score} PTS</div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 panel-card w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl ring-4 ring-bg-main bg-bg-card">🥈</div>
                </div>
            )}

            {/* Winner */}
            {winner && (
                <div className="order-1 md:order-2 panel p-10 md:p-14 rounded-[3.5rem] border-brand-highlight/20 relative shadow-3xl bg-bg-panel/80 scale-100 md:scale-105 animate-pop-in overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-highlight/10 to-transparent pointer-events-none" />
                    <div className="text-[10px] font-black text-brand-highlight uppercase tracking-[0.5em] mb-6 animate-pulse">Winner</div>
                    <div className="text-3xl md:text-5xl font-black text-white mb-8 drop-shadow-2xl italic px-4 max-w-[200px] md:max-w-[280px] mx-auto overflow-hidden text-ellipsis whitespace-nowrap">{winner.name}</div>
                    
                    <div className="inline-flex items-center gap-4 bg-brand-highlight/10 border border-brand-highlight/20 px-8 py-4 rounded-[2.5rem]">
                        <span className="text-2xl font-black text-white italic">{winner.score}</span>
                        <span className="text-[10px] font-black text-brand-highlight uppercase tracking-widest">Points</span>
                    </div>

                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-highlight w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(251,191,36,0.4)] ring-8 ring-bg-main btn-game">🥇</div>
                </div>
            )}

            {/* 3rd Place */}
            {sortedPlayers[2] && (
                <div className="order-3 panel p-8 md:p-10 rounded-[2.5rem] border-white/5 relative group transition-all hover:bg-bg-panel/60 h-fit">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">3rd Place</div>
                    <div className="text-xl md:text-2xl font-black text-white/95 mb-4 px-2 max-w-[150px] md:max-w-[180px] mx-auto overflow-hidden text-ellipsis whitespace-nowrap italic">{sortedPlayers[2].name}</div>
                    <div className="inline-block bg-white/5 px-6 py-2 rounded-full text-[10px] font-mono font-black text-brand-secondary">{sortedPlayers[2].score} PTS</div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 panel-card w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl ring-4 ring-bg-main bg-bg-card">🥉</div>
                </div>
            )}
        </div>

        {/* Global Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10 relative z-[110] animate-slide-up">
          {isHost ? (
              <button
                onClick={resetGame}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-16 py-6 rounded-[2.5rem] font-black text-sm tracking-[0.4em] btn-game shadow-tactile-heavy transition-all active:scale-95 group/btn"
              >
                PLAY AGAIN ➔
              </button>
          ) : (
              <div className="panel px-10 py-5 rounded-[2rem] border-white/10 flex items-center gap-4">
                  <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic tracking-[0.4em]">Waiting for Host to restart...</span>
              </div>
          )}
          
          <button
            onClick={() => { sessionStorage.clear(); navigate('/'); window.location.reload(); }}
            className="text-slate-700 hover:text-slate-400 px-10 py-5 font-black text-[10px] tracking-[0.5em] transition-all uppercase italic"
          >
            LEAVE ROOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
