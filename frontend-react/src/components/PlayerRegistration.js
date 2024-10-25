import React, { useState } from 'react';
import './PlayerRegistration.css'
import { useTranslate } from './Translate/useTranslate';


function PlayerRegistration({ addPlayer, players }) {
  const [alias, setAlias] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { translate } = useTranslate();  // Get the translation function

  const handleAddPlayer = () => {
    if (alias && !players.includes(alias)) {
      addPlayer(alias);
      setAlias('');
      setErrorMessage(''); // Clear any previous error message
    } else {
      setErrorMessage(translate('Alias cannot be empty or already registered.'));
    }
  };

  return (
    <div className="player-registration">
      <h2>{translate('Player Registration')}</h2>
      <div className="input-group">
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder={translate('Enter alias')}
          className="alias-input"
        />
        <button onClick={handleAddPlayer} className="add-button">{translate('Add Player')}</button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <ul className="player-list">
        {players.map((player, index) => (
          <li key={index} className="player-item">{player}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerRegistration;
