// GameOver.tsx
// Redesigned with a premium "Winner's Circle" summary screen.

import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const GameOver: React.FC = () => {
  const { phase, leaderboard, winner } = useGame();
  const navigate = useNavigate();

  if (phase !== 'gameOver') return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#03040b]/90 backdrop-blur-xl animate-fade-in">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-brand-secondary/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-2xl text-center relative z-10">
        <div className="mb-10">
          <div className="inline-block px-4 py-1.5 mb-6 glass rounded-full ring-1 ring-white/10">
            <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">
              Exhibition Concluded
            </span>
          </div>
          <h1 className="text-7xl font-black italic text-gradient tracking-tighter mb-4">
            SESSION OVER
          </h1>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="glass p-12 rounded-[3.5rem] border-white/10 shadow-3xl mb-10 group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
             
             <div className="relative">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Ultimate Master</div>
                <div className="text-5xl font-black text-white mb-6 drop-shadow-md">{winner.name}</div>
                
                <div className="inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-8 py-3 rounded-2xl">
                   <span className="text-2xl font-black text-indigo-400">{winner.score}</span>
                   <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Points Secured</span>
                </div>
             </div>
          </div>
        )}

        {/* Mini Leaderboard */}
        <div className="space-y-3 mb-12">
          {leaderboard.slice(0, 5).map((player, index) => (
            <div key={player.id} className="flex items-center justify-between px-8 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black italic text-slate-600 w-4">#{index + 1}</span>
                <span className="text-sm font-bold text-slate-300">{player.name}</span>
              </div>
              <span className="text-xs font-black text-white tabular-nums">{player.score} pts</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-3xl font-black text-sm tracking-[0.25em] shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95"
        >
          RETURN TO HUB
        </button>
      </div>
    </div>
  );
};

export default GameOver;
