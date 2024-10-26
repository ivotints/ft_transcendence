// LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  // Check localStorage for saved language or use default 'en'
  const savedLanguage = localStorage.getItem('language') || 'en';
  const [language, setLanguage] = useState(savedLanguage);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);  // Save the selected language to localStorage
  };

  // Ensure language is loaded from localStorage when component mounts
  useEffect(() => {
    setLanguage(savedLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
