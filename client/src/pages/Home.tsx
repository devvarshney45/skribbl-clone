// Home.tsx — Premium Landing with Responsive Optimization & Shared Animation Engine
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useGame } from '../context/GameContext';
import CreateRoomModal from '../components/CreateRoomModal';
import SketchBackground from '../components/SketchBackground';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRoom, joinRoom, socket } = useGame();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && urlCode.length === 6) {
      setCode(urlCode.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('joined_room', (data: { roomCode: string }) => {
      setLoading(false);
      navigate(`/room/${data.roomCode}`);
    });

    socket.on('no_public_room', () => {
      setError('Establishing new exhibition...');
      handleCreateRoom({ rounds: 3, drawTime: 80, maxPlayers: 8, wordCount: 3, hints: 2 }, false);
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      setLoading(false);
    });

    return () => { 
      socket.off('joined_room'); 
      socket.off('no_public_room');
      socket.off('error');
    };
  }, [socket, name]);

  const handleCreateRoom = async (settings: any, isPrivate: boolean) => {
    if (!name.trim()) { setError('Please enter your name first!'); return; }
    setLoading(true); setError('');
    try {
      const resp = await axios.post(`${API_URL}/api/rooms`, { hostName: name, isPrivate, settings });
      createRoom(name, resp.data.roomCode, isPrivate);
      navigate(`/room/${resp.data.roomCode}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create studio.');
      setLoading(false);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleQuickJoin = () => {
    if (!name.trim()) { setError('Please enter your name first!'); return; }
    setLoading(true); setError('Searching for an active studio...');
    socket?.emit('quick_join', { playerName: name });
  };

  const handleJoinWithCode = async () => {
    if (!name.trim()) { setError('Please enter your name first!'); return; }
    if (!code.trim() || code.length < 6) { setError('Please enter a valid 6-character code.'); return; }
    setLoading(true); setError('');
    try {
      const resp = await axios.get(`${API_URL}/api/rooms/${code}/join`);
      if (resp.data.canJoin) {
        joinRoom(name, code.toUpperCase());
        navigate(`/room/${code.toUpperCase()}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.reason || 'Room not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-screen bg-mesh-pro flex flex-col font-sans relative overflow-hidden selection:bg-brand-primary/30">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[10%] left-[5%] text-4xl lg:text-7xl opacity-[0.03] pointer-events-none animate-float select-none">✏️</div>
      <div className="absolute bottom-[10%] right-[10%] text-4xl lg:text-7xl opacity-[0.03] pointer-events-none animate-float-delayed select-none">🎨</div>

      {/* Internal Animation Engine */}
      <SketchBackground />

      <main className="flex-grow flex flex-col items-center justify-center p-2 md:p-6 lg:p-8 z-10 w-full h-full relative">
        
        {/* Cinematic Particles Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/20 blur-[120px] animate-pulse-delayed" />
        </div>

        <div className="w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 md:gap-6 lg:gap-8 relative">
            
            {/* ── LOGO SECTION ── */}
            <header className="flex flex-col items-center text-center space-y-1 md:space-y-3 animate-pop-in">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                   <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                   <span className="text-[7px] md:text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Multiplayer Drawing Arena</span>
                </div>
                <h1 className="logo-responsive font-black italic tracking-tighter text-white leading-[0.8] drop-shadow-2xl">
                  SKRIBBL<span className="text-brand-primary">.</span>IO
                </h1>
                <p className="text-slate-500 font-bold text-[9px] md:text-sm lg:text-base max-w-md mx-auto leading-tight">
                  Fast-paced, high-def multiplayer pictionary.
                </p>
            </header>

            {/* ── CENTRAL CONTROL PANEL ── */}
            <div className="w-full max-w-lg glass-pro rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 animate-slide-up relative overflow-hidden flex flex-col gap-4 md:gap-6">
                
                {/* Branding Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-30" />

                <div className="space-y-4 md:space-y-6">
                  {/* Step 1: Alias */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 md:w-7 md:h-7 rounded-lg md:rounded-xl bg-brand-primary flex items-center justify-center text-white font-black text-[9px] md:text-xs shadow-lg shadow-brand-primary/20 italic">01</span>
                        <h3 className="text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">Your Alias</h3>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Picasso"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 outline-none focus:ring-2 focus:ring-brand-primary transition-all font-black text-lg md:text-2xl text-brand-primary placeholder:text-slate-800"
                      maxLength={16}
                      autoFocus
                    />
                  </div>

                  {/* Step 2: Deployment */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 md:w-7 md:h-7 rounded-lg md:rounded-xl bg-brand-secondary flex items-center justify-center text-bg-main font-black text-[9px] md:text-xs shadow-lg shadow-brand-secondary/20 italic">02</span>
                        <h3 className="text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">Choose Arena</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleQuickJoin}
                            disabled={loading && !error.includes('Searching')}
                            className={`group relative overflow-hidden py-3 md:py-5 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs tracking-[0.2em] transition-all flex flex-col items-center gap-1 shadow-tactile-heavy ${name ? 'bg-brand-primary text-white hover:scale-[1.02] active:scale-95' : 'bg-white/5 text-slate-700 pointer-events-none opacity-50'}`}
                        >
                            <span className="text-lg md:text-xl group-hover:rotate-12 transition-transform">🌍</span>
                            {loading && error.includes('Searching') ? '...' : 'QUICK START'}
                            {loading && error.includes('Searching') && <span className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />}
                        </button>

                        <button 
                            onClick={() => { if (!name) return setError('Enter name first!'); setIsModalOpen(true); }}
                            className={`group py-3 md:py-5 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs tracking-[0.2em] transition-all flex flex-col items-center gap-1 shadow-tactile ${name ? 'bg-bg-card border border-white/10 text-white hover:bg-white/5 hover:scale-[1.02] active:scale-95' : 'bg-white/5 text-slate-700 pointer-events-none opacity-50'}`}
                        >
                            <span className="text-lg md:text-xl group-hover:-rotate-12 transition-transform">🛡️</span>
                            NEW STUDIO
                        </button>
                    </div>

                    <div className="pt-3 md:pt-5 border-t border-white/5 flex gap-2">
                        <input 
                            type="text" 
                            placeholder="INVITE CODE" 
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="flex-grow bg-black/40 border border-white/10 rounded-lg px-4 py-2 md:py-3 outline-none focus:ring-1 focus:ring-brand-primary text-brand-primary font-black tracking-[0.2em] text-[10px] md:text-xs uppercase"
                            maxLength={6}
                        />
                        <button 
                            onClick={handleJoinWithCode}
                            className={`px-4 md:px-6 rounded-lg font-black text-[10px] tracking-widest transition-all ${code.length === 6 ? 'bg-brand-secondary text-bg-main shadow-lg shadow-brand-secondary/20 hover:scale-105' : 'bg-white/5 text-slate-700 pointer-events-none'}`}
                            disabled={loading || code.length < 6}
                        >
                            JOIN
                        </button>
                    </div>
                  </div>

                  {error && (
                    <div className={`p-2 md:p-3 rounded-lg text-center shadow-inner ${error.includes('...') ? 'bg-brand-primary/10 text-brand-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">{error}</span>
                    </div>
                  )}
                </div>
            </div>

            {/* ── FOOTER STATS ── */}
            <div className="hidden md:flex gap-8 text-center opacity-30">
                <div className="space-y-0.5">
                    <span className="block text-lg font-black text-white italic tracking-tighter leading-none border-b border-brand-primary">0.1s</span>
                    <span className="block text-[7px] font-black text-slate-600 uppercase tracking-widest">Network</span>
                </div>
                <div className="space-y-0.5">
                    <span className="block text-lg font-black text-white italic tracking-tighter leading-none border-b border-brand-secondary">60FPS</span>
                    <span className="block text-[7px] font-black text-slate-600 uppercase tracking-widest">Global</span>
                </div>
                <div className="space-y-0.5">
                    <span className="block text-lg font-black text-white italic tracking-tighter leading-none border-b border-brand-highlight">SECURE</span>
                    <span className="block text-[7px] font-black text-slate-600 uppercase tracking-widest">Studios</span>
                </div>
            </div>
        </div>
      </main>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
        loading={loading}
      />
    </div>
  );
};

export default Home;
