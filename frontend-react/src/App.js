import './App.css';
import Header from './components/Header';
import AuthOptions from './components/AuthOptions';
import GameOptions from './components/GameOptions';
import Profile from './components/Profile';
import Game from './components/Game';
import PlayerVsPlayer from './components/PlayerVsPlayer';
import PlayerVsAI from './components/PlayerVsAI';
import Tournament from './components/Tournament';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LanguageProvider } from './components/Translate/LanguageContext';  // Import LanguageProvider

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('https://localhost:8000/check-login/', {
        withCredentials: true,
      });

      if (response.status !== 200) {
        setIsLoggedIn(false);
        navigate('/'); // Redirect to the base window with login options
      }
    } catch (error) {
      setIsLoggedIn(false);
      navigate('/'); // Redirect to the base window with login options
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkLoginStatus, 600000); // Check every 10 minutes
    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <LanguageProvider>
      <div className="App">
        {isLoggedIn && <Header />}
        <Routes>
          <Route path="/" element={
            !isLoggedIn ? (
              <>
                <h1>Welcome to Pong Transcendence</h1>
                <AuthOptions onLoginSuccess={handleLoginSuccess} />
              </>
            ) : (
              <>
                <h1>Choose Your Game Option</h1>
                <GameOptions />
              </>
            )
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/player-vs-player" element={<PlayerVsPlayer />} />
          <Route path="/game/player-vs-ai" element={<PlayerVsAI />} />
          <Route path="/tournament" element={<Tournament />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
