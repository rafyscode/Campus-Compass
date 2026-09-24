import { ExtrudeGeometry, Shape } from 'three';
import { footprintCentroid, type WorldTuple } from '../../data/campus';

export function createFootprintGeometry(points: readonly WorldTuple[], height: number, bevel = 0.45) {
  const [cx, cz] = footprintCentroid(points);
  const shape = new Shape();
  points.forEach(([x, z], index) => {
    const localX = x - cx;
    const localY = -(z - cz);
    if (index === 0) shape.moveTo(localX, localY);
    else shape.lineTo(localX, localY);
  });
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel > 0,
    bevelSegments: bevel > 0 ? 2 : 0,
    bevelSize: Math.min(bevel, Math.max(0.12, height * 0.025)),
    bevelThickness: Math.min(bevel, Math.max(0.12, height * 0.025)),
    curveSegments: 1,
    steps: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return { geometry, center: [cx, cz] as const };
}
