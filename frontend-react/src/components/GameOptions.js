import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameOptions.css'; // You'll add some styles here

function GameOptions() {
  const navigate = useNavigate();

  return (
    <div className="game-options-container">
      <button onClick={() => navigate('/game/player-vs-player')} className="game-option-button">
        Player vs Player
      </button>
      <button onClick={() => navigate('/game/player-vs-ai')} className="game-option-button">
        Player vs AI
      </button>
      <button onClick={() => navigate('/tournament')} className="game-option-button">
        Tournament
      </button>
    </div>
  );
}

export default GameOptions;