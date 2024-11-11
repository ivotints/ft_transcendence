import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WinTable.css';
import { useTranslate } from './Translate/useTranslate';

function WinTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const { players = [], scores = {} } = location.state || {};
  const [user, setUser] = useState(null);
  const { translate } = useTranslate();

  // Sort players by score (descending), handling ties randomly
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = scores[a] || 0;
    const scoreB = scores[b] || 0;
    if (scoreB === scoreA) {
      // Randomize order if scores are tied
      return Math.random() - 0.5;
    }
    return scoreB - scoreA;
  });

  // Hardcode positions 1 through 4
  const rankedPlayers = sortedPlayers.slice(0, 4).map((player, index) => ({
    name: player,
    score: scores[player] || 0,
    position: index + 1 // Hardcoded positions 1, 2, 3, 4
  }));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get('/api/profiles/me/', { withCredentials: true });
        setUser(userResponse.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      const resultsPosted = sessionStorage.getItem('resultsPosted');
      if (!resultsPosted) {
        const postResults = async () => {
          try {
            const winners_order = rankedPlayers.map(player => player.name);

            const response = await axios.post('/api/tournaments/', {
              owner: user.id,
              winners_order: winners_order
            }, {
              withCredentials: true
            });
            console.log('Results posted successfully:', response.data);
            // Set the flag in sessionStorage to indicate that the results have been posted
            sessionStorage.setItem('resultsPosted', 'true');
          } catch (error) {
            console.error('Error posting results:', error);
          }
        };

        postResults();
      }
    }
  }, [user, rankedPlayers]);

  const handleRestart = () => {
    // Clear state and sessionStorage, then navigate to the tournament screen
    sessionStorage.clear();
    navigate('/tournament');
  };

  return (
    <div>
      <h1 className="profileH2">{translate("Final standings were determined by your score and performance!")}</h1>
      <div className="win-table-wrapper">
        <h1 className="win-table-title">{translate("Final Standings")}</h1>
        <div className="win-table-content">
          <table className="win-table">
            <thead>
              <tr>
                <th>{translate("Position")}</th>
                <th>{translate("Player")}</th>
                <th>{translate("Score")}</th>
              </tr>
            </thead>
            <tbody>
              {rankedPlayers.map((player, index) => (
                <tr key={index}>
                  <td>{player.position}</td>
                  <td>{player.name}</td>
                  <td>{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="win-table-restart-button" onClick={handleRestart}>{translate("Start New Tournament")}</button>
        </div>
      </div>
    </div>
  );
}

export default WinTable;