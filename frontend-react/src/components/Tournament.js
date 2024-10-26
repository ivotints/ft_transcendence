import React, { useState } from 'react';
import './Tournament.css';
import PlayerRegistration from './PlayerRegistration';
import MatchDisplay from './MatchDisplay';
import NextMatch from './NextMatch';
import ScoreTracker from './ScoreTracker';
import MatchQueue from './MatchQueue';
import { useTranslate } from './Translate/useTranslate';
import { useLanguage } from './Translate/LanguageContext';

function Tournament() {
  const [players, setPlayers] = useState([]);
  const [currentMatchKey, setCurrentMatchKey] = useState(null);  // Store current match key
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [matchQueue, setMatchQueue] = useState([]);
  const [scores, setScores] = useState({});
  const [errorKey, setErrorKey] = useState('');

  const { translate } = useTranslate();
  const { language } = useLanguage();  // To trigger re-render on language change

  const addPlayer = (alias) => {
    setPlayers([...players, alias]);
    setScores((prevScores) => ({
      ...prevScores,
      [alias]: 0
    }));
  };

  const startTournament = () => {
    if (players.length > 1) {
      setIsTournamentStarted(true);
      const generatedQueue = generateMatches();
      setMatchQueue(generatedQueue);
      setCurrentMatchKey(generatedQueue[0] || 'No more matches scheduled');  // Set initial match or key
      setErrorKey('');
    } else {
      setErrorKey('At least two players are required to start the tournament.');
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
    setCurrentMatchKey(nextQueue[0] || 'No more matches scheduled.');  // Update match or fallback key
  };

  const updateScore = (winner) => {
    setScores((prevScores) => ({
      ...prevScores,
      [winner]: prevScores[winner] + 1
    }));
  };

  // Derived variables that translate error and match messages
  const errorMessage = errorKey ? translate(errorKey) : '';
  const currentMatchMessage = currentMatchKey ? translate(currentMatchKey) : '';

  return (
    <div className="tournament-container">
      <h1 className="profileH2">{translate("Tournament")}</h1>
      {!isTournamentStarted ? (
        <>
          <PlayerRegistration addPlayer={addPlayer} players={players} />
          <button className="start-button" onClick={startTournament}>
            {translate("Start Tournament")}
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </>
      ) : (
        <div className="tournament-content">
          <div className="left-column">
            <MatchDisplay match={currentMatchMessage} />
            <NextMatch currentMatch={currentMatchMessage} onNextMatch={handleNextMatch} />
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
