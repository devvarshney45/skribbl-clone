// Chat.tsx
// Redesigned for absolute spatial efficiency.
// Features a high-density message list for sidebars.

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
    sendGuess(inputText);
    setInputText('');
  };

  const isGuesser = phase === 'drawing' && !currentPlayerIsDrawer;

  return (
    <div className="glass h-full rounded-[1.5rem] md:rounded-[2rem] flex flex-col border-white/5 shadow-2xl overflow-hidden bg-white/1 animate-fade-in relative">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/2">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center justify-between">
          Intercom
          <span className="text-[7px] bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 tracking-widest uppercase">Direct</span>
        </h2>
      </div>

      {/* Messages List - High Density */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar"
      >
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center py-1">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                   {msg.text}
                </span>
              </div>
            );
          }

          if (msg.type === 'correct') {
            return (
              <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center flex items-center justify-center gap-2 animate-bounce">
                  <span>⚡</span> {msg.text}
              </div>
            );
          }

          return (
            <div key={idx} className="flex flex-col items-start max-w-full">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-0.5">{msg.author}</span>
              <div className="px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-tight bg-white/5 text-slate-300 border border-white/2 break-words max-w-full">
                {msg.text}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center opacity-10 text-center px-6">
              <span className="text-3xl mb-2">📡</span>
              <p className="text-[8px] font-black uppercase tracking-widest">Awaiting Comms</p>
           </div>
        )}
      </div>

      {/* Input Area - Very compact */}
      <div className="p-4 border-t border-white/5 bg-white/2">
        {currentPlayerIsDrawer && phase === 'drawing' ? (
           <div className="bg-white/3 p-3 rounded-xl flex items-center justify-center gap-3 border border-white/5 opacity-50">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Artist is focused</span>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder={isGuesser ? "DECODE..." : "MESSAGE..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-600/30 transition-all font-bold text-xs text-white placeholder:text-slate-800"
              maxLength={100}
            />
            <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-xl shadow-indigo-600/20 active:scale-90"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
