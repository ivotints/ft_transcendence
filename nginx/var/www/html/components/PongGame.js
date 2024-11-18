// PongGame.js
export class PongGame {
    constructor(container, players) {
        this.DIRECTION = {
            IDLE: 0,
            UP: -1,
            DOWN: 1,
            LEFT: -1,
            RIGHT: 1
        };

        this.container = container;
        this.players = players;
        this.isAIGame = players.player2 === 'AI';
        this.is2v2 = players.player3 !== 'none';

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'pong-canvas';
        this.context = this.canvas.getContext('2d');
        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.running = false;
        this.over = false;
        this.winningScore = 5;
        this.animationFrameId = null;

        this.ball = {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: this.DIRECTION.IDLE,
            moveY: this.DIRECTION.IDLE,
            speed: 8,
            speedX: 0,
            speedY: 0,
            maxSpeed: 20,
            speedIncrement: 0.5
        };

        this.isPlayer1AI = false;  // Add this line

        if (this.is2v2) {
            this.initializeTwoVsTwo();
        } else {
            this.initializeOneVsOne();
        }

        this.container.appendChild(this.canvas);
        this.addEventListeners();
        this.showStartMenu();
    }

    initializeOneVsOne() {
        this.player1 = {
            width: 18,
            height: 180,
            x: 150,
            y: (this.canvas.height / 2) - 90,
            score: 0,
            move: this.DIRECTION.IDLE,
            speed: 8,
            name: this.players.player1
        };

        this.player2 = {
            width: 18,
            height: 180,
            x: this.canvas.width - 150,
            y: (this.canvas.height / 2) - 90,
            score: 0,
            move: this.DIRECTION.IDLE,
            speed: 8,
            name: this.players.player2
        };
    }

    initializeTwoVsTwo() {
        this.initializeOneVsOne();

        this.player3 = {
            width: 18,
            height: 180,
            x: 300,
            y: (this.canvas.height / 2) - 90,
            score: 0,
            move: this.DIRECTION.IDLE,
            speed: 8,
            name: this.players.player3
        };

        this.player4 = {
            width: 18,
            height: 180,
            x: this.canvas.width - 300,
            y: (this.canvas.height / 2) - 90,
            score: 0,
            move: this.DIRECTION.IDLE,
            speed: 8,
            name: this.players.player4
        };
    }

    updatePlayerAI(player) {
        const isLeftPlayer = player === this.player1;
        const paddleCenter = player.y + (player.height / 2);
        const ballCenter = this.ball.y + (this.ball.height / 2);
        const difficulty = 0.8;
        const reactionThreshold = 35 * (1 - difficulty);

        // Check if ball is moving towards this player
        const ballComingTowards = isLeftPlayer ? this.ball.speedX < 0 : this.ball.speedX > 0;

        if (ballComingTowards) {
            if (paddleCenter < ballCenter - reactionThreshold) {
                player.move = this.DIRECTION.DOWN;
            } else if (paddleCenter > ballCenter + reactionThreshold) {
                player.move = this.DIRECTION.UP;
            } else {
                player.move = this.DIRECTION.IDLE;
            }
        } else {
            // Return to center when ball moving away
            const screenCenter = this.canvas.height / 2;
            if (Math.abs(paddleCenter - screenCenter) > player.height / 2) {
                if (paddleCenter > screenCenter) {
                    player.move = this.DIRECTION.UP;
                } else {
                    player.move = this.DIRECTION.DOWN;
                }
            } else {
                player.move = this.DIRECTION.IDLE;
            }
        }
    }

	startGame() {
		this.running = true;
		this.ball.moveX = Math.random() > 0.5 ? this.DIRECTION.LEFT : this.DIRECTION.RIGHT;
		this.ball.moveY = this.DIRECTION.IDLE;
		this.ball.speedX = this.ball.speed * (this.ball.moveX === this.DIRECTION.LEFT ? -1 : 1);
		this.ball.speedY = 0;
		this.gameLoop();
	}

