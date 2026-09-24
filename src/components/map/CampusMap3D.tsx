import { Component, useEffect, useMemo, useState, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { LocateFixed, Wifi } from 'lucide-react';
import { BUILDING_BY_ID, CAMPUS_CONFIG, footprintBounds, footprintCentroid, type CampusLayerKey, type CampusVisualMode } from '../../data/campus';
import type { ForecastPoint, OccupancyHistoryPoint, OccupancySnapshot, SensorStatus } from '../../types/domain';
import { DataSourceBadge } from '../dashboard/DataSourceBadge';
import { BuildingInfoPanel } from './BuildingInfoPanel';
import { CampusFallback2D } from './CampusFallback2D';
import { CampusLayerPanel, CampusViewControls } from './CampusControls';
import { CampusScene } from './CampusScene';
import { CampusSearch } from './CampusSearch';
import { CampusTimeScrubber } from './CampusTimeScrubber';
import type { CameraTarget, CampusLayersState } from './mapTypes';
import { occupancyAtMinute, occupancyColor } from './mapUtils';
import { useMediaQuery } from './useMediaQuery';

class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Campus 3D failed', error, info); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGL2RenderingContext && canvas.getContext('webgl2')) || Boolean(window.WebGLRenderingContext && canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const DEFAULT_LAYERS: CampusLayersState = {
  buildings: true,
  occupancy: true,
  forecast: true,
  heatmap: false,
  flow: false,
  labels: true,
  vegetation: true,
};

