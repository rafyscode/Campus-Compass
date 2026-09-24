import { afterEach, describe, expect, it, vi } from 'vitest';
import messages from './messages.json';
import { isLanguage, LANGUAGE_STORAGE_KEY, readLanguage, translate } from './core';

afterEach(() => vi.unstubAllGlobals());
describe('language preferences and German fallback', () => {
  it('uses German when storage is absent, invalid or inaccessible', () => {
    for (const stored of [null, 'it', 'EN', '']) {
      vi.stubGlobal('localStorage', { getItem: () => stored });
      expect(readLanguage()).toBe('de');
    }
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Storage blocked'); } });
    expect(readLanguage()).toBe('de');
  });
  it.each(['de', 'en', 'es', 'fr'] as const)('restores the explicit %s choice', language => {
    const getItem = vi.fn(() => language);
    vi.stubGlobal('localStorage', { getItem });
    expect(readLanguage()).toBe(language);
    expect(getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
    expect(isLanguage(language)).toBe(true);
  });
  it('preserves German source text, whitespace and unknown messages', () => {
    expect(translate('de', ' Öffnungszeiten ')).toBe(' Öffnungszeiten ');
    expect(translate('fr', ' Noch nicht übersetzter Text ')).toBe(' Noch nicht übersetzter Text ');
    expect(translate('en', '')).toBe('');
    expect(translate('es', '   ')).toBe('   ');
  });
  it('changes labels without changing interpolated values', () => {
    expect(translate('en', 'Sensordaten konnten nicht geladen werden ({status}).', { status: 503 })).toContain('503');
    expect(translate('en', 'Sprache')).toBe('Language');
    expect(translate('es', 'Sprache')).toBe('Idioma');
    expect(translate('fr', 'Sprache')).toBe('Langue');
  });
  it('provides all three translations and preserves every placeholder', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    for (const [source, translations] of Object.entries(messages)) {
      for (const language of ['en', 'es', 'fr'] as const) {
        expect(translations[language]?.trim(), `${source}: ${language}`).toBeTruthy();
        expect(placeholders(translations[language]), `${source}: ${language}`).toEqual(placeholders(source));
      }
    }
  });
});
