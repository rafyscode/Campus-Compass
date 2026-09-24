import { Sky } from '@react-three/drei';
import { CAMPUS_CONFIG, type CampusVisualMode } from '../../data/campus';
import type { DataMode } from '../../types/domain';
import { CampusBuildings } from './CampusBuildings';
import { CampusCamera } from './CampusCamera';
import { CampusFlowLayer } from './CampusFlowLayer';
import { CampusGround } from './CampusGround';
import { CampusHeatmap } from './CampusHeatmap';
import { CampusLabels } from './CampusLabels';
import { CampusLighting } from './CampusLighting';
import type { CameraTarget, CampusLayersState } from './mapTypes';
import { CampusVegetation } from './CampusVegetation';

export function CampusScene({
  selectedBuildingId,
  hoveredBuildingId,
  occupancyPercent,
  dataMode,
  layers,
  visualMode,
  mobile,
  reducedMotion,
  cameraCommand,
  onSelect,
  onHover,
  onCameraInteraction,
}: {
  selectedBuildingId: string;
  hoveredBuildingId: string | null;
  occupancyPercent: number;
  dataMode: DataMode;
  layers: CampusLayersState;
  visualMode: CampusVisualMode;
  mobile: boolean;
  reducedMotion: boolean;
  cameraCommand: CameraTarget;
  onSelect: (buildingId: string) => void;
  onHover: (buildingId: string | null) => void;
  onCameraInteraction: () => void;
}) {
  const background = visualMode === 'night' ? '#10151b' : visualMode === 'dusk' ? '#c8b6a9' : '#e9eceb';
  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 470, 830]} />
      {visualMode !== 'night' && (
        <Sky
          distance={1000}
          sunPosition={visualMode === 'dusk' ? [-2, 0.4, -3] : [-5, 8, -4]}
          turbidity={visualMode === 'dusk' ? 7.5 : 3.6}
          rayleigh={visualMode === 'dusk' ? 2.2 : 1.15}
          mieCoefficient={0.006}
          mieDirectionalG={0.82}
        />
      )}
      <CampusLighting mode={visualMode} mobile={mobile} />
      <CampusGround mode={visualMode} />
      {layers.buildings && (
        <CampusBuildings
          selectedBuildingId={selectedBuildingId}
          occupancyPercent={occupancyPercent}
          dataMode={dataMode}
          occupancyVisible={layers.occupancy}
          mode={visualMode}
          onSelect={onSelect}
          onHover={onHover}
        />
      )}
      <CampusVegetation mode={visualMode} mobile={mobile} enabled={layers.vegetation} />
      <CampusLabels selectedBuildingId={selectedBuildingId} hoveredBuildingId={hoveredBuildingId} enabled={layers.labels} />
      <CampusHeatmap percent={occupancyPercent} enabled={layers.heatmap} />
      <CampusFlowLayer percent={occupancyPercent} enabled={layers.flow} mobile={mobile} />
      <CampusCamera command={cameraCommand} reducedMotion={reducedMotion} onInteractionStart={onCameraInteraction} />
      <mesh position={[0, -2.2, 0]} visible={false}>
        <boxGeometry args={[CAMPUS_CONFIG.worldBounds.maxX - CAMPUS_CONFIG.worldBounds.minX, 1, CAMPUS_CONFIG.worldBounds.maxZ - CAMPUS_CONFIG.worldBounds.minZ]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
