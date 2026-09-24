import { Globe2 } from 'lucide-react';
import { useTranslation } from './context';
import { isLanguage, languageNames, languages } from './core';

export function LanguageSelect() {
  const { language, setLanguage, t } = useTranslation();
  return <label className="language-select"><Globe2 size={16} aria-hidden="true" /><span className="sr-only">{t('Sprache')}</span><select value={language} onChange={event => { if (isLanguage(event.target.value)) setLanguage(event.target.value); }} aria-label={t('Sprache')}>
    {languages.map(code => <option key={code} value={code} lang={code}>{languageNames[code]}</option>)}
  </select></label>;
}
