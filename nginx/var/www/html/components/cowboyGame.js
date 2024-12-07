// cowboyGame.js

export class CowboyGame {
    constructor(container, players) {
        this.container = container;
        this.players = players;

        // Game state
        this.gamePhase = 'ready';
        this.winner = null;
        this.gameStartTime = null;
        this.player1Score = 0;
        this.player2Score = 0;
        this.maxScore = 5;
        this.timeouts = [];

        this.player1Name = players.player1;
        this.player2Name = players.player2;

        this.initGame();
    }

    initGame() {
        // Initialize game elements
        this.scoreboard = document.createElement('div');
        this.scoreboard.className = 'scoreboard';

        this.player1ScoreDiv = this.createScoreElement(this.player1Name, this.player1Score);
        this.player2ScoreDiv = this.createScoreElement(this.player2Name, this.player2Score);
        this.scoreboard.appendChild(this.player1ScoreDiv);
        this.scoreboard.appendChild(this.player2ScoreDiv);

        this.playersDiv = document.createElement('div');
        this.playersDiv.className = 'players';

        this.player1Div = this.createPlayerElement(this.player1Name, 1);
        this.player2Div = this.createPlayerElement(this.player2Name, 2);
        this.playersDiv.appendChild(this.player1Div);
        this.playersDiv.appendChild(this.player2Div);

        this.messageDiv = document.createElement('h2');
        this.messageDiv.className = 'message';

        this.resultDiv = document.createElement('div');
        this.resultDiv.className = 'result';

        this.container.appendChild(this.scoreboard);
        this.container.appendChild(this.playersDiv);
        this.container.appendChild(this.messageDiv);
        this.container.appendChild(this.resultDiv);

        this.handleKeyPressBound = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.handleKeyPressBound);
        this.updateGamePhase('ready');
    }

    createScoreElement(name, score) {
        const div = document.createElement('div');
        div.className = 'score';
        const truncatedName = name.length > 10 ? name.slice(0, 10) + '...' : name;
        div.innerHTML = `
            <span class="score-label">${truncatedName}</span>
            <span class="score-value">${score}</span>
        `;
        return div;
    }

    createPlayerElement(name, playerNum) {
        const div = document.createElement('div');
        div.className = `player player${playerNum}`;
        const truncatedName = name.length > 10 ? name.slice(0, 10) + '...' : name;
        div.innerHTML = `
            <img src="https://thumbs.dreamstime.com/b/old-man-cowboy-thick-mustache-carrying-gun-vector-illustration-art-doodle-icon-image-kawaii-228493204.jpg"
                alt="Player ${playerNum} Cowboy" class="cowboy-image">
            <h3>${truncatedName}</h3>
        `;
        return div;
    }

    updateGamePhase(phase) {
        if (this.winner && phase !== 'finished') return;

        this.gamePhase = phase;
        this.messageDiv.className = `message ${phase}`;

        const player1Element = this.playersDiv.querySelector('.player1');
        const player2Element = this.playersDiv.querySelector('.player2');

        player1Element.classList.remove('steady', 'shoot');
        player2Element.classList.remove('steady', 'shoot');

        if (phase === 'steady' && !this.winner) {
            player1Element.classList.add('steady');
            player2Element.classList.add('steady');
        } else if (phase === 'bang' && !this.winner) {
            player1Element.classList.add('shoot');
            player2Element.classList.add('shoot');
        }

        if (phase === 'ready') {
            this.messageDiv.textContent = 'Ready...';
            if (!this.winner) {
                this.timeouts.push(setTimeout(() => this.updateGamePhase('steady'), 1000));
            }
        } else if (phase === 'steady') {
            this.messageDiv.textContent = 'Steady...';
            if (!this.winner) {
                const randomTime = Math.floor(Math.random() * 3000) + 2000;
                this.timeouts.push(setTimeout(() => {
                    if (!this.winner) {
                        this.updateGamePhase('bang');
                        this.gameStartTime = Date.now();
                    }
                }, randomTime));
            }
        } else if (phase === 'bang') {
            this.messageDiv.textContent = 'Bang!';
        } else if (phase === 'finished') {
            this.messageDiv.textContent = 'Game Over';
        }
    }

    handleKeyPress(event) {
        if ((event.key === ' ' || event.key === 'Enter') && this.gamePhase === 'finished') {
            this.resetGame();
            return;
        }

        if (event.key !== 'w' && event.key !== 'ArrowUp') return;

        if (this.gamePhase === 'ready' || this.gamePhase === 'steady') {
            if (!this.winner) {
                if (event.key === 'w') {
                    this.setWinner(this.player2Name, 'won by opponent misclick');
                    this.player2Score = Math.min(this.player2Score + 1, this.maxScore);
                } else if (event.key === 'ArrowUp') {
                    this.setWinner(this.player1Name, 'won by opponent misclick');
                    this.player1Score = Math.min(this.player1Score + 1, this.maxScore);
                }
                this.updateGamePhase('finished');

                // Check if game is over and trigger onGameEnd
                if (this.player1Score === this.maxScore || this.player2Score === this.maxScore) {
                    if (this.onGameEnd) {
                        this.onGameEnd();
                    }
                }
            }
        } else if (this.gamePhase === 'bang' && !this.winner) {
            const reactionTime = Date.now() - this.gameStartTime;
            if (event.key === 'w') {
                this.setWinner(this.player1Name, null, reactionTime);
                this.player1Score = Math.min(this.player1Score + 1, this.maxScore);
            } else if (event.key === 'ArrowUp') {
                this.setWinner(this.player2Name, null, reactionTime);
                this.player2Score = Math.min(this.player2Score + 1, this.maxScore);
            }
            this.updateGamePhase('finished');

            // Check if game is over and trigger onGameEnd
            if (this.player1Score === this.maxScore || this.player2Score === this.maxScore) {
                if (this.onGameEnd) {
                    this.onGameEnd();
                }
            }
        }

        this.updateScoreboard();
    }

    setWinner(name, reason, reactionTime) {
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
        this.winner = { name, reason, reactionTime };
        this.updateResult();
    }

    updateResult() {
        if (!this.winner) {
            this.resultDiv.innerHTML = '';
            return;
        }

        let resultHTML = '';
        if (this.winner.reason === 'won by opponent misclick') {
            resultHTML = `<h3>${this.winner.name} wins this round due to opponent's misclick!</h3>`;
        } else {
            resultHTML = `
                <h3>${this.winner.name} wins this round!</h3>
                <p>Reaction Time: ${this.winner.reactionTime} ms</p>
            `;
        }

        if (this.player1Score === this.maxScore || this.player2Score === this.maxScore) {
            resultHTML += `<h3>${this.player1Score === this.maxScore ? this.player1Name : this.player2Name} wins the match!</h3>`;
			if (this.onGameEnd)
				this.onGameEnd();
		}

        resultHTML += `<p>Press "Enter" or "Space" to play again</p>`;
        this.resultDiv.innerHTML = resultHTML;
    }

    updateScoreboard() {
        this.player1ScoreDiv.querySelector('.score-value').textContent = this.player1Score;
        this.player2ScoreDiv.querySelector('.score-value').textContent = this.player2Score;
    }

    resetGame() {
        if (this.player1Score === this.maxScore || this.player2Score === this.maxScore) {

            this.player1Score = 0;
            this.player2Score = 0;
            this.updateScoreboard();
        }
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
        this.winner = null;
        this.gameStartTime = null;
        this.updateResult();
        this.updateGamePhase('ready');
    }

    cleanup() {
        this.timeouts.forEach(clearTimeout);
        window.removeEventListener('keydown', this.handleKeyPressBound);
    }
}
