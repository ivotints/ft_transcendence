import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import axios from 'axios';
import { useTranslate } from './Translate/useTranslate';
import { useLanguage } from './Translate/LanguageContext';  // Import useLanguage

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { translate } = useTranslate();  // Get the translation function
  const { changeLanguage } = useLanguage();  // Get the changeLanguage function from context

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);  // Toggle dropdown state
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);  // Change the language
    setDropdownOpen(false);  // Close the dropdown
  };

  const handleLogout = async () => {
    try {
      await axios.post('https://localhost:8000/logout/', {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">{translate('Home')}</Link></li>
          <li className="nav-item"><Link to="/profile">{translate('Profile')}</Link></li>
          <li className="nav-item"><Link to="/game">{translate('Game')}</Link></li>
          <li className="nav-item"><Link to="/tournament">{translate('Tournament')}</Link></li>
        </ul>
        <div className="language-dropdown">
          <button className="dropdown-button" onClick={toggleDropdown}>
            <b>{translate('Language')}</b>
          </button>
          {dropdownOpen && (
            <ul className="dropdown-menu">
              <li><button onClick={() => handleLanguageChange('en')}>EN</button></li>
              <li><button onClick={() => handleLanguageChange('ru')}>RU</button></li>
              <li><button onClick={() => handleLanguageChange('cz')}>CZ</button></li>
            </ul>
          )}
        </div>

        <div className="logout">
          <button className="dropdown-button" onClick={handleLogout}>
            <b>{translate('Log out')}</b>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
