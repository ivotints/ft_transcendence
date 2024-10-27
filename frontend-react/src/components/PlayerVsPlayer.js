// PlayerVsPlayer.js
import React, { useState } from 'react';
import PongGame from './PongGame';
import './PlayerVsPlayer.css';

function PlayerVsPlayer() {
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="match-container">
      <h1>Player vs Player Ping-Pong</h1>
      {!gameStarted ? (
        <div className="menu">
          <p>Welcome to Player vs Player Ping-Pong!</p>
          <button onClick={startGame} className="start-button">Start Game</button>
        </div>
      ) : (
        <div>
          <PongGame />
          <button onClick={resetGame} className="reset-button">Reset Game</button>
        </div>
      )}
    </div>
  );
}

export default PlayerVsPlayer;
