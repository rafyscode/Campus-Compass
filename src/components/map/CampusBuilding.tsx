import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { Detailed, Edges, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, Group, MathUtils, type MeshStandardMaterial } from 'three';
import { footprintBounds, footprintCentroid, type CampusBuilding, type CampusVisualMode, type WorldTuple } from '../../data/campus';
import { getOccupancyLevel } from '../../config/app';
import type { DataMode } from '../../types/domain';
import { createFootprintGeometry } from './geometry';
import { occupancyColor } from './mapUtils';

interface CampusBuildingProps {
  building: CampusBuilding;
  selected: boolean;
  occupancyPercent: number;
  dataMode: DataMode;
  occupancyVisible: boolean;
  mode: CampusVisualMode;
  onSelect: (buildingId: string) => void;
  onHover: (buildingId: string | null) => void;
}

function materialColors(building: CampusBuilding, mode: CampusVisualMode) {
  if (mode === 'night') {
    if (building.category === 'landmark') return { wall: '#545c63', roof: '#747d84' };
    if (building.category === 'library') return { wall: '#4a403d', roof: '#302d2c' };
    if (building.category === 'sports') return { wall: '#4e4742', roof: '#32302d' };
    return { wall: '#4b3732', roof: '#2f2b29' };
  }
  if (building.category === 'landmark') return { wall: '#9da3a3', roof: '#c2c6c5' };
  if (building.category === 'library') return { wall: '#74645f', roof: '#4f4946' };
  if (building.category === 'sports') return { wall: '#7c6d64', roof: '#55504c' };
  if (building.category === 'service') return { wall: '#856f64', roof: '#504944' };
  return { wall: '#8b6658', roof: '#4d4541' };
}

function StatusRing({ footprint, percent, visible }: { footprint: readonly WorldTuple[]; percent: number; visible: boolean }) {
  const [cx, cz] = footprintCentroid(footprint);
  const bounds = footprintBounds(footprint);
  const radius = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) * 0.62;
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !visible) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.025;
    group.current.scale.setScalar(pulse);
  });
  const color = occupancyColor(percent);
  if (!visible) return null;
  return (
    <group ref={group} position={[cx, 0.35, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.93, radius, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.46} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.08, radius * 1.1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CentralLandmark({ building, colors, selected, hovered, mode }: { building: CampusBuilding; colors: ReturnType<typeof materialColors>; selected: boolean; hovered: boolean; mode: CampusVisualMode }) {
  const base = useMemo(() => createFootprintGeometry(building.footprint, 10, 0.55), [building]);
  const [cx, cz] = footprintCentroid(building.footprint);
  const towerFootprint = useMemo(() => [
    [cx - 42, cz - 18], [cx - 1, cz - 25], [cx + 17, cz - 4], [cx + 1, cz + 8], [cx + 9, cz + 34], [cx - 28, cz + 28],
  ] as const, [cx, cz]);
  const midFootprint = useMemo(() => [
    [cx - 4, cz + 5], [cx + 49, cz + 2], [cx + 42, cz + 30], [cx + 7, cz + 38], [cx - 10, cz + 19],
  ] as const, [cx, cz]);
  const tower = useMemo(() => createFootprintGeometry(towerFootprint, building.heightM, 0.45), [building.heightM, towerFootprint]);
  const mid = useMemo(() => createFootprintGeometry(midFootprint, 20, 0.45), [midFootprint]);
  const edge = selected || hovered ? '#7b0832' : '#d4d8d8';
  return (
    <group>
      <mesh geometry={base.geometry} position={[base.center[0], 0, base.center[1]]} castShadow receiveShadow>
        <meshStandardMaterial color={colors.wall} roughness={0.58} metalness={0.18} />
        <Edges threshold={18} color={edge} />
      </mesh>
      <mesh geometry={tower.geometry} position={[tower.center[0], 0, tower.center[1]]} castShadow receiveShadow>
        <meshStandardMaterial color={mode === 'night' ? '#687077' : '#aeb4b3'} roughness={0.46} metalness={0.24} />
        <Edges threshold={16} color={edge} />
      </mesh>
      <mesh geometry={mid.geometry} position={[mid.center[0], 0, mid.center[1]]} castShadow receiveShadow>
        <meshStandardMaterial color={mode === 'night' ? '#5b6268' : '#979e9e'} roughness={0.5} metalness={0.2} />
        <Edges threshold={16} color={edge} />
      </mesh>
      {mode === 'night' && (
        <pointLight position={[cx, 12, cz + 15]} color="#ffc87a" intensity={5} distance={70} decay={2} />
      )}
    </group>
  );
}

export function CampusBuildingMesh({ building, selected, occupancyPercent, dataMode, occupancyVisible, mode, onSelect, onHover }: CampusBuildingProps) {
  const [hovered, setHovered] = useState(false);
  const colors = materialColors(building, mode);
  const detail = useMemo(() => createFootprintGeometry(building.footprint, building.heightM, 0.42), [building]);
  const roof = useMemo(() => createFootprintGeometry(building.footprint, 0.65, 0.22), [building]);
  const bounds = useMemo(() => footprintBounds(building.footprint), [building]);
  const [cx, cz] = useMemo(() => footprintCentroid(building.footprint), [building]);
  const status = occupancyColor(occupancyPercent);
  const occupancyLevel = getOccupancyLevel(occupancyPercent);
  const roofColor = building.id === 'mensa' && occupancyVisible ? status : colors.roof;
  const roofMaterial = useRef<MeshStandardMaterial>(null);
  const targetColor = useMemo(() => new Color(roofColor), [roofColor]);
  useFrame((_, delta) => {
    if (!roofMaterial.current) return;
    roofMaterial.current.color.r = MathUtils.damp(roofMaterial.current.color.r, targetColor.r, 5, delta);
    roofMaterial.current.color.g = MathUtils.damp(roofMaterial.current.color.g, targetColor.g, 5, delta);
    roofMaterial.current.color.b = MathUtils.damp(roofMaterial.current.color.b, targetColor.b, 5, delta);
  });

  const hoverStart = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(true);
    onHover(building.id);
    document.body.style.cursor = 'pointer';
  };
  const hoverEnd = () => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = 'default';
  };
  const click = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(building.id);
  };

  return (
    <group onPointerOver={hoverStart} onPointerOut={hoverEnd} onClick={click}>
      {building.id === 'central' ? (
        <CentralLandmark building={building} colors={colors} selected={selected} hovered={hovered} mode={mode} />
      ) : (
        <Detailed distances={[0, 260]}>
          <group>
            <mesh geometry={detail.geometry} position={[detail.center[0], 0, detail.center[1]]} castShadow receiveShadow>
              <meshStandardMaterial color={colors.wall} roughness={0.76} metalness={0.035} />
              {(hovered || selected) && <Edges threshold={18} color={building.id === 'mensa' ? status : '#7b0832'} />}
            </mesh>
            <mesh geometry={roof.geometry} position={[roof.center[0], building.heightM - 0.05, roof.center[1]]} castShadow>
              <meshStandardMaterial ref={roofMaterial} color={roofColor} roughness={0.62} metalness={0.08} emissive={building.id === 'mensa' && occupancyVisible ? status : '#000000'} emissiveIntensity={building.id === 'mensa' && occupancyVisible ? 0.12 : 0} />
            </mesh>
            {mode === 'night' && building.important && (
              <mesh position={[cx, Math.min(building.heightM * 0.45, 6.5), cz + (bounds.maxZ - bounds.minZ) * 0.18]}>
                <boxGeometry args={[Math.max(5, (bounds.maxX - bounds.minX) * 0.42), 0.7, 0.18]} />
                <meshStandardMaterial color="#ffc36b" emissive="#ffc36b" emissiveIntensity={1.6} />
              </mesh>
            )}
          </group>
          <mesh position={[cx, building.heightM / 2, cz]} castShadow>
            <boxGeometry args={[Math.max(4, bounds.maxX - bounds.minX), building.heightM, Math.max(4, bounds.maxZ - bounds.minZ)]} />
            <meshStandardMaterial color={colors.wall} roughness={0.85} />
          </mesh>
        </Detailed>
      )}
      {building.id === 'mensa' && <StatusRing footprint={building.footprint} percent={occupancyPercent} visible={occupancyVisible} />}
      {building.id === 'mensa' && occupancyVisible && (
        <Html position={[cx, building.heightM + 9, cz]} center transform={false} distanceFactor={210} zIndexRange={[40, 10]}>
          <div className="campus-mensa-pin" style={{ '--map-status': status } as CSSProperties}>
            <span className="campus-mensa-pin-kicker">MENSA</span>
            <strong>{occupancyPercent.toFixed(0)}%</strong>
            <span>{occupancyLevel.label} · {dataMode === 'demo' ? 'DEMO' : 'LIVE'}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
