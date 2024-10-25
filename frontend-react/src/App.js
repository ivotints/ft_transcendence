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
import { refreshToken } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('https://localhost:8000/check-login/', {
        withCredentials: true,
      });
  
      if (response.status === 200) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus(); // Check login status on component mount
    const intervalId = setInterval(checkLoginStatus, 1 * 60 * 1000); // Check every 1 minute minus 100 ms
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array

  useEffect(() => {
    refreshToken();
    const interval = setInterval(refreshToken, 1 * 60 * 1000 - 100); // Refresh token every 1 minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, isLoading, navigate]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator while checking login status
  }

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
          <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<Game />} />
            <Route path="/game/player-vs-player" element={<PlayerVsPlayer />} />
            <Route path="/game/player-vs-ai" element={<PlayerVsAI />} />
            <Route path="/tournament" element={<Tournament />} />
          </Route>
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