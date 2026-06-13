//scr/components/Experience.tsx
import React from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const Experience = ({
  bookName,
}: {
  bookName: string;
}): React.JSX.Element => {
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    canvas.style.cursor = 'url("/book-slider/images/feather1.png") 16 16, auto';
    return () => {
      if (canvas) canvas.style.cursor = "";
    };
  }, [canvas]);

  return (
    <>
      <Book bookName={bookName} />
      <OrbitControls />
      <Environment preset="sunset" />
      <directionalLight
        position={[1, 9, 1]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
