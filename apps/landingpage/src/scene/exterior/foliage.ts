import * as THREE from "three";

export const windUniform = { value: 0 };

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void, srgb = true) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createLeafTexture() {
  const rand = mulberry32(7);
  return canvasTexture(256, (ctx, size) => {
    const c = size / 2;
    for (let i = 0; i < 46; i++) {
      const r = Math.sqrt(rand()) * size * 0.36;
      const a = rand() * Math.PI * 2;
      const x = c + Math.cos(a) * r;
      const y = c + Math.sin(a) * r;
      const len = size * (0.11 + rand() * 0.07);
      const wid = len * (0.36 + rand() * 0.12);
      const light = 24 + rand() * 22;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + (rand() - 0.5) * 1.6);
      const gradient = ctx.createLinearGradient(-wid, 0, wid, 0);
      gradient.addColorStop(0, `hsl(${92 + rand() * 22}, ${38 + rand() * 18}%, ${light - 6}%)`);
      gradient.addColorStop(1, `hsl(${96 + rand() * 18}, ${42 + rand() * 18}%, ${light + 8}%)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -len / 2);
      ctx.quadraticCurveTo(wid, -len * 0.1, 0, len / 2);
      ctx.quadraticCurveTo(-wid, -len * 0.1, 0, -len / 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(90, 30%, ${light - 12}%, 0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -len / 2);
      ctx.lineTo(0, len / 2);
      ctx.stroke();
      ctx.restore();
    }
  });
}

export function createBarkTexture() {
  const rand = mulberry32(11);
  const texture = canvasTexture(128, (ctx, size) => {
    ctx.fillStyle = "#4a3a2c";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 260; i++) {
      const x = rand() * size;
      const l = 6 + rand() * 30;
      ctx.strokeStyle = rand() > 0.5 ? `rgba(30,22,16,${0.3 + rand() * 0.4})` : `rgba(120,100,80,${0.15 + rand() * 0.2})`;
      ctx.lineWidth = 0.6 + rand() * 1.8;
      ctx.beginPath();
      const y = rand() * size;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 3, y + l);
      ctx.stroke();
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 3);
  return texture;
}

export function createGrassTexture() {
  const rand = mulberry32(3);
  const texture = canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = "#4c6a2c";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 90; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 20 + rand() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tone = rand() > 0.5 ? "96,124,52" : "58,82,34";
      g.addColorStop(0, `rgba(${tone},0.35)`);
      g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 9000; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const light = 22 + rand() * 26;
      ctx.strokeStyle = `hsla(${78 + rand() * 30}, ${35 + rand() * 25}%, ${light}%, ${0.35 + rand() * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 2.5, y - 2 - rand() * 5);
      ctx.stroke();
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const WIND_FN = /* glsl */ `
uniform float uWind;
attribute vec3 aCrown;
vec3 leafWind(vec3 p, float height) {
  float t = uWind;
  float gust = sin(t * 0.7 + p.x * 0.15) * 0.5 + 0.5;
  float sway = sin(t * 1.6 + p.x * 0.8 + p.z * 0.6) * 0.035 + sin(t * 3.1 + p.y * 2.3) * 0.012;
  return vec3(sway * (0.6 + gust), sway * 0.25, sway * 0.5) * clamp(height * 0.35, 0.2, 1.4);
}
`;

export function createLeafMaterial(map: THREE.Texture) {
  const material = new THREE.MeshStandardMaterial({
    map,
    alphaTest: 0.42,
    alphaToCoverage: true,
    side: THREE.DoubleSide,
    roughness: 0.82,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = windUniform;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${WIND_FN}`)
      .replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>
#ifdef USE_INSTANCING
  vec3 cardCenter = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 crownNormal = normalize(cardCenter - aCrown + vec3(0.0, 0.45, 0.0));
  transformedNormal = normalize(normalMatrix * crownNormal);
#endif`,
      )
      .replace(
        "#include <project_vertex>",
        THREE.ShaderChunk.project_vertex.replace(
          "mvPosition = modelViewMatrix * mvPosition;",
          "mvPosition.xyz += leafWind(mvPosition.xyz, mvPosition.y);\nmvPosition = modelViewMatrix * mvPosition;",
        ),
      );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      THREE.ShaderChunk.normal_fragment_begin.replace("normal *= faceDirection;", ""),
    );
  };
  material.customProgramCacheKey = () => "mylife-leaf";
  return material;
}

export function createLeafDepthMaterial(map: THREE.Texture) {
  return new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.42 });
}
