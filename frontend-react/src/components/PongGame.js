// PongGame.js
import React, { useRef, useEffect, useState } from 'react';
import './PongGame.css';

function PongGame() {
  const canvasRef = useRef(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');

  // Paddle and Ball settings
  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballSize = 10;
  
  const paddleSpeed = 6;
  const ballSpeed = 5;

  // Paddle and Ball positions and speeds
  const player1 = { x: 20, y: 150, speedY: 0 };
  const player2 = { x: 470, y: 150, speedY: 0 };
  const ball = { x: 250, y: 200, speedX: ballSpeed, speedY: ballSpeed };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const keyDownHandler = (e) => {
      if (e.key === 'w') player1.speedY = -paddleSpeed;
      if (e.key === 's') player1.speedY = paddleSpeed;
      if (e.key === 'ArrowUp') player2.speedY = -paddleSpeed;
      if (e.key === 'ArrowDown') player2.speedY = paddleSpeed;
    };

    const keyUpHandler = (e) => {
      if (e.key === 'w' || e.key === 's') player1.speedY = 0;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player2.speedY = 0;
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    const draw = () => {
      if (gameOver) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw paddles
      context.fillStyle = 'white';
      context.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
      context.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);

      // Draw ball
      context.fillRect(ball.x, ball.y, ballSize, ballSize);

      // Move paddles
      player1.y += player1.speedY;
      player2.y += player2.speedY;

      // Paddle boundaries
      player1.y = Math.max(Math.min(player1.y, canvas.height - paddleHeight), 0);
      player2.y = Math.max(Math.min(player2.y, canvas.height - paddleHeight), 0);

      // Move ball
      ball.x += ball.speedX;
      ball.y += ball.speedY;

      // Ball collision with top and bottom walls
      if (ball.y <= 0 || ball.y >= canvas.height - ballSize) {
        ball.speedY *= -1;
      }

      // Ball collision with paddles
      if (
        ball.x <= player1.x + paddleWidth &&
        ball.y + ballSize > player1.y &&
        ball.y < player1.y + paddleHeight
      ) {
        ball.speedX *= -1;
      }
      if (
        ball.x + ballSize >= player2.x &&
        ball.y + ballSize > player2.y &&
        ball.y < player2.y + paddleHeight
      ) {
        ball.speedX *= -1;
      }

      // Ball out of bounds (scoring)
      if (ball.x < 0) {
        setPlayer2Score((prev) => prev + 1);
        resetBall();
      } else if (ball.x > canvas.width) {
        setPlayer1Score((prev) => prev + 1);
        resetBall();
      }
    };

    const resetBall = () => {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.speedX *= -1;
    };

    const gameLoop = setInterval(draw, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, []);

  return (
    <div className="pong-game">
      <h1>Ping-Pong Game</h1>
      <div className="score">
        <p>Player 1: {player1Score}</p>
        <p>Player 2: {player2Score}</p>
      </div>
      <canvas ref={canvasRef} width="500" height="400" className="pong-canvas" />
    </div>
  );
}

export default PongGame;
