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
  const { roomCode, phase } = useGame();

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
