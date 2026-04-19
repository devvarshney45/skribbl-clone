// WordModal.tsx
// Redesigned with a premium "Selection Studio" look.

import React from 'react';
import { useGame } from '../context/GameContext';

const WordModal: React.FC = () => {
  const { phase, wordOptions, chooseWord, currentPlayerIsDrawer } = useGame();

  if (phase !== 'choosing' || !currentPlayerIsDrawer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="glass w-full max-w-2xl p-10 rounded-[3rem] border-white/10 shadow-3xl text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="relative">
          <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <span className="text-[10px] font-black tracking-[0.25em] text-indigo-400 uppercase">
              ARTIST SELECTION
            </span>
          </div>
          
          <h2 className="text-4xl font-black italic text-white mb-4">Choose Your Subject</h2>
          <p className="text-slate-500 font-medium mb-12">Select the concept you'd like to bring to life on the canvas.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wordOptions.map((word) => (
              <button
                key={word}
                onClick={() => chooseWord(word)}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-xl font-black text-white uppercase tracking-wider group-hover:text-indigo-300 transition-colors">
                  {word}
                </span>
                <div className="mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Pick this word
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
          Hurry! The studio is waiting for your choice.
        </div>
      </div>
    </div>
  );
};

export default WordModal;
