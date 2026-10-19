import { useEffect } from "react";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Book } from "./Book";

export const Experience = ({ bookName }: { bookName: string }) => {
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    canvas.style.cursor = 'url("/book-slider/images/feather1.png") 16 16, auto';
    return () => {
      canvas.style.cursor = "";
    };
  }, [canvas]);

  return (
    <>
      <Book bookName={bookName} />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={7} enableDamping />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffe2bf" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffb98a" position={[-5, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#bcd4ff" position={[5, 2, -2]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
      </Environment>
      <ambientLight intensity={0.6} />
      <directionalLight position={[1, 9, 1]} intensity={2.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0001} />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
