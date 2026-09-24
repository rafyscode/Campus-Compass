import { useTranslation } from '../../i18n/context';
import type { MapMode, QualityLevel } from '../types/campus'
import { useCampusStore } from '../stores/campusStore'

interface MapControlsProps {
  onHome: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onTop?: () => void
  onOblique?: () => void
}

const mapModes: Array<{ value: MapMode; label: string; short: string }> = [
  { value: 'campus', label: 'Campus', short: 'Campus' },
  { value: 'standard', label: 'Karte', short: 'Karte' },
  { value: 'aerial', label: 'Luftbild', short: 'Luft' },
]

export function MapControls({ onHome, onZoomIn, onZoomOut, onTop, onOblique }: MapControlsProps) {
  const { t } = useTranslation();
  const quality = useCampusStore((state) => state.quality)
  const setQuality = useCampusStore((state) => state.setQuality)
  const mapMode = useCampusStore((state) => state.mapMode)
  const setMapMode = useCampusStore((state) => state.setMapMode)
  const showLabels = useCampusStore((state) => state.showLabels)
  const setShowLabels = useCampusStore((state) => state.setShowLabels)
  const showCampusBoundary = useCampusStore((state) => state.showCampusBoundary)
  const setShowCampusBoundary = useCampusStore((state) => state.setShowCampusBoundary)
  const showPulse = useCampusStore((state) => state.showPulse)
  const setShowPulse = useCampusStore((state) => state.setShowPulse)

  return (
    <div className="map-controls">
      <div className="map-mode-switch" role="group" aria-label={t("Kartenansicht")}>
        {mapModes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={mapMode === mode.value ? 'active' : ''}
            onClick={() => setMapMode(mode.value)}
            aria-pressed={mapMode === mode.value}
            title={t(mode.label)}
          >
            <span className="mode-label-full">{t(mode.label)}</span>
            <span className="mode-label-short">{t(mode.short)}</span>
          </button>
        ))}
      </div>

      {(onTop || onOblique) && <div className="view-controls" role="group" aria-label={t("Blick auf den Campus")}>
        {onTop && <button type="button" onClick={onTop} title={t("Campus von oben anzeigen")}>{t("Von oben")}</button>}
        {onOblique && <button type="button" onClick={onOblique} title={t("Campus in 3D anzeigen")}>{t("3D-Ansicht")}</button>}
      </div>}

      <div className="control-stack primary-controls">
        <button type="button" onClick={onZoomIn} title={t("Hineinzoomen")} aria-label={t("Hineinzoomen")}>+</button>
        <button type="button" onClick={onZoomOut} title={t("Herauszoomen")} aria-label={t("Herauszoomen")}>−</button>
        <button type="button" onClick={onHome} title={t("Campusübersicht")} aria-label={t("Campusübersicht")}>⌂</button>
      </div>

      <details className="layer-control">
        <summary>{t("Details")}</summary>
        <div className="layer-menu">
          <label>
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />{t("Gebäudebeschriftung")}</label>
          <label>
            <input type="checkbox" checked={showCampusBoundary} onChange={(e) => setShowCampusBoundary(e.target.checked)} />{t("Campusgrenze")}</label>
          <label>
            <input type="checkbox" checked={showPulse} onChange={(e) => setShowPulse(e.target.checked)} />{t("Historischer Mensa-Wert")}</label>
          <label className="select-row">{t("Qualität")}<select value={quality} onChange={(e) => setQuality(e.target.value as QualityLevel)}>
              <option value="auto">{t("Auto")}</option>
              <option value="high">{t("Hoch")}</option>
              <option value="balanced">{t("Ausgewogen")}</option>
              <option value="performance">{t("Sparsam")}</option>
            </select>
          </label>
        </div>
      </details>
    </div>
  )
}
