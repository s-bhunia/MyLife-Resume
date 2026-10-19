import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32 } from "./foliage";

export interface TreeSpec {
  x: number;
  z: number;
  height: number;
  seed: number;
  lean?: number;
}

export interface BushSpec {
  x: number;
  z: number;
  radius: number;
  seed: number;
}

interface Card {
  position: THREE.Vector3;
  size: number;
  crown: THREE.Vector3;
  shade: number;
}

const UP = new THREE.Vector3(0, 1, 0);

function taperedTube(curve: THREE.Curve<THREE.Vector3>, r0: number, r1: number, segments: number, radial: number) {
  const geometry = new THREE.TubeGeometry(curve, segments, 1, radial, false);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const center = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, center);
    const radius = THREE.MathUtils.lerp(r0, r1, Math.pow(t, 0.8));
    for (let j = 0; j <= radial; j++) {
      const index = i * (radial + 1) + j;
      v.fromBufferAttribute(position, index).sub(center).multiplyScalar(radius).add(center);
      position.setXYZ(index, v.x, v.y, v.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function direction(azimuth: number, polar: number) {
  return new THREE.Vector3(Math.sin(polar) * Math.cos(azimuth), Math.cos(polar), Math.sin(polar) * Math.sin(azimuth)).normalize();
}

function cluster(cards: Card[], rand: () => number, center: THREE.Vector3, radius: number, count: number, crown: THREE.Vector3, size: number) {
  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 1.4 - 0.5, rand() * 2 - 1).normalize();
    const r = radius * (0.45 + 0.55 * Math.sqrt(rand()));
    cards.push({
      position: center.clone().addScaledVector(dir, r),
      size: size * (0.75 + rand() * 0.5),
      crown,
      shade: 0.72 + rand() * 0.38,
    });
  }
}

export function buildTree(spec: TreeSpec) {
  const rand = mulberry32(spec.seed);
  const base = new THREE.Vector3(spec.x, 0, spec.z);
  const h = spec.height;
  const lean = spec.lean ?? 0.25;
  const leanDir = rand() * Math.PI * 2;
  const trunkCurve = new THREE.CatmullRomCurve3([
    base.clone(),
    base.clone().add(new THREE.Vector3(Math.cos(leanDir) * lean * 0.2, h * 0.35, Math.sin(leanDir) * lean * 0.2)),
    base.clone().add(new THREE.Vector3(Math.cos(leanDir) * lean * 0.6 + (rand() - 0.5) * 0.2, h * 0.7, Math.sin(leanDir) * lean * 0.6)),
    base.clone().add(new THREE.Vector3(Math.cos(leanDir) * lean, h, Math.sin(leanDir) * lean)),
  ]);
  const trunkRadius = 0.05 * h;
  const woods: THREE.BufferGeometry[] = [taperedTube(trunkCurve, trunkRadius, trunkRadius * 0.25, 10, 8)];
  const cards: Card[] = [];
  const crown = trunkCurve.getPointAt(0.8).clone();
  const leafSize = 0.55 + h * 0.03;

  const mains = 5 + Math.floor(rand() * 3);
  for (let m = 0; m < mains; m++) {
    const t = 0.42 + (m / mains) * 0.45 + rand() * 0.05;
    const start = trunkCurve.getPointAt(t);
    const dir = direction((m / mains) * Math.PI * 2 + rand() * 0.8, 0.6 + rand() * 0.45);
    const length = h * (0.32 + rand() * 0.16) * (1.1 - t * 0.5);
    const mid = start.clone().addScaledVector(dir, length * 0.5).add(new THREE.Vector3(0, length * 0.12, 0));
    const tip = start.clone().addScaledVector(dir, length).add(new THREE.Vector3(0, length * 0.22, 0));
    const curve = new THREE.CatmullRomCurve3([start, mid, tip]);
    const r0 = trunkRadius * (0.55 - t * 0.25);
    woods.push(taperedTube(curve, r0, r0 * 0.25, 6, 6));
    cluster(cards, rand, tip, 0.75 + h * 0.05, 30, crown, leafSize);
    cluster(cards, rand, mid.clone().add(new THREE.Vector3(0, 0.25, 0)), 0.55, 12, crown, leafSize);

    const subs = 2 + Math.floor(rand() * 2);
    for (let s = 0; s < subs; s++) {
      const st = 0.45 + rand() * 0.4;
      const sStart = curve.getPointAt(st);
      const sDir = dir.clone().applyAxisAngle(UP, (rand() - 0.5) * 1.8).add(new THREE.Vector3(0, 0.5, 0)).normalize();
      const sLen = length * (0.35 + rand() * 0.2);
      const sTip = sStart.clone().addScaledVector(sDir, sLen);
      woods.push(taperedTube(new THREE.LineCurve3(sStart, sTip), r0 * 0.45, r0 * 0.12, 3, 5));
      cluster(cards, rand, sTip, 0.5 + h * 0.03, 16, crown, leafSize * 0.9);
    }
  }
  cluster(cards, rand, trunkCurve.getPointAt(1).add(new THREE.Vector3(0, 0.2, 0)), 0.9 + h * 0.05, 34, crown, leafSize);

  const wood = mergeGeometries(woods, false)!;
  woods.forEach((g) => g.dispose());
  return { wood, cards };
}

export function buildBush(spec: BushSpec) {
  const rand = mulberry32(spec.seed);
  const cards: Card[] = [];
  const crown = new THREE.Vector3(spec.x, spec.radius * 0.4, spec.z);
  const lobes = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < lobes; i++) {
    const a = rand() * Math.PI * 2;
    const c = new THREE.Vector3(spec.x + Math.cos(a) * spec.radius * 0.45, spec.radius * (0.45 + rand() * 0.3), spec.z + Math.sin(a) * spec.radius * 0.45);
    cluster(cards, rand, c, spec.radius * 0.6, 26, crown, 0.32 + spec.radius * 0.18);
  }
  return cards;
}

export function writeCards(mesh: THREE.InstancedMesh, cards: Card[]) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const scale = new THREE.Vector3();
  const color = new THREE.Color();
  const crowns = new Float32Array(cards.length * 3);
  const rand = mulberry32(99);
  cards.forEach((card, i) => {
    euler.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
    quaternion.setFromEuler(euler);
    scale.setScalar(card.size);
    matrix.compose(card.position, quaternion, scale);
    mesh.setMatrixAt(i, matrix);
    color.setRGB(card.shade * (0.92 + rand() * 0.1), card.shade, card.shade * (0.85 + rand() * 0.1));
    mesh.setColorAt(i, color);
    card.crown.toArray(crowns, i * 3);
  });
  mesh.geometry.setAttribute("aCrown", new THREE.InstancedBufferAttribute(crowns, 3));
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}
