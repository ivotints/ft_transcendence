// PongGameWithAI.js
import React, { useRef, useEffect, useState } from 'react';
import './PongGameWithAI.css';

function PongGameWithAI() {
  const canvasRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballSize = 10;

  const paddleSpeed = 6;
  const aiPaddleSpeed = 4;
  const ballSpeed = 5;

  const playerPaddle = { x: 20, y: 150, speedY: 0 };
  const aiPaddle = { x: 470, y: 150 };
  const ball = { x: 250, y: 200, speedX: ballSpeed, speedY: ballSpeed };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const keyDownHandler = (e) => {
      if (e.key === 'w') playerPaddle.speedY = -paddleSpeed;
      if (e.key === 's') playerPaddle.speedY = paddleSpeed;
    };

    const keyUpHandler = (e) => {
      if (e.key === 'w' || e.key === 's') playerPaddle.speedY = 0;
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw paddles
      context.fillStyle = 'white';
      context.fillRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight);
      context.fillRect(aiPaddle.x, aiPaddle.y, paddleWidth, paddleHeight);

      // Draw ball
      context.fillRect(ball.x, ball.y, ballSize, ballSize);

      // Move player paddle
      playerPaddle.y += playerPaddle.speedY;
      playerPaddle.y = Math.max(Math.min(playerPaddle.y, canvas.height - paddleHeight), 0);

      // Move AI paddle
      if (ball.y > aiPaddle.y + paddleHeight / 2) {
        aiPaddle.y += aiPaddleSpeed;
      } else if (ball.y < aiPaddle.y + paddleHeight / 2) {
        aiPaddle.y -= aiPaddleSpeed;
      }
      aiPaddle.y = Math.max(Math.min(aiPaddle.y, canvas.height - paddleHeight), 0);

      // Move ball
      ball.x += ball.speedX;
      ball.y += ball.speedY;

      // Ball collision with top and bottom walls
      if (ball.y <= 0 || ball.y >= canvas.height - ballSize) {
        ball.speedY *= -1;
      }

      // Ball collision with player paddle
      if (
        ball.x <= playerPaddle.x + paddleWidth &&
        ball.y + ballSize > playerPaddle.y &&
        ball.y < playerPaddle.y + paddleHeight
      ) {
        ball.speedX *= -1;
      }

      // Ball collision with AI paddle
      if (
        ball.x + ballSize >= aiPaddle.x &&
        ball.y + ballSize > aiPaddle.y &&
        ball.y < aiPaddle.y + paddleHeight
      ) {
        ball.speedX *= -1;
      }

      // Ball out of bounds (scoring)
      if (ball.x < 0) {
        setAiScore((prev) => prev + 1);
        resetBall();
      } else if (ball.x > canvas.width) {
        setPlayerScore((prev) => prev + 1);
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
      <h2>Player vs AI</h2>
      <div className="score">
        <p>Player Score: {playerScore}</p>
        <p>AI Score: {aiScore}</p>
      </div>
      <canvas ref={canvasRef} width="500" height="400" className="pong-canvas" />
    </div>
  );
}

export default PongGameWithAI;
