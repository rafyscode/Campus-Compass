import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext } from './context';
import { LANGUAGE_STORAGE_KEY, readLanguage } from './core';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(readLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Storage is optional. */ }
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
