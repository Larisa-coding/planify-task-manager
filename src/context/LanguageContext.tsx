import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, translations } from '../i18n/translations';

type AnyTranslation = typeof translations.ru;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: AnyTranslation;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ru',
  setLanguage: () => {},
  t: translations.ru as AnyTranslation,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'ru' || saved === 'en') ? saved : 'ru';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  const t = translations[language] as AnyTranslation;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
