// Toolbar.tsx
// Redesigned with a premium "Glass Floating" aesthetic.
// Features high-end colors, refined controls, and sleek feedback.

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
    <div className="glass px-10 py-5 rounded-[2.5rem] flex items-center gap-10 shadow-3xl border-white/5 animate-fade-in">
      
      {/* Color Palette */}
      <div className="flex flex-col gap-2.5">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 mb-1">Pigments</span>
          <div className="grid grid-cols-5 gap-3">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setBrushConfig({ color: c })}
                className={`w-7 h-7 rounded-xl transition-all transform hover:scale-125 active:scale-90 relative ${
                  color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-[#03040b] scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              >
                  {color === c && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-black mix-blend-difference">●</div>
                  )}
              </button>
            ))}
          </div>
      </div>

      <div className="w-px h-12 bg-white/5" />

      {/* Brush Architecture */}
      <div className="flex flex-col gap-2.5">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 mb-1">Thickness</span>
          <div className="flex items-center gap-2.5">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => setBrushConfig({ size: s.value })}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${
                  size === s.value 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10' 
                  : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
      </div>

      <div className="w-px h-12 bg-white/5" />

      {/* Utility Suite */}
      <div className="flex flex-col gap-2.5">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 mb-1">Instruments</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBrushConfig({ color: '#ffffff' })}
              title="White Ink"
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 border ${
                color === '#ffffff' 
                ? 'bg-indigo-600 text-white border-indigo-500/50 shadow-xl' 
                : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7.5 7.5 0 01-2 12H5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.2 3L12 6.2M18.8 6.6L15.6 9.8" />
              </svg>
            </button>
            
            <button
              onClick={undo}
              title="Rollback Segment"
              className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 border border-white/5 group"
            >
              <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            
            <button
              onClick={clearCanvas}
              title="Purge Canvas"
              className="w-11 h-11 rounded-2xl bg-rose-950/20 hover:bg-rose-900/40 flex items-center justify-center transition-all active:scale-90 border border-rose-500/10 group shadow-lg"
            >
              <svg className="w-5 h-5 text-rose-500 group-hover:text-rose-400 group-hover:rotate-12 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
      </div>
    </div>
  );
};

export default Toolbar;
