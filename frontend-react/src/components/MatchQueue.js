import React from 'react';
import './MatchQueue.css';
import { useTranslate } from './Translate/useTranslate';

function MatchQueue({ matchQueue }) {
  const { translate } = useTranslate();
  return (
    <div className="match-queue">
      <h2>{translate("Upcoming Matches")}</h2>
      {matchQueue.length > 0 ? (
        <ul>
          {matchQueue.map((match, index) => (
            <li key={index}>{match}</li>
          ))}
        </ul>
      ) : (
        <p>{translate("No more matches scheduled.")}</p>
      )}
    </div>
  );
}

export default MatchQueue;
