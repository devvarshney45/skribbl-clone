// Canvas.tsx
// The core drawing component of the game.
// Handles both drawing (for the drawer) and rendering (for onlookers).
// Synchronizes stroke data in real-time via Socket.IO.

import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../context/GameContext';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  type: 'start' | 'move' | 'end';
  x?: number;
  y?: number;
  color?: string;
  brushSize?: number;
}

interface ReplayStroke {
  type: string;
  x: number;
  y: number;
  color?: string;
  brushSize?: number;
  points: Point[];
}

const Canvas: React.FC = () => {
  const socket = useSocket();
  const { roomCode, currentDrawerId, playerId, phase } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Drawing settings (controlled by Toolbar, but kept locally for quick access)
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const isMyTurn = playerId === currentDrawerId && phase === 'drawing';

  // ---------------------------------------------------------------------------
  // Initialize Canvas
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set internal resolution higher for better quality
    canvas.width = 800;
    canvas.height = 600;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;
    }

    // Listen for color/size changes from the Toolbar (via window events for simplicity)
    const handleToolbarUpdate = (e: any) => {
      if (e.detail.color) setColor(e.detail.color);
      if (e.detail.size) setBrushSize(e.detail.size);
    };

    window.addEventListener('toolbar-update', handleToolbarUpdate);

    return () => window.removeEventListener('toolbar-update', handleToolbarUpdate);
  }, []);

  // ---------------------------------------------------------------------------
  // Socket Listeners for Real-time Rendering
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming drawing data from other players
    socket.on('draw_data', (data: Stroke) => {
      if (isMyTurn) return; // Ignore our own broadcasted data
      renderStroke(data);
    });

    // Listen for canvas clear event
    socket.on('canvas_cleared', () => {
      clearCanvasLocally();
    });

    // Listen for full replay (on join or undo)
    socket.on('canvas_replay', (data: { strokes: ReplayStroke[] }) => {
      replayStrokes(data.strokes);
    });

    return () => {
      socket.off('draw_data');
      socket.off('canvas_cleared');
      socket.off('canvas_replay');
    };
  }, [socket, isMyTurn]);

  // ---------------------------------------------------------------------------
  // Drawing Logic (Mouse Events)
  // ---------------------------------------------------------------------------
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMyTurn) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);

    const context = contextRef.current;
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = color;
      context.lineWidth = brushSize;
    }

    // Emit to server
    socket.emit('draw_start', { roomCode, x, y, color, brushSize });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isMyTurn) return;

    const { x, y } = getCoordinates(e);
    
    const context = contextRef.current;
    if (context) {
      context.lineTo(x, y);
      context.stroke();
    }

    // Emit to server
    socket.emit('draw_move', { roomCode, x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing || !isMyTurn) return;

    const context = contextRef.current;
    if (context) {
      context.closePath();
    }

    setIsDrawing(false);
    socket.emit('draw_end', { roomCode });
  };

  // ---------------------------------------------------------------------------
  // Helper: Get localized mouse/touch coordinates
  // ---------------------------------------------------------------------------
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // ---------------------------------------------------------------------------
  // Helper: Render a single stroke segment (for onlookers)
  // ---------------------------------------------------------------------------
  const renderStroke = (data: Stroke) => {
    const context = contextRef.current;
    if (!context) return;

    if (data.type === 'start' && data.x !== undefined && data.y !== undefined) {
      context.beginPath();
      context.moveTo(data.x, data.y);
      if (data.color) context.strokeStyle = data.color;
      if (data.brushSize) context.lineWidth = data.brushSize;
    } else if (data.type === 'move' && data.x !== undefined && data.y !== undefined) {
      context.lineTo(data.x, data.y);
      context.stroke();
    } else if (data.type === 'end') {
      context.closePath();
    }
  };

  // ---------------------------------------------------------------------------
  // Helper: Clear local canvas
  // ---------------------------------------------------------------------------
  const clearCanvasLocally = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ---------------------------------------------------------------------------
  // Helper: Replay all strokes (for middle-joiners or undo)
  // ---------------------------------------------------------------------------
  const replayStrokes = (strokes: ReplayStroke[]) => {
    clearCanvasLocally();
    const context = contextRef.current;
    if (!context) return;

    strokes.forEach((stroke) => {
      context.beginPath();
      context.moveTo(stroke.x, stroke.y);
      context.strokeStyle = stroke.color || '#000000';
      context.lineWidth = stroke.brushSize || 5;

      stroke.points.forEach((p) => {
        context.lineTo(p.x, p.y);
      });
      context.stroke();
      context.closePath();
    });
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-white rounded-2xl shadow-inner border-4 border-gray-800 overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full touch-none"
      />
      
      {/* Overlay for non-drawers or when phase is not drawing */}
      {!isMyTurn && (
        <div className="absolute inset-0 z-10 bg-transparent pointer-events-none">
          {/* This empty div prevents interaction but allows viewing */}
        </div>
      )}

      {phase !== 'drawing' && phase !== 'waiting' && (
         <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />
      )}
    </div>
  );
};

export default Canvas;