	showStartMenu() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.font = '48px Arial';
		this.context.textAlign = 'center';
		this.context.fillStyle = '#ffffff';
		this.context.fillText(
			'Press any key to begin',
			this.canvas.width / 2,
			this.canvas.height / 2
		);
	}

	addEventListeners() {
		document.addEventListener('keydown', (key) => {
			if (!this.running) {
				this.startGame();
			}
			const code = key.code;
			if (code === 'KeyT') {
				this.isPlayer1AI = !this.isPlayer1AI;
			}
			if (!this.isPlayer1AI) {
				if (code === 'KeyW') this.player1.move = this.DIRECTION.UP;
				else if (code === 'KeyS') this.player1.move = this.DIRECTION.DOWN;
			}
			if (code === 'ArrowUp') this.player2.move = this.DIRECTION.UP;
			else if (code === 'ArrowDown') this.player2.move = this.DIRECTION.DOWN;
		});

		document.addEventListener('keyup', (key) => {
			const code = key.code;
			if (!this.isPlayer1AI) {
				if (code === 'KeyW' || code === 'KeyS') this.player1.move = this.DIRECTION.IDLE;
			}
			if (code === 'ArrowUp' || code === 'ArrowDown') this.player2.move = this.DIRECTION.IDLE;
		});
	}

	checkWallCollision() {
		if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ball.height) {
			this.ball.speedY = -this.ball.speedY;
		}
	}

	update() {
		if (this.running && !this.over) {
			if (this.isAIGame) {
				this.updatePlayerAI(this.player2);
			}
			if (this.isPlayer1AI) {
				this.updatePlayerAI(this.player1);
			}
			if (this.player1.move === this.DIRECTION.UP) this.player1.y = Math.max(0, this.player1.y - this.player1.speed);
			if (this.player1.move === this.DIRECTION.DOWN) this.player1.y = Math.min(this.canvas.height - this.player1.height, this.player1.y + this.player1.speed);
			if (this.player2.move === this.DIRECTION.UP) this.player2.y = Math.max(0, this.player2.y - this.player2.speed);
			if (this.player2.move === this.DIRECTION.DOWN) this.player2.y = Math.min(this.canvas.height - this.player2.height, this.player2.y + this.player2.speed);

			this.checkWallCollision();
			this.checkPaddleCollision(this.player1);
			this.checkPaddleCollision(this.player2);

			this.ball.x += this.ball.speedX;
			this.ball.y += this.ball.speedY;

			this.ball.y = Math.max(
				0,
				Math.min(this.canvas.height - this.ball.height, this.ball.y)
			);

			if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ball.height) {
				if (Math.abs(this.ball.speedY) < 1) {
					this.ball.speedY = this.ball.speed * (this.ball.y <= 0 ? 1 : -1);
				}
			}

			if (this.ball.x <= 0) {
				this.player2.score++;
				this.resetBall();
			}
			if (this.ball.x >= this.canvas.width) {
				this.player1.score++;
				this.resetBall();
			}

			if (this.player1.score >= this.winningScore || this.player2.score >= this.winningScore) {
				this.over = true;
			}
		}
	}

	resetBall() {
		this.ball.x = this.canvas.width / 2;
		this.ball.y = this.canvas.height / 2;
		this.ball.moveX = Math.random() > 0.5 ? this.DIRECTION.LEFT : this.DIRECTION.RIGHT;
		this.ball.moveY = Math.random() > 0.5 ? this.DIRECTION.UP : this.DIRECTION.DOWN;
		this.ball.speed = 8;
		this.ball.speedX = this.ball.speed  * (this.ball.moveX === this.DIRECTION.LEFT ? -1 : 1);
		this.ball.speedY = 0;
	}

	drawRect(x, y, width, height) {
		this.context.fillRect(x, y, width, height);
	}

	draw() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = '#ffffff';

		const roundRect = (x, y, width, height) => {
			const radius = 9;
			this.context.beginPath();
			this.context.moveTo(x + radius, y);
			this.context.arcTo(x + width, y, x + width, y + height, radius);
			this.context.arcTo(x + width, y + height, x, y + height, radius);
			this.context.arcTo(x, y + height, x, y, radius);
			this.context.arcTo(x, y, x + width, y, radius);
			this.context.closePath();
			this.context.fill();
		};

		roundRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
		roundRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);

		this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);

		this.context.font = '48px Arial';
		this.context.textAlign = 'center';
		this.context.fillText(this.player1.score.toString(), this.canvas.width / 4, 100);
		this.context.fillText(this.player2.score.toString(), (this.canvas.width / 4) * 3, 100);

		if (this.over) {
			this.context.font = '64px Arial';
			this.context.fillText(
				`${this.player1.score > this.player2.score ? 'Player 1' : 'Player 2'} Wins!`,
				this.canvas.width / 2,
				this.canvas.height / 2
			);
		}
	}

	gameLoop() {
		if (!this.over) {
			this.update();
			this.draw();
		} else {
			this.showGameOver();
		}
		this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
	}

	checkPaddleCollision(player) {
		if (
			this.ball.x <= player.x + player.width &&
			this.ball.x + this.ball.width >= player.x &&
			this.ball.y + this.ball.height >= player.y &&
			this.ball.y <= player.y + player.height
		) {
			const buffer = 5;
			if (
				this.ball.y + this.ball.height >= player.y - buffer &&
				this.ball.y <= player.y + player.height + buffer
			) {
				this.ball.y = Math.max(
					0,
					Math.min(
						this.canvas.height - this.ball.height,
						this.ball.y
					)
				);

				const intersectY =
					player.y + player.height / 2 - (this.ball.y + this.ball.height / 2);
				const normalized = Math.max(
					-1,
					Math.min(1, intersectY / (player.height / 2))
				);

				const randomAngle = (Math.random() - 0.5) * 2 * (Math.PI / 180);
				const bounceAngle = normalized * (Math.PI / 3) + randomAngle;

				const speed = Math.min(
					this.ball.speed + this.ball.speedIncrement,
					this.ball.maxSpeed
					);

				if (this.ball.y <= buffer || this.ball.y >= this.canvas.height - this.ball.height - buffer) {
					this.ball.speedY = -this.ball.speedY;
					this.ball.speedY *= 0.5;
				}

				this.ball.speed = speed;
				this.ball.moveX = player === this.player1 ? this.DIRECTION.RIGHT : this.DIRECTION.LEFT;
				this.ball.speedX = (player === this.player1 ? 1 : -1) * speed * Math.cos(bounceAngle);
				this.ball.speedY = speed * -Math.sin(bounceAngle);

				this.ball.x = player === this.player1
					? player.x + player.width + 1
					: player.x - this.ball.width - 1;
			}
		}
	}

	initBall() {
		this.ball.x = (this.canvas.width - this.ball.width) / 2;
		this.ball.y = (this.canvas.height - this.ball.height) / 2;
		this.ball.speed = 8;
		this.ball.speedX = this.ball.speed * (Math.random() > 0.5 ? -1 : 1);
		this.ball.speedY = 0;
		this.ball.moveX = this.ball.speedX > 0 ? this.DIRECTION.RIGHT : this.DIRECTION.LEFT;
		this.ball.moveY = this.DIRECTION.IDLE;
	}

	resetGame() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		this.player1.score = 0;
		this.player2.score = 0;

		this.player1.y = (this.canvas.height / 2) - (this.player1.height / 2);
		this.player2.y = (this.canvas.height / 2) - (this.player2.height / 2);
		this.player1.move = this.DIRECTION.IDLE;
		this.player2.move = this.DIRECTION.IDLE;

		this.ball.speed = 8;
		this.ball.x = (this.canvas.width / 2) - (this.ball.width / 2);
		this.ball.y = (this.canvas.height / 2) - (this.ball.height / 2);
		this.ball.speedX = 0;
		this.ball.speedY = 0;
		this.ball.moveX = this.DIRECTION.IDLE;
		this.ball.moveY = this.DIRECTION.IDLE;

		this.over = false;
		this.running = false;

		this.showStartMenu();
	}

	showGameOver() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.font = '64px Arial';
		this.context.textAlign = 'center';
		this.context.fillStyle = '#ffffff';
		this.context.fillText(
			`${this.player1.score > this.player2.score ? 'Player 1' : 'Player 2'} Wins!`,
			this.canvas.width / 2,
			this.canvas.height / 2
		);
		this.context.font = '48px Arial';
		this.context.fillText(
			'Press Space or Enter to Restart',
			this.canvas.width / 2,
			this.canvas.height / 2 + 100
		);

		if (!this.restartListenerAdded) {
			this.restartListenerAdded = true;
			const restartHandler = (e) => {
				if (e.code === 'Space' || e.code === 'Enter') {
					document.removeEventListener('keydown', restartHandler);
					this.restartListenerAdded = false;
					this.resetGame();
				}
			};
			document.addEventListener('keydown', restartHandler);
		}
	}
}
