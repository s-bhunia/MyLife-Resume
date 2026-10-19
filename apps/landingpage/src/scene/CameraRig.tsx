import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { INTRO, ROOM_BOUNDS, VIEWS } from "../config/views";
import { useMind } from "../state/mind";

type Controls = CameraControls;

const ACTION = { NONE: 0, ROTATE: 1, TRUCK: 2, DOLLY: 16, TOUCH_ROTATE: 64, TOUCH_DOLLY_TRUCK: 4096 } as const;

const v = (tuple: readonly [number, number, number]) => new THREE.Vector3(...tuple);

export function CameraRig() {
  const controls = useRef<Controls>(null);
  const phase = useMind((s) => s.phase);
  const view = useMind((s) => s.view);
  const navNonce = useMind((s) => s.navNonce);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const { phase: current, view: currentView } = useMind.getState();
    if (current === "exploring") {
      const resume = VIEWS[currentView];
      c.setLookAt(...resume.position, ...resume.target, false);
      c.setBoundary(new THREE.Box3(v(ROOM_BOUNDS.min), v(ROOM_BOUNDS.max)));
    } else {
      c.setLookAt(...INTRO.start.position, ...INTRO.start.target, false);
    }
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    const c = controls.current;
    if (phase !== "entering" || !c) return;

    const home = VIEWS.home;
    const positions = new THREE.CatmullRomCurve3([
      v(INTRO.start.position),
      new THREE.Vector3(7.5, 4.6, 14.5),
      new THREE.Vector3(1.6, 2.2, 8.4),
      v(INTRO.door.position),
    ]);
    const targets = new THREE.CatmullRomCurve3([v(INTRO.start.target), new THREE.Vector3(0, 1.8, 1.8), v(INTRO.door.target)]);
    const inside = new THREE.LineCurve3(v(INTRO.door.position), v(home.position));
    const insideTarget = new THREE.LineCurve3(v(INTRO.door.target), v(home.target));
    const pos = new THREE.Vector3();
    const tgt = new THREE.Vector3();
    const state = { outside: 0, inside: 0 };

    const apply = (curve: THREE.Curve<THREE.Vector3>, lookCurve: THREE.Curve<THREE.Vector3>, t: number) => {
      curve.getPointAt(t, pos);
      lookCurve.getPointAt(t, tgt);
      c.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, false);
    };

    const timeline = gsap.timeline({
      onComplete: () => {
        c.setBoundary(new THREE.Box3(v(ROOM_BOUNDS.min), v(ROOM_BOUNDS.max)));
        useMind.getState().finishIntro();
      },
    });
    timeline
      .to(state, { outside: 1, duration: 2.8, ease: "power2.inOut", onUpdate: () => apply(positions, targets, state.outside) })
      .call(() => useMind.getState().openDoor(), [], 2.15)
      .to(state, { inside: 1, duration: 2.1, ease: "power2.inOut", onUpdate: () => apply(inside, insideTarget, state.inside) }, 3.05);

    const skip = (event: Event) => {
      if (event instanceof KeyboardEvent && !["Escape", " ", "Enter"].includes(event.key)) return;
      useMind.getState().openDoor();
      timeline.progress(1);
    };
    const arm = window.setTimeout(() => {
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
    }, 400);

    return () => {
      window.clearTimeout(arm);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      timeline.kill();
    };
  }, [phase]);

  useEffect(() => {
    const c = controls.current;
    if (!c || phase !== "exploring" || navNonce === 0) return;
    const goal = VIEWS[view];
    const fromPos = c.getPosition(new THREE.Vector3());
    const fromTarget = c.getTarget(new THREE.Vector3());
    const toPos = v(goal.position);
    const toTarget = v(goal.target);
    const pos = new THREE.Vector3();
    const tgt = new THREE.Vector3();
    const travel = Math.max(fromPos.distanceTo(toPos), fromTarget.distanceTo(toTarget));
    const state = { k: 0 };
    const tween = gsap.to(state, {
      k: 1,
      duration: THREE.MathUtils.clamp(0.7 + travel * 0.16, 0.8, 1.6),
      ease: "power2.inOut",
      onUpdate: () => {
        pos.lerpVectors(fromPos, toPos, state.k);
        tgt.lerpVectors(fromTarget, toTarget, state.k);
        c.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, false);
      },
    });
    const interrupt = () => tween.kill();
    c.addEventListener("controlstart", interrupt);
    return () => {
      tween.kill();
      c.removeEventListener("controlstart", interrupt);
    };
  }, [view, navNonce, phase]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      enabled={phase === "exploring"}
      smoothTime={0.55}
      draggingSmoothTime={0.12}
      minDistance={0.35}
      maxDistance={6}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI * 0.64}
      azimuthRotateSpeed={0.55}
      polarRotateSpeed={0.55}
      dollySpeed={0.5}
      truckSpeed={1.4}
      boundaryEnclosesCamera
      boundaryFriction={0.2}
      mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.DOLLY, right: ACTION.TRUCK, wheel: ACTION.DOLLY }}
      touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY_TRUCK, three: ACTION.TOUCH_DOLLY_TRUCK }}
    />
  );
}
