import { Suspense, useCallback, useMemo } from "react";
import { Bookshelf } from "@mylife/bookshelf";
import { TubeClock } from "@mylife/tube-clock";
import { TravelGlobe } from "@mylife/globe";
import { StudyDesk } from "@mylife/study-desk";
import { Text } from "@react-three/drei";
import { useHoverable } from "@mylife/core-engine";
import { projects, skills, travel, work } from "@mylife/profile";
import { useWidgetStore } from "@mylife/chatbot/store";
import { useMind } from "../../state/mind";
import { BACK_WALL_Z, FLOOR_Y, LEFT_WALL_X, RIGHT_WALL_X } from "../house/dimensions";
import { AboutWall } from "./AboutWall";
import { HexWall, type HexItem } from "./HexWall";
import { Plaque } from "./Plaque";

const WORK_ITEMS: HexItem[] = [
  ...work.map((w) => ({ id: w.id, title: w.title, tagline: w.tagline, symbol: w.symbol, variant: "work" as const })),
  ...projects.map((p) => ({ id: p.id, title: p.title, tagline: p.tagline, symbol: p.symbol, variant: "project" as const })),
];

const SKILL_ITEMS: HexItem[] = skills.map((s) => ({ id: s.id, title: s.title, tagline: s.tagline, symbol: s.symbol, variant: "skill" }));

function Hoverable({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  const hover = useHoverable(label, hint);
  return <group {...hover}>{children}</group>;
}

export function Interior() {
  const openScroll = useMind((s) => s.openScroll);
  const openBook = useMind((s) => s.openBook);
  const openSoul = useMind((s) => s.openSoul);
  const openAbout = useCallback(() => openScroll("about_me"), [openScroll]);
  const openArchive = useCallback(() => openScroll("archive"), [openScroll]);
  const openJourneys = useCallback(() => openScroll("globe_travel_history"), [openScroll]);
  const openLaptop = useCallback(() => openScroll("voice_agent"), [openScroll]);
  const openAssistant = useCallback(() => {
    const widget = useWidgetStore.getState();
    widget.setViewMode("assistant");
    if (!widget.isOpen) widget.toggleOpen();
  }, []);
  const archiveHover = useHoverable("More builds", "Earlier projects · click to open");
  const z = BACK_WALL_Z + 0.02;
  const workCenter = useMemo<[number, number, number]>(() => [-2.6, 1.74, z], [z]);
  const skillCenter = useMemo<[number, number, number]>(() => [2.6, 1.74, z], [z]);

  return (
    <group>
      <Plaque text="PROJECTS" symbol="💻" position={[-2.6, 2.6, z]} />
      <HexWall center={workCenter} items={WORK_ITEMS} onSelect={openScroll} />
      <group
        position={[-2.6, 0.98, z]}
        {...archiveHover}
        onClick={(event) => {
          event.stopPropagation();
          openArchive();
        }}
      >
        <mesh position={[0, 0, -0.006]}>
          <boxGeometry args={[0.7, 0.15, 0.01]} />
          <meshStandardMaterial color="#e6bb11" emissive="#cc8f00" emissiveIntensity={0.6} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.66, 0.12, 0.02]} />
          <meshStandardMaterial color="#5c3a21" roughness={0.9} />
        </mesh>
        <Text fontSize={0.05} letterSpacing={0.1} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0, 0.012]}>
          MORE BUILDS →
        </Text>
      </group>

      <Plaque text="LIBRARY" symbol="📚" position={[0, 2.6, z]} />
      <Suspense fallback={null}>
        <Bookshelf position={[0, 1.35, -3.5]} scale={0.3} onBookClick={openBook} />
      </Suspense>

      <Plaque text="SKILLS" symbol="⚡" position={[2.6, 2.6, z]} />
      <HexWall center={skillCenter} items={SKILL_ITEMS} onSelect={openScroll} />

      <Hoverable label="Time" hint="Drag the knob to dim the tubes">
        <group position={[4.05, 1.7, -3.78]} scale={0.08}>
          <TubeClock />
        </group>
      </Hoverable>

      <Plaque text="JOURNEYS" symbol="🌍" position={[RIGHT_WALL_X, 2.6, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Hoverable label="Journeys" hint={`From ${travel.origin.label} to ${travel.destinations.map((d) => d.label).join(", ")}`}>
        <group position={[4.2, 1.67, 0]} scale={0.3}>
          <TravelGlobe origin={travel.origin} destinations={travel.destinations} onClick={openJourneys} />
        </group>
      </Hoverable>

      <AboutWall x={LEFT_WALL_X} onPortrait={openAbout} />
      <StudyDesk position={[-4.5, FLOOR_Y, 0]} rotation={[0, Math.PI / 2, 0]} onLaptop={openLaptop} onMicrophone={openAssistant} onDiya={openSoul} />
    </group>
  );
}
