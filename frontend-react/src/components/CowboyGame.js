import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CowboyGame.css';
import { useTranslate } from './Translate/useTranslate';

function CowboyGame({ player1, player2Name }) {
  const { translate } = useTranslate();
  const [gamePhase, setGamePhase] = useState('ready'); // 'ready', 'steady', 'bang', 'finished'
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [gameStartTime, setGameStartTime] = useState(null);
  const [player1Score, setPlayer1Score] = useState(0); // Score for Player 1
  const [player2Score, setPlayer2Score] = useState(0); // Score for Player 2
  const maxScore = 5;
  const timeouts = [];

  useEffect(() => {
    if (gamePhase === 'ready' && !winner) {
      setMessage('Ready...');
      const timeoutId1 = setTimeout(() => setGamePhase('steady'), 1000);
      timeouts.push(timeoutId1);
    } else if (gamePhase === 'steady' && !winner) {
      setMessage('Steady...');
      const randomTime = Math.floor(Math.random() * 3000) + 2000;
      const timeoutId2 = setTimeout(() => {
        if (!winner) {
          setGamePhase('bang');
          setGameStartTime(Date.now());
        }
      }, randomTime);
      timeouts.push(timeoutId2);
    } else if (gamePhase === 'bang' && !winner) {
      setMessage('Bang!');
    } else if (gamePhase === 'finished') {
      setMessage('Game Over');
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [gamePhase]);

  const handleKeyPress = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      // Reset the game on Space or Enter press if the game is finished
      if (gamePhase === 'finished') resetGame();
      return;
    }

    if (event.key !== 'w' && event.key !== 'ArrowUp') {
      return;
    }

    // Check for misclick if the game is not in "bang" phase
    if (gamePhase === 'ready' || gamePhase === 'steady') {
      if (!winner) {
        if (event.key === 'w') {
          // Player 1 misclicks, Player 2 wins
          setWinner({ name: player2Name, reason: 'won by opponent misclick' });
          setPlayer2Score((prevScore) => Math.min(prevScore + 1, maxScore));
        } else if (event.key === 'ArrowUp') {
          // Player 2 misclicks, Player 1 wins
          setWinner({ name: player1.username, reason: 'won by opponent misclick' });
          setPlayer1Score((prevScore) => Math.min(prevScore + 1, maxScore));
        }
        setGamePhase('finished');
      }
    } else if (gamePhase === 'bang' && !winner) {
      // Check for reaction time after "Bang!"
      const reactionTime = Date.now() - gameStartTime;
      if (event.key === 'w') {
        setWinner({ name: player1.username, reactionTime });
        setPlayer1Score((prevScore) => Math.min(prevScore + 1, maxScore));
      } else if (event.key === 'ArrowUp') {
        setWinner({ name: player2Name, reactionTime });
        setPlayer2Score((prevScore) => Math.min(prevScore + 1, maxScore));
      }
      setGamePhase('finished');
    }
  };

  useEffect(() => {
    if (player1Score === maxScore || player2Score === maxScore) {
      sendResults();}
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gamePhase, gameStartTime]);


  const sendResults = () => {
    const matchData = {
      player1: player1.id,
      player2: player2Name,
      match_score: `${player1Score}-${player2Score}`,
    };

    axios.post('/api/matches/cowboy/', matchData, { withCredentials: true })
      .then(response => {
        console.log('Match data sent successfully:', response.data);
      })
      .catch(error => {
        console.error('Error sending match data:', error);
      });
  };

  const resetGame = () => {
    if (player1Score === maxScore || player2Score === maxScore) {
      sendResults();
      setPlayer1Score(0);
      setPlayer2Score(0);
    }
    setGamePhase('ready');
    setWinner(null);
    setMessage('');
    setGameStartTime(null);
  };

  return (
    <div className="game-container">


      <div className="scoreboard">
        <div className="score player1-score">
          <span className="score-label">{player1.username}</span>
          <span className="score-value">{player1Score}</span>
        </div>
        <div className="score player2-score">
          <span className="score-label">{player2Name}</span>
          <span className="score-value">{player2Score}</span>
        </div>
      </div>


      <div className="players">
        <div className={`player player1 ${gamePhase === 'steady' ? 'steady' : ''} ${gamePhase === 'bang' && !winner ? 'shoot' : ''}`}>
          <img
            src="https://thumbs.dreamstime.com/b/old-man-cowboy-thick-mustache-carrying-gun-vector-illustration-art-doodle-icon-image-kawaii-228493204.jpg"
            alt="Player 1 Cowboy"
            className="cowboy-image"
          />
          <h3>{player1.username}</h3>
        </div>
        <div className={`player player2 ${gamePhase === 'steady' ? 'steady' : ''} ${gamePhase === 'bang' && !winner ? 'shoot' : ''}`}>
          <img
            src="https://thumbs.dreamstime.com/b/old-man-cowboy-thick-mustache-carrying-gun-vector-illustration-art-doodle-icon-image-kawaii-228493204.jpg"
            alt="Player 2 Cowboy"
            className="cowboy-image"
          />
          <h3>{player2Name}</h3>
        </div>
      </div>


      <h2 className={`message ${gamePhase}`}>{translate(message)}</h2>
      {winner && (
        <div className="result">
          {winner.reason === 'won by opponent misclick' ? (
            <h3>{`${winner.name} ${translate("wins this round due to opponent's misclick!")}`}</h3>
          ) : (
            <>
              <h3>{`${winner.name} ${translate("wins this round!")}`}</h3>
              <p>{translate("Reaction Time")}: {winner.reactionTime} {translate("ms")}</p>
            </>
          )}
          {(player1Score === maxScore || player2Score === maxScore) && (
            <h3>{`${player1Score === maxScore ? player1.username : player2Name} ${translate("wins the match!")}`}</h3>


          )}
          <p>{translate('Press "Enter" or "Space" to play again')}</p>
        </div>
      )}
    </div>
  );
}

export default CowboyGame;
