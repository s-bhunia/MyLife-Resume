// src/components/Experience.tsx
import React, { useEffect } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
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
      <Book bookName={bookName} /> {/*[cite: 2] */}
      <OrbitControls /> {/*[cite: 2] */}
      <Environment preset="sunset" /> {/*[cite: 2] */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[1, 9, 1]}
        intensity={3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        {" "}
        {/*[cite: 2] */}
        <planeGeometry args={[100, 100]} /> {/*[cite: 2] */}
        <shadowMaterial transparent opacity={0.2} /> {/*[cite: 2] */}
      </mesh>
    </>
  );
};
