import { EthicalReflection } from '../components/ui/EthicalReflection';
import { useTranslation } from '../i18n/context';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
const products = [
  ['01', 'Digital Twin', 'Gebäude, Raumreferenzen und Fußwege im räumlichen Zusammenhang erkunden.', '/campus'],
  ['02', 'Reale Sensordaten', 'Ein abgeschlossener Messzeitraum macht die Mensa-Auslastung nachvollziehbar.', '/live'],
  ['03', 'Forecast-System', 'Baselines und ML-Modelle vergleichen; Vorhersagen an späteren Messungen prüfen.', '/forecast'],
  ['04', 'Analytics', 'Verläufe, Tagesprofile und Spitzenzeiten aus dem realen Datensatz lesen.', '/analytics'],
];
export default function AboutPage() {
  const { t } = useTranslation();
  return <div className="content page-stack">
    <PageHeader eyebrow={t("Über das Projekt")} title={t("Ein Campus, der verständlicher wird.")} description={t("Campus Compass ist ein studentisches Smart-Campus-Projekt an der Leuphana Universität Lüneburg.")} />
    <section className="editorial-split"><div><span className="eyebrow">{t("Warum")}</span><h2>{t("Weniger Unsicherheit.")}<br />{' '}{t("Mehr Orientierung.")}</h2></div><div><p className="large-copy">{t("Wie voll wird die Mensa sein? Wo ist das nächste Gebäude? Welcher Weg führt dorthin?")}</p><p>{t("Campus Compass untersucht, wie Daten solche Alltagsfragen verständlicher machen. Reale Messungen, eine interaktive Karte und ein trainiertes Forecast-System bilden die Grundlage. Die Auslastung wird anhand eines abgeschlossenen Messzeitraums gezeigt.")}</p></div></section>
    <section><span className="eyebrow">{t("Was wir gebaut haben")}</span><div className="product-index">{products.map(([num, title, text, to]) => <Link to={to} key={title}><span>{num}</span><h2>{t(title)}</h2><p>{t(text)}</p><span aria-hidden="true">↗</span></Link>)}</div></section>
    <section className="about-process"><span className="eyebrow">{t("Wie es zusammenkommt")}</span><p>{t("Sensor ")}<span>→</span>{t(" Daten ")}<span>→</span>{t(" Prognose ")}<span>→</span>{t(" Orientierung")}</p></section>
    <section className="team-section"><div><span className="eyebrow">{t("Projektteam")}</span><h2>{t("Drei Perspektiven.")}<br />{' '}{t("Ein Campus.")}</h2></div><ul><li>Rafael Bollmann Robles</li><li>Ozge Utku</li><li>Nick Bennet Kühl</li></ul></section>
    <EthicalReflection />
  </div>;
}

