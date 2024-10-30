import React, { useEffect, useRef } from 'react';
import { useTranslate } from './Translate/useTranslate';

const DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
};

const WINNING_SCORE = 5;
const BACKGROUND_COLOR = '#00cc00';

function TwoVsTwoGame({ player1Name, player2Name, player3Name, player4Name }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const { translate } = useTranslate();

  useEffect(() => {
    const Ball = {
      new: function (incrementedSpeed) {
        return {
          width: 18,
          height: 18,
          x: (this.canvas.width / 2) - 9,
          y: (this.canvas.height / 2) - 9,
          moveX: DIRECTION.IDLE,
          moveY: DIRECTION.IDLE,
          speed: incrementedSpeed || 7
        };
      }
    };

    const Paddle = {
      new: function (side) {
        return {
          width: 18,
          height: 180,
          x: side === 'left' ? 150 : this.canvas.width - 150,
          y: (this.canvas.height / 2) - 35,
          score: 0,
          move: DIRECTION.IDLE,
          speed: 8
        };
      }
    };

    const Game = {
      initialize: function () {
        this.canvas = canvasRef.current;
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';

        this.player1 = Paddle.new.call(this, 'left');
        this.player2 = Paddle.new.call(this, 'right');
        this.player3 = Paddle.new.call(this, 'left');
        this.player4 = Paddle.new.call(this, 'right');

// Example initial setup in constructor or initialization function
this.player1 = { x: 50, y: 100, width: 18, height: 180, move: null, speed: 5, score: 0 };
this.player2 = { x: this.canvas.width - 60, y: 100, width: 18,  height: 180, move: null, speed: 5, score: 0 };
this.player3 = { x: 50, y: this.canvas.height - 150, width: 18,  height: 180, move: null, speed: 5, score: 0 };
this.player4 = { x: this.canvas.width - 60, y: this.canvas.height - 150, width: 18, height: 180, move: null, speed: 5, score: 0 };


        this.ball = Ball.new.call(this);

        this.running = this.over = false;
        this.turn = this.player2;
        this.timer = 0;
        this.color = BACKGROUND_COLOR;

        this.menu();
        this.listen();
      },

      endGameMenu: function (text) {
        const Pong = gameRef.current;
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;

        Pong.context.fillRect(
          Pong.canvas.width / 2 - 350,
          Pong.canvas.height / 2 - 48,
          700,
          100
        );

        Pong.context.fillStyle = '#ffffff';

        Pong.context.fillText(text,
          Pong.canvas.width / 2,
          Pong.canvas.height / 2 + 15
        );
      },

      menu: function () {
        this.draw();

        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        this.context.fillRect(
          this.canvas.width / 2 - 350,
          this.canvas.height / 2 - 48,
          700,
          100
        );

        this.context.fillStyle = '#ffffff';

        this.context.fillText(translate('Press any key to begin'),
          this.canvas.width / 2,
          this.canvas.height / 2 + 15
        );
      },

      update: function () {
        const Pong = gameRef.current;
        if (!this.over) {
            // Ball movement and collision logic
            if (this.ball.x <= 0) this._resetTurn.call(this, this.player2, this.player1);
            if (this.ball.x >= this.canvas.width - this.ball.width) this._resetTurn.call(this, this.player1, this.player2);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
    
            // Move player 1 (top left half)
            if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
            else if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;
    
            // Move player 2 (top right half)
            if (this.player2.move === DIRECTION.UP) this.player2.y -= this.player2.speed;
            else if (this.player2.move === DIRECTION.DOWN) this.player2.y += this.player2.speed;
    
            // Move player 3 (bottom left half)
            if (this.player3.move === DIRECTION.UP) this.player3.y -= this.player3.speed;
            else if (this.player3.move === DIRECTION.DOWN) this.player3.y += this.player3.speed;
    
            // Move player 4 (bottom right half)
            if (this.player4.move === DIRECTION.UP) this.player4.y -= this.player4.speed;
            else if (this.player4.move === DIRECTION.DOWN) this.player4.y += this.player4.speed;
    
            // Restrict players to their designated half
            const middleY = this.canvas.height / 2;
    
            // Restrict player1 and player3 (left side players)
            if (this.player1.y <= 0) this.player1.y = 0;
            else if (this.player1.y >= middleY - this.player1.height) this.player1.y = middleY - this.player1.height;
    
            if (this.player3.y <= middleY) this.player3.y = middleY;
            else if (this.player3.y >= this.canvas.height - this.player3.height) this.player3.y = this.canvas.height - this.player3.height;
    
            // Restrict player2 and player4 (right side players)
            if (this.player2.y <= 0) this.player2.y = 0;
            else if (this.player2.y >= middleY - this.player2.height) this.player2.y = middleY - this.player2.height;
    
            if (this.player4.y <= middleY) this.player4.y = middleY;
            else if (this.player4.y >= this.canvas.height - this.player4.height) this.player4.y = this.canvas.height - this.player4.height;
    
            // Ball movement logic
            if (this._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = (this.turn === this.player1 || this.turn === this.player3) ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
    
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
    
            // Handle paddle collision with ball
            [this.player1, this.player3].forEach(player => {
                if (this.ball.x - this.ball.width <= player.x &&
                    this.ball.x >= player.x - player.width &&
                    this.ball.y <= player.y + player.height &&
                    this.ball.y + this.ball.height >= player.y) {
                        this.ball.x = (player.x + this.ball.width);
                        this.ball.moveX = DIRECTION.RIGHT;
                }
            });
    
            [this.player2, this.player4].forEach(player => {
                if (this.ball.x - this.ball.width <= player.x &&
                    this.ball.x >= player.x - player.width &&
                    this.ball.y <= player.y + player.height &&
                    this.ball.y + this.ball.height >= player.y) {
                        this.ball.x = (player.x - this.ball.width);
                        this.ball.moveX = DIRECTION.LEFT;
                }
            });
        }
    
        // Check for game end (score of 5 for team-based win)
        if (this.player1.score + this.player3.score === WINNING_SCORE) {
            this.over = true;
            setTimeout(() => { this.endGameMenu(`${player1Name} and ${player2Name} ` + translate('Win!')); }, 1000);
        } else if (this.player2.score + this.player4.score === WINNING_SCORE) {
            this.over = true;
            setTimeout(() => { this.endGameMenu(`${player3Name} and ${player4Name} ` + translate('Win!')); }, 1000);
        }
    },
    
    

    draw: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw background
      this.context.fillStyle = this.color;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      this.context.fillStyle = '#ffffff';
  
      // Draw each player paddle based on their updated initial positions
      this.context.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
      this.context.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
      this.context.fillRect(this.player3.x, this.player3.y, this.player3.width, this.player3.height);
      this.context.fillRect(this.player4.x, this.player4.y, this.player4.width, this.player4.height);
  
      // Draw the ball if turn delay is over
      if (this._turnDelayIsOver.call(this)) {
          this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
      }
  

        // Draw the net
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        // Draw scores
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';

        this.context.fillText(
          this.player1.score.toString(),
          (this.canvas.width / 2) - 300,
          200
        );

        this.context.fillText(
          this.player2.score.toString(),
          (this.canvas.width / 2) + 300,
          200
        );
      },

      loop: function () {
        const Pong = gameRef.current;
        Pong.update();
        Pong.draw();

        if (!Pong.over) requestAnimationFrame(Pong.loop);
      },

      listen: function () {
        const Pong = gameRef.current;
        
        const handleKeyDown = function (key) {
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
    
            // Player 1 controls (W and S keys)
            if (key.keyCode === 87) Pong.player1.move = DIRECTION.UP; // W key
            if (key.keyCode === 83) Pong.player1.move = DIRECTION.DOWN; // S key
    
            // Player 3 controls (Single quote ' and Slash / keys)
            if (key.keyCode === 222) Pong.player3.move = DIRECTION.UP; // ' key
            if (key.keyCode === 191) Pong.player3.move = DIRECTION.DOWN; // / key
    
            // Player 2 controls (8 and 2 on Numpad)
            if (key.keyCode === 104) Pong.player2.move = DIRECTION.UP; // Numpad 8
            if (key.keyCode === 98) Pong.player2.move = DIRECTION.DOWN; // Numpad 2

            // Player 4 controls (Up and Down arrow keys)
            if (key.keyCode === 38) Pong.player4.move = DIRECTION.UP; // Up arrow
            if (key.keyCode === 40) Pong.player4.move = DIRECTION.DOWN; // Down arrow
        };
    
        const handleKeyUp = function (key) {
            // Stop movement when keys are released
            if (key.keyCode === 87 || key.keyCode === 83) Pong.player1.move = DIRECTION.IDLE; // W or S released
            if (key.keyCode === 104 || key.keyCode === 98) Pong.player2.move = DIRECTION.IDLE; // Numpad 8 or 2 released
            if (key.keyCode === 222 || key.keyCode === 191) Pong.player3.move = DIRECTION.IDLE; // ' or / released
            if (key.keyCode === 38 || key.keyCode === 40) Pong.player4.move = DIRECTION.IDLE; // Up or Down arrow released
        };
    
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    },
    

      _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victor.score++;
      },

      _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);
      }
    };

    // Initialize the game
    const Pong = Object.assign({}, Game);
    gameRef.current = Pong;
    Pong.initialize();

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.over = true;
      }
    };
  }, [player1Name, player2Name]);

  return (
    <div className="pong-game">
      <canvas ref={canvasRef} style={{ background: BACKGROUND_COLOR }} />
    </div>
  );
}

export default TwoVsTwoGame;