import { useMemo } from 'react';
import { DoubleSide, Shape, ShapeGeometry, Vector3 } from 'three';
import { CAMPUS_AREAS, CAMPUS_CONFIG, CAMPUS_PATHS, footprintCentroid, type CampusVisualMode, type WorldTuple } from '../../data/campus';

function AreaMesh({ polygon, kind, mode }: { polygon: readonly WorldTuple[]; kind: 'grass' | 'sports' | 'garden' | 'plaza' | 'parking'; mode: CampusVisualMode }) {
  const { geometry, center } = useMemo(() => {
    const [cx, cz] = footprintCentroid(polygon);
    const shape = new Shape();
    polygon.forEach(([x, z], index) => {
      const localX = x - cx;
      const localY = -(z - cz);
      if (index === 0) shape.moveTo(localX, localY);
      else shape.lineTo(localX, localY);
    });
    shape.closePath();
    const g = new ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);
    return { geometry: g, center: [cx, cz] as const };
  }, [polygon]);

  const palette = mode === 'night'
    ? { grass: '#1f2a25', sports: '#21322b', garden: '#1a2d27', plaza: '#383a3d', parking: '#303338' }
    : mode === 'dusk'
      ? { grass: '#7d8875', sports: '#708477', garden: '#697c6e', plaza: '#c7bdb2', parking: '#aca8a3' }
      : { grass: '#b8c3ad', sports: '#aab9a2', garden: '#a7b59f', plaza: '#dedad3', parking: '#c9c8c4' };

  return (
    <mesh geometry={geometry} position={[center[0], 0.05, center[1]]} receiveShadow>
      <meshStandardMaterial color={palette[kind]} roughness={0.96} side={DoubleSide} />
    </mesh>
  );
}

function PathStrip({ points, widthM, kind, mode }: { points: readonly WorldTuple[]; widthM: number; kind: 'road' | 'walk'; mode: CampusVisualMode }) {
  const segments = useMemo(() => points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    if (!next) return null;
    const start = new Vector3(point[0], 0.08, point[1]);
    const end = new Vector3(next[0], 0.08, next[1]);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const length = start.distanceTo(end);
    const angle = Math.atan2(end.z - start.z, end.x - start.x);
    return { midpoint, length, angle };
  }).filter((segment): segment is NonNullable<typeof segment> => Boolean(segment)), [points]);
  const color = mode === 'night' ? (kind === 'road' ? '#24282e' : '#44474a') : kind === 'road' ? '#b8b7b4' : '#eeeae3';
  return (
    <group>
      {segments.map((segment, index) => (
        <mesh key={index} position={segment.midpoint} rotation={[0, -segment.angle, 0]} receiveShadow>
          <boxGeometry args={[segment.length, 0.12, widthM]} />
          <meshStandardMaterial color={color} roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

export function CampusGround({ mode }: { mode: CampusVisualMode }) {
  const base = mode === 'night' ? '#171b1f' : mode === 'dusk' ? '#a9a49d' : '#d7d6d0';
  const { minX, maxX, minZ, maxZ } = CAMPUS_CONFIG.worldBounds;
  const width = maxX - minX + 120;
  const depth = maxZ - minZ + 110;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(minX + maxX) / 2, -0.08, (minZ + maxZ) / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={base} roughness={1} />
      </mesh>
      {CAMPUS_AREAS.map((area) => <AreaMesh key={area.id} polygon={area.polygon} kind={area.kind} mode={mode} />)}
      {CAMPUS_PATHS.map((campusPath) => <PathStrip key={campusPath.id} points={campusPath.points} widthM={campusPath.widthM} kind={campusPath.kind} mode={mode} />)}
    </group>
  );
}
