import { useTranslation } from '../../i18n/context';

export function EthicalReflection() {
  const { t } = useTranslation();
  return <section className="ethical-reflection">
    <span className="eyebrow">{t('Verantwortung')}</span>
    <h2>{t('Daten nutzen. Grenzen mitdenken.')}</h2>
    <p>{t('Die Web-App verarbeitet aggregierte Zählwerte und Zeitstempel statt personenbezogener Identifikation. Der verwendete Datensatz enthält keine Bilder oder individuellen Kennungen; Gesichtserkennung und individuelle Bewegungsprofile sind kein Bestandteil dieser Auswertung. Die technischen Verbindungen zu Hosting-, Daten- und Kartenanbietern sind im Datenschutz beschrieben.')}</p>
    <p>{t('Sensorzählungen können ungenau sein. Ohne unabhängige Referenzmessung lässt sich ihre Genauigkeit hier nicht beziffern. Der kurze abgeschlossene Messzeitraum ist nicht repräsentativ für alle Semester, Veranstaltungen oder Betriebsbedingungen.')}</p>
    <p>{t('Prognosen können Entscheidungen über Besuchszeiten beeinflussen und dadurch das Verhalten verändern, auf dem sie beruhen. Der historische Replay zeigt einen begrenzten Vergleich und ist keine Zusage für die heutige Auslastung.')}</p>
    <p>{t('Die Karte unterstützt die Orientierung. Geschätzte Gebäudehöhen, fehlende Innenwege und nicht bestätigte Barrierefreiheit oder Sperrungen begrenzen ihre Aussagekraft. Vor Ort haben Beschilderung und verlässliche Informationen zur Zugänglichkeit Vorrang.')}</p>
  </section>;
}
