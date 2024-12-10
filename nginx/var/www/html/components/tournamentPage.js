// tournamentPage.js
import { checkLoginStatus } from './utils/state.js';
import { PongGame } from './PongGame.js';
import { translate } from './utils/translate.js';

export async function tournamentPage() {
    if (!checkLoginStatus()) {
        window.navigateTo('/');
        return document.createElement('div');
    }

    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container';

    let players = [];
    let matches = [];
    let matchQueue = [];
    let currentMatchIndex = 0;
    let scores = {};
    let tournamentStarted = false;

    let activeGame = null;

    function createMatchQueue() {
        const queueContainer = document.createElement('div');
        queueContainer.className = 'match-queue';

        const title = document.createElement('h2');
        title.textContent = translate('Upcoming Matches');
        queueContainer.appendChild(title);

        const list = document.createElement('ul');
        matchQueue.forEach(match => {
            const li = document.createElement('li');
            li.textContent = match.replace(' vs ', ` ${translate('vs')} `);
            list.appendChild(li);
        });
        queueContainer.appendChild(list);

        return queueContainer;
    }

    function createScoreTracker() {
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-tracker';

        const title = document.createElement('h2');
        title.textContent = translate('Scores');
        scoreContainer.appendChild(title);

        const list = document.createElement('ul');
        Object.entries(scores).forEach(([player, score]) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${player}</span><span class="points">${score} ${translate('points')}</span>`;
            list.appendChild(li);
        });
        scoreContainer.appendChild(list);

        return scoreContainer;
    }

    function createMatchDisplay(currentMatch) {
        const displayContainer = document.createElement('div');
        displayContainer.className = 'match-display';

        const title = document.createElement('h2');
        title.textContent = translate('Current Match');
        displayContainer.appendChild(title);

        const matchText = document.createElement('p');
        matchText.textContent = currentMatch ? currentMatch.replace(' vs ', ` ${translate('vs')} `) : translate('No matches yet.');
        displayContainer.appendChild(matchText);

        const matchCounter = document.createElement('p');
        matchCounter.className = 'match-counter';
        matchCounter.textContent = `${translate('Match')} ${currentMatchIndex + 1} ${translate('of')} ${matchQueue.length}`;
        displayContainer.appendChild(matchCounter);

        return displayContainer;
    }

    function createPlayerRegistration() {
        const container = document.createElement('div');
        container.className = 'player-registration';

        const title = document.createElement('h2');
        title.textContent = translate('Player Registration');
        container.appendChild(title);

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 32;
        input.placeholder = translate('Enter alias');
        input.className = 'alias-input';

        const addButton = document.createElement('button');
        addButton.textContent = translate('Add Player');
        addButton.className = 'add-button';

        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';

        const playerList = document.createElement('ul');
        playerList.className = 'player-list';

        const startButton = document.createElement('button');
        startButton.textContent = translate('Start Tournament');
        startButton.className = 'start-button';
        startButton.onclick = () => {
            if (players.length < 4) {
                errorMessage.textContent = translate('Need 4 players to start tournament');
                return;
            }
            startTournament();
        };

        addButton.addEventListener('click', () => {
            const alias = input.value.trim();
            const validAliasRegex = /^[a-zA-Z0-9@.+\-_]+$/;

            if (!alias) {
                errorMessage.textContent = translate('Alias cannot be empty.');
                return;
            }

            if (alias === 'none') {
                errorMessage.textContent = translate('Username "none" is not allowed');
                return;
            }

            if (!validAliasRegex.test(alias)) {
                errorMessage.textContent = translate('Alias may contain only letters, numbers, and @/./+/-/_ characters.');
                return;
            }

            if (players.includes(alias)) {
                errorMessage.textContent = translate('This alias is already registered.');
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
        container.appendChild(startButton);
        return container;
    }

    function generateMatchQueue() {
        matchQueue = [];
        for (let i = 0; i < players.length - 1; i++) {
            for (let j = i + 1; j < players.length; j++) {
                matchQueue.push(`${players[i]} vs ${players[j]}`);
            }
        }
        return matchQueue;
    }

    function startTournament() {
        if (players.length === 4) {
            tournamentStarted = true;
            generateMatchQueue();
            renderTournament();
        }
    }

    function renderTournament() {
        if (activeGame) {
            activeGame.cleanup();
            activeGame = null;
        }

        tournamentContainer.innerHTML = '';

        const tournamentLayout = document.createElement('div');
        tournamentLayout.className = 'tournament-layout';

        const leftColumn = document.createElement('div');
        leftColumn.className = 'left-column';

        const currentMatch = matchQueue[currentMatchIndex];
        leftColumn.appendChild(createMatchDisplay(currentMatch));

        const playButton = document.createElement('button');
        playButton.className = 'submit-button';
        playButton.textContent = translate('Play Game');
        playButton.onclick = () => {
            if (currentMatch) {
                const [player1, player2] = currentMatch.split(' vs ');
                startGame(player1, player2);
            }
        };
        leftColumn.appendChild(playButton);
        leftColumn.appendChild(createScoreTracker());

        const rightColumn = document.createElement('div');
        rightColumn.className = 'right-column';
        rightColumn.appendChild(createMatchQueue());

        tournamentLayout.appendChild(leftColumn);
        tournamentLayout.appendChild(rightColumn);
        tournamentContainer.appendChild(tournamentLayout);
    }

    function startGame(player1, player2) {
        if (activeGame) {
            activeGame.cleanup();
            activeGame = null;
        }

        tournamentContainer.innerHTML = '';
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container';
        tournamentContainer.appendChild(gameContainer);

        activeGame = new PongGame(gameContainer, {
            player1,
            player2,
            player3: 'none',
            player4: 'none'
        });

        let finalPlayer1Score = 0;
        let finalPlayer2Score = 0;

        activeGame.onGameEnd = () => {
            finalPlayer1Score = activeGame.player1.score;
            finalPlayer2Score = activeGame.player2.score;

            const winner = finalPlayer1Score > finalPlayer2Score ? player1 : player2;

            activeGame.cleanup();
            activeGame = null;

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
        if (activeGame) {
            activeGame.cleanup();
            activeGame = null;
        }

        tournamentContainer.innerHTML = '';

        const sortedPlayers = [...players].sort((a, b) => {
            const scoreA = scores[a] || 0;
            const scoreB = scores[b] || 0;
            if (scoreB === scoreA) {
                return Math.random() - 0.5;
            }
            return scoreB - scoreA;
        });

        const rankedPlayers = sortedPlayers.slice(0, 4).map((player, index) => ({
            name: player,
            score: scores[player] || 0,
            position: index + 1
        }));

        const winTableContainer = document.createElement('div');
        winTableContainer.innerHTML = `
            <h1 class="profileH2">${translate('Final standings were determined by your score and performance!')}</h1>
            <div class="win-table-wrapper">
                <h1 class="win-table-title">${translate('Final Standings')}</h1>
                <div class="win-table-content">
                    <table class="win-table">
                        <thead>
                            <tr>
                                <th>${translate('Position')}</th>
                                <th>${translate('Player')}</th>
                                <th>${translate('Score')}</th>
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
                    <button class="win-table-restart-button">${translate('Start New Tournament')}</button>
                </div>
            </div>
        `;

        const restartButton = winTableContainer.querySelector('.win-table-restart-button');
        restartButton.addEventListener('click', () => {
            players = [];
            matches = [];
            matchQueue = [];
            currentMatchIndex = 0;
            scores = {};
            tournamentStarted = false;
            sessionStorage.removeItem('resultsPosted');

            tournamentContainer.innerHTML = '';
            const playerRegistration = createPlayerRegistration();
            tournamentContainer.appendChild(playerRegistration);
        });

        tournamentContainer.appendChild(winTableContainer);
        sendTournamentResults(rankedPlayers);
    }

    async function sendTournamentResults(rankedPlayers) {
        try {
            const userResponse = await fetch('/api/profiles/me/', {
                credentials: 'include'
            });
            const userData = await userResponse.json();

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

    const cleanup = () => {
        if (activeGame) {
            activeGame.cleanup();
            activeGame = null;
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if (node === tournamentContainer) {
                    cleanup();
                    observer.disconnect();
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const playerRegistration = createPlayerRegistration();
    tournamentContainer.appendChild(playerRegistration);

    return tournamentContainer;
}
