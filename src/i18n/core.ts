import catalog from './messages.json';

export const languages = ['de', 'en', 'es', 'fr'] as const;
export type Language = typeof languages[number];
export const languageNames: Record<Language, string> = { de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français' };
export const locales: Record<Language, string> = { de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR' };
export const LANGUAGE_STORAGE_KEY = 'cc-language';
export type Variables = Record<string, string | number>;
export function isLanguage(value: unknown): value is Language { return languages.some(language => language === value); }
export function readLanguage(): Language {
  try { const value = localStorage.getItem(LANGUAGE_STORAGE_KEY); return isLanguage(value) ? value : 'de'; }
  catch { return 'de'; }
}
const messages: Record<string, Partial<Record<Language, string>>> = catalog;
export function translate(language: Language, source: string, variables: Variables = {}): string {
  const key = source.trim();
  const translated = language === 'de' ? key : messages[key]?.[language] || key;
  const text = source.slice(0, source.indexOf(key)) + translated + source.slice(source.indexOf(key) + key.length);
  return text.replace(/\{(\w+)\}/g, (match, name: string) => variables[name] === undefined ? match : String(variables[name]));
}
