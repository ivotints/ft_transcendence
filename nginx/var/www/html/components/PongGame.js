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
			maxSpeed: 25,
			speedIncrement: 0.5
		};

		this.player1AI = false;
		this.player2AI = players.player2 === 'none';
		this.player3AI = false;
		this.player4AI = false;

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
		// Left team
		this.player1 = {
			width: 18,
			height: 180,
			x: 150,
			y: (this.canvas.height / 4) - 90,
			score: 0,
			move: this.DIRECTION.IDLE,
			speed: 8,
			name: this.players.player1,
			maxY: this.canvas.height / 2 - 180
		};

		this.player3 = {
			width: 18,
			height: 180,
			x: 150,
			y: (this.canvas.height * 3 / 4) - 90,
			score: 0,
			move: this.DIRECTION.IDLE,
			speed: 8,
			name: this.players.player3,
			minY: this.canvas.height / 2
		};

		// Right team
		this.player2 = {
			width: 18,
			height: 180,
			x: this.canvas.width - 150,
			y: (this.canvas.height / 4) - 90,
			score: 0,
			move: this.DIRECTION.IDLE,
			speed: 8,
			name: this.players.player2,
			maxY: this.canvas.height / 2 - 180
		};

		this.player4 = {
			width: 18,
			height: 180,
			x: this.canvas.width - 150,
			y: (this.canvas.height * 3 / 4) - 90,
			score: 0,
			move: this.DIRECTION.IDLE,
			speed: 8,
			name: this.players.player4,
			minY: this.canvas.height / 2
		};
	}

	updatePlayerAI(player) {
		const isLeftPlayer = player === this.player1 || player === this.player3;
		const paddleCenter = player.y + (player.height / 2);
		const ballCenter = this.ball.y + (this.ball.height / 2);
		const difficulty = 0.8;
		const reactionThreshold = 35 * (1 - difficulty);

		let territoryCenter;
		if (this.is2v2) {
			if (player === this.player1 || player === this.player2) {
				territoryCenter = this.canvas.height / 4;
			} else {
				territoryCenter = (this.canvas.height * 3) / 4;
			}
		} else {
			territoryCenter = this.canvas.height / 2;
		}

		const ballComingTowards = isLeftPlayer ? this.ball.speedX < 0 : this.ball.speedX > 0;

		if (ballComingTowards) {
			const isInTerritory = this.is2v2 ?
				(player === this.player1 || player === this.player2) ?
					ballCenter < this.canvas.height / 2 :
					ballCenter >= this.canvas.height / 2
				: true;

			if (isInTerritory) {
				if (paddleCenter < ballCenter - reactionThreshold) {
					player.move = this.DIRECTION.DOWN;
				} else if (paddleCenter > ballCenter + reactionThreshold) {
					player.move = this.DIRECTION.UP;
				} else {
					player.move = this.DIRECTION.IDLE;
				}
			} else {
				if (Math.abs(paddleCenter - territoryCenter) > player.height / 4) {
					if (paddleCenter > territoryCenter) {
						player.move = this.DIRECTION.UP;
					} else {
						player.move = this.DIRECTION.DOWN;
					}
				} else {
					player.move = this.DIRECTION.IDLE;
				}
			}
		} else {
			if (Math.abs(paddleCenter - territoryCenter) > player.height / 4) {
				if (paddleCenter > territoryCenter) {
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
		this.context.fillStyle = '#ffffff';
		this.context.textAlign = 'center';

		this.context.font = '48px Arial';
		this.context.fillText(
			'Press any key to begin',
			this.canvas.width / 2,
			this.canvas.height / 2 - 150
		);

		this.context.font = '26px Arial';
		if (this.is2v2) {
			this.context.fillText(
				'Left Team Controls:',
				this.canvas.width / 2,
				this.canvas.height / 2 - 50
			);
			this.context.fillText(
				'Top: W/S, Bottom: / and \'',
				this.canvas.width / 2,
				this.canvas.height / 2 - 20
			);
			this.context.fillText(
				'Right Team Controls:',
				this.canvas.width / 2,
				this.canvas.height / 2 + 20
			);
			this.context.fillText(
				'Top: ↑/↓, Bottom: 8/2',
				this.canvas.width / 2,
				this.canvas.height / 2 + 50
			);
		} else if (this.player2AI) {
			this.context.fillText(
				'Player Controls: W/S',
				this.canvas.width / 2,
				this.canvas.height / 2 - 20
			);
			this.context.fillText(
				'AI Controls right paddle',
				this.canvas.width / 2,
				this.canvas.height / 2 + 20
			);
		} else {
			this.context.fillText(
				'Left Player: W/S',
				this.canvas.width / 2,
				this.canvas.height / 2 - 20
			);
			this.context.fillText(
				'Right Player: ↑/↓',
				this.canvas.width / 2,
				this.canvas.height / 2 + 20
			);
		}

		this.context.fillText(
			'Press 1-4 to toggle AI for each player',
			this.canvas.width / 2,
			this.canvas.height / 2 + 100
		);
	}

	addEventListeners() {
		document.addEventListener('keydown', (key) => {
			if (!this.running) {
				this.startGame();
			}
			const code = key.code;

			if (code === 'Digit1') this.player1AI = !this.player1AI;
			if (code === 'Digit2') this.player2AI = !this.player2AI;
			if (code === 'Digit3' && this.is2v2) this.player3AI = !this.player3AI;
			if (code === 'Digit4' && this.is2v2) this.player4AI = !this.player4AI;

			if (this.is2v2) {
				if (!this.player1AI) {
					if (code === 'KeyW') this.player1.move = this.DIRECTION.UP;
					if (code === 'KeyS') this.player1.move = this.DIRECTION.DOWN;
				}
				if (!this.player3AI) {
					if (code === 'Quote') this.player3.move = this.DIRECTION.UP;
					if (code === 'Slash') this.player3.move = this.DIRECTION.DOWN;
				}

				if (!this.player2AI) {
					if (code === 'ArrowUp') this.player2.move = this.DIRECTION.UP;
					if (code === 'ArrowDown') this.player2.move = this.DIRECTION.DOWN;
				}
				if (!this.player4AI) {
					if (code === 'Numpad8') this.player4.move = this.DIRECTION.UP;
					if (code === 'Numpad2') this.player4.move = this.DIRECTION.DOWN;
				}
			} else {
				if (!this.player1AI) {
					if (code === 'KeyW') this.player1.move = this.DIRECTION.UP;
					if (code === 'KeyS') this.player1.move = this.DIRECTION.DOWN;
				}
				if (!this.player2AI) {
					if (code === 'ArrowUp') this.player2.move = this.DIRECTION.UP;
					if (code === 'ArrowDown') this.player2.move = this.DIRECTION.DOWN;
				}
			}
		});

		document.addEventListener('keyup', (key) => {
			const code = key.code;
			if (this.is2v2) {
				if (!this.player1AI && (code === 'KeyW' || code === 'KeyS'))
					this.player1.move = this.DIRECTION.IDLE;
				if (!this.player3AI && (code === 'Quote' || code === 'Slash'))
					this.player3.move = this.DIRECTION.IDLE;

				if (!this.player2AI && (code === 'ArrowUp' || code === 'ArrowDown'))
					this.player2.move = this.DIRECTION.IDLE;
				if (!this.player4AI && (code === 'Numpad8' || code === 'Numpad2'))
					this.player4.move = this.DIRECTION.IDLE;
			} else {
				if (!this.player1AI && (code === 'KeyW' || code === 'KeyS'))
					this.player1.move = this.DIRECTION.IDLE;
				if (!this.player2AI && (code === 'ArrowUp' || code === 'ArrowDown'))
					this.player2.move = this.DIRECTION.IDLE;
			}
		});
	}

	checkWallCollision() {
		if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ball.height) {
			this.ball.speedY = -this.ball.speedY;
		}
	}

	update() {
		if (this.running && !this.over) {
			if (this.player1AI) this.updatePlayerAI(this.player1);
			if (this.player2AI) this.updatePlayerAI(this.player2);
			if (this.is2v2) {
				if (this.player3AI) this.updatePlayerAI(this.player3);
				if (this.player4AI) this.updatePlayerAI(this.player4);
			}
			if (this.is2v2) {
				if (this.player1.move === this.DIRECTION.UP) {
					this.player1.y = Math.max(0, Math.min(this.player1.maxY, this.player1.y - this.player1.speed));
				}
				if (this.player1.move === this.DIRECTION.DOWN) {
					this.player1.y = Math.max(0, Math.min(this.player1.maxY, this.player1.y + this.player1.speed));
				}

				if (this.player3.move === this.DIRECTION.UP) {
					this.player3.y = Math.max(this.player3.minY, Math.min(this.canvas.height - this.player3.height, this.player3.y - this.player3.speed));
				}
				if (this.player3.move === this.DIRECTION.DOWN) {
					this.player3.y = Math.max(this.player3.minY, Math.min(this.canvas.height - this.player3.height, this.player3.y + this.player3.speed));
				}

				if (this.player2.move === this.DIRECTION.UP) {
					this.player2.y = Math.max(0, Math.min(this.player2.maxY, this.player2.y - this.player2.speed));
				}
				if (this.player2.move === this.DIRECTION.DOWN) {
					this.player2.y = Math.max(0, Math.min(this.player2.maxY, this.player2.y + this.player2.speed));
				}

				if (this.player4.move === this.DIRECTION.UP) {
					this.player4.y = Math.max(this.player4.minY, Math.min(this.canvas.height - this.player4.height, this.player4.y - this.player4.speed));
				}
				if (this.player4.move === this.DIRECTION.DOWN) {
					this.player4.y = Math.max(this.player4.minY, Math.min(this.canvas.height - this.player4.height, this.player4.y + this.player4.speed));
				}

				this.checkPaddleCollision(this.player3);
				this.checkPaddleCollision(this.player4);
			} else {
				if (this.player1.move === this.DIRECTION.UP) this.player1.y = Math.max(0, this.player1.y - this.player1.speed);
				if (this.player1.move === this.DIRECTION.DOWN) this.player1.y = Math.min(this.canvas.height - this.player1.height, this.player1.y + this.player1.speed);
				if (this.player2.move === this.DIRECTION.UP) this.player2.y = Math.max(0, this.player2.y - this.player2.speed);
				if (this.player2.move === this.DIRECTION.DOWN) this.player2.y = Math.min(this.canvas.height - this.player2.height, this.player2.y + this.player2.speed);

			}
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
		this.ball.speedX = this.ball.speed * (this.ball.moveX === this.DIRECTION.LEFT ? -1 : 1);
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

		if (this.is2v2) {
			roundRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
			roundRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
			roundRect(this.player3.x, this.player3.y, this.player3.width, this.player3.height);
			roundRect(this.player4.x, this.player4.y, this.player4.width, this.player4.height);

			this.context.beginPath();
			this.context.strokeStyle = '#ffffff';
			this.context.setLineDash([5, 15]);
			this.context.moveTo(0, this.canvas.height / 2);
			this.context.lineTo(this.canvas.width, this.canvas.height / 2);
			this.context.stroke();
		} else {
			roundRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
			roundRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
		}

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
		const isLeftTeam = player === this.player1 || player === this.player3;

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
					Math.min(this.canvas.height - this.ball.height, this.ball.y)
				);

				const intersectY = player.y + player.height / 2 - (this.ball.y + this.ball.height / 2);
				const normalized = Math.max(-1, Math.min(1, intersectY / (player.height / 2)));
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
				this.ball.moveX = isLeftTeam ? this.DIRECTION.RIGHT : this.DIRECTION.LEFT;
				this.ball.speedX = (isLeftTeam ? 1 : -1) * speed * Math.cos(bounceAngle);
				this.ball.speedY = speed * -Math.sin(bounceAngle);

				this.ball.x = isLeftTeam
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
