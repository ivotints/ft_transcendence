// PlayerVsAI.js
import React, { useState } from 'react';
import PongGameWithAI from './PongGameWithAI';
import './PlayerVsAI.css';

function PlayerVsAI() {
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="match-container">
      <h1 className="profileH2">Player vs AI Ping-Pong</h1>
      {!gameStarted ? (
        <div className="menu">
          <p>Challenge the AI to a game of Ping-Pong!</p>
          <button onClick={startGame} className="start-button">Start Game</button>
        </div>
      ) : (
        <div>
          <PongGameWithAI />
          <button onClick={resetGame} className="reset-button">Reset Game</button>
        </div>
      )}
    </div>
  );
}

export default PlayerVsAI;
