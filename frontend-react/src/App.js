import './App.css';
import Header from './components/Header';
import AuthOptions from './components/AuthOptions';
import GameOptions from './components/GameOptions';
import Profile from './components/Profile';
import Game from './components/Game';
import PlayerVsPlayer from './components/PlayerVsPlayer';
import PlayerVsAI from './components/PlayerVsAI';
import Tournament from './components/Tournament';
import TournamentGame from './components/TournamentGame';
import WinTable from './components/WinTable';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LanguageProvider } from './components/Translate/LanguageContext';  // Import LanguageProvider
import { useTranslate } from './components/Translate/useTranslate';
// import { refreshToken } from './utils/auth';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { translate } = useTranslate();
  const checkLoginIntervalRef = useRef(null);
  const refreshTokenIntervalRef = useRef(null);

  // const checkLoginStatus = async () => {
  //   try {
  //     const response = await axios.get('https://localhost:8000/check-login/', {
  //       withCredentials: true,
  //     });
  
  //     if (response.status === 200) {
  //       setIsLoggedIn(true);
  //     } else {
  //       setIsLoggedIn(false);
  //     }
  //   } catch (error) {
  //     setIsLoggedIn(false);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const refreshToken = async () => {
    try {
      const response = await axios.post('https://localhost:8000/token/refresh/', {}, {
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log('Token refreshed successfully');
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  useEffect(() => {
    const initializeIntervals = async () => {
      await refreshToken();
      // await sleep(1000);
      // await checkLoginStatus();

      refreshTokenIntervalRef.current = setInterval(refreshToken, 60 * 1000);
      // await sleep(1000);
      // checkLoginIntervalRef.current = setInterval(checkLoginStatus, 60 * 1000);
    };

    initializeIntervals();

    return () => {
      clearInterval(refreshTokenIntervalRef.current);
      // clearInterval(checkLoginIntervalRef.current);
    };
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
    return <div>{translate("Loading")}...</div>; // Show loading indicator while checking login status
  }

  return (
      <div className="App">
        {isLoggedIn && <Header />}
        <Routes>
          <Route path="/" element={
            !isLoggedIn ? (
              <>
                <h1 className="profileH2">{translate('Welcome to Pong Transcendence')}</h1>
                <AuthOptions onLoginSuccess={handleLoginSuccess} />
              </>
            ) : (
              <>
                <h1 className="profileH2">{translate('Choose Your Game Option')}</h1>
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
            <Route path="/tournament-game" element={<TournamentGame />} />
            <Route path="/win-table" element={<WinTable />} />
          </Route>
        </Routes>
      </div>
  );
}

const AppWrapper = () => (
  <LanguageProvider>
    <Router>
      <App />
    </Router>
  </LanguageProvider>
);

export default AppWrapper;