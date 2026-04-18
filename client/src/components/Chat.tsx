// Chat.tsx
// Displays the real-time chat and guessing log.
// Correct guesses are highlighted, and the input is restricted for the current drawer.

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../context/GameContext';

interface Message {
  type: 'chat' | 'correct' | 'system';
  playerName?: string;
  text: string;
}

const Chat: React.FC = () => {
  const socket = useSocket();
  const { roomCode, phase, currentDrawerId, playerId, sendGuess, sendChat } = useGame();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMyTurn = playerId === currentDrawerId && phase === 'drawing';

  // ---------------------------------------------------------------------------
  // Auto-scroll to bottom on new message
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ---------------------------------------------------------------------------
  // Socket Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    socket.on('chat_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, [socket]);

  // ---------------------------------------------------------------------------
  // Handle Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (phase === 'drawing') {
      sendGuess(inputText);
    } else {
      sendChat(inputText);
    }

    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-grow p-4 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {messages.length === 0 && (
          <div className="text-gray-600 text-[10px] font-black uppercase text-center mt-4 tracking-widest">
            Begone, silence! Say something!
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`text-sm py-1 px-3 rounded-xl break-words transition-all animate-in fade-in slide-in-from-bottom-2 ${
              msg.type === 'correct' 
                ? 'bg-green-600/20 text-green-400 border border-green-500/30 font-bold' 
                : msg.type === 'system'
                ? 'bg-yellow-500/10 text-yellow-500 italic border border-yellow-500/20 text-xs'
                : 'bg-gray-800/50 text-white'
            }`}
          >
            {msg.playerName && msg.type === 'chat' && (
              <span className="font-black text-xs text-gray-500 uppercase mr-2 tracking-tighter">
                {msg.playerName}:
              </span>
            )}
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-950 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isMyTurn}
            placeholder={
              isMyTurn 
                ? "Shh! You're the artist..." 
                : phase === 'drawing' 
                ? "Type your guess here!" 
                : "Type to chat..."
            }
            className={`w-full py-3 px-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
              isMyTurn
                ? 'bg-gray-900 text-gray-700 cursor-not-allowed italic'
                : 'bg-gray-800 text-white focus:ring-purple-500 border border-gray-700'
            }`}
          />
          {!isMyTurn && (
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-25">
                ↵
             </div>
          )}
        </form>
        <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-center text-gray-600">
          {isMyTurn 
            ? "Don't spoil the word!" 
            : phase === 'drawing' 
            ? "Faster guess = More points" 
            : "Project Round Demo"}
        </p>
      </div>
    </div>
  );
};

export default Chat;
