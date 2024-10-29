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
//const BACKGROUND_COLOR = '#8c52ff';
const BACKGROUND_COLOR = '#00cc00';

function PongGameWithAI() {
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

    const Ai = {
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

        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);

        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
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
          if (this.ball.x <= 0) this._resetTurn.call(this, this.ai, this.player);
          if (this.ball.x >= this.canvas.width - this.ball.width) this._resetTurn.call(this, this.player, this.ai);
          if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
          if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

          if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
          else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

          if (this._turnDelayIsOver.call(this) && this.turn) {
            this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
            this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
            this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
            this.turn = null;
          }

          if (this.player.y <= 0) this.player.y = 0;
          else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

          if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
          else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
          if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
          else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

          if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
            if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
            else this.ai.y -= this.ai.speed / 4;
          }
          if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
            if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
            else this.ai.y += this.ai.speed / 4;
          }

          if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
          else if (this.ai.y <= 0) this.ai.y = 0;

          if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
            if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
              this.ball.x = (this.player.x + this.ball.width);
              this.ball.moveX = DIRECTION.RIGHT;
            }
          }

          if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
            if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
              this.ball.x = (this.ai.x - this.ball.width);
              this.ball.moveX = DIRECTION.LEFT;
            }
          }
        }

        // Check for game end (score of 5)
        if (this.player.score === WINNING_SCORE) {
          this.over = true;
          setTimeout(() => { this.endGameMenu(translate('You won!')); }, 1000);
        } else if (this.ai.score === WINNING_SCORE) {
          this.over = true;
          setTimeout(() => { this.endGameMenu(translate('Game Over!')); }, 1000);

        }
      },

      draw: function () {
        this.context.clearRect(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );

        this.context.fillStyle = this.color;

        this.context.fillRect(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );

        this.context.fillStyle = '#ffffff';

        this.context.fillRect(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        );

        this.context.fillRect(
          this.ai.x,
          this.ai.y,
          this.ai.width,
          this.ai.height
        );

        if (this._turnDelayIsOver.call(this)) {
          this.context.fillRect(
            this.ball.x,
            this.ball.y,
            this.ball.width,
            this.ball.height
          );
        }

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
          this.player.score.toString(),
          (this.canvas.width / 2) - 300,
          200
        );

        this.context.fillText(
          this.ai.score.toString(),
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

          if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;
          if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        };

        const handleKeyUp = function (key) {
          Pong.player.move = DIRECTION.IDLE;
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
  }, []);

  return (
    <div className="pong-game">
      <canvas ref={canvasRef} style={{ background: BACKGROUND_COLOR }} />
    </div>
  );
}

export default PongGameWithAI;