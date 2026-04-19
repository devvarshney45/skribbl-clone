// Chat.tsx
// Redesigned with a premium "Terminal" aesthetic.
// Features elegant message balloons, system notifications, and refined input handling.

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const Chat: React.FC = () => {
  const { messages, sendGuess, phase, currentPlayerIsDrawer } = useGame();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Send as guess (GameContext handles if it should be chat or guess)
    sendGuess(inputText);
    setInputText('');
  };

  const isGuesser = phase === 'drawing' && !currentPlayerIsDrawer;

  return (
    <div className="glass h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-3xl overflow-hidden animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/2">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
          Studio Comms
          <span className="text-[9px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-md font-black tracking-tighter">ENCRYPTED</span>
        </h2>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar"
      >
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center">
                <div className="bg-white/5 px-5 py-2 rounded-full border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic animate-fade-in">
                   {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === 'correct') {
            return (
              <div key={idx} className="flex justify-center animate-fade-in">
                <div className="bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3">
                    <span className="text-base">💎</span>
                    {msg.text}
                </div>
              </div>
            );
          }

          const isSystem = msg.author === 'SYSTEM';

          return (
            <div 
              key={idx} 
              className={`flex flex-col animate-fade-in ${isSystem ? 'items-center' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{msg.author}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
              </div>
              <div className={`px-5 py-3 rounded-[1.25rem] text-sm font-bold tracking-tight max-w-[90%] break-words ${
                msg.type === 'correct' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-white/5 text-slate-300 border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
              <span className="text-4xl mb-4">💬</span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Silence is heavy.<br/>Break the ice.</p>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/5 bg-white/2">
        {currentPlayerIsDrawer && phase === 'drawing' ? (
           <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-3 border border-white/5 grayscale">
              <span className="text-lg">🤐</span>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Artists must remain silent</span>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              placeholder={isGuesser ? "DECODE THE ARTWORK..." : "MODULATE COMMS..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600/40 transition-all font-bold text-sm text-white placeholder:text-slate-700 placeholder:tracking-widest"
              maxLength={100}
            />
            <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 active:scale-90"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
