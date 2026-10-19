import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { gsap } from "gsap";
import type * as ToneNS from "tone";
import type { AnimationSequence, LyricLine } from "./types";

type Tone = typeof ToneNS;
type FontKey = LyricLine["font"];

const ASSET_ROOT = "/landing-animation";
const TEXT_SIZE = 4.5;
const PUSH_RADIUS = 2.5;
const PUSH_STRENGTH = 0.5;
const COLOR_A = new THREE.Color(0xda70d6);
const COLOR_B = new THREE.Color(0x00bfff);

export interface AnimationSceneOptions {
  mount: HTMLDivElement;
  sequence: AnimationSequence;
  tone: Tone;
  onPrepare: (progress: number) => void;
  onPlaying: () => void;
  onComplete: () => void;
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function particleBudget() {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency ?? 4;
  return small || cores <= 4 ? 18000 : 36000;
}

export class AnimationScene {
  private readonly opts: AnimationSceneOptions;
  private readonly count = particleBudget();
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly targets = new Map<string, Float32Array>();
  private readonly colorCache = new Map<string, Float32Array>();
  private readonly tweens: gsap.core.Tween[] = [];
  private readonly active = new Map<THREE.BufferAttribute, gsap.core.Tween>();
  private readonly mouse = new THREE.Vector2(-100, -100);
  private readonly lastMouse = new THREE.Vector2();
  private readonly ray = new THREE.Vector3();
  private readonly hit = new THREE.Vector3();
  private fonts?: Record<FontKey, Font>;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private stars?: THREE.Points;
  private background?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private backgrounds: THREE.Texture[] = [];
  private timeline?: gsap.core.Timeline;
  private synths: { dispose(): void }[] = [];
  private player?: ToneNS.Player;
  private morphSynth?: ToneNS.PolySynth;
  private touchSynth?: ToneNS.MetalSynth;
  private scatterSynth?: ToneNS.NoiseSynth;
  private exitSynth?: ToneNS.PluckSynth;
  private frame = 0;
  private interactive = false;
  private disposed = false;
  private lastMouseTime = 0;
  private mouseVelocity = 0;
  private lastPush = 0;

  constructor(opts: AnimationSceneOptions) {
    this.opts = opts;
    this.camera.position.z = 18;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    opts.mount.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
  }

  async start() {
    this.createStars();
    this.frame = requestAnimationFrame(this.animate);
    this.createAudio();
    const [backgrounds] = await Promise.all([this.loadBackgrounds(), this.loadFonts(), this.player?.load(this.opts.sequence.audioUrl)]);
    if (this.disposed) return;
    this.backgrounds = backgrounds;
    if (backgrounds[0]) this.createBackground(backgrounds[0]);

    const { lyrics } = this.opts.sequence;
    for (let i = 0; i < lyrics.length; i++) {
      const lyric = lyrics[i];
      if (!this.targets.has(lyric.text)) this.targets.set(lyric.text, this.sampleText(lyric.text, lyric.font));
      this.opts.onPrepare((i + 1) / lyrics.length);
      await nextFrame();
      if (this.disposed) return;
    }
    this.createParticles();
    this.play();
  }

