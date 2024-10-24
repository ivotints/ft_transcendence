import React, { createContext, useContext, useState } from 'react';

// Create the context
const LanguageContext = createContext();

// Custom hook to use the LanguageContext
export const useLanguage = () => useContext(LanguageContext);

// Language provider to wrap the app and provide language state
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang) => {
    setLanguage(lang); // Updates the language
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
