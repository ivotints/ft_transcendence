import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameOptions.css'; // You'll add some styles here
import { useTranslate } from './Translate/useTranslate';

function GameOptions() {
  const navigate = useNavigate();
  const { translate } = useTranslate();  // Get the translation function


  return (
    <div className="game-options-container">
      <button onClick={() => navigate('/game/player-vs-player')} className="game-option-button">
      {translate('Player vs Player')}
      </button>
      <button onClick={() => navigate('/game/player-vs-ai')} className="game-option-button">
      {translate('Player vs AI')}
      </button>
      <button onClick={() => navigate('/tournament')} className="game-option-button">
      {translate('Tournament')}
      </button>
    </div>
  );
}

export default GameOptions;
