import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export interface Opening {
  x: number;
  y: number;
  w: number;
  h: number;
}

const box = (w: number, h: number, d: number, x: number, y: number) => {
  const geometry = new THREE.BoxGeometry(w, h, d);
  geometry.translate(x, y, 0);
  return geometry;
};

export function bandGeometry(length: number, y0: number, y1: number, depth: number, openings: Opening[]) {
  const parts: THREE.BufferGeometry[] = [];
  const cuts = openings
    .map((o) => ({ x0: o.x - o.w / 2, x1: o.x + o.w / 2, y0: Math.max(o.y - o.h / 2, y0), y1: Math.min(o.y + o.h / 2, y1) }))
    .filter((c) => c.y1 > c.y0)
    .sort((a, b) => a.x0 - b.x0);

  let cursor = -length / 2;
  for (const cut of cuts) {
    if (cut.x0 > cursor) parts.push(box(cut.x0 - cursor, y1 - y0, depth, (cursor + cut.x0) / 2, (y0 + y1) / 2));
    const cx = (cut.x0 + cut.x1) / 2;
    const cw = cut.x1 - cut.x0;
    if (cut.y0 > y0) parts.push(box(cw, cut.y0 - y0, depth, cx, (y0 + cut.y0) / 2));
    if (cut.y1 < y1) parts.push(box(cw, y1 - cut.y1, depth, cx, (cut.y1 + y1) / 2));
    cursor = cut.x1;
  }
  if (cursor < length / 2) parts.push(box(length / 2 - cursor, y1 - y0, depth, (cursor + length / 2) / 2, (y0 + y1) / 2));

  const merged = mergeGeometries(parts, false) ?? new THREE.BufferGeometry();
  parts.forEach((part) => part.dispose());
  return merged;
}
