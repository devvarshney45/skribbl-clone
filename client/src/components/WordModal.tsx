// WordModal.tsx
// Redesigned with a premium "Exhibition Picker" look.
// Features elegant typography, animated options, and a refined layout.

import React from 'react';
import { useGame } from '../context/GameContext';

const WordModal: React.FC = () => {
  const { phase, currentPlayerIsDrawer, wordOptions, chooseWord } = useGame();

  if (phase !== 'choosing' || !currentPlayerIsDrawer) {
    if (phase === 'choosing' && !currentPlayerIsDrawer) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#03040b]/80 backdrop-blur-md animate-fade-in">
          <div className="glass p-12 rounded-[2.5rem] border-white/5 shadow-3xl text-center flex flex-col items-center max-w-lg">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-8 animate-pulse">🎨</div>
             <h2 className="text-xl font-black text-white mb-4 italic tracking-tight">Artist is Curating...</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] leading-relaxed px-4">
                The session director is currently selecting the thematic focus for this exhibition.
             </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#03040b]/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-3xl text-center relative">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-indigo-600/10 blur-[100px] pointer-events-none" />
        
        <div className="mb-14">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 glass rounded-full ring-1 ring-white/10 shadow-xl">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
             <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
                Artistic Direction
             </span>
          </div>
          <h1 className="text-6xl font-black italic text-gradient tracking-tighter mb-4">
            CHOOSE YOUR <span className="text-slate-800">SUBJECT</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] mt-6">Select the theme you wish to manifest on the canvas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {wordOptions.map((word, index) => (
            <button
              key={word}
              onClick={() => chooseWord(word)}
              className="glass p-10 rounded-[2.5rem] border-white/5 text-white/90 text-xl font-black tracking-tight transition-all duration-500 hover:bg-indigo-600 hover:border-indigo-500/50 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-600/30 active:scale-95 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 group-hover:text-white/50 transition-colors italic">Option {index + 1}</div>
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordModal;
