import { useCallback, useEffect, useRef, useState } from "react";
import { AnimationScene } from "./AnimationScene";
import type { AnimationSequence } from "./types";
import "./intro.css";

type Stage = "idle" | "preparing" | "playing" | "error";

export interface IntroAnimationProps {
  onAnimationComplete: () => void;
  sequencesUrl?: string;
}

export function IntroAnimation({ onAnimationComplete, sequencesUrl = "/landing-animation/sequences.json" }: IntroAnimationProps) {
  const mount = useRef<HTMLDivElement>(null);
  const scene = useRef<AnimationScene | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [prepared, setPrepared] = useState(0);
  const sequences = useRef<Promise<AnimationSequence[]> | null>(null);

  useEffect(() => {
    sequences.current = fetch(sequencesUrl).then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${sequencesUrl}`);
      return response.json() as Promise<AnimationSequence[]>;
    });
    sequences.current.catch(() => setStage("error"));
    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, [sequencesUrl]);

  const begin = useCallback(async () => {
    if (!mount.current || scene.current || !sequences.current) return;
    setStage("preparing");
    try {
      const [Tone, list] = await Promise.all([import("tone"), sequences.current]);
      await Tone.start();
      const sequence = list[Math.floor(Math.random() * list.length)];
      scene.current = new AnimationScene({
        mount: mount.current,
        sequence,
        tone: Tone,
        onPrepare: setPrepared,
        onPlaying: () => setStage("playing"),
        onComplete: onAnimationComplete,
      });
      await scene.current.start();
    } catch {
      setStage("error");
    }
  }, [onAnimationComplete]);

  return (
    <div className="intro">
      <div ref={mount} className="intro-stage" />
      {stage === "idle" && (
        <div className="intro-gate">
          <p>Turn your sound on</p>
          <button type="button" className="intro-button" onClick={begin}>
            <span>Begin</span>
          </button>
        </div>
      )}
      {stage === "preparing" && <p className="intro-status">tuning in · {Math.round(prepared * 100)}%</p>}
      {stage === "playing" && (
        <button type="button" className="intro-button intro-skip" onClick={() => scene.current?.skip()}>
          <span>Skip</span>
        </button>
      )}
      {stage === "error" && (
        <div className="intro-gate">
          <p>This corner of my mind is resting right now.</p>
          <button type="button" className="intro-button" onClick={onAnimationComplete}>
            <span>Go back</span>
          </button>
        </div>
      )}
    </div>
  );
}
