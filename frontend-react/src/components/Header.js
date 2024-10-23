import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

var Language = "en";

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const changeLanguage = (lang) => {
      Language = lang;
  };

  const translate = (word) => {
    if (Language == 'ru')
    {
      if (word == 'Home')
        return ("Дом");
      if (word == "Profile")
        return ("Профиль");
      if (word == "Game")
        return ("Игра");
      if (word == "Tournament")
        return ("Турнир");
      if (word == "Language")
        return ("Язык");
    };
    if (Language == 'cz')
      {
        if (word == 'Home')
          return ("Dům");
        if (word == "Profile")
          return ("Profil");
        if (word == "Game")
          return ("Hra");
        if (word == "Tournament")
          return ("Turnaj");
        if (word == "Language")
          return ("Jazyk");
      };
    return (word);
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
              <li><button onClick={() => changeLanguage('en')}>EN</button></li>
              <li><button onClick={() => changeLanguage('ru')}>RU</button></li>
              <li><button onClick={() => changeLanguage('cz')}>CZ</button></li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

