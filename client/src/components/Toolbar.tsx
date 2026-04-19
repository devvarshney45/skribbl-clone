// Toolbar.tsx
// Redesigned with a floating "Glass" look and high-quality SVG icons.

import React from 'react';
import { useGame } from '../context/GameContext';

const Toolbar: React.FC = () => {
  const { color, setBrushConfig, size, clearCanvas, undo } = useGame();

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', 
    '#10b981', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'
  ];

  const sizes = [
    { label: 'S', value: 2 },
    { label: 'M', value: 5 },
    { label: 'L', value: 10 },
    { label: 'XL', value: 20 },
  ];

  return (
    <div className="glass px-6 py-4 rounded-3xl flex items-center gap-8 shadow-2xl border-white/10">
      
      {/* Color Palette */}
      <div className="flex items-center gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setBrushConfig({ color: c })}
            className={`w-6 h-6 rounded-full transition-all transform hover:scale-125 active:scale-95 ${
              color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#03040b] scale-110' : ''
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* Brush Sizes */}
      <div className="flex items-center gap-2">
        {sizes.map((s) => (
          <button
            key={s.value}
            onClick={() => setBrushConfig({ size: s.value })}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
              size === s.value 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setBrushConfig({ color: '#ffffff' })}
          title="Eraser"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            color === '#ffffff' 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* Action Tools */}
      <div className="flex items-center gap-3">
        <button
          onClick={undo}
          title="Undo Stroke"
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 group"
        >
          <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        
        <button
          onClick={clearCanvas}
          title="Clear Canvas"
          className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center transition-all active:scale-90 group"
        >
          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
