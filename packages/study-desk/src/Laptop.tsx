import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";
import { MAT } from "./materials";

const W = 512;
const H = 320;
const STAGES = ["MIC", "STT", "LLM", "TTS", "VOICE"];
const LOGS = [
  "listening · vad: speech start",
  "stt  · streaming partial transcript",
  "stt  · final: \"tell me about yourself\"",
  "llm  · first token",
  "llm  · streaming response",
  "tts  · synthesising audio",
  "tts  · speaking",
  "turn · complete, listening again",
];
const FPS = 10;

function drawScreen(ctx: CanvasRenderingContext2D, t: number) {
  ctx.fillStyle = "#0a0e13";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#121821";
  ctx.fillRect(0, 0, W, 28);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16 + i * 16, 14, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = "500 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#8d95a7";
  ctx.fillText("voice-agent — live", 70, 18);
  ctx.fillStyle = "#5ee7ff";
  ctx.fillText("● streaming", W - 112, 18);

  const active = Math.floor(t * 1.4) % STAGES.length;
  const boxW = 78;
  const gap = (W - 40 - boxW * STAGES.length) / (STAGES.length - 1);
  STAGES.forEach((stage, i) => {
    const x = 20 + i * (boxW + gap);
    const on = i === active;
    ctx.fillStyle = on ? "rgba(94,231,255,0.16)" : "#121821";
    ctx.strokeStyle = on ? "#5ee7ff" : "#263041";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, 52, boxW, 44, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = on ? "#eef1f6" : "#8d95a7";
    ctx.font = "600 15px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stage, x + boxW / 2, 79);
    ctx.textAlign = "left";
    if (i < STAGES.length - 1) {
      const sx = x + boxW + 4;
      ctx.strokeStyle = "#263041";
      ctx.beginPath();
      ctx.moveTo(sx, 74);
      ctx.lineTo(sx + gap - 8, 74);
      ctx.stroke();
      const p = ((t * 1.4) % 1 + 1) % 1;
      if (i === active) {
        ctx.fillStyle = "#5ee7ff";
        ctx.beginPath();
        ctx.arc(sx + (gap - 8) * p, 74, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const bars = 48;
  const barW = (W - 40) / bars;
  for (let i = 0; i < bars; i++) {
    const env = Math.exp(-Math.pow((i / bars - 0.5) / 0.3, 2));
    const h = 6 + Math.abs(Math.sin(t * 6 + i * 0.55) * Math.sin(t * 2.3 + i * 0.21)) * 58 * env;
    ctx.fillStyle = i / bars < 0.5 ? "rgba(94,231,255,0.85)" : "rgba(167,139,250,0.85)";
    ctx.fillRect(20 + i * barW, 170 - h / 2, barW - 3, h);
  }

  ctx.font = "500 12px 'JetBrains Mono', monospace";
  const head = Math.floor(t * 1.2);
  for (let i = 0; i < 4; i++) {
    const line = LOGS[(head + i) % LOGS.length];
    ctx.fillStyle = i === 3 ? "#eef1f6" : "rgba(141,149,167," + (0.35 + i * 0.18) + ")";
    ctx.fillText(`› ${line}`, 20, 228 + i * 20);
  }
}

interface LaptopProps {
  position: [number, number, number];
  rotationY?: number;
  onOpen: () => void;
}

export function Laptop({ position, rotationY = 0, onOpen }: LaptopProps) {
  const group = useRef<THREE.Group>(null);
  const clock = useRef({ acc: 0, t: 0 });
  const hover = useHoverable("Current work", "Real-time voice agent · click to open");

  const { texture, ctx, screen } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const context = canvas.getContext("2d")!;
    drawScreen(context, 0);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return { texture: map, ctx: context, screen: new THREE.MeshBasicMaterial({ map, toneMapped: false }) };
  }, []);

  useEffect(
    () => () => {
      texture.dispose();
      screen.dispose();
    },
    [texture, screen],
  );

  const worldPos = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    const c = clock.current;
    c.t += delta;
    c.acc += delta;
    if (c.acc < 1 / FPS) return;
    c.acc = 0;
    node.getWorldPosition(worldPos);
    if (state.camera.position.distanceTo(worldPos) > 4.5) return;
    drawScreen(ctx, c.t);
    texture.needsUpdate = true;
  });

  return (
    <group
      ref={group}
      position={position}
      rotation-y={rotationY}
      {...hover}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <mesh material={MAT.aluminium} position={[0, 0.006, 0]} castShadow>
        <boxGeometry args={[0.33, 0.012, 0.23]} />
      </mesh>
      <mesh material={MAT.keyboard} position={[0, 0.0125, -0.02]}>
        <boxGeometry args={[0.29, 0.002, 0.11]} />
      </mesh>
      <mesh material={MAT.rubber} position={[0, 0.0125, 0.075]}>
        <boxGeometry args={[0.11, 0.0015, 0.06]} />
      </mesh>
      <group position={[0, 0.012, -0.112]} rotation-x={-0.28}>
        <mesh material={MAT.aluminium} position={[0, 0.108, -0.004]} castShadow>
          <boxGeometry args={[0.33, 0.216, 0.007]} />
        </mesh>
        <mesh material={screen} position={[0, 0.108, 0.0002]}>
          <planeGeometry args={[0.31, 0.194]} />
        </mesh>
      </group>
    </group>
  );
}
