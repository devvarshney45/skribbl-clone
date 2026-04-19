// Toolbar.tsx
// Redesigned for spatial economy.
// Features a high-density kit for the drawing phase.

import React from 'react';
import { useGame } from '../context/GameContext';

const Toolbar: React.FC = () => {
  const { color, setBrushConfig, size, clearCanvas, undo, phase, currentPlayerIsDrawer } = useGame();

  if (phase !== 'drawing' || !currentPlayerIsDrawer) return null;

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', 
    '#10b981', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'
  ];

  const sizes = [
    { label: 'S', value: 3 },
    { label: 'M', value: 8 },
    { label: 'L', value: 16 },
    { label: 'XL', value: 32 },
  ];

  return (
    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-6 shadow-3xl border-white/5 animate-fade-in bg-bg-deep/40 backdrop-blur-3xl scale-90 md:scale-100">
      
      {/* Pigments */}
      <div className="flex flex-col gap-1.5 px-1">
          <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">Pigment</span>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setBrushConfig({ color: c })}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-lg transition-all transform hover:scale-110 active:scale-95 ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-deep scale-105' : 'opacity-80'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
      </div>

      <div className="w-px h-8 bg-white/5" />

      {/* Thickness */}
      <div className="flex flex-col gap-1.5 px-1">
          <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">Weight</span>
          <div className="flex items-center gap-1.5">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => setBrushConfig({ size: s.value })}
                className={`w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${
                  size === s.value 
                  ? 'bg-indigo-600 text-white shadow-xl ring-1 ring-white/10' 
                  : 'bg-white/5 text-slate-500 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
      </div>

      <div className="w-px h-8 bg-white/5" />

      {/* Instruments */}
      <div className="flex flex-col gap-1.5 px-1">
          <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">Action</span>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              title="Undo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            
            <button
              onClick={clearCanvas}
              title="Clear"
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center transition-all border border-rose-500/10 group"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
      </div>
    </div>
  );
};

export default Toolbar;
