// pongGame.js
import { checkLoginStatus } from './utils/state.js';

export async function pongGamePage() {
    if (!checkLoginStatus()) {
        window.navigateTo('/');
        return document.createElement('div');
    }

    const DIRECTION = {
        IDLE: 0,
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    };

    class PongGame {
        constructor(container) {
            this.container = container;
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'pong-canvas';
            this.context = this.canvas.getContext('2d');
            this.canvas.width = 1400;
            this.canvas.height = 1000;

            this.player1 = {
                width: 18,
                height: 180,
                x: 150,
                y: (this.canvas.height / 2) - 35,
                score: 0,
                move: DIRECTION.IDLE,
                speed: 8
            };

            this.player2 = {
                width: 18,
                height: 180,
                x: this.canvas.width - 150,
                y: (this.canvas.height / 2) - 35,
                score: 0,
                move: DIRECTION.IDLE,
                speed: 8
            };

            this.ball = {
                width: 18,
                height: 18,
                x: (this.canvas.width / 2) - 9,
                y: (this.canvas.height / 2) - 9,
                moveX: DIRECTION.IDLE,
                moveY: DIRECTION.IDLE,
                speed: 8,
                speedX: 0,
                speedY: 0
            };

            this.running = false;
            this.over = false;

            this.container.appendChild(this.canvas);
            this.addEventListeners();
            this.showStartMenu();
        }

        startGame() {
            this.running = true;
            // Set initial straight direction
            this.ball.moveX = Math.random() > 0.5 ? DIRECTION.LEFT : DIRECTION.RIGHT;
            this.ball.moveY = DIRECTION.IDLE;
            this.ball.speedX = this.ball.speed * (this.ball.moveX === DIRECTION.LEFT ? -1 : 1);
            this.ball.speedY = 0; // Start with no vertical movement
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
                    this.startGame(); // Use new startGame method instead
                }

                if (key.keyCode === 87) this.player1.move = DIRECTION.UP;
                if (key.keyCode === 83) this.player1.move = DIRECTION.DOWN;
                if (key.keyCode === 38) this.player2.move = DIRECTION.UP;
                if (key.keyCode === 40) this.player2.move = DIRECTION.DOWN;
            });

            document.addEventListener('keyup', (key) => {
                if (key.keyCode === 87 || key.keyCode === 83) {
                    this.player1.move = DIRECTION.IDLE;
                }
                if (key.keyCode === 38 || key.keyCode === 40) {
                    this.player2.move = DIRECTION.IDLE;
                }
            });
        }

        update() {
            if (this.running && !this.over) {
                if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
                if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;
                if (this.player2.move === DIRECTION.UP) this.player2.y -= this.player2.speed;
                if (this.player2.move === DIRECTION.DOWN) this.player2.y += this.player2.speed;

                this.player1.y = Math.max(0, Math.min(this.canvas.height - this.player1.height, this.player1.y));
                this.player2.y = Math.max(0, Math.min(this.canvas.height - this.player2.height, this.player2.y));

                if (this.ball.y <= 0) {
                    this.ball.y = 0;
                    this.ball.moveY = DIRECTION.DOWN;
                    this.ball.speedY = -this.ball.speedY;
                }
                if (this.ball.y >= this.canvas.height - this.ball.height) {
                    this.ball.y = this.canvas.height - this.ball.height;
                    this.ball.moveY = DIRECTION.UP;
                    this.ball.speedY = -this.ball.speedY;
                }

                // Player 1 paddle collision
                if (this.ball.x <= this.player1.x + this.player1.width &&
                    this.ball.x + this.ball.width >= this.player1.x &&
                    this.ball.y + this.ball.height >= this.player1.y &&
                    this.ball.y <= this.player1.y + this.player1.height) {

                    // Add buffer zone check
                    const buffer = 5;
                    if (this.ball.y + this.ball.height >= this.player1.y - buffer &&
                        this.ball.y <= this.player1.y + this.player1.height + buffer) {

                        // Calculate relative intersect point (-1 to 1)
                        const intersectY = (this.player1.y + (this.player1.height / 2)) - (this.ball.y + (this.ball.height / 2));
                        const normalized = Math.max(-1, Math.min(1, intersectY / (this.player1.height / 2))); // Clamp between -1 and 1

                        // Calculate bounce angle (maximum 60 degrees)
                        const bounceAngle = normalized * (Math.PI / 3); // 60 degrees max

                        // Set new velocities with consistent speed
                        const speed = this.ball.speed;
                        this.ball.moveX = DIRECTION.RIGHT;
                        this.ball.speedX = speed * Math.cos(bounceAngle);
                        this.ball.speedY = speed * -Math.sin(bounceAngle);

                        // Prevent sticking by moving ball outside collision zone
                        this.ball.x = this.player1.x + this.player1.width + 1;
                    }
                }

                // Player 2 paddle collision
                if (this.ball.x + this.ball.width >= this.player2.x &&
                    this.ball.x <= this.player2.x + this.player2.width &&
                    this.ball.y + this.ball.height >= this.player2.y &&
                    this.ball.y <= this.player2.y + this.player2.height) {

                    // Add buffer zone check
                    const buffer = 5;
                    if (this.ball.y + this.ball.height >= this.player2.y - buffer &&
                        this.ball.y <= this.player2.y + this.player2.height + buffer) {

                        const intersectY = (this.player2.y + (this.player2.height / 2)) - (this.ball.y + (this.ball.height / 2));
                        const normalized = Math.max(-1, Math.min(1, intersectY / (this.player2.height / 2))); // Clamp between -1 and 1

                        const bounceAngle = normalized * (Math.PI / 3); // 60 degrees max

                        const speed = this.ball.speed;
                        this.ball.moveX = DIRECTION.LEFT;
                        this.ball.speedX = -speed * Math.cos(bounceAngle);
                        this.ball.speedY = speed * -Math.sin(bounceAngle);

                        // Prevent sticking by moving ball outside collision zone
                        this.ball.x = this.player2.x - this.ball.width - 1;
                    }
                }

                // Update ball movement with new speeds
                this.ball.x += this.ball.speedX;
                this.ball.y += this.ball.speedY;

                if (this.ball.x <= 0) {
                    this.player2.score++;
                    this.resetBall();
                }
                if (this.ball.x >= this.canvas.width) {
                    this.player1.score++;
                    this.resetBall();
                }

                if (this.player1.score >= 5 || this.player2.score >= 5) {
                    this.over = true;
                }
            }
        }

        resetBall() {
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.moveX = Math.random() > 0.5 ? DIRECTION.LEFT : DIRECTION.RIGHT;
            this.ball.moveY = Math.random() > 0.5 ? DIRECTION.UP : DIRECTION.DOWN;
            this.ball.speedX = this.ball.speed * (this.ball.moveX === DIRECTION.LEFT ? -1 : 1);
            this.ball.speedY = this.ball.speed * (this.ball.moveY === DIRECTION.UP ? -1 : 1);
        }

        draw() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.fillStyle = '#ffffff';

            const radius = 9;

            // Helper function to draw rounded rectangle
            const roundRect = (x, y, width, height, radius) => {
                this.context.beginPath();
                this.context.moveTo(x + radius, y);
                this.context.arcTo(x + width, y, x + width, y + height, radius);
                this.context.arcTo(x + width, y + height, x, y + height, radius);
                this.context.arcTo(x, y + height, x, y, radius);
                this.context.arcTo(x, y, x + width, y, radius);
                this.context.closePath();
                this.context.fill();
            };

            // Draw rounded paddles
            roundRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height, radius);
            roundRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height, radius);

            // Draw ball
            this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);

            // Draw scores
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
                requestAnimationFrame(() => this.gameLoop());
            }
        }
    }

    const container = document.createElement('div');
    container.className = 'match-container';

    const title = document.createElement('h1');
    title.className = 'profileH2';
    title.textContent = 'Player vs Player Pong';
    container.appendChild(title);

    const game = new PongGame(container);
    return container;
}
