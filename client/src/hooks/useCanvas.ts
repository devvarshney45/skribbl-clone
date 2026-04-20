// useCanvas.ts
// Handles all drawing logic, local state, and socket synchronization.

import { useRef, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from './useSocket';

export default function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const socket = useSocket();
  const { roomCode, color, size, playerId } = useGame();
  
  // History for sync and resize — mirrors server's currentStrokes
  const strokes = useRef<any[]>([]);
  const currentStroke = useRef<any>(null);
  const isDrawing = useRef(false);

  // ---------------------------------------------------------------------------
  // Canvas Helper: Get current context
  // ---------------------------------------------------------------------------
  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d', { willReadFrequently: true });
  }, [canvasRef]);

  // ---------------------------------------------------------------------------
  // Redraw all strokes from buffer
  // ---------------------------------------------------------------------------
  const redraw = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    strokes.current.forEach((stroke) => {
      ctx.beginPath();
      ctx.moveTo(stroke.x, stroke.y);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size || stroke.brushSize || 5;

      if (stroke.points && stroke.points.length > 0) {
        stroke.points.forEach((pt: any) => {
          ctx.lineTo(pt.x, pt.y);
        });
      }
      ctx.stroke();
    });
  }, [getCtx, canvasRef]);

  // ---------------------------------------------------------------------------
  // Init Canvas settings
  // ---------------------------------------------------------------------------
  const initCanvas = useCallback(() => {
    const ctx = getCtx();
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [getCtx]);

  // ---------------------------------------------------------------------------
  // Drawing Actions (Local + Socket)
  // ---------------------------------------------------------------------------
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!socket) return;
    
    isDrawing.current = true;
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    
    let x, y;

    if ('touches' in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    // Record locally
    currentStroke.current = {
      type: 'start',
      x, y,
      color,
      size,
      points: []
    };
    strokes.current.push(currentStroke.current);

    socket.emit('draw_start', { roomCode, x, y, color, size });
  }, [socket, roomCode, color, size, getCtx, canvasRef]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !socket || !canvasRef.current) return;

    const ctx = getCtx();
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    let x, y;

    if ('touches' in e) {
       x = (e.touches[0].clientX - rect.left) * scaleX;
       y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
       x = (e.clientX - rect.left) * scaleX;
       y = (e.clientY - rect.top) * scaleY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    // Record locally
    if (currentStroke.current) {
        currentStroke.current.points.push({ x, y });
    }

    socket.emit('draw_move', { roomCode, x, y });
  }, [socket, roomCode, getCtx, canvasRef]);

  const endDrawing = useCallback(() => {
    if (!isDrawing.current || !socket) return;
    isDrawing.current = false;
    currentStroke.current = null;
    socket.emit('draw_end', { roomCode });
  }, [socket, roomCode]);

  // ---------------------------------------------------------------------------
  // Handle incoming drawing data from other players
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    socket.on('draw_data', (data) => {
      // Don't draw our own data again (we draw locally for speed)
      if (data.playerId === playerId) return;

      const ctx = getCtx();
      if (!ctx) return;

      if (data.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;

        // Sync to local buffer
        currentStroke.current = {
            type: 'start',
            x: data.x, y: data.y,
            color: data.color,
            size: data.size,
            points: []
        };
        strokes.current.push(currentStroke.current);
      } else if (data.type === 'move') {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();

        if (currentStroke.current) {
            currentStroke.current.points.push({ x: data.x, y: data.y });
        }
      } else if (data.type === 'end') {
          currentStroke.current = null;
      }
    });

    socket.on('canvas_cleared', () => {
      strokes.current = [];
      currentStroke.current = null;
      redraw();
    });

    socket.on('canvas_replay', (data) => {
       strokes.current = data.strokes || [];
       currentStroke.current = null;
       redraw();
    });

    return () => {
      socket.off('draw_data');
      socket.off('canvas_cleared');
      socket.off('canvas_replay');
    };
  }, [socket, playerId, getCtx, canvasRef]);

  return { initCanvas, redraw, startDrawing, draw, endDrawing };
}
