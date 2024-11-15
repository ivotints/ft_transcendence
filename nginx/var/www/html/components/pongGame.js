//pongGame.js

export class pongGame {
    constructor(canvas, players) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.players = players;
        this.paddleCount = players.length;

        this.DIRECTION = {
            IDLE: 0,
            UP: 1,
            DOWN: 2,
            LEFT: 3,
            RIGHT: 4
        };

        this.WINNING_SCORE = 5;
        this.BACKGROUND_COLOR = '#00cc00';

        // Add constant speeds
        this.BALL_SPEED = 10;

        // Add this line
        this.animationFrameId = null;

        this.initialize();
    }

    initialize() {
        this.canvas.width = 1400;
        this.canvas.height = 1000;
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';

        this.paddles = this.createPaddles();
        this.ball = this.createBall();

        this.running = false;
        this.over = false;
        this.turn = this.paddles[1];
        this.timer = 0;

        this.setupControls();
        this.menu();
        this.listen();
    }

    createBall() {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: this.DIRECTION.IDLE,
            moveY: this.DIRECTION.IDLE,
            speed: this.BALL_SPEED
        };
    }

    createPaddles() {
        const paddles = [];
        if (this.paddleCount === 2) {
            // PvP or PvAI mode
            paddles.push(this.createPaddle('left'));
            paddles.push(this.createPaddle('right'));
        } else if (this.paddleCount === 4) {
            // 2v2 mode
            paddles.push(this.createPaddle('left'));
            paddles.push(this.createPaddle('left', 250));
            paddles.push(this.createPaddle('right'));
            paddles.push(this.createPaddle('right', 250));
        }
        return paddles;
    }

    createPaddle(side, offset = 150) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? offset : this.canvas.width - offset,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: this.DIRECTION.IDLE,
            speed: 8
        };
    }

    setupControls() {
        if (this.paddleCount === 2) {
            this.controls = {
                0: { up: 87, down: 83 },    // Player 1: W, S
                1: { up: 38, down: 40 }     // Player 2/AI: Arrow Up, Down
            };
        } else if (this.paddleCount === 4) {
            this.controls = {
                0: { up: 87, down: 83 },    // Player 1: W, S
                1: { up: 222, down: 191 },  // Player 2: ', /
                2: { up: 38, down: 40 },    // Player 3: Arrow Up, Down
                3: { up: 104, down: 98 }    // Player 4: Numpad 8, 2
            };
        }
    }

    menu() {
        this.draw();
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.BACKGROUND_COLOR;
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        this.context.fillStyle = '#ffffff';
        this.context.fillText(
            'Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    }

    update() {
        if (!this.over) {
            // Ball movement and collision
            this.updateBall();

            // Update paddles
            this.updatePaddles();

            // Check for winner
            this.checkWinner();
        }
    }

    updateBall() {
        // Update timer
        this.timer += 16; // Roughly 60fps

        // Check paddle collisions
        this.paddles.forEach(paddle => {
            if (this.ball.x < paddle.x + paddle.width &&
                this.ball.x + this.ball.width > paddle.x &&
                this.ball.y < paddle.y + paddle.height &&
                this.ball.y + this.ball.height > paddle.y) {

                // Only change direction, don't modify speed
                this.ball.moveX = paddle.x < this.canvas.width / 2 ?
                    this.DIRECTION.RIGHT : this.DIRECTION.LEFT;

            }
        });

        // Existing boundary checks
        if (this.ball.x <= 0) this.resetTurn(this.paddles[1], this.paddles[0]);
        if (this.ball.x >= this.canvas.width - this.ball.width) {
            this.resetTurn(this.paddles[0], this.paddles[1]);
        }

        if (this.ball.y <= 0) this.ball.moveY = this.DIRECTION.DOWN;
        if (this.ball.y >= this.canvas.height - this.ball.height) {
            this.ball.moveY = this.DIRECTION.UP;
        }

        // Ball movement
        if (this.ball.moveY === this.DIRECTION.UP) {
            this.ball.y -= (this.ball.speed / 1.5);
        } else if (this.ball.moveY === this.DIRECTION.DOWN) {
            this.ball.y += (this.ball.speed / 1.5);
        }

        if (this.ball.moveX === this.DIRECTION.LEFT) {
            this.ball.x -= this.ball.speed;
        } else if (this.ball.moveX === this.DIRECTION.RIGHT) {
            this.ball.x += this.ball.speed;
        }
    }

    draw() {
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.context.fillStyle = this.BACKGROUND_COLOR;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paddles and ball
        this.context.fillStyle = '#ffffff';

        this.paddles.forEach(paddle => {
            this.context.fillRect(
                paddle.x,
                paddle.y,
                paddle.width,
                paddle.height
            );
        });

        this.context.fillRect(
            this.ball.x,
            this.ball.y,
            this.ball.width,
            this.ball.height
        );

        // Draw scores
        this.drawScores();
    }

    listen() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        if (!this.running && !this.over) {
            this.running = true;

            // Cancel any existing animation frame
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            // Initialize ball movement when game starts
            this.ball.moveX = Math.random() > 0.5 ? this.DIRECTION.LEFT : this.DIRECTION.RIGHT;
            this.ball.moveY = Math.random() > 0.5 ? this.DIRECTION.UP : this.DIRECTION.DOWN;
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
        }

        for (let i = 0; i < this.paddleCount; i++) {
            const controls = this.controls[i];
            if (controls) {
                if (event.keyCode === controls.up) {
                    this.paddles[i].move = this.DIRECTION.UP;
                }
                if (event.keyCode === controls.down) {
                    this.paddles[i].move = this.DIRECTION.DOWN;
                }
            }
        }
    }

    loop() {
        if (!this.over && this.running) {
            this.update();
            this.draw();
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
        }
    }

    turnDelayIsOver() {
        return this.timer >= 2000;
    }

    resetTurn(victor, loser) {
        if (!this.over) {
            this.running = false;

            // Cancel the current animation frame
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            // Update score immediately
            victor.score++;

            // Check for a winner after updating the score
            this.checkWinner();

            if (!this.over) {
                setTimeout(() => {
                    // Create new ball with initial speed
                    this.ball = this.createBall();

                    // Randomize vertical position
                    const offset = Math.random() * 200 - 100; // Random offset between -100 and 100
                    this.ball.y = Math.min(Math.max(50, (this.canvas.height / 2) + offset), this.canvas.height - 50);

                    // Set direction based on who scored
                    this.ball.moveX = victor === this.paddles[0] ? this.DIRECTION.RIGHT : this.DIRECTION.LEFT;
                    this.ball.moveY = Math.random() > 0.5 ? this.DIRECTION.UP : this.DIRECTION.DOWN;

                    this.running = true;

                    // Start game loop
                    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
                }, 1000); // 1-second delay
            }
        }
    }

    checkWinner() {
        const winner = this.paddles.find(paddle => paddle.score === this.WINNING_SCORE);
        if (winner) {
            this.over = true;
            this.running = false;

            // Cancel the current animation frame
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            // Display winning message
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = '#ffffff';
            this.context.font = '50px Courier New';
            this.context.fillText(
                `Player ${this.paddles.indexOf(winner) + 1} Wins!`,
                this.canvas.width / 2 - 150,
                this.canvas.height / 2
            );

            // Reset game after a delay
            setTimeout(() => {
                this.paddles.forEach(paddle => paddle.score = 0);
                this.over = false;
                this.running = false;

                // Reset the ball
                this.ball = this.createBall();

                // Display the menu
                this.menu();
            }, 3000); // 3-second delay
        }
    }

    updatePaddles() {
        this.paddles.forEach(paddle => {
            if (paddle.move === this.DIRECTION.UP) {
                paddle.y = Math.max(0, paddle.y - paddle.speed);
            } else if (paddle.move === this.DIRECTION.DOWN) {
                paddle.y = Math.min(this.canvas.height - paddle.height, paddle.y + paddle.speed);
            }
        });
    }

    handleKeyUp(event) {
        for (let i = 0; i < this.paddleCount; i++) {
            const controls = this.controls[i];
            if (controls) {
                if (event.keyCode === controls.up || event.keyCode === controls.down) {
                    this.paddles[i].move = this.DIRECTION.IDLE;
                }
            }
        }
    }

    drawScores() {
        this.context.font = '24px Courier New';
        this.context.fillStyle = '#ffffff';

        // Draw scores based on number of players
        if (this.paddleCount === 2) {
            this.context.fillText(this.paddles[0].score.toString(), 100, 50);
            this.context.fillText(this.paddles[1].score.toString(), this.canvas.width - 100, 50);
        }
    }
}
