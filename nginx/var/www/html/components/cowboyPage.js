import { checkLoginStatus } from './utils/state.js';

export async function cowboyPage() {
    if (!checkLoginStatus()) {
        window.navigateTo('/');
        return document.createElement('div');
    }

    const container = document.createElement('div');
    container.className = 'game-container';

    // Game state
    let gamePhase = 'ready';
    let winner = null;
    let gameStartTime = null;
    let player1Score = 0;
    let player2Score = 0;
    const maxScore = 5;
    let timeouts = [];
	const player1 = "Player 1";
	const player2 = "Player 2";

    const scoreboard = document.createElement('div');
    scoreboard.className = 'scoreboard';

    const player1ScoreDiv = createScoreElement(player1, player1Score);
    const player2ScoreDiv = createScoreElement(player2, player2Score);
    scoreboard.appendChild(player1ScoreDiv);
    scoreboard.appendChild(player2ScoreDiv);

    const playersDiv = document.createElement('div');
    playersDiv.className = 'players';

    const player1Div = createPlayerElement(player1, 1);
    const player2Div = createPlayerElement(player2, 2);
    playersDiv.appendChild(player1Div);
    playersDiv.appendChild(player2Div);

    const messageDiv = document.createElement('h2');
    messageDiv.className = 'message';

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';

    container.appendChild(scoreboard);
    container.appendChild(playersDiv);
    container.appendChild(messageDiv);
    container.appendChild(resultDiv);

    function createScoreElement(name, score) {
        const div = document.createElement('div');
        div.className = 'score';
        div.innerHTML = `
            <span class="score-label">${name}</span>
            <span class="score-value">${score}</span>
        `;
        return div;
    }

    function createPlayerElement(name, playerNum) {
        const div = document.createElement('div');
        div.className = `player player${playerNum}`;
        div.innerHTML = `
            <img src="https://thumbs.dreamstime.com/b/old-man-cowboy-thick-mustache-carrying-gun-vector-illustration-art-doodle-icon-image-kawaii-228493204.jpg"
                alt="Player ${playerNum} Cowboy" class="cowboy-image">
            <h3>${name}</h3>
        `;
        return div;
    }

    function updateGamePhase(phase) {
        if (winner && phase !== 'finished') return;

        gamePhase = phase;
        messageDiv.className = `message ${phase}`;

        // Get player elements
        const player1Element = playersDiv.querySelector('.player1');
        const player2Element = playersDiv.querySelector('.player2');

        // Remove all state classes first
        player1Element.classList.remove('steady', 'shoot');
        player2Element.classList.remove('steady', 'shoot');

        // Add appropriate class based on phase
        if (phase === 'steady' && !winner) {
            player1Element.classList.add('steady');
            player2Element.classList.add('steady');
        } else if (phase === 'bang' && !winner) {
            player1Element.classList.add('shoot');
            player2Element.classList.add('shoot');
        }

        if (phase === 'ready') {
            messageDiv.textContent = 'Ready...';
            if (!winner) {
                timeouts.push(setTimeout(() => updateGamePhase('steady'), 1000));
            }
        } else if (phase === 'steady') {
            messageDiv.textContent = 'Steady...';
            if (!winner) {
                const randomTime = Math.floor(Math.random() * 3000) + 2000;
                timeouts.push(setTimeout(() => {
                    if (!winner) {
                        updateGamePhase('bang');
                        gameStartTime = Date.now();
                    }
                }, randomTime));
            }
        } else if (phase === 'bang') {
            messageDiv.textContent = 'Bang!';
        } else if (phase === 'finished') {
            messageDiv.textContent = 'Game Over';
        }
    }

    function handleKeyPress(event) {
        if ((event.key === ' ' || event.key === 'Enter') && gamePhase === 'finished') {
            resetGame();
            return;
        }

        if (event.key !== 'w' && event.key !== 'ArrowUp') return;

        if (gamePhase === 'ready' || gamePhase === 'steady') {
            if (!winner) {
                if (event.key === 'w') {
                    setWinner(player2, 'won by opponent misclick');
                    player2Score = Math.min(player2Score + 1, maxScore);
                } else if (event.key === 'ArrowUp') {
                    setWinner(player1, 'won by opponent misclick');
                    player1Score = Math.min(player1Score + 1, maxScore);
                }
                updateGamePhase('finished');
            }
        } else if (gamePhase === 'bang' && !winner) {
            const reactionTime = Date.now() - gameStartTime;
            if (event.key === 'w') {
                setWinner(player1, null, reactionTime);
                player1Score = Math.min(player1Score + 1, maxScore);
            } else if (event.key === 'ArrowUp') {
                setWinner(player2, null, reactionTime);
                player2Score = Math.min(player2Score + 1, maxScore);
            }
            updateGamePhase('finished');
        }

        updateScoreboard();
    }

    // Modify setWinner function to clear timeouts
    function setWinner(name, reason, reactionTime) {
        timeouts.forEach(clearTimeout); // Clear all pending timeouts
        timeouts = []; // Reset timeouts array
        winner = { name, reason, reactionTime };
        updateResult();
    }

    function updateResult() {
        if (!winner) {
            resultDiv.innerHTML = '';
            return;
        }

        let resultHTML = '';
        if (winner.reason === 'won by opponent misclick') {
            resultHTML = `<h3>${winner.name} ${"wins this round due to opponent's misclick!"}</h3>`;
        } else {
            resultHTML = `
                <h3>${winner.name} ${"wins this round!"}</h3>
                <p>${"Reaction Time"}: ${winner.reactionTime} ${"ms"}</p>
            `;
        }

        if (player1Score === maxScore || player2Score === maxScore) {
            resultHTML += `<h3>${player1Score === maxScore ? player1 : player2} ${"wins the match!"}</h3>`;
            sendResults();
        }

        resultHTML += `<p>${'Press "Enter" or "Space" to play again'}</p>`;
        resultDiv.innerHTML = resultHTML;
    }

    function updateScoreboard() {
        player1ScoreDiv.querySelector('.score-value').textContent = player1Score;
        player2ScoreDiv.querySelector('.score-value').textContent = player2Score;
    }

    function resetGame() {
        if (player1Score === maxScore || player2Score === maxScore) {
            player1Score = 0;
            player2Score = 0;
            updateScoreboard();
        }
        timeouts.forEach(clearTimeout);
        timeouts = [];
        winner = null;
        gameStartTime = null;
        updateResult();
        updateGamePhase('ready');
    }

    async function sendResults() {
        const matchData = {
            player1: player1.id,
            player2: player2,
            match_score: `${player1Score}-${player2Score}`,
        };

        try {
            const response = await fetch('/api/matches/cowboy/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(matchData)
            });
            const data = await response.json();
            console.log('Match data sent successfully:', data);
        } catch (error) {
            console.error('Error sending match data:', error);
        }
    }

    window.addEventListener('keydown', handleKeyPress);
    updateGamePhase('ready');

    // Cleanup function
    container.cleanup = () => {
        timeouts.forEach(clearTimeout);
        window.removeEventListener('keydown', handleKeyPress);
    };

    return container;
}
