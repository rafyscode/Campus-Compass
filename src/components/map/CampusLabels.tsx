import { useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CAMPUS_BUILDINGS, footprintCentroid } from '../../data/campus';

type ZoomTier = 'far' | 'medium' | 'near';

export function CampusLabels({ selectedBuildingId, hoveredBuildingId, enabled }: { selectedBuildingId: string; hoveredBuildingId: string | null; enabled: boolean }) {
  const [tier, setTier] = useState<ZoomTier>('medium');
  useFrame(({ camera }) => {
    const distance = camera.position.length();
    const next: ZoomTier = distance > 480 ? 'far' : distance > 260 ? 'medium' : 'near';
    setTier((previous) => previous === next ? previous : next);
  });

  if (!enabled) return null;
  return (
    <group>
      {CAMPUS_BUILDINGS.map((building) => {
        const [x, z] = footprintCentroid(building.footprint);
        const forced = building.id === selectedBuildingId || building.id === hoveredBuildingId;
        const visible = forced || (tier === 'far' ? building.important : tier === 'medium' ? (building.important || ['4', '6', '10', '12', '25'].includes(building.id)) : true);
        if (!visible || building.id === 'mensa') return null;
        return (
          <Html key={building.id} position={[x, building.heightM + 4.5, z]} center distanceFactor={250} zIndexRange={[18, 5]}>
            <div className={`campus-building-label ${forced ? 'is-active' : ''}`}>
              <span>{building.shortName}</span>
            </div>
          </Html>
        );
      })}
    </group>
  );
}
