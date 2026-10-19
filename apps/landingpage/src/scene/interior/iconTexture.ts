import * as THREE from "three";

const SIZE = 128;
const cache = new Map<string, THREE.CanvasTexture>();

const GLYPHS: Record<string, string> = {
  resume: "M38 18h36l22 22v70H38z M74 18v22h22 M52 62h30 M52 76h30 M52 90h20",
  email: "M20 38h88v56H20z M20 40l44 32 44-32",
};

function finish(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function iconTexture(source: string): THREE.CanvasTexture {
  const cached = cache.get(source);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const texture = finish(canvas);
  cache.set(source, texture);

  if (source === "medium") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(40, 64, 26, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(84, 64, 13, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(108, 64, 5, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    texture.needsUpdate = true;
    return texture;
  }

  const glyph = GLYPHS[source];
  if (glyph) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke(new Path2D(glyph));
    texture.needsUpdate = true;
    return texture;
  }

  const image = new Image(SIZE, SIZE);
  image.onload = () => {
    const pad = SIZE * 0.14;
    ctx.drawImage(image, pad, pad, SIZE - pad * 2, SIZE - pad * 2);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    texture.needsUpdate = true;
  };
  image.src = source;
  return texture;
}
