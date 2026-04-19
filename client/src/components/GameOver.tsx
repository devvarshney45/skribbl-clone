// GameOver.tsx
// Compact, high-responsive winner exhibition.

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-deep/98 backdrop-blur-2xl animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl text-center relative z-10 py-10 md:py-20">
        
        {/* Header Branding */}
        <div className="mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full border border-white/5 opacity-80">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[8px] md:text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
              Exhibition Conclusion
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic text-gradient tracking-tighter leading-none mb-4">
            CURTAIN <span className="text-slate-800">FALL</span>
          </h1>
        </div>

        {/* Podium - Scales for vertical height */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-16 items-end px-4 max-w-3xl mx-auto">
            {/* 2nd Place */}
            {sortedPlayers[1] && (
                <div className="order-2 md:order-1 glass p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border-white/5 relative group animate-fade-in delay-200">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Runner Up</div>
                    <div className="text-xl md:text-2xl font-black text-white/90 mb-2 truncate">{sortedPlayers[1].name}</div>
                    <div className="text-xs font-mono font-black text-indigo-400">{sortedPlayers[1].score} PTS</div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/10 w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xl ring-2 ring-bg-deep">🥈</div>
                </div>
            )}

            {/* Winner */}
            {winner && (
                <div className="order-1 md:order-2 glass p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border-indigo-500/20 relative shadow-3xl scale-105 animate-fade-in">
                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4 md:mb-6 animate-pulse">Ultimate Master</div>
                    <div className="text-4xl md:text-6xl font-black text-white mb-6 md:mb-8 drop-shadow-2xl truncate">{winner.name}</div>
                    
                    <div className="inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl">
                        <span className="text-xl md:text-2xl font-black text-white">{winner.score}</span>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Points</span>
                    </div>

                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.75rem] flex items-center justify-center text-2xl md:text-3xl shadow-indigo-600/50 ring-4 md:ring-8 ring-bg-deep">🥇</div>
                </div>
            )}

            {/* 3rd Place */}
            {sortedPlayers[2] && (
                <div className="order-3 glass p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border-white/5 relative group animate-fade-in delay-300">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Honorable</div>
                    <div className="text-xl md:text-2xl font-black text-white/90 mb-2 truncate">{sortedPlayers[2].name}</div>
                    <div className="text-xs font-mono font-black text-indigo-400">{sortedPlayers[2].score} PTS</div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/10 w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xl ring-2 ring-bg-deep">🥉</div>
                </div>
            )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-10 relative z-[110]">
          {isHost ? (
              <button
                onClick={resetGame}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 md:py-6 rounded-[2rem] font-black text-xs md:text-sm tracking-[0.3em] shadow-xl transition-all"
              >
                START NEW SESSION ➔
              </button>
          ) : (
              <div className="glass px-8 py-4 rounded-2xl border-white/5 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Waiting for Studio Owner...</span>
              </div>
          )}
          
          <button
            onClick={() => { sessionStorage.clear(); navigate('/'); window.location.reload(); }}
            className="text-slate-600 hover:text-slate-400 px-8 py-4 font-black text-[9px] md:text-[10px] tracking-[0.4em] transition-all uppercase italic"
          >
            Leave Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
