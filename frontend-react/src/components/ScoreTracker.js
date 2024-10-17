import React from 'react';
import './ScoreTracker.css';

function ScoreTracker({ scores }) {
  return (
    <div className="score-tracker">
      <h2>Scores</h2>
      <ul>
        {Object.keys(scores).map((player, index) => (
          <li key={index}>
            <span>{player}</span>
            <span className="points">{scores[player]} points</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreTracker;
