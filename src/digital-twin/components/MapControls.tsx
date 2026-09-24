import type { MapMode, QualityLevel } from '../types/campus'
import { useCampusStore } from '../stores/campusStore'

interface MapControlsProps {
  onHome: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

const mapModes: Array<{ value: MapMode; label: string; short: string }> = [
  { value: 'campus', label: 'Campus', short: 'Campus' },
  { value: 'standard', label: 'Karte', short: 'Karte' },
  { value: 'aerial', label: 'Luftbild', short: 'Luft' },
]

export function MapControls({ onHome, onZoomIn, onZoomOut }: MapControlsProps) {
  const quality = useCampusStore((state) => state.quality)
  const setQuality = useCampusStore((state) => state.setQuality)
  const mapMode = useCampusStore((state) => state.mapMode)
  const setMapMode = useCampusStore((state) => state.setMapMode)
  const showLabels = useCampusStore((state) => state.showLabels)
  const setShowLabels = useCampusStore((state) => state.setShowLabels)
  const showCampusBoundary = useCampusStore((state) => state.showCampusBoundary)
  const setShowCampusBoundary = useCampusStore((state) => state.setShowCampusBoundary)

  return (
    <div className="map-controls">
      <div className="map-mode-switch" role="group" aria-label="Kartenansicht">
        {mapModes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={mapMode === mode.value ? 'active' : ''}
            onClick={() => setMapMode(mode.value)}
            aria-pressed={mapMode === mode.value}
            title={mode.label}
          >
            <span className="mode-label-full">{mode.label}</span>
            <span className="mode-label-short">{mode.short}</span>
          </button>
        ))}
      </div>

      <div className="control-stack primary-controls">
        <button onClick={onZoomIn} title="Hineinzoomen" aria-label="Hineinzoomen">+</button>
        <button onClick={onZoomOut} title="Herauszoomen" aria-label="Herauszoomen">−</button>
        <button onClick={onHome} title="Campusansicht zurücksetzen" aria-label="Campusansicht zurücksetzen">⌂</button>
      </div>

      <details className="layer-control">
        <summary>Details</summary>
        <div className="layer-menu">
          <label>
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
            Campus-Labels
          </label>
          <label>
            <input type="checkbox" checked={showCampusBoundary} onChange={(e) => setShowCampusBoundary(e.target.checked)} />
            Campusgrenze
          </label>
          <label className="select-row">
            Qualität
            <select value={quality} onChange={(e) => setQuality(e.target.value as QualityLevel)}>
              <option value="auto">Auto</option>
              <option value="high">High</option>
              <option value="balanced">Balanced</option>
              <option value="performance">Performance</option>
            </select>
          </label>
        </div>
      </details>
    </div>
  )
}
