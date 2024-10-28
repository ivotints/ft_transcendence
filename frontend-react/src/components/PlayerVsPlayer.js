import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PongGame from './PongGame';
import './PlayerVsPlayer.css';

function PlayerVsPlayer() {
  const [gameStarted, setGameStarted] = useState(false);
  const [player2Name, setPlayer2Name] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('https://localhost:8000/profiles/me/', { withCredentials: true });
      const profile = response.data;
      setPlayer1Name(profile.user.username); // Set player1Name from profile
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile(); // Call the function on component mount
  }, []);

  const handleNameChange = (e) => {
    setPlayer2Name(e.target.value);
  };

  const confirmName = () => {
    if (player2Name.trim()) {
      setIsNameConfirmed(true);
    }
  };

  const startGame = () => {
    if (isNameConfirmed) {
      setGameStarted(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayer2Name('');
    setIsNameConfirmed(false);
  };

  return (
    <div className="match-container">
      <h1 className="profileH2">Player vs Player Ping-Pong</h1>
      {!gameStarted ? (
        <div className="menu">
          <p>Provide Player 2 name and press Start to play!</p>
          {!isNameConfirmed ? (
            <div>
              <input
                type="text"
                placeholder="Player 2 Name"
                value={player2Name}
                onChange={handleNameChange}
                className="name-input"
              />
              <button onClick={confirmName} className="confirm-button">Confirm</button>
            </div>
          ) : (
            <button onClick={startGame} className="start-button">Start Game</button>
          )}
        </div>
      ) : (
        <div>
          <PongGame player1Name={player1Name} player2Name={player2Name} />
          <button onClick={resetGame} className="reset-button">Reset Game</button>
        </div>
      )}
    </div>
  );
}

export default PlayerVsPlayer;