import React, { useState, useEffect } from 'react';
import './CowboyGame.css';

function CowboyGame({ player1, player2Name }) {
  const [gamePhase, setGamePhase] = useState('ready'); // 'ready', 'steady', 'bang', 'finished'
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [gameStartTime, setGameStartTime] = useState(null);

  useEffect(() => {
    if (gamePhase === 'ready') {
      setMessage('Ready...');
      setTimeout(() => setGamePhase('steady'), 1000);
    } else if (gamePhase === 'steady') {
      setMessage('Steady...');
      const randomTime = Math.floor(Math.random() * 3000) + 2000; // random time between 2-5 seconds
      setTimeout(() => {
        setGamePhase('bang');
        setGameStartTime(Date.now());
      }, randomTime);
    } else if (gamePhase === 'bang') {
      setMessage('Bang!');
    }
  }, [gamePhase]);

  const handleKeyPress = (event) => {
    if (gamePhase === 'ready' || gamePhase === 'steady') {
      // Penalize for pressing too early
      if (!winner) {
        if (event.key === 'a') {
          setWinner({ name: player2Name, reason: 'pressed too soon' });
        } else if (event.key === 'l') {
          setWinner({ name: player1.username, reason: 'pressed too soon' });
        }
        setGamePhase('finished');
      }
    } else if (gamePhase === 'bang' && !winner) {
      // Check for reaction time after "Bang!"
      const reactionTime = Date.now() - gameStartTime;
      if (event.key === 'a') {
        setWinner({ name: player1.username, reactionTime });
      } else if (event.key === 'l') {
        setWinner({ name: player2Name, reactionTime });
      }
      setGamePhase('finished');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gamePhase, gameStartTime]);

  const resetGame = () => {
    setGamePhase('ready');
    setWinner(null);
    setMessage('');
    setGameStartTime(null);
  };

  return (
    <div className="game-container">
      <div className="players">
        <div className={`player player1 ${gamePhase === 'bang' && !winner ? 'shoot' : ''}`}>
          <img
            src="https://thumbs.dreamstime.com/b/old-man-cowboy-thick-mustache-carrying-gun-vector-illustration-art-doodle-icon-image-kawaii-228493204.jpg"
            alt="Player 1 Cowboy"
            className="cowboy-image"
          />
          <h3>{player1.username}</h3>
        </div>
        <div className={`player player2 ${gamePhase === 'bang' && !winner ? 'shoot' : ''}`}>
          <img
            src="https://thumbs.dreamstime.com/b/old-man-cowboy-thick-mustache-carrying-gun-vector-illustration-art-doodle-icon-image-kawaii-228493204.jpg"
            alt="Player 2 Cowboy"
            className="cowboy-image"
          />
          <h3>{player2Name}</h3>
        </div>
      </div>
      <h2 className={`message ${gamePhase}`}>{message}</h2>
      {gamePhase === 'finished' && winner && (
        <div className="result">
          {winner.reason ? (
            <h3>{`${winner.name} loses for pressing too soon!`}</h3>
          ) : (
            <>
              <h3>{`${winner.name} wins!`}</h3>
              <p>Reaction Time: {winner.reactionTime} ms</p>
            </>
          )}
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default CowboyGame;
