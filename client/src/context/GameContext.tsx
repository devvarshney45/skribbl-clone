// GameContext.tsx
// Manages the global state of the game, including player info,
// room details, and real-time game status.

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import confetti from 'canvas-confetti';

// Type definitions for the game state
export interface Player {
  id: string;
  name: string;
  score: number;
  hasGuessedCorrectly: boolean;
  isReady: boolean;
  isHost: boolean;
  isBot: boolean;
  isOnline: boolean;
}

export type GamePhase = 'waiting' | 'choosing' | 'drawing' | 'roundEnd' | 'gameOver';

interface GameContextType {
  // Player & Room info
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  playerId: string;
  loading: boolean;
  
  // Game State
  players: Player[];
  phase: GamePhase;
  currentDrawerId: string | null;
  word: string;
  wordHints: string[];
  wordOptions: string[];
  messages: Array<{ author: string; text: string; type: 'normal' | 'correct' | 'system' }>;
  timeLeft: number;
  round: number;
  totalRounds: number;
  winner: Player | null;
  drawTime: number;
  isPrivate: boolean;

  // Status Helpers
  currentPlayerIsDrawer: boolean;

  // Brush Config
  color: string;
  size: number;
  setBrushConfig: (config: { color?: string; size?: number }) => void;

  // Actions
  joinRoom: (name: string, code: string) => void;
  createRoom: (name: string, code: string, isPrivate?: boolean) => void;
  markReady: () => void;
  startGame: () => void;
  chooseWord: (word: string) => void;
  sendGuess: (text: string) => void;
  sendChat: (text: string) => void;
  undo: () => void;
  clearCanvas: () => void;
  updateSettings: (settings: { rounds?: number; drawTime?: number; isPrivate?: boolean }) => void;
  resetGame: () => void;
  kickPlayer: (targetPlayerId: string) => void;
  claimHost: () => void;
  addBot: () => void;
  isDisconnected: boolean;
  socket: any;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socket = useSocket();

