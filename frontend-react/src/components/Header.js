import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">Home</Link></li>
          <li className="nav-item"><Link to="/profile">Profile</Link></li>
          <li className="nav-item"><Link to="/game">Game</Link></li>
          <li className="nav-item"><Link to="/tournament">Tournament</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
