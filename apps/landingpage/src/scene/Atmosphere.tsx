import { Environment, Lightformer, Sky } from "@react-three/drei";

export const SUN: [number, number, number] = [34, 15, 24];

export function Atmosphere() {
  return (
    <>
      <color attach="background" args={["#e9c9a4"]} />
      <fog attach="fog" args={["#e2c3a0", 28, 110]} />
      <Sky distance={4500} sunPosition={SUN} turbidity={6.5} rayleigh={1.4} mieCoefficient={0.006} mieDirectionalG={0.86} />
      <hemisphereLight args={["#ffe6cc", "#3c4a2e", 0.45]} />
      <directionalLight
        position={SUN}
        intensity={2.8}
        color="#ffd6a6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={17}
        shadow-camera-bottom={-17}
        shadow-camera-near={10}
        shadow-camera-far={90}
      />
      <Environment resolution={128} frames={1} environmentIntensity={0.85}>
        <Lightformer form="rect" intensity={2.4} color="#fff3e2" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 10, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd2a0" position={[10, 3, 4]} rotation-y={-Math.PI / 2} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#c9dcff" position={[-10, 3, 0]} rotation-y={Math.PI / 2} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#ffffff" position={[0, 3, 10]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#e9d8bd" position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
      </Environment>
    </>
  );
}
