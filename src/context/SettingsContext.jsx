import { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext(null);

export const LANGUAGES = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  mr: 'मराठी',
  pa: 'ਪੰਜਾਬੀ',
  hr: 'हरियाणवी',
  bn: 'বাংলা',
  or: 'ଓଡ଼ିଆ'
};

export const SettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('agri_fontsize') || 'normal';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agri_language') || 'en';
  });

  useEffect(() => {
    if (fontSize === 'small') {
      document.documentElement.style.fontSize = '14px';
    } else if (fontSize === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
    localStorage.setItem('agri_fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('agri_language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
  };

  return (
    <SettingsContext.Provider value={{ fontSize, changeFontSize, language, changeLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
