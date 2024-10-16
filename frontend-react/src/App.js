import './App.css';
import Header from './components/Header';
import AuthOptions from './components/AuthOptions';
import Profile from './components/Profile';
import Game from './components/Game';
import PlayerVsPlayer from './components/PlayerVsPlayer';
import PlayerVsAI from './components/PlayerVsAI';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Tournament from './components/Tournament';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <h1>Welcome to Pong Transcendence</h1>
              <AuthOptions />
            </>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/player-vs-player" element={<PlayerVsPlayer />} />
          <Route path="/game/player-vs-ai" element={<PlayerVsAI />} />
          <Route path="/tournament" element={<Tournament />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

