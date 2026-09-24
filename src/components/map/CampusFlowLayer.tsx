import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DynamicDrawUsage, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { BUILDING_BY_ID, footprintCentroid } from '../../data/campus';
import { occupancyColor } from './mapUtils';

interface ParticleRoute {
  from: [number, number];
  to: [number, number];
  phase: number;
  speed: number;
}

export function CampusFlowLayer({ percent, enabled, mobile }: { percent: number; enabled: boolean; mobile: boolean }) {
  const mesh = useRef<InstancedMesh>(null);
  const routes = useMemo<ParticleRoute[]>(() => {
    const mensa = BUILDING_BY_ID.get('mensa');
    const central = BUILDING_BY_ID.get('central');
    const library = BUILDING_BY_ID.get('library');
    if (!mensa || !central || !library) return [];
    const m = footprintCentroid(mensa.footprint);
    const c = footprintCentroid(central.footprint);
    const l = footprintCentroid(library.footprint);
    const count = mobile ? 14 : 30;
    return Array.from({ length: count }, (_, index) => {
      const target = index % 3 === 0 ? c : index % 3 === 1 ? l : m;
      const from: [number, number] = index % 2 === 0 ? [-220, -125 + (index % 7) * 28] : [220, -110 + (index % 9) * 24];
      return { from, to: [target[0], target[1]], phase: (index * 0.137) % 1, speed: 0.025 + (index % 5) * 0.004 };
    });
  }, [mobile]);

  useEffect(() => {
    if (!enabled || !mesh.current) return;
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
  }, [enabled]);

  useFrame(({ clock }) => {
    if (!enabled || !mesh.current) return;
    const matrix = new Matrix4();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    const position = new Vector3();
    routes.forEach((route, index) => {
      const t = (route.phase + clock.elapsedTime * route.speed) % 1;
      const eased = t * t * (3 - 2 * t);
      const x = route.from[0] + (route.to[0] - route.from[0]) * eased;
      const z = route.from[1] + (route.to[1] - route.from[1]) * eased;
      const arc = Math.sin(Math.PI * eased) * 1.6;
      position.set(x, 1.6 + arc, z);
      scale.setScalar(0.9 + Math.sin(index + clock.elapsedTime) * 0.12);
      matrix.compose(position, quaternion, scale);
      mesh.current?.setMatrixAt(index, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!enabled || routes.length === 0) return null;
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, routes.length]}>
      <sphereGeometry args={[1.15, 8, 8]} />
      <meshBasicMaterial color={new Color(occupancyColor(percent))} transparent opacity={0.62} depthWrite={false} />
    </instancedMesh>
  );
}
