import { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { CampusMap } from '../digital-twin/components/CampusMap';
import { DataSourceBadge } from '../components/dashboard/DataSourceBadge';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { useCampusData } from '../hooks/useCampusData';
import { useTranslation } from '../i18n/context';

export default function CampusPage() {
  const { t } = useTranslation();
  const { data, loading, error, refresh } = useCampusData();
  const [forecastIndex, setForecastIndex] = useState(0);
  if (error) return <div className="content"><ErrorState message={error} onRetry={() => void refresh()} /></div>;
  if (loading || !data) return <div className="content"><LoadingSkeleton /></div>;
  const point = forecastIndex > 0 ? data.forecast[forecastIndex - 1] : undefined;
  const displayed = point ? { ...data.current, percent: point.predictedPercent, count: null, confidence: point.confidence } : data.current;
  const minute = point?.horizonMinutes ?? 0;
  return (
    <div className="content page-stack campus-page-content">
      <PageHeader eyebrow={t("Smart Campus · Digital Twin")} title={t("Dein Campus. In einer neuen Perspektive.")}
        description={t("Entdecke den Zentralen Campus in 3D: Gebäude suchen, zwischen Karte und Luftbild wechseln und die Mensa-Auslastung im Blick behalten.")}
        action={<DataSourceBadge mode={data.mode} />} />
      <CampusMap current={displayed} forecastMinute={minute} />
      <section className="twin-status" aria-label="Mensa-Auslastung und Prognose">
        <div><strong>{t("Mensa")} · {displayed.percent >= 0 ? `${Math.round(displayed.percent)} %` : t("Auslastung unbekannt")}</strong><span>{minute ? `${t("Prognose in")} ${minute} ${t("Minuten")}` : t("Aktueller Stand")} · {data.mode === 'demo' ? t("Simulierte Demodaten") : t("Live-Daten")}</span></div>
        <label htmlFor="campus-forecast">{t("Zeitpunkt")}
          <select id="campus-forecast" aria-label={t("Zeitpunkt")} value={point ? forecastIndex : 0} onChange={(event) => setForecastIndex(Number(event.target.value))}>
            <option value={0}>{t("Jetzt")}</option>
            {data.forecast.map((forecast, index) => <option key={forecast.targetAt} value={index + 1}>{t("In")} {forecast.horizonMinutes} {t("Minuten")}</option>)}
          </select>
        </label>
        {point && <span>{t("Prognosebereich:")} {Math.round(point.lowerBound)}–{Math.round(point.upperBound)} %</span>}
      </section>
      <div className="campus-source-note"><Info size={17} /><div>
        <strong>{t("Geodaten & Auslastung")}</strong>
        <p>{t("Gebäudegrundrisse und Grundkarte stammen aus OpenStreetMap über OpenFreeMap. Das Luftbild wird vom LGLN geladen. Gebäudehöhen sind je nach Quelle abgeleitet oder geschätzt; die Ansicht ersetzt keine Vermessung. Kartendaten benötigen eine Internetverbindung. Auslastung und Prognosen stehen derzeit exklusiv für die Mensa bereit.")}</p>
        <a href="https://www.leuphana.de/universitaet/lageplaene.html" target="_blank" rel="noreferrer">{t("Offizieller Lageplan")} <ExternalLink size={12} /></a>
      </div></div>
    </div>
  );
}
