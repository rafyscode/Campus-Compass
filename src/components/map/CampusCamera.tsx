import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MathUtils, Vector3 } from 'three';
import { CAMPUS_CONFIG } from '../../data/campus';
import type { CameraTarget } from './mapTypes';

interface CampusCameraProps {
  command: CameraTarget;
  reducedMotion: boolean;
  onInteractionStart: () => void;
}

export function CampusCamera({ command, reducedMotion, onInteractionStart }: CampusCameraProps) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl | null>(null);
  const transitionActive = useRef(true);
  const destinationPosition = useRef(new Vector3(...command.position));
  const destinationTarget = useRef(new Vector3(...command.target));

  useEffect(() => {
    destinationPosition.current.set(...command.position);
    destinationTarget.current.set(...command.target);
    transitionActive.current = true;
    if (command.instant || reducedMotion) {
      camera.position.copy(destinationPosition.current);
      controls.current?.target.copy(destinationTarget.current);
      controls.current?.update();
      transitionActive.current = false;
    }
  }, [camera, command, reducedMotion]);

  useFrame((_, delta) => {
    if (!transitionActive.current || !controls.current) return;
    const lambda = reducedMotion ? 30 : 3.8;
    camera.position.x = MathUtils.damp(camera.position.x, destinationPosition.current.x, lambda, delta);
    camera.position.y = MathUtils.damp(camera.position.y, destinationPosition.current.y, lambda, delta);
    camera.position.z = MathUtils.damp(camera.position.z, destinationPosition.current.z, lambda, delta);
    controls.current.target.x = MathUtils.damp(controls.current.target.x, destinationTarget.current.x, lambda, delta);
    controls.current.target.y = MathUtils.damp(controls.current.target.y, destinationTarget.current.y, lambda, delta);
    controls.current.target.z = MathUtils.damp(controls.current.target.z, destinationTarget.current.z, lambda, delta);
    controls.current.update();

    const positionDone = camera.position.distanceTo(destinationPosition.current) < 0.7;
    const targetDone = controls.current.target.distanceTo(destinationTarget.current) < 0.35;
    if (positionDone && targetDone) transitionActive.current = false;
  });

  const stopTransition = () => {
    transitionActive.current = false;
    onInteractionStart();
  };

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.075}
      enablePan
      enableRotate
      enableZoom
      minDistance={72}
      maxDistance={980}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2.08}
      target={[...CAMPUS_CONFIG.camera.campus.target]}
      onStart={stopTransition}
    />
  );
}
