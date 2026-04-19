// GameOver.tsx
// Redesigned with a stunning "Victory Exhibition" summary screen.
// Features a dynamic podium, refined stats, and fixed transition back to the lobby.

import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const GameOver: React.FC = () => {
  const { phase, players, winner, resetGame, playerId } = useGame();
  const navigate = useNavigate();

  if (phase !== 'gameOver') return null;

  // Sorting players for the mini-leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Find current player to see if they are the host
  const me = players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#03040b]/95 backdrop-blur-2xl animate-fade-in overflow-y-auto custom-scrollbar">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse-subtle pointer-events-none" />

      <div className="w-full max-w-4xl text-center relative z-10 py-20 px-4">
        {/* Header Branding */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-2 mb-8 glass rounded-full ring-1 ring-white/10 shadow-3xl">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
              Exhibition Conclusion
            </span>
          </div>
          <h1 className="text-8xl font-black italic text-gradient tracking-tighter mb-4 leading-none">
            CURTAIN <span className="text-slate-800">FALL</span>
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.5em] mt-6">The results of the studio session are finalized</p>
        </div>

        {/* Podium Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end px-4">
            {/* 2nd Place */}
            {sortedPlayers[1] && (
                <div className="order-2 md:order-1 glass p-8 rounded-[2.5rem] border-white/5 relative group transition-all hover:border-white/10 animate-fade-in delay-200">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Runner Up</div>
                    <div className="text-2xl font-black text-white/90 mb-4">{sortedPlayers[1].name}</div>
                    <div className="text-sm font-mono font-black text-indigo-400">{sortedPlayers[1].score} PTS</div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/10 w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl ring-4 ring-[#03040b]">🥈</div>
                </div>
            )}

            {/* Winner (1st Place) */}
            {winner && (
                <div className="order-1 md:order-2 glass p-12 rounded-[3.5rem] border-indigo-500/20 relative shadow-3xl group transition-all hover:bg-white/5 scale-105 animate-fade-in">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none rounded-[3.5rem]" />
                    <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-6 animate-pulse">Ultimate Master</div>
                    <div className="text-6xl font-black text-white mb-8 drop-shadow-2xl">{winner.name}</div>
                    
                    <div className="inline-flex items-center gap-4 bg-indigo-500/10 border border-indigo-500/20 px-10 py-4 rounded-[2rem]">
                        <span className="text-3xl font-black text-white">{winner.score}</span>
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Points Secured</span>
                    </div>

                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-3xl shadow-[0_0_50px_rgba(79,70,229,0.5)] ring-8 ring-[#03040b]">🥇</div>
                </div>
            )}

            {/* 3rd Place */}
            {sortedPlayers[2] && (
                <div className="order-3 glass p-8 rounded-[2.5rem] border-white/5 relative group transition-all hover:border-white/10 animate-fade-in delay-300">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Honorable</div>
                    <div className="text-2xl font-black text-white/90 mb-4">{sortedPlayers[2].name}</div>
                    <div className="text-sm font-mono font-black text-indigo-400">{sortedPlayers[2].score} PTS</div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/10 w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl ring-4 ring-[#03040b]">🥉</div>
                </div>
            )}
        </div>

        {/* Detailed Leaderboard (4th onwards) */}
        {sortedPlayers.length > 3 && (
            <div className="max-w-xl mx-auto space-y-4 mb-16 animate-fade-in delay-500 px-4">
                <div className="w-full flex items-center gap-6 mb-8 mt-12 opacity-30">
                    <div className="flex-grow h-px bg-white/10" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Extended Roster</span>
                    <div className="flex-grow h-px bg-white/10" />
                </div>
                {sortedPlayers.slice(3, 8).map((player, index) => (
                    <div key={player.id} className="glass p-5 rounded-3xl flex items-center justify-between border-white/2 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-6 pl-2">
                            <span className="text-xs font-black text-slate-700 italic w-4">#{index + 4}</span>
                            <span className="text-sm font-bold text-white/80">{player.name}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-slate-500 pr-4">{player.score} PTS</span>
                    </div>
                ))}
            </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 pb-12 relative z-[110]">
          {isHost ? (
              <button
                onClick={() => {
                   resetGame(); 
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-16 py-6 rounded-[2.5rem] font-black text-sm tracking-[0.3em] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95 group/btn"
              >
                START NEW SESSION
                <span className="inline-block ml-3 group-hover:translate-x-1 transition-transform">→</span>
              </button>
          ) : (
              <div className="glass px-10 py-5 rounded-3xl border-white/10 flex items-center gap-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Waiting for Studio Owner to reset...</span>
              </div>
          )}
          
          <button
            onClick={() => {
               sessionStorage.clear();
               navigate('/');
               window.location.reload(); 
            }}
            className="text-slate-600 hover:text-slate-400 px-10 py-5 font-black text-[10px] tracking-[0.4em] transition-all uppercase hover:bg-white/5 rounded-3xl italic"
          >
            Leave Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
