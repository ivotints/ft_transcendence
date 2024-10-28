import React from 'react';
import './MatchDisplay.css';
import { useTranslate } from './Translate/useTranslate';


function MatchDisplay({ match }) {
  const { translate } = useTranslate();
  return (
    <div className="match-display">
      <h2>{translate("Current Match")}</h2>
      {match !== "No more matches scheduled." ? (
        <p>{match}</p>
      ) : (
        <p className="no-match">{translate("No matches yet.")}</p>
      )}
    </div>
  );
}

export default MatchDisplay;

