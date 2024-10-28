// PlayerVsAI.js
import React, { useState } from 'react';
import PongGameWithAI from './PongGameWithAI';
import './PlayerVsAI.css';
import { useTranslate } from './Translate/useTranslate';

function PlayerVsAI() {
  const [gameStarted, setGameStarted] = useState(false);
  const { translate } = useTranslate();

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="match-container">
      <h1 className="profileH2">{translate('Player vs AI Ping-Pong')}</h1>
      {!gameStarted ? (
        <div className="menu">
          <p>{translate('Challenge the AI to a game of Ping-Pong!')}</p>
          <button onClick={startGame} className="start-button">{translate('Start Game')}</button>
        </div>
      ) : (
        <div>
          <PongGameWithAI />
          <button onClick={resetGame} className="reset-button">{translate('Reset Game')}</button>
        </div>
      )}
    </div>
  );
}

export default PlayerVsAI;
