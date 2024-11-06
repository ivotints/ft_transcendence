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

  const handle2vs2Click = () => {
    navigate('/game/2-vs-2');
  };

  const handleCowboyClick = () => {
    navigate('/game/cowboy');
  };

  return (
    <div className="game-container">
      <h1 className="profileH2">{translate('Select Match Type')}</h1>
      <div className="button-group">
        <button className="submit-button" onClick={handlePvPClick}>{translate('Player vs Player')}</button>
        <button className="submit-button" onClick={handlePvAIClick}>{translate('Player vs AI')}</button>
        <button className="submit-button" onClick={handle2vs2Click}>{translate('2 Players vs 2 Players')}</button>
        <button className="submit-button" onClick={handleCowboyClick}>{translate('Cowboy Game')}</button>
      </div>
    </div>
  );
}

export default Game;

