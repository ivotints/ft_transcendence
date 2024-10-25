// LanguageContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the LanguageContext
const LanguageContext = createContext();

// Custom hook to use the LanguageContext
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// LanguageProvider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const changeLanguage = (lang) => setLanguage(lang);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
