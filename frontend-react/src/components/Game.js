import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';

function Game() {
  const navigate = useNavigate();

  const handlePvPClick = () => {
    navigate('/game/player-vs-player');
  };

  const handlePvAIClick = () => {
    navigate('/game/player-vs-ai');
  };

  return (
    <div className="game-container">
      <h1 className="profileH2">Select Match Type</h1>
      <div className="button-group">
        <button className="submit-button" onClick={handlePvPClick}>Player vs Player</button>
        <button className="submit-button" onClick={handlePvAIClick}>Player vs AI</button>
      </div>
    </div>
  );
}

export default Game;

