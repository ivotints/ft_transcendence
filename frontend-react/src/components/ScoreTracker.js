import React from 'react';
import './ScoreTracker.css';
import { useTranslate } from './Translate/useTranslate';

function ScoreTracker({ scores }) {
  const { translate } = useTranslate();
  return (
    <div className="score-tracker">
      <h2>{translate("Scores")}</h2>
      <ul>
        {Object.keys(scores).map((player, index) => (
          <li key={index}>
            <span>{player}</span>
            <span className="points">{scores[player]} {translate("points")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreTracker;