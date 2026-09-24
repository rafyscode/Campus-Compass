import { CAMPUS_AREAS, CAMPUS_BUILDINGS, CAMPUS_CONFIG, CAMPUS_PATHS, footprintCentroid, type CampusVisualMode, type WorldTuple } from '../../data/campus';
import { occupancyColor } from './mapUtils';

function toSvg(x: number, z: number) {
  const { minX, maxX, minZ, maxZ } = CAMPUS_CONFIG.worldBounds;
  const width = maxX - minX;
  const height = maxZ - minZ;
  return {
    x: ((x - minX) / width) * 1000,
    y: ((z - minZ) / height) * 650,
  };
}

function pointsString(points: readonly WorldTuple[]) {
  return points.map(([x, z]) => {
    const point = toSvg(x, z);
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(' ');
}

export function CampusFallback2D({ occupancyPercent, selectedBuildingId, mode, onSelect }: { occupancyPercent: number; selectedBuildingId: string; mode: CampusVisualMode; onSelect: (id: string) => void }) {
  const status = occupancyColor(occupancyPercent);
  return (
    <div className={`campus-2d-fallback is-${mode}`}>
      <svg viewBox="0 0 1000 650" role="img" aria-label="Interaktive schematische 2D-Campuskarte">
        <rect width="1000" height="650" className="campus-2d-base" />
        {CAMPUS_AREAS.map((area) => <polygon key={area.id} points={pointsString(area.polygon)} className={`campus-2d-area area-${area.kind}`} />)}
        {CAMPUS_PATHS.map((path) => <polyline key={path.id} points={pointsString(path.points)} className={`campus-2d-path path-${path.kind}`} strokeWidth={path.kind === 'road' ? 13 : 6} />)}
        {CAMPUS_BUILDINGS.map((building) => {
          const active = building.id === selectedBuildingId;
          return (
            <g key={building.id} className={`campus-2d-building ${active ? 'is-active' : ''}`} onClick={() => onSelect(building.id)} tabIndex={0} role="button" aria-label={`${building.name} auswählen`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(building.id); }}>
              <polygon points={pointsString(building.footprint)} style={building.id === 'mensa' ? { stroke: status, strokeWidth: 5 } : undefined} />
              {building.important && (() => { const [x, z] = footprintCentroid(building.footprint); const point = toSvg(x, z); return <text x={point.x} y={point.y}>{building.shortName}</text>; })()}
            </g>
          );
        })}
      </svg>
      <div className="campus-fallback-note">2D-Modus · WebGL ist auf diesem Gerät nicht verfügbar. Alle Auslastungswerte bleiben separat lesbar.</div>
    </div>
  );
}
