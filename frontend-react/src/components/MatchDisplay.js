import React from 'react';
import './MatchDisplay.css';

function MatchDisplay({ match }) {
  return (
    <div className="match-display">
      <h2>Current Match</h2>
      {match ? (
        <p>{match}</p>
      ) : (
        <p className="no-match">No matches yet.</p>
      )}
    </div>
  );
}

export default MatchDisplay;

