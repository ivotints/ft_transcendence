import React, { useState } from 'react';
import './PlayerRegistration.css';
import { useTranslate } from './Translate/useTranslate';
import { useLanguage } from './Translate/LanguageContext';

function PlayerRegistration({ addPlayer, players }) {
  const [alias, setAlias] = useState('');
  const [errorKey, setErrorKey] = useState('');  // Store only the error key
  const { translate } = useTranslate();
  const { language } = useLanguage();  // Access current language to trigger re-render on change

  const handleAddPlayer = () => {
    if (alias && !players.includes(alias)) {
      addPlayer(alias);
      setAlias('');
      setErrorKey('');  // Clear error key on successful add
    } else {
      setErrorKey('Alias cannot be empty or already registered.');
    }
  };

  // Derived variable to translate the error message based on the current language
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
        />
        <button onClick={handleAddPlayer} className="add-button">{translate('Add Player')}</button>
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
