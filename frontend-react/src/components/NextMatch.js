import React from 'react';

function NextMatch({ onNextMatch }) {
  return (
    <div className="next-match">
      <button onClick={onNextMatch} className="submit-button">
        Next Match
      </button>
    </div>
  );
}

export default NextMatch;
