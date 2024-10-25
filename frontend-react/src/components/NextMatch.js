import React from 'react';
import { useTranslate } from './Translate/useTranslate';

function NextMatch({ onNextMatch }) {
  const { translate } = useTranslate();
  return (
    <div className="next-match">
      <button onClick={onNextMatch} className="submit-button">
      {translate("Next Match")}
      </button>
    </div>
  );
}

export default NextMatch;
