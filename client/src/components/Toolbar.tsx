// Toolbar.tsx
// Provides drawing tools for the current drawer:
// Colors, Brush Sizes, Eraser, Undo, and Clear Canvas.

import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../context/GameContext';

const COLORS = [
  '#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8',
  '#3F48CC', '#A349A4', '#FFFFFF', '#C3C3C3', '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0',
  '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7'
];

const BRUSH_SIZES = [5, 10, 20, 40];

const Toolbar: React.FC = () => {
  const socket = useSocket();
  const { roomCode, playerId, currentDrawerId, phase } = useGame();
  
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedSize, setSelectedSize] = useState(5);

  const isMyTurn = playerId === currentDrawerId && phase === 'drawing';

  // If it's not the user's turn to draw, don't show the toolbar
  if (!isMyTurn) return null;

  // ---------------------------------------------------------------------------
  // Tool Actions
  // ---------------------------------------------------------------------------

  const updateTool = (color: string, size: number) => {
    setSelectedColor(color);
    setSelectedSize(size);
    // Dispatch a custom event that Canvas.tsx listens to
    window.dispatchEvent(new CustomEvent('toolbar-update', { 
      detail: { color, size } 
    }));
  };

  const handleClear = () => {
    if (window.confirm('Clear the entire canvas?')) {
      socket.emit('canvas_clear', { roomCode });
    }
  };

  const handleUndo = () => {
    socket.emit('draw_undo', { roomCode });
  };

  const handleEraser = () => {
    updateTool('#FFFFFF', 20);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-3xl shadow-2xl mt-4">
      {/* Color Palette */}
      <div className="grid grid-cols-10 gap-1 bg-gray-800 p-2 rounded-xl">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => updateTool(color, selectedSize)}
            className={`w-6 h-6 rounded-md transition-transform active:scale-90 ${
              selectedColor === color ? 'ring-2 ring-white scale-110 z-10' : ''
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Brush Sizes */}
      <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-xl px-4">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => updateTool(selectedColor, size)}
            className={`flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-all ${
              selectedSize === size ? 'ring-2 ring-purple-500 bg-gray-600' : ''
            }`}
            style={{ width: 32, height: 32 }}
          >
            <div 
              className="bg-white rounded-full" 
              style={{ width: Math.max(2, size / 2), height: Math.max(2, size / 2) }}
            />
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleEraser}
          className="flex flex-col items-center justify-center w-14 h-14 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all active:scale-95"
          title="Eraser"
        >
          <span className="text-xl">🧽</span>
          <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">Eraser</span>
        </button>
        
        <button
          onClick={handleUndo}
          className="flex flex-col items-center justify-center w-14 h-14 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all active:scale-95"
          title="Undo last stroke"
        >
          <span className="text-xl">↩️</span>
          <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">Undo</span>
        </button>

        <button
          onClick={handleClear}
          className="flex flex-col items-center justify-center w-14 h-14 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-xl transition-all active:scale-95 group"
          title="Clear everything"
        >
          <span className="text-xl group-hover:animate-ping opacity-75">🗑️</span>
          <span className="text-[8px] font-black uppercase tracking-tighter text-red-400">Clear</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
