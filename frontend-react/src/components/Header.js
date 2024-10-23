import React, { useState } from 'react';
import { Link } from 'react-router-dom';
//import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import './Header.css';

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  //const { t, i18n } = useTranslation(); // Destructure t (translate function) and i18n instance

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const changeLanguage = (language) => {
    //i18n.changeLanguage(language); // Change the language
    //setDropdownOpen(false); // Close the dropdown after changing the language
  };

  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
{/*           <li className="nav-item"><Link to="/">{t('home')}</Link></li>
          <li className="nav-item"><Link to="/profile">{t('profile')}</Link></li>
          <li className="nav-item"><Link to="/game">{t('game')}</Link></li>
          <li className="nav-item"><Link to="/tournament">{t('tournament')}</Link></li> */}
          <li className="nav-item"><Link to="/">Home</Link></li>
          <li className="nav-item"><Link to="/profile">Profile</Link></li>
          <li className="nav-item"><Link to="/game">Game</Link></li>
          <li className="nav-item"><Link to="/tournament">Tournament</Link></li>
        </ul>
        <div className="language-dropdown">
          <button className="dropdown-button" onClick={toggleDropdown}>
          {/* {t('language')} */}
          <b>language</b>
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

