// WordModal.tsx
// Modal shown to the current drawer at the start of their round.
// Players choose one of three words to draw.

import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../context/GameContext';

const WordModal: React.FC = () => {
  const socket = useSocket();
  const { phase, playerId, currentDrawerId, selectWord } = useGame();
  
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);
  
  const isMyTurn = playerId === currentDrawerId && phase === 'choosing';

  // ---------------------------------------------------------------------------
  // Socket Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // Listen for word choices from the server
    socket.on('word_options', (data: { words: string[] }) => {
      setWordOptions(data.words);
      setCountdown(10);
    });

    return () => {
      socket.off('word_options');
    };
  }, [socket]);

  // ---------------------------------------------------------------------------
  // Modal Countdown logic
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMyTurn && wordOptions.length > 0 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isMyTurn && countdown === 0 && wordOptions.length > 0) {
      // Auto-select first word if time runs out
      selectWord(wordOptions[0]);
    }
    return () => clearInterval(timer);
  }, [isMyTurn, wordOptions, countdown, selectWord]);

  // If it's not the user's turn to choose or phase is not choosing, don't show
  if (!isMyTurn || wordOptions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in transition-all">
      <div className="bg-gray-900 border-2 border-purple-500/50 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic text-white tracking-widest uppercase mb-2">
            Pick a word
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Choosing in:</span>
            <span className={`text-xl font-black ${countdown < 4 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
              {countdown}s
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {wordOptions.map((word) => (
            <button
              key={word}
              onClick={() => selectWord(word)}
              className="group relative bg-gray-800 hover:bg-purple-600 border border-gray-700 hover:border-purple-400 py-6 px-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 text-center overflow-hidden"
            >
              <span className="relative z-10 text-xl font-bold tracking-wide text-white group-hover:text-white">
                {word}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
            Tip: Choose something you can actually draw!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordModal;
