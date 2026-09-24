import { useTranslation } from '../../i18n/context';
export function Legend() {
  const { t } = useTranslation();
  return <div className="legend" aria-label={t("Kartenlegende")}><span><i className="swatch building-generic" />{t("Gebäude")}</span><span><i className="swatch building-food" />{t("Mensa")}</span><span><i className="line boundary" />{t("Campusgrenze")}</span></div>;
}

