// useCanvas.ts
// Handles all drawing logic, local state, and socket synchronization.

import { useRef, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from './useSocket';

export default function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const socket = useSocket();
  const { roomCode, color, size, currentDrawerId, playerId } = useGame();
  
  // History for undo
  const history = useRef<ImageData[]>([]);
  const isDrawing = useRef(false);

  // ---------------------------------------------------------------------------
  // Canvas Helper: Get current context
  // ---------------------------------------------------------------------------
  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d', { willReadFrequently: true });
  }, [canvasRef]);

  // ---------------------------------------------------------------------------
  // Canvas Helper: Save state to history for undo
  // ---------------------------------------------------------------------------
  const saveToHistory = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.current = [...history.current.slice(-19), imageData]; // Keep last 20 strokes
    }
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
    
    // Save current state before new stroke
    saveToHistory();
    
    isDrawing.current = true;
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;

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

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    socket.emit('draw_start', { roomCode, x, y, color, size });
  }, [socket, roomCode, color, size, getCtx, canvasRef, saveToHistory]);

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

    socket.emit('draw_move', { roomCode, x, y });
  }, [socket, roomCode, getCtx, canvasRef]);

  const endDrawing = useCallback(() => {
    if (!isDrawing.current || !socket) return;
    isDrawing.current = false;
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
      } else if (data.type === 'move') {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    });

    socket.on('canvas_cleared', () => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    socket.on('canvas_replay', (data) => {
       const ctx = getCtx();
       const canvas = canvasRef.current;
       if (!ctx || !canvas) return;

       // Quickly wipe
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       // Loop and redraw all strokes
       data.strokes.forEach((stroke: any) => {
         if (stroke.type === 'start') {
           ctx.beginPath();
           ctx.moveTo(stroke.x, stroke.y);
           ctx.strokeStyle = stroke.color;
           ctx.lineWidth = stroke.size || 5; 
         } else if (stroke.type === 'move') {
           // Move arrays
           stroke.points.forEach((pt: any) => {
             ctx.lineTo(pt.x, pt.y);
           });
           ctx.stroke();
         }
       });
    });

    return () => {
      socket.off('draw_data');
      socket.off('canvas_cleared');
      socket.off('canvas_replay');
    };
  }, [socket, playerId, getCtx, canvasRef]);

  return { initCanvas, startDrawing, draw, endDrawing };
}
