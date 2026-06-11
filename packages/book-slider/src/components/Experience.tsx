//scr/components/Experience.tsx
import React from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useEffect } from "react";

export const Experience = ({
  bookName,
}: {
  bookName: string;
}): React.JSX.Element => {
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    canvas.style.cursor = 'url("/book-slider/images/feather1.png") 16 16, auto';
    return () => {
      if (canvas) canvas.style.cursor = "";
    };
  }, []);

  return (
    <>
      <Book bookName={bookName} />
      <OrbitControls />
      <Environment preset="sunset" />
      <directionalLight
        position={[1, 9, 1]}
        intensity={1}
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