  // Local state
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [wordHints, setWordHints] = useState<string[]>([]);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Array<{ author: string; text: string; type: 'normal' | 'correct' | 'system' }>>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(80);
  const [isPrivate, setIsPrivate] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);
  
  // Brush state
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(5);

  // ---------------------------------------------------------------------------
  // Socket Event Listeners
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Session Persistence Effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('skribbl_player_id');
    const savedRoomCode = localStorage.getItem('skribbl_room_code');
    const savedName = localStorage.getItem('skribbl_player_name');

    if (savedPlayerId && savedRoomCode && savedName) {
      console.log('[GameContext] Found existing session, attempting reconnect...');
      setPlayerName(savedName);
      setRoomCode(savedRoomCode);
      setPlayerId(savedPlayerId);
      setLoading(true);
      socket.emit('reconnect_session', { playerId: savedPlayerId, roomCode: savedRoomCode });
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Auto-Recovery on socket reconnect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;
    
    socket.on('connect', () => {
      setIsDisconnected(false);
      const savedPlayerId = localStorage.getItem('skribbl_player_id');
      const savedRoomCode = localStorage.getItem('skribbl_room_code');
      const savedName = localStorage.getItem('skribbl_player_name');
      
      if (savedPlayerId && savedRoomCode && savedName) {
        console.log('[Socket] Recovered connection, resyncing session...');
        socket.emit('reconnect_session', { playerId: savedPlayerId, roomCode: savedRoomCode });
      }
    });

    socket.on('disconnect', () => {
      setIsDisconnected(true);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on('room_created', ({ roomCode: code, player, settings, isPrivate: priv }) => {
      setRoomCode(code);
      setPlayerId(player.id);
      setPlayers([player]);
      setIsPrivate(priv ?? false);
      if (settings?.rounds) setTotalRounds(settings.rounds);
      if (settings?.drawTime) setDrawTime(settings.drawTime);
      
      localStorage.setItem('skribbl_player_id', player.id);
      localStorage.setItem('skribbl_room_code', code);
      localStorage.setItem('skribbl_player_name', player.name);
    });

    socket.on('joined_room', ({ roomCode: code, player, settings, isPrivate: priv }) => {
      setRoomCode(code);
      setPlayerId(player.id);
      setIsPrivate(priv ?? false);
      if (settings?.rounds) setTotalRounds(settings.rounds);
      if (settings?.drawTime) setDrawTime(settings.drawTime);
      
      localStorage.setItem('skribbl_player_id', player.id);
      localStorage.setItem('skribbl_room_code', code);
      localStorage.setItem('skribbl_player_name', player.name);
    });

    socket.on('player_list', ({ players: list }) => {
      setPlayers(list);
    });

    socket.on('player_joined', ({ player }) => {
      setMessages(prev => [...prev.slice(-49), { 
        author: 'SYSTEM', 
        text: `${player.name} entered the studio.`, 
        type: 'system' 
      }]);
    });

    socket.on('session_expired', ({ message }) => {
      console.warn('[GameContext] Session expired:', message);
      localStorage.clear();
      setLoading(false);
      setPhase('waiting');
      setRoomCode('');
    });

    socket.on('kicked', ({ message }) => {
      console.warn('[GameContext] Kicked:', message);
      localStorage.clear();
      setLoading(false);
      setPhase('waiting');
      setRoomCode('');
      alert(message || 'You were removed from the room.');
    });

    socket.on('player_left', ({ playerId: leftId, playerName }) => {
      setPlayers(prev => prev.filter(p => p.id !== leftId));
      setMessages(prev => [...prev.slice(-49), { author: 'SYSTEM', text: `${playerName} left the studio.`, type: 'system' }]);
    });

    socket.on('round_start', (data) => {
      setPhase('choosing');
      setCurrentDrawerId(data.drawerId);
      setRound(data.round);
      if (data.totalRounds) setTotalRounds(data.totalRounds);
      if (data.options) setWordOptions(data.options);
      setWord('');
      setWordHints([]);
      setMessages(prev => [...prev.slice(-49), { author: 'SYSTEM', text: `Round ${data.round} — ${data.drawerName} is drawing!`, type: 'system' }]);
    });

    socket.on('word_options', (data) => {
      setWordOptions(data.words);
    });

    socket.on('you_are_drawer', ({ isDrawer: value }) => {
      console.log('[GameContext] SERVER PUSH: isDrawer =', value);
      // Deprecated in favor of identity_sync + playerId
    });

    socket.on('identity_sync', ({ playerId: sId }) => {
      console.log('[GameContext] IDENTITY SYNC: Official ID =', sId);
      setPlayerId(sId);
      localStorage.setItem('skribbl_player_id', sId);
    });

    // Drawing start
    socket.on('game_state', (data) => {
      setPhase(data.phase);
      setWordHints(data.wordHints);
      setTimeLeft(data.timeLeft);
    });

    // Updates
    socket.on('timer_update', (data) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('hint_update', (data) => {
      setWordHints(data.wordHints);
    });

    socket.on('round_end', (data) => {
      setPhase('roundEnd');
      setWord(data.word);
      setPlayers(data.leaderboard);
    });

    socket.on('game_over', (data) => {
      setPhase('gameOver');
      setWinner(data.winner);
      setPlayers(data.leaderboard);
    });

    socket.on('settings_updated', ({ settings, isPrivate: priv }) => {
      console.log('[GameContext] SETTINGS UPDATE RECEIVED:', settings, '| isPrivate:', priv);
      if (settings.rounds) setTotalRounds(settings.rounds);
      if (settings.drawTime) setDrawTime(settings.drawTime);
      if (priv !== undefined) setIsPrivate(priv);
    });

    socket.on('game_reset', () => {
      setPhase('waiting');
      setWinner(null);
      setWord('');
      setWordHints([]);
      // We keep messages but you could clear them if you want
      setMessages(prev => [...prev.slice(-49), { author: 'SYSTEM', text: 'Studio session reset. Prepare for the next round!', type: 'system' }]);
    });

    socket.on('chat_message', (data) => {
      setMessages(prev => [...prev.slice(-49), { author: data.playerName, text: data.text, type: data.type || 'normal' }]);
    });

    socket.on('guess_result', (data) => {
      if (data.correct) {
        // Trigger confetti for a celebratory feel
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#0ea5e9', '#ffffff']
        });

        setMessages(prev => [...prev.slice(-49), { 
          author: 'SYSTEM', 
          text: `${data.playerName} decoded the artwork!`, 
          type: 'correct' 
        }]);
      }
    });

    // Iron-Clad Reconnection Sync
    socket.on('reconnected', (data) => {
      console.log('[GameContext] Syncing state from server:', data);
      
      const { player, roomCode: code, phase: p, currentDrawerId: dId, ...rest } = data;
      
      setPlayerId(player.id);
      setRoomCode(code);
      setPhase(p as any);
      setCurrentDrawerId(dId);
      setWordHints(rest.wordHints || []);
      setTimeLeft(rest.timeLeft || 0);
      setRound(rest.round || 1);
      setTotalRounds(rest.totalRounds || 3);
      setIsPrivate(rest.isPrivate ?? false);
      setDrawTime(rest.settings?.drawTime || 80);
      setLoading(false);

      if (rest.wordOptions && rest.wordOptions.length > 0) {
        setWordOptions(rest.wordOptions);
      }
      
      localStorage.setItem('skribbl_player_id', player.id);
      localStorage.setItem('skribbl_room_code', code);
      localStorage.setItem('skribbl_player_name', player.name);
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_room');
      socket.off('player_list');
      socket.off('player_joined');
      socket.off('chat_message');
      socket.off('error');
      socket.off('session_expired');
      socket.off('round_start');
      socket.off('game_state');
      socket.off('timer_update');
      socket.off('hint_update');
      socket.off('round_end');
      socket.off('game_over');
      socket.off('reconnected');
    };
  }, [socket]);

  // ---------------------------------------------------------------------------
  // Action Helpers
  // ---------------------------------------------------------------------------
  const createRoom = (name: string, code: string, isPrivate: boolean = false, settings?: any) => {
    setPlayerName(name);
    setPhase('waiting');
    socket.emit('create_room', { playerName: name, roomCode: code, isPrivate, settings });
  };

  const joinRoom = (name: string, code: string) => {
    setPlayerName(name);
    setPhase('waiting');
    socket.emit('join_room', { playerName: name, roomCode: code });
  };

  const markReady = () => {
    socket.emit('player_ready', { roomCode });
  };

  const startGame = () => {
    socket.emit('start_game', { roomCode });
  };

  const chooseWord = (selectedWord: string) => {
    socket.emit('word_chosen', { roomCode, word: selectedWord });
  };

  const kickPlayer = (targetPlayerId: string) => {
    socket.emit('kick_player', { roomCode, targetPlayerId });
  };

  const claimHost = () => {
    socket.emit('claim_host', { roomCode });
  };

  const addBot = () => {
    socket.emit('add_bot', { roomCode });
  };

  const sendGuess = (text: string) => {
    socket.emit('guess', { roomCode, text });
  };

  const sendChat = (text: string) => {
    socket.emit('chat', { roomCode, text });
  };

  const setBrushConfig = (config: { color?: string; size?: number }) => {
    if (config.color) setColor(config.color);
    if (config.size) setSize(config.size);
  };

  const undo = () => {
    socket.emit('draw_undo', { roomCode });
  };

  const clearCanvas = () => {
    socket.emit('canvas_clear', { roomCode });
  };

  const updateSettings = (settings: { rounds?: number; drawTime?: number; isPrivate?: boolean }) => {
    socket.emit('update_settings', { roomCode, settings });
  };

  const resetGame = () => {
    socket.emit('reset_game', { roomCode });
  };

  const currentPlayerIsDrawer = !!playerId && !!currentDrawerId && playerId === currentDrawerId;

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        roomCode,
        setRoomCode,
        playerId,
        loading,
        players,
        phase,
        currentDrawerId,
        word,
        wordHints,
        wordOptions,
        messages,
        timeLeft,
        round,
        totalRounds,
        drawTime,
        isPrivate,
        winner,
        currentPlayerIsDrawer,
        kickPlayer,
        claimHost,
        addBot,
        isDisconnected,
        joinRoom,
        createRoom,
        markReady,
        startGame,
        chooseWord,
        sendGuess,
        sendChat,
        color,
        size,
        setBrushConfig,
        undo,
        clearCanvas,
        updateSettings,
        resetGame,
        socket,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
