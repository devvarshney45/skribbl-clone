// Chat.tsx
// Final Transformation: Tactical intercom.

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
    <div className="panel h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-2xl overflow-hidden bg-bg-panel/40 animate-slide-up relative">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-white/2">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center justify-between">
          Intercom
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-lg border border-brand-secondary/20">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-tighter">Live</span>
          </div>
        </h2>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-5 py-6 space-y-4 custom-scrollbar"
      >
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center py-1">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic opacity-60">
                   {msg.text}
                </span>
              </div>
            );
          }

          if (msg.type === 'correct') {
             return (
               <div key={idx} className="bg-brand-secondary/10 border border-brand-secondary/30 p-4 rounded-2xl animate-pop-in">
                  <div className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                     <span className="text-lg">✨</span> {msg.text}
                  </div>
               </div>
             );
          }

          return (
            <div key={idx} className="flex flex-col items-start gap-1">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">{msg.author}</span>
              <div className="px-4 py-2.5 rounded-2xl text-[13px] font-bold tracking-tight bg-bg-card/60 shadow-inner border border-white/5 text-slate-300 break-words max-w-full">
                {msg.text}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-4">
              <div className="text-5xl">📡</div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected</p>
           </div>
        )}
      </div>

      {/* Input Stage */}
      <div className="p-6 border-t border-white/5 bg-white/1">
        {currentPlayerIsDrawer && phase === 'drawing' ? (
           <div className="bg-bg-card/50 p-4 rounded-2xl flex items-center justify-center gap-3 border border-white/2 grayscale opacity-40">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Artist remains silent</span>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              placeholder={isGuesser ? "DECODE THE ART..." : "MODULATE MSG..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-bg-card border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-bold text-sm text-white placeholder:text-slate-800"
              maxLength={100}
            />
            <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center transition-all btn-game active:scale-95"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
