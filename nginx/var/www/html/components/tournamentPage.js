// tournamentPage.js
import { checkLoginStatus } from './utils/state.js';
import { PongGame } from './PongGame.js';

export async function tournamentPage() {
    if (!checkLoginStatus()) {
        window.navigateTo('/');
        return document.createElement('div');
    }

    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container';

    // State management
    let players = [];
    let matches = [];
    let matchQueue = [];
    let currentMatchIndex = 0;
    let scores = {};
    let tournamentStarted = false;

    // Create components
    function createMatchQueue() {
        const queueContainer = document.createElement('div');
        queueContainer.className = 'match-queue';

        const title = document.createElement('h2');
        title.textContent = 'Upcoming Matches';
        queueContainer.appendChild(title);

        const list = document.createElement('ul');
        matchQueue.forEach(match => {
            const li = document.createElement('li');
            li.textContent = match;
            list.appendChild(li);
        });
        queueContainer.appendChild(list);

        return queueContainer;
    }

    function createScoreTracker() {
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-tracker';

        const title = document.createElement('h2');
        title.textContent = 'Scores';
        scoreContainer.appendChild(title);

        const list = document.createElement('ul');
        Object.entries(scores).forEach(([player, score]) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${player}</span><span class="points">${score} points</span>`;
            list.appendChild(li);
        });
        scoreContainer.appendChild(list);

        return scoreContainer;
    }

    function createMatchDisplay(currentMatch) {
        const displayContainer = document.createElement('div');
        displayContainer.className = 'match-display';

        const title = document.createElement('h2');
        title.textContent = 'Current Match';
        displayContainer.appendChild(title);

        const matchText = document.createElement('p');
        matchText.textContent = currentMatch || 'No matches yet.';
        displayContainer.appendChild(matchText);

        // Update match counter to use currentMatchIndex
        const matchCounter = document.createElement('p');
        matchCounter.className = 'match-counter';
        matchCounter.textContent = `Match ${currentMatchIndex + 1} of ${matchQueue.length}`;
        displayContainer.appendChild(matchCounter);

        return displayContainer;
    }

    function createPlayerRegistration() {
        const container = document.createElement('div');
        container.className = 'player-registration';

        const title = document.createElement('h2');
        title.textContent = 'Player Registration';
        container.appendChild(title);

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 32;
        input.placeholder = 'Enter alias';
        input.className = 'alias-input';

        const addButton = document.createElement('button');
        addButton.textContent = 'Add Player';
        addButton.className = 'add-button';

        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';

        const playerList = document.createElement('ul');
        playerList.className = 'player-list';

        addButton.addEventListener('click', () => {
            const alias = input.value.trim();
            if (!alias || players.includes(alias) || alias.includes(' ')) {
                errorMessage.textContent = 'Alias cannot be empty, contain spaces, or already be registered.';
                return;
            }

            players.push(alias);
            scores[alias] = 0;
            input.value = '';
            errorMessage.textContent = '';
            renderPlayerList();

            if (players.length >= 4) {
                input.disabled = true;
                addButton.disabled = true;
                addButton.classList.add('disabled');
            }
        });

        function renderPlayerList() {
            playerList.innerHTML = '';
            players.forEach(player => {
                const li = document.createElement('li');
                li.className = 'player-item';
                li.textContent = player;
                playerList.appendChild(li);
            });
        }

        inputGroup.appendChild(input);
        inputGroup.appendChild(addButton);
        container.appendChild(inputGroup);
        container.appendChild(errorMessage);
        container.appendChild(playerList);

        return container;
    }

    // Update generateMatchQueue() function:
    function generateMatchQueue() {
        matchQueue = [];
        // Generate all possible combinations (6 matches total)
        for (let i = 0; i < players.length - 1; i++) {
            for (let j = i + 1; j < players.length; j++) {
                matchQueue.push(`${players[i]} vs ${players[j]}`);
            }
        }
        return matchQueue;
        // For 4 players this will generate:
        // player1 vs player2
        // player1 vs player3
        // player1 vs player4
        // player2 vs player3
        // player2 vs player4
        // player3 vs player4
    }

    function startTournament() {
        if (players.length === 4) {
            tournamentStarted = true;
            generateMatchQueue();
            renderTournament();
        }
    }

    function renderTournament() {
        tournamentContainer.innerHTML = '';

        const tournamentLayout = document.createElement('div');
        tournamentLayout.className = 'tournament-layout';

        // Left column - match display, play button, and scores
        const leftColumn = document.createElement('div');
        leftColumn.className = 'left-column';

        const currentMatch = matchQueue[currentMatchIndex];
        leftColumn.appendChild(createMatchDisplay(currentMatch));

        // Add play button between match display and scores
        const playButton = document.createElement('button');
        playButton.className = 'submit-button';
        playButton.textContent = 'Play Game';
        playButton.onclick = () => {
            if (currentMatch) {
                const [player1, player2] = currentMatch.split(' vs ');
                startGame(player1, player2);
            }
        };
        leftColumn.appendChild(playButton);
        leftColumn.appendChild(createScoreTracker());

        // Right column - upcoming matches
        const rightColumn = document.createElement('div');
        rightColumn.className = 'right-column';
        rightColumn.appendChild(createMatchQueue());

        tournamentLayout.appendChild(leftColumn);
        tournamentLayout.appendChild(rightColumn);
        tournamentContainer.appendChild(tournamentLayout);
    }

    // Update startGame() function:
    function startGame(player1, player2) {
        tournamentContainer.innerHTML = '';
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container';
        tournamentContainer.appendChild(gameContainer);

        const game = new PongGame(gameContainer, {
            player1,
            player2,
            player3: 'none',
            player4: 'none'
        });

        game.onGameEnd = () => {
            const winner = game.player1.score > game.player2.score ? player1 : player2;
            scores[winner]++;
            currentMatchIndex++;

            if (currentMatchIndex < matchQueue.length) {
                renderTournament();
            } else {
                showFinalResults();
            }
        };
    }

    function showFinalResults() {
        tournamentContainer.innerHTML = '';

        // Sort players by score
        const sortedPlayers = [...players].sort((a, b) => {
            const scoreA = scores[a] || 0;
            const scoreB = scores[b] || 0;
            if (scoreB === scoreA) {
                return Math.random() - 0.5; // Randomize ties
            }
            return scoreB - scoreA;
        });

        // Create ranked players array
        const rankedPlayers = sortedPlayers.slice(0, 4).map((player, index) => ({
            name: player,
            score: scores[player] || 0,
            position: index + 1
        }));

        // Create win table
        const winTableContainer = document.createElement('div');
        winTableContainer.innerHTML = `
            <h1 class="profileH2">Final standings were determined by your score and performance!</h1>
            <div class="win-table-wrapper">
                <h1 class="win-table-title">Final Standings</h1>
                <div class="win-table-content">
                    <table class="win-table">
                        <thead>
                            <tr>
                                <th>Position</th>
                                <th>Player</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rankedPlayers.map(player => `
                                <tr>
                                    <td>${player.position}</td>
                                    <td>${player.name}</td>
                                    <td>${player.score}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="win-table-restart-button">Start New Tournament</button>
                </div>
            </div>
        `;

        // Add restart functionality
        const restartButton = winTableContainer.querySelector('.win-table-restart-button');
        restartButton.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.reload();
        });

        tournamentContainer.appendChild(winTableContainer);

        // Send results to backend
        sendTournamentResults(rankedPlayers);
    }

    // Add function to send results to backend
    async function sendTournamentResults(rankedPlayers) {
        try {
            // First get current user
            const userResponse = await fetch('/api/profiles/me/', {
                credentials: 'include'
            });
            const userData = await userResponse.json();

            // Post tournament results
            if (!sessionStorage.getItem('resultsPosted')) {
                const response = await fetch('/api/tournaments/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        owner: userData.user.id,
                        winners_order: rankedPlayers.map(player => player.name)
                    })
                });

                if (response.ok) {
                    console.log('Tournament results posted successfully');
                    sessionStorage.setItem('resultsPosted', 'true');
                }
            }
        } catch (error) {
            console.error('Error posting tournament results:', error);
        }
    }

    // Initial render
    const playerRegistration = createPlayerRegistration();
    tournamentContainer.appendChild(playerRegistration);

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Tournament';
    startButton.className = 'start-button';
    startButton.onclick = startTournament;
    tournamentContainer.appendChild(startButton);

    return tournamentContainer;
}
