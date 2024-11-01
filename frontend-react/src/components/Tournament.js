import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Tournament.css';
import PlayerRegistration from './PlayerRegistration';
import MatchDisplay from './MatchDisplay';
import ScoreTracker from './ScoreTracker';
import MatchQueue from './MatchQueue';
import { useTranslate } from './Translate/useTranslate';
import { useLanguage } from './Translate/LanguageContext';
import NextMatch from './NextMatch';

function Tournament() {
  const [players, setPlayers] = useState([]);
  const [currentMatchKey, setCurrentMatchKey] = useState(null);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [matchQueue, setMatchQueue] = useState([]);
  const [scores, setScores] = useState({});
  const [errorKey, setErrorKey] = useState('');

  const { translate } = useTranslate();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Load data from sessionStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedPlayers = JSON.parse(sessionStorage.getItem("players")) || [];
        const storedScores = JSON.parse(sessionStorage.getItem("scores")) || {};
        const storedQueue = JSON.parse(sessionStorage.getItem("matchQueue")) || [];
        const storedMatchKey = sessionStorage.getItem("currentMatchKey");
        const tournamentStarted = JSON.parse(sessionStorage.getItem("isTournamentStarted"));

        setPlayers(storedPlayers);
        setScores(storedScores);
        setMatchQueue(storedQueue);
        setCurrentMatchKey(storedMatchKey || null);
        setIsTournamentStarted(tournamentStarted || false);
      } catch (error) {
        console.error("Error loading stored data:", error);
        handleCancelTournament();
      }
    };

    loadStoredData();
  }, []);

  // Save data to sessionStorage whenever relevant state changes
  useEffect(() => {
    const saveToStorage = () => {
      try {
        sessionStorage.setItem("players", JSON.stringify(players));
        sessionStorage.setItem("scores", JSON.stringify(scores));
        sessionStorage.setItem("matchQueue", JSON.stringify(matchQueue));
        sessionStorage.setItem("currentMatchKey", currentMatchKey);
        sessionStorage.setItem("isTournamentStarted", JSON.stringify(isTournamentStarted));
      } catch (error) {
        console.error("Error saving to storage:", error);
      }
    };

    saveToStorage();
  }, [players, scores, matchQueue, currentMatchKey, isTournamentStarted]);

  // Handle game completion and winner updates
  useEffect(() => {
    const handleGameCompletion = () => {
      if (location.state?.winner) {
        updateScore(location.state.winner);
        handleNextMatch();
        // Clear the location state to prevent duplicate updates
        window.history.replaceState({}, document.title);
      }
    };

    handleGameCompletion();
  }, [location.state]);

  const addPlayer = (alias) => {
    setPlayers(prev => {
      const updatedPlayers = [...prev, alias];
      const updatedScores = { ...scores, [alias]: 0 };
      setScores(updatedScores);
      return updatedPlayers;
    });
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

  const startTournament = () => {
    if (players.length === 4) {
      const generatedQueue = generateMatches();
      setMatchQueue(generatedQueue);
      setCurrentMatchKey(generatedQueue[0] || 'No more matches scheduled');
      setIsTournamentStarted(true);
      setErrorKey('');
    } else {
      setErrorKey('Exactly four players are required to start the tournament.');
    }
  };

  const handlePlayGame = () => {
    if (currentMatchKey && currentMatchKey !== 'No more matches scheduled') {
      const [player1, player2] = currentMatchKey.split(' vs ');
      navigate('/tournament-game', { state: { player1, player2 } });
    }
  };

  const handleNextMatch = () => {
    setMatchQueue(prevQueue => {
      const nextQueue = prevQueue.slice(1);
      const nextMatch = nextQueue.length > 0 ? nextQueue[0] : 'No more matches scheduled';
      setCurrentMatchKey(nextMatch);
      return nextQueue;
    });
  };

  useEffect(() => {
    if (isTournamentStarted && matchQueue.length === 0 && players.length > 0 && Object.keys(scores).length > 0) {
      // Navigate to WinTable with the latest players and scores
      navigate('/win-table', { state: { players, scores } });
    }
  }, [isTournamentStarted, matchQueue, players, scores, navigate]);



  const updateScore = (winner) => {
    setScores(prevScores => ({
      ...prevScores,
      [winner]: (prevScores[winner] || 0) + 1
    }));
  };

  const handleCancelTournament = () => {
    setPlayers([]);
    setScores({});
    setMatchQueue([]);
    setCurrentMatchKey(null);
    setIsTournamentStarted(false);
    sessionStorage.clear();
  };

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
            <NextMatch
              onPlayGame={handlePlayGame}
              onNextMatch={handleNextMatch}
              currentMatch={currentMatchMessage}
            />
            <button className="cancel-button" onClick={handleCancelTournament}>
              {translate("Cancel Tournament")}
            </button>
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
