import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";
import { profile, socials } from "@mylife/profile";
import { LivingPortrait } from "./LivingPortrait";
import { Plaque } from "./Plaque";
import { iconTexture } from "./iconTexture";

interface LinkSpec {
  id: string;
  label: string;
  hint: string;
  icon: string;
  href: string;
}

const byId = (id: string) => socials.find((s) => s.id === id)!;
const social = (id: string): LinkSpec => {
  const s = byId(id);
  return { id: s.id, label: s.label, hint: s.handle, icon: s.icon, href: s.url };
};

const LEFT_COLUMN: LinkSpec[] = [
  { id: "resume", label: "Résumé", hint: "Open PDF", icon: "resume", href: profile.resumeUrl },
  { id: "email", label: "Email", hint: profile.email, icon: "email", href: `mailto:${profile.email}` },
  { ...social("medium"), icon: "medium" },
];
const RIGHT_COLUMN: LinkSpec[] = [social("linkedin"), social("github"), social("youtube")];

const TILE_MAT = new THREE.MeshStandardMaterial({ color: "#5c3a21", roughness: 0.75 });
const TILE_RIM = new THREE.MeshStandardMaterial({ color: "#e6bb11", emissive: "#cc8f00", emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.3 });

const LinkTile = memo(function LinkTile({ link, position }: { link: LinkSpec; position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const texture = useMemo(() => iconTexture(link.icon), [link.icon]);
  const iconMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: texture, transparent: true, color: "#fff4e0", toneMapped: false }),
    [texture],
  );
  useEffect(() => () => iconMat.dispose(), [iconMat]);

  const hover = useHoverable(link.label, link.hint, (value) => {
    hovered.current = value;
  });

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const z = hovered.current ? 0.05 : 0;
    if (Math.abs(node.position.z - z) < 0.0005) return;
    node.position.z = THREE.MathUtils.damp(node.position.z, z, 12, delta);
    iconMat.color.set(hovered.current ? "#ffb347" : "#fff4e0");
  });

  return (
    <group position={position}>
      <group
        ref={group}
        {...hover}
        onClick={(event) => {
          event.stopPropagation();
          window.open(link.href, link.href.startsWith("mailto:") ? "_self" : "_blank", "noopener,noreferrer");
        }}
      >
        <RoundedBox args={[0.22, 0.22, 0.02]} radius={0.03} smoothness={3} material={TILE_RIM} position={[0, 0, -0.008]} />
        <RoundedBox args={[0.2, 0.2, 0.03]} radius={0.03} smoothness={3} material={TILE_MAT} />
        <mesh position={[0, 0, 0.017]} material={iconMat}>
          <planeGeometry args={[0.13, 0.13]} />
        </mesh>
      </group>
    </group>
  );
});

interface AboutWallProps {
  x: number;
  onPortrait: () => void;
}

export function AboutWall({ x, onPortrait }: AboutWallProps) {
  const rows = [2.27, 1.98, 1.69];
  return (
    <group position={[x, 0, 0]} rotation-y={Math.PI / 2}>
      <Plaque text="ABOUT ME" symbol="👤" position={[0, 2.71, 0]} />
      <LivingPortrait position={[0, 1.98, 0.01]} scale={0.62} onClick={onPortrait} />
      {LEFT_COLUMN.map((link, i) => (
        <LinkTile key={link.id} link={link} position={[-0.6, rows[i], 0.02]} />
      ))}
      {RIGHT_COLUMN.map((link, i) => (
        <LinkTile key={link.id} link={link} position={[0.6, rows[i], 0.02]} />
      ))}
    </group>
  );
}
