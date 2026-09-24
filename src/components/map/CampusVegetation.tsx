import { useEffect, useMemo, useRef } from 'react';
import { Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { CAMPUS_TREES, type CampusVisualMode } from '../../data/campus';

export function CampusVegetation({ mode, mobile, enabled }: { mode: CampusVisualMode; mobile: boolean; enabled: boolean }) {
  const points = useMemo(() => mobile ? CAMPUS_TREES.filter((_, index) => index % 2 === 0) : CAMPUS_TREES, [mobile]);
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);

  useEffect(() => {
    if (!enabled || !trunks.current || !crowns.current) return;
    const matrix = new Matrix4();
    const quaternion = new Quaternion();
    const position = new Vector3();
    const scale = new Vector3();
    points.forEach((tree, index) => {
      position.set(tree.x, 2.4 * tree.scale, tree.z);
      quaternion.setFromAxisAngle(new Vector3(0, 1, 0), tree.rotation);
      scale.set(0.85 * tree.scale, 4.8 * tree.scale, 0.85 * tree.scale);
      matrix.compose(position, quaternion, scale);
      trunks.current?.setMatrixAt(index, matrix);

      position.set(tree.x, 7.5 * tree.scale, tree.z);
      scale.set(4.8 * tree.scale, 7.2 * tree.scale, 4.8 * tree.scale);
      matrix.compose(position, quaternion, scale);
      crowns.current?.setMatrixAt(index, matrix);
    });
    trunks.current.instanceMatrix.needsUpdate = true;
    crowns.current.instanceMatrix.needsUpdate = true;
  }, [enabled, points]);

  if (!enabled) return null;
  const crown = mode === 'night' ? new Color('#183128') : mode === 'dusk' ? new Color('#536b54') : new Color('#55765a');
  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, points.length]} castShadow={!mobile} receiveShadow>
        <cylinderGeometry args={[0.38, 0.52, 1, 6]} />
        <meshStandardMaterial color={mode === 'night' ? '#3c322c' : '#6c584d'} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, points.length]} castShadow={!mobile}>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color={crown} roughness={0.92} />
      </instancedMesh>
    </group>
  );
}
