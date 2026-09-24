import { useTranslation } from './context';

export function LegalOriginalNote() {
  const { language, t } = useTranslation();
  return language === 'de' ? null : <p className="analysis-note">{t('Diese rechtlichen Informationen werden in der maßgeblichen deutschen Originalfassung angezeigt.')}</p>;
}
