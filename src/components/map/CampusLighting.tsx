import type { CampusVisualMode } from '../../data/campus';

export function CampusLighting({ mode, mobile }: { mode: CampusVisualMode; mobile: boolean }) {
  if (mode === 'night') {
    return (
      <>
        <ambientLight intensity={0.26} color="#8fa6c8" />
        <hemisphereLight intensity={0.42} color="#7894c5" groundColor="#171a1e" />
        <directionalLight position={[180, 260, 110]} intensity={0.65} color="#9fb8e7" castShadow={!mobile} shadow-mapSize={[1024, 1024]} shadow-camera-left={-420} shadow-camera-right={420} shadow-camera-top={420} shadow-camera-bottom={-420} shadow-camera-near={1} shadow-camera-far={900} />
        <pointLight position={[150, 70, 40]} intensity={2.2} color="#ffcf8b" distance={240} decay={1.8} />
      </>
    );
  }
  if (mode === 'dusk') {
    return (
      <>
        <ambientLight intensity={0.58} color="#d9d1c9" />
        <hemisphereLight intensity={0.64} color="#ffcfa8" groundColor="#786f67" />
        <directionalLight position={[-220, 190, -120]} intensity={1.75} color="#ffbd7d" castShadow={!mobile} shadow-mapSize={[mobile ? 512 : 1536, mobile ? 512 : 1536]} shadow-camera-left={-420} shadow-camera-right={420} shadow-camera-top={420} shadow-camera-bottom={-420} shadow-camera-near={1} shadow-camera-far={900} />
      </>
    );
  }
  return (
    <>
      <ambientLight intensity={0.7} color="#f6f3ec" />
      <hemisphereLight intensity={0.8} color="#f8f1e7" groundColor="#a6a29a" />
      <directionalLight position={[-180, 280, -140]} intensity={2.05} color="#fff8e8" castShadow={!mobile} shadow-mapSize={[mobile ? 512 : 1536, mobile ? 512 : 1536]} shadow-bias={-0.00015} shadow-camera-left={-420} shadow-camera-right={420} shadow-camera-top={420} shadow-camera-bottom={-420} shadow-camera-near={1} shadow-camera-far={900} />
    </>
  );
}