export function CampusMap3D({ current, forecast, history, sensor }: { current: OccupancySnapshot; forecast: ForecastPoint[]; history: OccupancyHistoryPoint[]; sensor: SensorStatus }) {
  const mobile = useMediaQuery('(max-width: 760px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const webgl = useMemo(() => supportsWebGL(), []);
  const [selectedBuildingId, setSelectedBuildingId] = useState('mensa');
  const [panelOpen, setPanelOpen] = useState(true);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [forecastMinute, setForecastMinute] = useState(0);
  const [layers, setLayers] = useState<CampusLayersState>(DEFAULT_LAYERS);
  const [visualMode, setVisualMode] = useState<CampusVisualMode>('day');
  const [cameraCommand, setCameraCommand] = useState<CameraTarget>({ id: 0, position: [...CAMPUS_CONFIG.camera.campus.position], target: [...CAMPUS_CONFIG.camera.campus.target], instant: reducedMotion });
  const [introActive, setIntroActive] = useState(!reducedMotion);

  const displayed = occupancyAtMinute(current, forecast, layers.forecast ? forecastMinute : 0);
  const selectedBuilding = BUILDING_BY_ID.get(selectedBuildingId) ?? BUILDING_BY_ID.get('mensa');
  const statusColor = occupancyColor(displayed.percent);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setTimeout(() => setIntroActive(false), 3600);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const setCommand = (position: readonly number[], target: readonly number[], instant = false) => {
    setCameraCommand((previous) => ({ id: previous.id + 1, position: [position[0] ?? 0, position[1] ?? 0, position[2] ?? 0], target: [target[0] ?? 0, target[1] ?? 0, target[2] ?? 0], instant }));
    setIntroActive(false);
  };

  const focusBuilding = (buildingId: string) => {
    const building = BUILDING_BY_ID.get(buildingId);
    if (!building) return;
    setSelectedBuildingId(buildingId);
    setPanelOpen(true);
    const [x, z] = footprintCentroid(building.footprint);
    const bounds = footprintBounds(building.footprint);
    const size = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
    const distance = Math.max(76, size * 1.45 + building.heightM * 1.7);
    setCommand([x + distance * 0.85, Math.max(72, building.heightM * 2.8 + 40), z + distance], [x, Math.min(building.heightM * 0.28, 9), z]);
  };

  const applyPreset = (preset: 'campus' | 'mensa' | 'central' | 'top' | 'north') => {
    if (preset === 'mensa') return focusBuilding('mensa');
    if (preset === 'central') return focusBuilding('central');
    if (preset === 'top') return setCommand(CAMPUS_CONFIG.camera.top.position, CAMPUS_CONFIG.camera.top.target);
    if (preset === 'north') return setCommand([-8, 410, 555], [-8, 0, 2]);
    return setCommand(CAMPUS_CONFIG.camera.campus.position, CAMPUS_CONFIG.camera.campus.target);
  };

  const toggleLayer = (key: CampusLayerKey) => {
    setLayers((previous) => {
      const next = { ...previous, [key]: !previous[key] };
      if (key === 'forecast' && previous.forecast) setForecastMinute(0);
      return next;
    });
  };

  const fallback = <CampusFallback2D occupancyPercent={displayed.percent} selectedBuildingId={selectedBuildingId} mode={visualMode} onSelect={focusBuilding} />;

  return (
    <section className={`campus-digital-twin mode-${visualMode}`} style={{ '--campus-status': statusColor } as CSSProperties}>
      <div className="campus-map-brandbar">
        <div className="campus-brand-lockup">
          <img src="/branding/leuphana-logo.png" alt="Leuphana Universität Lüneburg" />
          <div><span>Campus Compass</span><strong>Smart Campus Digital Twin</strong></div>
        </div>
        <div className="campus-map-state"><DataSourceBadge mode={current.source} /><span className={`campus-sensor-dot is-${sensor.state}`}><Wifi size={12} />{current.source === 'demo' ? 'Sensor simulation' : sensor.state === 'online' ? 'Sensor ready' : sensor.state}</span></div>
      </div>

      <CampusSearch onSelect={focusBuilding} />
      <CampusViewControls onPreset={applyPreset} />
      <CampusLayerPanel layers={layers} onToggle={toggleLayer} visualMode={visualMode} onVisualMode={setVisualMode} />

      <div className="campus-map-viewport" onPointerDown={() => setIntroActive(false)}>
        {webgl ? (
          <MapErrorBoundary fallback={fallback}>
            <Canvas
              className="campus-canvas-premium"
              shadows={!mobile}
              dpr={mobile ? [1, 1.15] : [1, 1.5]}
              camera={{ position: reducedMotion ? [...CAMPUS_CONFIG.camera.campus.position] : [620, 520, 660], fov: mobile ? 46 : 40, near: 0.5, far: 1600 }}
              gl={{ antialias: !mobile, powerPreference: 'high-performance', alpha: false }}
              onPointerMissed={() => setHoveredBuildingId(null)}
            >
              <CampusScene
                selectedBuildingId={selectedBuildingId}
                hoveredBuildingId={hoveredBuildingId}
                occupancyPercent={displayed.percent}
                dataMode={current.source}
                layers={layers}
                visualMode={visualMode}
                mobile={mobile}
                reducedMotion={reducedMotion}
                cameraCommand={cameraCommand}
                onSelect={focusBuilding}
                onHover={setHoveredBuildingId}
                onCameraInteraction={() => setIntroActive(false)}
              />
            </Canvas>
          </MapErrorBoundary>
        ) : fallback}
        {introActive && <div className="campus-cinematic-caption"><LocateFixed size={14} /><span>Universitätsallee · Lüneburg</span></div>}
        <div className="campus-scale" aria-label="Referenz: 100 Meter in lokalen Weltkoordinaten"><i /><span>100 m world ref.</span></div>
        <div className="campus-attribution">Geometrische Referenz: Leuphana Lageplan · Geodatenanker: © OpenStreetMap contributors</div>
      </div>

      {selectedBuilding && panelOpen && (
        <BuildingInfoPanel
          building={selectedBuilding}
          current={current}
          forecast={forecast}
          history={history}
          sensor={sensor}
          forecastMinute={forecastMinute}
          displayedPercent={displayed.percent}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <CampusTimeScrubber value={forecastMinute} onChange={setForecastMinute} enabled={layers.forecast} reducedMotion={reducedMotion} />
    </section>
  );
}
