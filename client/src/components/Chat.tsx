// Chat.tsx
// Redesigned with a modern, glassmorphism messaging look.

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const Chat: React.FC = () => {
  const { messages, sendGuess, currentDrawerId, playerId, phase } = useGame();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canGuess = playerId !== currentDrawerId && (phase === 'drawing' || phase === 'choosing');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendGuess(inputText);
    setInputText('');
  };

  return (
    <div className="glass h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-2xl overflow-hidden animate-fade-in relative">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          Session Chat
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </h2>
      </div>

      {/* Messages list */}
      <div className="flex-grow overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col animate-fade-in ${
              msg.type === 'system' ? 'items-center my-4' : 'items-start'
            }`}
          >
            {msg.type === 'system' ? (
              <div className="text-[9px] font-black text-slate-600 bg-white/5 px-4 py-1.5 rounded-2xl uppercase tracking-widest border border-white/5 text-center leading-loose break-words whitespace-normal w-full max-w-full">
                {msg.text}
              </div>
            ) : msg.type === 'correct' ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Perfect Guess</div>
                  <div className="text-xs font-bold text-white">{msg.text}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-w-[90%]">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{msg.author}</span>
                <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                  <p className="text-xs font-semibold text-slate-300 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-black/20 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={canGuess ? "Decoded your guess..." : "Observe the art..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!canGuess}
            className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600 disabled:opacity-30 disabled:grayscale"
            maxLength={100}
          />
          <button 
            type="submit" 
            disabled={!canGuess}
            className="bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
