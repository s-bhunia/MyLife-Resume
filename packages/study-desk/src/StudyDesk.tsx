import { memo } from "react";
import { Chair, DeskLamp, Headphones, Microphone, Mug, Notebook } from "./DeskProps";
import { Diya } from "./Diya";
import { Laptop } from "./Laptop";
import { MAT } from "./materials";

const TOP_Y = 0.74;
const TOP_T = 0.035;
const WIDTH = 1.45;
const DEPTH = 0.64;
const SURFACE = TOP_Y + TOP_T / 2;

export interface StudyDeskProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  onLaptop: () => void;
  onMicrophone: () => void;
  onDiya: () => void;
}

const legs: [number, number][] = [
  [-WIDTH / 2 + 0.05, -DEPTH / 2 + 0.05],
  [WIDTH / 2 - 0.05, -DEPTH / 2 + 0.05],
  [-WIDTH / 2 + 0.05, DEPTH / 2 - 0.05],
  [WIDTH / 2 - 0.05, DEPTH / 2 - 0.05],
];

export const StudyDesk = memo(function StudyDesk({ position, rotation, onLaptop, onMicrophone, onDiya }: StudyDeskProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh material={MAT.walnut} position={[0, TOP_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH, TOP_T, DEPTH]} />
      </mesh>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} material={MAT.steel} position={[x, TOP_Y / 2 - 0.01, z]} castShadow>
          <boxGeometry args={[0.035, TOP_Y - 0.02, 0.035]} />
        </mesh>
      ))}
      <mesh material={MAT.steel} position={[0, TOP_Y - 0.06, -DEPTH / 2 + 0.05]}>
        <boxGeometry args={[WIDTH - 0.1, 0.06, 0.02]} />
      </mesh>
      <group position={[0.42, TOP_Y - 0.085, 0.01]}>
        <mesh material={MAT.walnutDark} castShadow>
          <boxGeometry args={[0.46, 0.13, DEPTH - 0.1]} />
        </mesh>
        <mesh material={MAT.brass} position={[0, 0, (DEPTH - 0.1) / 2 + 0.006]}>
          <boxGeometry args={[0.14, 0.012, 0.012]} />
        </mesh>
      </group>

      <Laptop position={[0, SURFACE, 0.03]} onOpen={onLaptop} />
      <Microphone position={[-0.48, SURFACE, 0.07]} onOpen={onMicrophone} />
      <Diya position={[-0.6, SURFACE, -0.15]} onOpen={onDiya} />
      <DeskLamp position={[0.57, SURFACE, -0.19]} />
      <Mug position={[0.36, SURFACE, 0.14]} />
      <Headphones position={[0.6, SURFACE, 0.12]} rotationY={0.5} />
      <Notebook position={[-0.27, SURFACE, 0.19]} rotationY={0.2} />
      <Chair position={[0.62, 0, 0.82]} rotationY={Math.PI + 0.75} />
    </group>
  );
});
