import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CowboyGame from './CowboyGame';
import './PlayerVsPlayer';
import { useTranslate } from './Translate/useTranslate';

function Cowboy() {
  const [gameStarted, setGameStarted] = useState(false);
  const [profile, setProfile] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [error, setError] = useState('');
  const { translate } = useTranslate();

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/profiles/me/', { withCredentials: true });
      const profile = response.data;
      setProfile(profile);
      setPlayer1Name(profile.user.username);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleNameChange2 = (e) => {
    setPlayer2Name(e.target.value.slice(0, 100));
  };

  const confirmName = () => {
    if (!player2Name.trim()) {
      setError(translate('All player names must be filled in.'));
    }
    else {
      setError('');
      setIsNameConfirmed(true);
    }
  };

  const startGame = () => {
    if (isNameConfirmed) {
      setGameStarted(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayer2Name('');
    setIsNameConfirmed(false);
  };

  return (
    <div className="match-container">
      <h1 className="profileH2">{translate('Cowboy Game')}</h1>
      {!gameStarted ? (
        <div className="menu">


          {!isNameConfirmed ? (
            <div>
              <p>{translate('Provide player name for 2nd player.')}</p>
              <table className="player-table">
                <tbody>
                  <tr>
                    <td>
                      <label>{translate('Player')} 1</label>
                      <input
                        maxLength={32}
                        type="text"
                        value={player1Name}
                        readOnly
                        className="name-input read-only"
                      />
                    </td>
                    <td>
                      <label>{translate('Player')} 2</label>
                      <input
                        type="text"
                        maxLength={32}
                        placeholder={translate("Player 2 Name")}
                        value={player2Name}
                        onChange={handleNameChange2}
                        className="name-input"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {error && <p className="error-message">{error}</p>}
              <button onClick={confirmName} className="confirm-button">{translate('Confirm')}</button>
            </div>
          ) : (
            <div className="instructions">
              <p className="start-text">{translate('Click Start when you are ready!')}</p>

              <div className="table">
                <div className="table-row">
                  <p>{player1Name}</p>
                  <p>{translate('Player')} 1: W</p>
                </div>
                <div className="table-row">
                  <p>{player2Name}</p>
                  <p>{translate('Player')} 2: {translate("Up")}</p>
                </div>
              </div>

              <button onClick={startGame} className="start-button">{translate('Start Game')}</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <CowboyGame
            player1={profile.user}
            player2Name={player2Name}
          />
          <button onClick={resetGame} className="reset-button">{translate('Reset Game')}</button>
        </div>
      )}
    </div>
  );
}

export default Cowboy;
