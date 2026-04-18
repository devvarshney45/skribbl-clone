// GameOver.tsx
// Final screen shown when the game ends.
// Displays the winner with animations and the final rankings.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const GameOver: React.FC = () => {
  const navigate = useNavigate();
  const { players, winner, startGame, playerId, phase, resetGame } = useGame();

  const me = players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  const handlePlayAgain = () => {
    resetGame();
    startGame();
  };

  const handleLeave = () => {
    resetGame();
    navigate('/');
    window.location.reload(); // Force full cleanup
  };

  if (phase !== 'gameOver') return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-950/95 backdrop-blur-xl animate-in fade-in transition-all overflow-y-auto">
      <div className="relative bg-gray-900 border border-gray-800 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl text-center">
        
        {/* Confetti Animation (CSS only) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-4 bg-purple-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <h1 className="text-sm font-black text-purple-500 uppercase tracking-[0.5em] mb-4">
            Game Over
          </h1>
          
          <div className="mb-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse" />
              <div className="relative text-7xl mb-4">👑</div>
            </div>
            <h2 className="text-4xl font-black italic text-white mb-2 leading-tight">
              {winner?.name} Wins!
            </h2>
            <p className="text-yellow-500 font-bold tracking-widest uppercase text-xs">
              Ultimate Master Artist
            </p>
          </div>

          {/* Mini Leaderboard */}
          <div className="bg-gray-800/50 rounded-3xl p-6 mb-12 border border-gray-700/50">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Final Standings</h3>
            <div className="space-y-4 max-h-[30vh] overflow-y-auto px-2">
              {players.sort((a, b) => b.score - a.score).map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-2xl ${
                    player.id === playerId ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      index === 0 ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-bold text-sm text-gray-200">{player.name}</span>
                  </div>
                  <span className="font-black text-white">{player.score} <span className="text-[10px] text-gray-700">PTS</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isHost && (
              <button
                onClick={handlePlayAgain}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-10 py-4 rounded-2xl font-black tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                PLAY AGAIN
              </button>
            )}
            <button
              onClick={handleLeave}
              className="bg-gray-800 hover:bg-gray-700 px-10 py-4 rounded-2xl font-black tracking-widest transition-all transform hover:scale-105 active:scale-95 border border-gray-700"
            >
              QUIT GAME
            </button>
          </div>
          
          <div className="mt-12 opacity-20 font-black italic text-[10px] uppercase tracking-widest text-white">
            Thanks for playing the Skribbl Clone!
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
