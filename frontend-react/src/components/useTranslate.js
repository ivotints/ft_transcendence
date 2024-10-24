// useTranslate.js
import translations from './translations.json';
import { useLanguage } from './LanguageContext';

export const useTranslate = () => {
  const { language } = useLanguage();  // Get language from context

  const translate = (word) => {
    return translations[language]?.[word] || word;
  };

  return { translate };
};
