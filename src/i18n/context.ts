import { createContext, useContext, useMemo } from 'react';
import { locales, translate, type Language, type Variables } from './core';

export const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: 'de', setLanguage: () => undefined });
export function useTranslation() {
  const { language, setLanguage } = useContext(LanguageContext);
  return useMemo(() => {
    const locale = locales[language];
    const number = (value: number, digits = 0) => value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return {
      language, setLanguage, locale,
      t: (source: string, variables?: Variables) => translate(language, source, variables),
      number,
      percent: (value: number, digits = 1) => number(value, digits) + ' %',
      date: (value: string | number, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) => new Date(value).toLocaleDateString(locale, { ...options, timeZone: 'Europe/Berlin' }),
      dateTime: (value: string | Date) => new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)),
    };
  }, [language, setLanguage]);
}
