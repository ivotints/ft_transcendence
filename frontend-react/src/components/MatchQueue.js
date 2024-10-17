import React from 'react';
import './MatchQueue.css';

function MatchQueue({ matchQueue }) {
  return (
    <div className="match-queue">
      <h2>Upcoming Matches</h2>
      {matchQueue.length > 0 ? (
        <ul>
          {matchQueue.map((match, index) => (
            <li key={index}>{match}</li>
          ))}
        </ul>
      ) : (
        <p>No more matches scheduled.</p>
      )}
    </div>
  );
}

export default MatchQueue;
