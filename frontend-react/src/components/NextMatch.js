import React from 'react';
import { useTranslate } from './Translate/useTranslate';

function NextMatch({ onPlayGame }) {
  const { translate } = useTranslate();
  return (
    <div className="next-match">
      <button onClick={onPlayGame} className="submit-button">
        {translate("Play Game")}
      </button>
    </div>
  );
}

export default NextMatch;