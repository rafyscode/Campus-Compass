import { CAMPUS_BUILDINGS, type CampusVisualMode } from '../../data/campus';
import type { DataMode } from '../../types/domain';
import { CampusBuildingMesh } from './CampusBuilding';

export function CampusBuildings({ selectedBuildingId, occupancyPercent, dataMode, occupancyVisible, mode, onSelect, onHover }: {
  selectedBuildingId: string;
  occupancyPercent: number;
  dataMode: DataMode;
  occupancyVisible: boolean;
  mode: CampusVisualMode;
  onSelect: (buildingId: string) => void;
  onHover: (buildingId: string | null) => void;
}) {
  return (
    <group>
      {CAMPUS_BUILDINGS.map((building) => (
        <CampusBuildingMesh
          key={building.id}
          building={building}
          selected={selectedBuildingId === building.id}
          occupancyPercent={occupancyPercent}
          dataMode={dataMode}
          occupancyVisible={occupancyVisible}
          mode={mode}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
}
