import { useTranslation } from '../../i18n/context';
import { Link } from 'react-router-dom';
export function Footer() {
  const { t } = useTranslation();
  return <footer className="site-footer">
    <div className="footer-main"><div><Link to="/" className="footer-brand">Campus Compass</Link><p>{t("Studentisches Smart-Campus-Projekt")}</p></div>
      <div className="footer-contact"><span>Nick Bennet Kühl</span><a href="mailto:Nick.B.Kuehl@stud.leuphana.de">Nick.B.Kuehl@stud.leuphana.de</a></div>
      <nav aria-label={t("Weitere Informationen")}><Link to="/imprint">{t("Impressum")}</Link><Link to="/privacy">{t("Datenschutz")}</Link><Link to="/methodology">{t("Methodik")}</Link><Link to="/status">{t("Systemstatus")}</Link></nav></div>
    <p className="footer-note">{t("Kein offiziell freigegebener Dienst der Leuphana Universität Lüneburg.")}</p>
  </footer>;
}

