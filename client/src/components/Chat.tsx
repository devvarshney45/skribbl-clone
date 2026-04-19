// Chat.tsx
// Final Transformation: Reliable tactical intercom with robust auto-scroll.

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const Chat: React.FC = () => {
  const { messages, sendGuess, phase, currentPlayerIsDrawer } = useGame();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Robust Auto-scroll logic
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendGuess(inputText);
    setInputText('');
  };

  const isDrawingPhase = phase === 'drawing';
  const canType = !currentPlayerIsDrawer || !isDrawingPhase;

  return (
    <div className="panel h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-2xl overflow-hidden bg-bg-panel/40 relative">
      
      {/* 1. Intercom Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-white/2 shrink-0">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center justify-between">
          Studio Intercom
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-lg border border-brand-secondary/20">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-tighter">Live</span>
          </div>
        </h2>
      </div>

      {/* 2. Tactical Message Feed */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto px-5 py-6 custom-scrollbar relative"
      >
        <div className="flex flex-col gap-4 min-h-full">
            {messages.map((msg, idx) => {
              if (msg.type === 'system') {
                return (
                  <div key={idx} className="flex justify-center py-1">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic opacity-60 text-center">
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
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 text-center gap-4 pointer-events-none">
                  <div className="text-5xl">💬</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Transmissions</p>
               </div>
            )}
            
            {/* Scroll Anchor */}
            <div ref={messagesEndRef} className="h-2 w-full shrink-0" />
        </div>
      </div>

      {/* 3. Input Terminal */}
      <div className="p-6 border-t border-white/5 bg-white/1 shrink-0">
        {!canType ? (
           <div className="bg-bg-card/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-white/2 grayscale opacity-40">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Transmission Blocked</span>
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-[0.2em]">Drawer cannot guess own word</span>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              placeholder={isDrawingPhase ? "Decode word..." : "Broadcast message..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-bg-card border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-bold text-sm text-white placeholder:text-slate-800 shadow-2xl"
              maxLength={100}
            />
            <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center transition-all btn-game active:scale-95 shadow-lg shadow-brand-primary/20"
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
