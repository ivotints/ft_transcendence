import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TwoVsTwoGame from './2vs2Game';
import './PlayerVsPlayer.css';
import { useTranslate } from './Translate/useTranslate';

function PlayerVsPlayer() {
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player3Name, setPlayer3Name] = useState('');
  const [player4Name, setPlayer4Name] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [error, setError] = useState('');
  const { translate } = useTranslate();

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('https://localhost:8000/profiles/me/', { withCredentials: true });
      const profile = response.data;
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

  const handleNameChange3 = (e) => {
    setPlayer3Name(e.target.value.slice(0, 100));
  };

  const handleNameChange4 = (e) => {
    setPlayer4Name(e.target.value.slice(0, 100));
  };

  const confirmName = () => {
    // Check if all names are filled in
    if (!player2Name.trim() || !player3Name.trim() || !player4Name.trim()) {
      setError(translate('All player names must be filled in.'));
    } 
    // Check for duplicate names
    else if (
      player2Name.trim() === player1Name.trim() || 
      player2Name.trim() === player3Name.trim() || 
      player2Name.trim() === player4Name.trim() || 
      player3Name.trim() === player4Name.trim() || 
      player3Name.trim() === player1Name.trim() || 
      player4Name.trim() === player1Name.trim()
    ) {
      setError(translate('Player names must be unique.'));
    } else {
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
    setPlayer3Name('');
    setPlayer4Name('');
    setIsNameConfirmed(false);
  };

  return (
    <div className="match-container">
      <h1 className="profileH2">{translate('Player vs Player Ping-Pong')}</h1>
      {!gameStarted ? (
        <div className="menu">


          {!isNameConfirmed ? (
            <div>
              <p>{translate('Provide player names for all players.')}</p>
              <table className="player-table">
                <tbody>
                  <tr>
                    <td>
                      <label>{translate('Team 1 Player 1')}</label>
                      <input
                        maxLength={32}
                        type="text"
                        value={player1Name}
                        readOnly
                        className="name-input read-only"
                        />
                    </td>
                    <td>
                      <label>{translate('Team 2 Player 1')}</label>
                      <input
                        type="text"
                        maxLength={32}
                        placeholder={translate("Enter Player 3 Name")}
                        value={player3Name}
                        onChange={handleNameChange3}
                        className="name-input"
                        />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>{translate('Team 1 Player 2')}</label>
                      <input
                        type="text"
                        maxLength={32}

                        placeholder={translate("Enter Player 2 Name")}
                        value={player2Name}
                        onChange={handleNameChange2}
                        className="name-input"
                        />
                    </td>
                    <td>
                      <label>{translate('Team 2 Player 2')}</label>
                      <input
                        type="text"
                        maxLength={32}
                        placeholder={translate("Enter Player 4 Name")}
                        value={player4Name}
                        onChange={handleNameChange4}
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
      <p>{translate('Player 1: W and S')}</p>
    </div>
    <div className="table-row">
      <p>{player2Name}</p>
      <p>{translate('Player 2: \' and /')}</p>
    </div>
    <div className="table-row">
      <p>{player3Name}</p>
      <p>{translate('Player 3: Up and Down')}</p>
    </div>
    <div className="table-row">
      <p>{player4Name}</p>
      <p>{translate('Player 4: 8 and 2')}</p>
    </div>
  </div>
  
  <button onClick={startGame} className="start-button">{translate('Start Game')}</button>
</div>



          )}
        </div>
      ) : (
        <div>
          <TwoVsTwoGame
            player1Name={player1Name}
            player2Name={player2Name}
            player3Name={player3Name}
            player4Name={player4Name}
          />
          <button onClick={resetGame} className="reset-button">{translate('Reset Game')}</button>
        </div>
      )}
    </div>
  );
}

export default PlayerVsPlayer;
