import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';
import { useTranslate } from './Translate/useTranslate';

function Game() {
  const navigate = useNavigate();
  const { translate } = useTranslate();  // Get the translation function


  const handlePvPClick = () => {
    navigate('/game/player-vs-player');
  };

  const handlePvAIClick = () => {
    navigate('/game/player-vs-ai');
  };

  return (
    <div className="game-container">
      <h1 className="profileH2">{translate('Select Match Type')}</h1>
      <div className="button-group">
        <button className="submit-button" onClick={handlePvPClick}>{translate('Player vs Player')}</button>
        <button className="submit-button" onClick={handlePvAIClick}>{translate('Player vs AI')}</button>
      </div>
    </div>
  );
}

export default Game;

