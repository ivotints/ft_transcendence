import React, { useState } from 'react';
import './PlayerRegistration.css';
import { useTranslate } from './Translate/useTranslate';
import { useLanguage } from './Translate/LanguageContext';

function PlayerRegistration({ addPlayer, players }) {
  const [alias, setAlias] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const { translate } = useTranslate();
  const { language } = useLanguage();

  const handleAddPlayer = () => {
    if (alias && !players.includes(alias)) {
      addPlayer(alias);
      setAlias('');
      setErrorKey('');
    } else {
      setErrorKey('Alias cannot be empty or already registered.');
    }
  };

  const translatedErrorMessage = errorKey ? translate(errorKey) : '';

  return (
    <div className="player-registration">
      <h2>{translate('Player Registration')}</h2>
      <div className="input-group">
        <input  
          maxLength={16}
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder={translate('Enter alias')}
          className="alias-input"
          disabled={players.length >= 4}
        />
        <button
          onClick={handleAddPlayer}
          className={`add-button ${players.length >= 4 ? 'disabled' : ''}`}
          disabled={players.length >= 4}
        >
          {translate('Add Player')}
        </button>
      </div>
      {translatedErrorMessage && <p className="error-message">{translatedErrorMessage}</p>}
      <ul className="player-list">
        {players.map((player, index) => (
          <li key={index} className="player-item">{player}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerRegistration;