import React, { useState } from 'react';
import './Tournament.css';
import PlayerRegistration from './PlayerRegistration';
import MatchDisplay from './MatchDisplay';
import NextMatch from './NextMatch';
import ScoreTracker from './ScoreTracker';
import MatchQueue from './MatchQueue'; // Importing the MatchQueue component

function Tournament() {
  const [players, setPlayers] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [matchQueue, setMatchQueue] = useState([]);
  const [scores, setScores] = useState({});
  const [error, setError] = useState('');

  const addPlayer = (alias) => {
    setPlayers([...players, alias]);
    setScores((prevScores) => ({
      ...prevScores,
      [alias]: 0 // Set initial score to 0 for each player
    }));
  };

  const startTournament = () => {
    if (players.length > 1) {
      setIsTournamentStarted(true);
      const generatedQueue = generateMatches();
      setMatchQueue(generatedQueue);
      setCurrentMatch(generatedQueue[0]);
      setError('');
    } else {
      setError('At least two players are required to start the tournament.');
    }
  };

  const generateMatches = () => {
    const queue = [];
    for (let i = 0; i < players.length - 1; i++) {
      for (let j = i + 1; j < players.length; j++) {
        queue.push(`${players[i]} vs ${players[j]}`);
      }
    }
    return queue;
  };

  const handleNextMatch = () => {
    const nextQueue = matchQueue.slice(1);
    setMatchQueue(nextQueue);
    setCurrentMatch(nextQueue[0] || 'No more matches scheduled.');
  };

  const updateScore = (winner) => {
    setScores((prevScores) => ({
      ...prevScores,
      [winner]: prevScores[winner] + 1 // Increment winner's score
    }));
  };

  return (
    <div className="tournament-container">
      <h1 className="profileH2">Tournament</h1>
      {!isTournamentStarted ? (
        <>
          <PlayerRegistration addPlayer={addPlayer} players={players} />
          <button className="start-button" onClick={startTournament}>
            Start Tournament
          </button>
          {error && <p className="error-message">{error}</p>}
        </>
      ) : (
        <div className="tournament-content">
          <div className="left-column">
            <MatchDisplay match={currentMatch} />
            <NextMatch currentMatch={currentMatch} onNextMatch={handleNextMatch} />
            <ScoreTracker scores={scores} />
          </div>
          <div className="right-column">
            <MatchQueue matchQueue={matchQueue} />
          </div>
        </div>
      )}
    </div>
  );  
}

export default Tournament;
