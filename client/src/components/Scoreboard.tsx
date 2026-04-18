// Scoreboard.tsx
// Displays the ranked list of players and their current scores.
// Highlights the current drawer and correct guessers in real-time.

import React from 'react';
import { useGame } from '../context/GameContext';

const Scoreboard: React.FC = () => {
  const { players, currentDrawerId, playerId, phase } = useGame();

  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden h-full">
      <div className="p-4 border-b border-gray-800 bg-gray-950/50">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
          Leaderboard
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {sortedPlayers.map((player, index) => {
          const isDrawer = player.id === currentDrawerId && phase === 'drawing';
          const isMe = player.id === playerId;
          
          return (
            <div 
              key={player.id}
              className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isMe 
                  ? 'bg-purple-600/10 border-purple-500/30' 
                  : 'bg-gray-800/40 border-gray-700/50'
              } ${index === 0 ? 'ring-1 ring-yellow-500/20' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Rank / Avatar */}
                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                  index === 0 ? 'bg-yellow-500 text-gray-900' :
                  index === 1 ? 'bg-gray-300 text-gray-900' :
                  index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {index + 1}
                  {isDrawer && (
                    <div className="absolute -top-1 -right-1 bg-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      ✏️
                    </div>
                  )}
                </div>

                {/* Name & Status */}
                <div>
                  <div className={`text-sm font-bold flex items-center gap-1.5 ${isMe ? 'text-purple-300' : 'text-gray-200'}`}>
                    {player.name}
                    {player.hasGuessedCorrectly && (
                       <span className="text-green-500 text-xs" title="Guessed correctly!">✓</span>
                    )}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-tighter text-gray-600">
                    {isDrawer ? 'Drawing...' : player.isHost ? 'Host' : 'Guesser'}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-sm font-black text-white px-2">
                  {player.score}
                </div>
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                  Pts
                </div>
              </div>

              {/* Me indicator */}
              {isMe && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-gray-950/30 text-center">
        <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
          Multiplayer Score System
        </p>
      </div>
    </div>
  );
};

export default Scoreboard;
