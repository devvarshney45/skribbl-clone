// App.tsx
// Root component that handles application routing.
// Connects the Home, Lobby, and Game pages.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGame } from './context/GameContext';
import Home from './pages/Home';
import Room from './pages/Room';
import Game from './pages/Game';

const App: React.FC = () => {
  const { phase, loading } = useGame();

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
          Restoring Studio Session...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Dynamic routing for joining via invite link */}
        <Route path="/join" element={<Home />} />

        {/* Lobby / Room Page */}
        <Route 
          path="/room/:code" 
          element={
            phase === 'waiting' ? (
              <Room />
            ) : phase === 'choosing' || phase === 'drawing' || phase === 'roundEnd' || phase === 'gameOver' ? (
              <Game />
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
