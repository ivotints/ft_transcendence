import { playerRegistration } from './playerRegistration.js';
import { matchDisplay } from './matchDisplay.js';
import { nextMatch } from './nextMatch.js';
import { scoreTracker } from './scoreTracker.js';
import { matchQueue } from './matchQueue.js';

export async function tournamentPage() {
  const tournamentContainer = document.createElement('div');
  tournamentContainer.className = 'tournament-container';

  const title = document.createElement('h1');
  title.className = 'profileH2';
  title.textContent = 'Tournament';
  tournamentContainer.appendChild(title);

  const startButton = document.createElement('button');
  startButton.className = 'start-button';
  startButton.textContent = 'Start Tournament';
  tournamentContainer.appendChild(startButton);

  const errorMessage = document.createElement('p');
  errorMessage.className = 'error-message';
  tournamentContainer.appendChild(errorMessage);

  let players = [];
  let currentMatchKey = null;
  let isTournamentStarted = false;
  let matchQueueData = [];
  let scores = {};

  const loadStoredData = () => {
    try {
      players = JSON.parse(sessionStorage.getItem('players')) || [];
      scores = JSON.parse(sessionStorage.getItem('scores')) || {};
      matchQueueData = JSON.parse(sessionStorage.getItem('matchQueue')) || [];
      currentMatchKey = sessionStorage.getItem('currentMatchKey');
      isTournamentStarted = JSON.parse(sessionStorage.getItem('isTournamentStarted')) || false;
    } catch (error) {
      console.error('Error loading stored data:', error);
      handleCancelTournament();
    }
  };

  const saveToStorage = () => {
    try {
      sessionStorage.setItem('players', JSON.stringify(players));
      sessionStorage.setItem('scores', JSON.stringify(scores));
      sessionStorage.setItem('matchQueue', JSON.stringify(matchQueueData));
      sessionStorage.setItem('currentMatchKey', currentMatchKey);
      sessionStorage.setItem('isTournamentStarted', JSON.stringify(isTournamentStarted));
    } catch (error) {
      console.error('Error saving to storage:', error);
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

  const startTournament = () => {
    if (players.length === 4) {
      matchQueueData = generateMatches();
      currentMatchKey = matchQueueData[0] || 'No more matches scheduled';
      isTournamentStarted = true;
      errorMessage.textContent = '';
      saveToStorage();
      renderTournamentComponents();
    } else {
      errorMessage.textContent = 'Exactly four players are required to start the tournament.';
    }
  };

  const handlePlayGame = () => {
    if (currentMatchKey && currentMatchKey !== 'No more matches scheduled') {
      const [player1, player2] = currentMatchKey.split(' vs ');
      // Simulate game logic here
      const winner = Math.random() > 0.5 ? player1 : player2;
      updateScore(winner);
      handleNextMatch();
    }
  };

  const handleNextMatch = () => {
    matchQueueData.shift();
    currentMatchKey = matchQueueData.length > 0 ? matchQueueData[0] : 'No more matches scheduled';
    saveToStorage();
    renderTournamentComponents();
  };

  const updateScore = (winner) => {
    scores[winner] = (scores[winner] || 0) + 1;
    saveToStorage();
  };

  const handleCancelTournament = () => {
    players = [];
    scores = {};
    matchQueueData = [];
    currentMatchKey = null;
    isTournamentStarted = false;
    sessionStorage.clear();
    renderTournamentComponents();
  };

  const addPlayer = (player) => {
    players.push(player);
    saveToStorage();
    renderPlayerRegistration();
  };

  const renderPlayerRegistration = () => {
    const existingRegistration = tournamentContainer.querySelector('.player-registration');
    if (existingRegistration) {
      tournamentContainer.replaceChild(playerRegistration(addPlayer, players), existingRegistration);
    } else {
      tournamentContainer.appendChild(playerRegistration(addPlayer, players));
    }
  };

  const renderTournamentComponents = () => {
    const existingContent = tournamentContainer.querySelector('.tournament-content');
    if (existingContent) {
      tournamentContainer.removeChild(existingContent);
    }

    if (isTournamentStarted) {
      const tournamentContent = document.createElement('div');
      tournamentContent.className = 'tournament-content';

      const leftColumn = document.createElement('div');
      leftColumn.className = 'left-column';

      leftColumn.appendChild(matchDisplay(currentMatchKey));
      leftColumn.appendChild(nextMatch(handlePlayGame));
      leftColumn.appendChild(scoreTracker(scores));

      const cancelButton = document.createElement('button');
      cancelButton.className = 'cancel-button';
      cancelButton.textContent = 'Cancel Tournament';
      cancelButton.addEventListener('click', handleCancelTournament);
      leftColumn.appendChild(cancelButton);

      const rightColumn = document.createElement('div');
      rightColumn.className = 'right-column';
      rightColumn.appendChild(matchQueue(matchQueueData));

      tournamentContent.appendChild(leftColumn);
      tournamentContent.appendChild(rightColumn);
      tournamentContainer.appendChild(tournamentContent);
    } else {
      renderPlayerRegistration();
    }
  };

  startButton.addEventListener('click', startTournament);

  loadStoredData();
  renderTournamentComponents();
  return tournamentContainer;
}
