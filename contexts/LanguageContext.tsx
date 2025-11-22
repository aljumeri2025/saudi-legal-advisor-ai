import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to browser language or 'ar'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'ar' || saved === 'en') return saved;
    
    const browserLang = navigator.language;
    return browserLang.startsWith('ar') ? 'ar' : 'en';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  // Update HTML dir/lang attributes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Update Tailwind helper classes if needed, or rely on logical properties
    if (dir === 'rtl') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
    } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};