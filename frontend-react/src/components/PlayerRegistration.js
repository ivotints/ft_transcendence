import React, { useState } from 'react';
import './PlayerRegistration.css'

function PlayerRegistration({ addPlayer, players }) {
  const [alias, setAlias] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddPlayer = () => {
    if (alias && !players.includes(alias)) {
      addPlayer(alias);
      setAlias('');
      setErrorMessage(''); // Clear any previous error message
    } else {
      setErrorMessage('Alias cannot be empty or already registered.');
    }
  };

  return (
    <div className="player-registration">
      <h2>Player Registration</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={alias} 
          onChange={(e) => setAlias(e.target.value)} 
          placeholder="Enter alias" 
          className="alias-input"
        />
        <button onClick={handleAddPlayer} className="add-button">Add Player</button>
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