  skip() {
    this.timeline?.kill();
    this.player?.stop();
    this.exitSynth?.triggerAttackRelease("C5", "1n");
    this.fadeOut(1.2);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.timeline?.kill();
    this.tweens.forEach((tween) => tween.kill());
    gsap.killTweensOf(this.opts.mount);
    this.player?.stop();
    this.player?.dispose();
    this.synths.forEach((synth) => synth.dispose());
    this.backgrounds.forEach((texture) => texture.dispose());
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private createAudio() {
    const Tone = this.opts.tone;
    this.player = new Tone.Player().toDestination();
    this.player.volume.value = -3;
    this.morphSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fmsawtooth", modulationIndex: 10, harmonicity: 0.5 },
      envelope: { attack: 0.2, decay: 0.4, sustain: 0.5, release: 1.2 },
      volume: -10,
    }).toDestination();
    this.touchSynth = new Tone.MetalSynth({
      envelope: { attack: 0.005, decay: 0.3, release: 0.2 },
      harmonicity: 9,
      modulationIndex: 15,
      resonance: 3000,
      octaves: 1.2,
      volume: -18,
    }).toDestination();
    this.scatterSynth = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.01, decay: 0.8, sustain: 0, release: 0.2 },
      volume: -8,
    }).toDestination();
    const ambient = new Tone.AMSynth({ harmonicity: 2, envelope: { attack: 3, decay: 2, sustain: 0.6, release: 5 }, volume: -28 }).toDestination();
    this.exitSynth = new Tone.PluckSynth({ attackNoise: 1, dampening: 4000, resonance: 0.9, volume: -12 }).toDestination();
    this.synths = [this.morphSynth, this.touchSynth, this.scatterSynth, ambient, this.exitSynth];
    if (Tone.getContext().state === "running") ambient.triggerAttack("C2");
  }

  private loadFonts() {
    const loader = new FontLoader();
    return Promise.all([
      loader.loadAsync(`${ASSET_ROOT}/fonts/helvetiker_bold.json`),
      loader.loadAsync(`${ASSET_ROOT}/fonts/noto_devanagari.json`),
    ]).then(([helvetiker, devanagari]) => {
      this.fonts = { helvetiker, devanagari };
    });
  }

  private loadBackgrounds() {
    const sequence = this.opts.sequence;
    const urls = Object.keys(sequence)
      .filter((key) => key.startsWith("background"))
      .map((key) => sequence[key as `background${string}`])
      .filter((url): url is string => typeof url === "string");
    const loader = new THREE.TextureLoader();
    return Promise.all(
      urls.map((url) =>
        loader.loadAsync(url).then((texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          return texture;
        }),
      ),
    );
  }

  private createStars() {
    const positions = new Float32Array(6000 * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 200;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x666666, size: 0.06, transparent: true }));
    this.scene.add(this.stars);
  }

  private planeSize() {
    const distance = this.camera.position.z + 20;
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * distance;
    return { width: height * this.camera.aspect, height };
  }

  private createBackground(texture: THREE.Texture) {
    const { width, height } = this.planeSize();
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    this.background = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    this.background.position.z = -20;
    this.fitBackground(texture);
    this.scene.add(this.background);
  }

  private fitBackground(texture: THREE.Texture) {
    if (!this.background) return;
    const image = texture.image as { width: number; height: number };
    const imageAspect = image.width / image.height;
    const planeAspect = this.camera.aspect;
    if (planeAspect > imageAspect) this.background.scale.set(1, planeAspect / imageAspect, 1);
    else this.background.scale.set(imageAspect / planeAspect, 1, 1);
  }

  private sampleText(text: string, fontKey: FontKey) {
    const font = this.fonts![fontKey];
    const ordered = fontKey === "devanagari" ? this.reorderDevanagari(text) : text;
    const geometry = new TextGeometry(ordered, {
      font,
      size: TEXT_SIZE,
      depth: fontKey === "devanagari" ? 0.5 : 0.8,
      curveSegments: fontKey === "devanagari" ? 5 : 6,
      bevelEnabled: false,
    });
    geometry.center();
    const out = new Float32Array(this.count * 3);
    const mesh = new THREE.Mesh(geometry);
    try {
      const sampler = new MeshSurfaceSampler(mesh).build();
      const point = new THREE.Vector3();
      for (let i = 0; i < this.count; i++) {
        sampler.sample(point);
        out[i * 3] = point.x;
        out[i * 3 + 1] = point.y;
        out[i * 3 + 2] = point.z;
      }
    } catch {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      for (let i = 0; i < this.count; i++) {
        out[i * 3] = THREE.MathUtils.lerp(box.min.x, box.max.x, Math.random());
        out[i * 3 + 1] = THREE.MathUtils.lerp(box.min.y, box.max.y, Math.random());
        out[i * 3 + 2] = THREE.MathUtils.lerp(box.min.z, box.max.z, Math.random());
      }
    }
    geometry.dispose();
    return out;
  }

  private reorderDevanagari(text: string) {
    const chars = [...text];
    for (let i = 1; i < chars.length; i++) {
      if (chars[i] === "ि") [chars[i - 1], chars[i]] = [chars[i], chars[i - 1]];
    }
    return chars.join("");
  }

  private colorsFor(text: string) {
    const cached = this.colorCache.get(text);
    if (cached) return cached;
    const target = this.targets.get(text)!;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < this.count; i++) {
      const x = target[i * 3];
      if (x < min) min = x;
      if (x > max) max = x;
    }
    const span = max - min || 1;
    const colors = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      const t = (target[i * 3] - min) / span;
      colors[i * 3] = COLOR_A.r + (COLOR_B.r - COLOR_A.r) * t;
      colors[i * 3 + 1] = COLOR_A.g + (COLOR_B.g - COLOR_A.g) * t;
      colors[i * 3 + 2] = COLOR_A.b + (COLOR_B.b - COLOR_A.b) * t;
    }
    this.colorCache.set(text, colors);
    return colors;
  }

  private createParticles() {
    const first = this.opts.sequence.lyrics[0].text;
    const positions = new Float32Array(this.count * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 30;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color", new THREE.BufferAttribute(this.colorsFor(first).slice(), 3).setUsage(THREE.DynamicDrawUsage));
    geometry.userData.target = this.targets.get(first);
    const material = new THREE.PointsMaterial({
      size: this.count > 20000 ? 0.04 : 0.055,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
    });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private tweenArray(attribute: THREE.BufferAttribute, to: Float32Array, duration: number) {
    const array = attribute.array as Float32Array;
    const from = array.slice();
    const proxy = { t: 0 };
    this.active.get(attribute)?.kill();
    const tween = gsap.to(proxy, {
      t: 1,
      duration,
      ease: "power3.inOut",
      onUpdate: () => {
        const t = proxy.t;
        for (let i = 0; i < array.length; i++) array[i] = from[i] + (to[i] - from[i]) * t;
        attribute.needsUpdate = true;
      },
    });
    this.active.set(attribute, tween);
    this.tweens.push(tween);
    return tween;
  }

  private later(delay: number, fn: () => void) {
    this.tweens.push(gsap.delayedCall(delay, fn));
  }

  private play() {
    const particles = this.particles!;
    const { lyrics, chords, flashEvents } = this.opts.sequence;
    const position = particles.geometry.getAttribute("position") as THREE.BufferAttribute;
    const color = particles.geometry.getAttribute("color") as THREE.BufferAttribute;
    const Tone = this.opts.tone;
    const timeline = gsap.timeline({ paused: true, onComplete: () => this.scatter() });
    this.timeline = timeline;

    if (this.background && flashEvents?.length) {
      const material = this.background.material;
      flashEvents.forEach(({ time, duration, intensity }, index) => {
        const flash = gsap.timeline({
          onStart: () => {
            const texture = this.backgrounds[index % this.backgrounds.length];
            if (!texture || !this.background) return;
            material.map = texture;
            material.needsUpdate = true;
            this.fitBackground(texture);
          },
        });
        flash
          .to(material, { opacity: intensity, duration: 0.05 })
          .to(material, { opacity: intensity * 0.3, duration: 0.08 })
          .to(material, { opacity: intensity * 0.9, duration: 0.04 })
          .to(material, { opacity: intensity * 0.5, duration: 0.1 })
          .to(material, { opacity: intensity * 0.7, duration: 0.03 })
          .to(material, { opacity: 0, duration: Math.max(duration - 0.3, 0.2), ease: "power1.out" });
        timeline.add(flash, time);
      });
    }

    let end = 0;
    lyrics.forEach((lyric, index) => {
      const next = lyrics[index + 1];
      const morph = next ? Math.min(next.startTime - lyric.startTime, 3) : Math.min(lyric.holdDuration * 0.3, 2.5);
      const hold = Math.max(lyric.holdDuration - morph, 0.5);
      end = Math.max(end, lyric.startTime + morph + hold);
      const target = this.targets.get(lyric.text)!;
      timeline.call(
        () => {
          particles.geometry.userData.target = target;
          this.morphSynth?.triggerAttackRelease(chords[index % chords.length], "2n", Tone.now());
          this.tweenArray(color, this.colorsFor(lyric.text), morph);
          this.tweenArray(position, target, morph);
          this.interactive = false;
          this.later(morph, () => (this.interactive = true));
          this.later(morph + hold, () => (this.interactive = false));
        },
        [],
        lyric.startTime,
      );
    });
    timeline.to({}, { duration: 0.01 }, end);

    this.player?.start(Tone.now() + 0.1);
    this.later(0.1, () => timeline.play());
    this.opts.onPlaying();
  }

  private scatter() {
    const particles = this.particles;
    if (!particles) return;
    this.interactive = false;
    this.scatterSynth?.triggerAttackRelease("1n");
    const position = particles.geometry.getAttribute("position") as THREE.BufferAttribute;
    const scattered = new Float32Array(this.count * 3);
    for (let i = 0; i < scattered.length; i++) scattered[i] = (Math.random() - 0.5) * 40;
    this.tweenArray(position, scattered, 2);
    gsap.to(particles.material, {
      opacity: 0,
      duration: 2,
      ease: "power2.in",
      onComplete: () => {
        this.exitSynth?.triggerAttackRelease("C5", "1n");
        this.fadeOut(1.5);
      },
    });
  }

  private fadeOut(duration: number) {
    if (this.particles) gsap.to(this.particles.material, { opacity: 0, duration, ease: "power2.in" });
    gsap.to(this.opts.mount, { opacity: 0, duration, onComplete: this.opts.onComplete });
  }

  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    if (this.stars) {
      this.stars.position.x = this.mouse.x * 0.5;
      this.stars.position.y = this.mouse.y * 0.5;
    }
    if (this.interactive && this.particles) this.interact();
    this.renderer.render(this.scene, this.camera);
  };

  private interact() {
    const particles = this.particles!;
    const attribute = particles.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const target = particles.geometry.userData.target as Float32Array;
    this.ray.set(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
    this.hit.copy(this.camera.position).addScaledVector(this.ray, -this.camera.position.z / this.ray.z);
    const hx = this.hit.x;
    const hy = this.hit.y;
    const hz = this.hit.z;
    const r2 = PUSH_RADIUS * PUSH_RADIUS;
    let pushed = 0;

    for (let i = 0; i < array.length; i += 3) {
      let x = array[i];
      let y = array[i + 1];
      let z = array[i + 2];
      const dx = x - hx;
      const dy = y - hy;
      const dz = z - hz;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < r2 && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const f = (PUSH_STRENGTH * (1 - d / PUSH_RADIUS)) / d;
        x += dx * f;
        y += dy * f;
        z += dz * f;
        pushed++;
      }
      array[i] = x + (target[i] - x) * 0.04;
      array[i + 1] = y + (target[i + 1] - y) * 0.04;
      array[i + 2] = z + (target[i + 2] - z) * 0.04;
    }
    attribute.needsUpdate = true;

    const now = this.opts.tone.now();
    if (pushed > 10 && now > this.lastPush + 0.06 && this.touchSynth) {
      const ratio = (Math.log10(pushed) - 1) / (Math.log10(2000) - 1);
      this.touchSynth.volume.value = -25 + Math.min(ratio, 1) * 20;
      const pitches = [200, 250, 300, 350, 400];
      this.touchSynth.frequency.value = pitches[(Math.random() * pitches.length) | 0] + Math.min(this.mouseVelocity * 20, 150);
      this.touchSynth.triggerAttack(now);
      this.lastPush = now;
    }
    this.mouseVelocity *= 0.95;
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.background) {
      const { width, height } = this.planeSize();
      this.background.geometry.dispose();
      this.background.geometry = new THREE.PlaneGeometry(width, height);
      const map = this.background.material.map;
      if (map) this.fitBackground(map);
    }
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    const now = performance.now();
    const elapsed = (now - this.lastMouseTime) / 1000;
    if (elapsed > 0) this.mouseVelocity = this.mouse.distanceTo(this.lastMouse) / elapsed;
    this.lastMouse.copy(this.mouse);
    this.lastMouseTime = now;
  };
}
