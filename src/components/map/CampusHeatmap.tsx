import { useMemo } from 'react';
import { AdditiveBlending, CanvasTexture, Color, LinearFilter } from 'three';
import { BUILDING_BY_ID, footprintCentroid } from '../../data/campus';
import { occupancyColor } from './mapUtils';

function createRadialTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return new CanvasTexture(canvas);
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.42)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}

export function CampusHeatmap({ percent, enabled }: { percent: number; enabled: boolean }) {
  const texture = useMemo(() => createRadialTexture(), []);
  const mensa = BUILDING_BY_ID.get('mensa');
  const library = BUILDING_BY_ID.get('library');
  const central = BUILDING_BY_ID.get('central');
  const color = new Color(occupancyColor(percent));
  if (!enabled || !mensa || !library || !central) return null;
  const [mx, mz] = footprintCentroid(mensa.footprint);
  const [lx, lz] = footprintCentroid(library.footprint);
  const [cx, cz] = footprintCentroid(central.footprint);
  const nodes = [
    { x: mx, z: mz, size: 115, opacity: 0.32 + percent / 500 },
    { x: (mx + lx) / 2, z: (mz + lz) / 2, size: 84, opacity: 0.1 + percent / 850 },
    { x: (mx + cx) / 2, z: (mz + cz) / 2, size: 96, opacity: 0.08 + percent / 950 },
  ];
  return (
    <group>
      {nodes.map((node, index) => (
        <mesh key={index} position={[node.x, 0.7, node.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[node.size, node.size]} />
          <meshBasicMaterial
            map={texture}
            color={color}
            transparent
            opacity={node.opacity}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
