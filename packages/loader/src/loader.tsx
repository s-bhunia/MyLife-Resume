import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { profile, socials } from "@mylife/profile";
import { PingPongDotLoader } from "./PingPongLoader";
import { GlitchGreeting } from "./GlitchTextLoader";
import { ProfileIcon } from "./ProfileIcon";
import { ResumeButton } from "./ResumeButton";
import { ExploreHouseButton } from "./myLifeButton";
import "./loader.css";

export interface LoaderProps {
  onEnter: () => void;
  isSceneReady: boolean;
  progress?: number;
  leaving?: boolean;
  onQuickView?: () => void;
}

const MIN_PONG_MS = 1600;
const ICONS_SETTLE_MS = 1800;
const ICONS = [
  ...socials.map((s) => ({ name: s.label, url: s.url, src: s.icon })),
  { name: "Email", url: `mailto:${profile.email}`, src: "/loader/mail.svg" },
];
const ORDER = [0, 1, 2, 4, 3, 5];
const DELAYS = ["0.1s", "0.3s", "0.5s", "1.1s", "0.9s", "0.7s"];
const EMBERS = Array.from({ length: 14 }, (_, i) => i);

function useViewport() {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export default function Loader({ onEnter, isSceneReady, progress = 0, leaving = false, onQuickView }: LoaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [iconsSettled, setIconsSettled] = useState(false);
  const { width } = useViewport();
  const isMobile = width < 768;
  const showGreeting = isSceneReady && minElapsed;

  useEffect(() => {
    const mount = setTimeout(() => setIsMounted(true), 150);
    const pong = setTimeout(() => setMinElapsed(true), MIN_PONG_MS);
    const settle = setTimeout(() => setIconsSettled(true), ICONS_SETTLE_MS);
    return () => {
      clearTimeout(mount);
      clearTimeout(settle);
      clearTimeout(pong);
    };
  }, []);

  useEffect(() => {
    if (!showGreeting || leaving) return;
    const onKey = (event: KeyboardEvent) => event.key === "Enter" && onEnter();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGreeting, leaving, onEnter]);

  const scale = Math.max(0.3, Math.min(width / 1400, 1));
  const outerX = Math.min(620 * scale, width / 2 - 45);
  const innerX = outerX * 0.86;
  const spreadY = 140 * (isMobile ? 0.95 : Math.max(0.6, scale));
  const desktopSpots: [number, number][] = [
    [-innerX, -spreadY],
    [-outerX, 0],
    [-innerX, spreadY],
    [innerX, -spreadY],
    [outerX, 0],
    [innerX, spreadY],
  ];

  const openQuickView = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onQuickView || event.metaKey || event.ctrlKey || event.button !== 0) return;
    event.preventDefault();
    onQuickView();
  };

  return (
    <div className={`loader-screen${leaving ? " is-leaving" : ""}${isMounted ? " is-mounted" : ""}`}>
      <div className="loader-embers" aria-hidden="true">
        {EMBERS.map((i) => (
          <span
            key={i}
            style={
              {
                "--i": i,
                "--size": `${4 + ((i * 3) % 5)}px`,
                "--dur": `${7 + ((i * 7) % 6)}s`,
                "--drift": `${(((i * 13) % 7) - 3) * 14}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <header className="loader-top">
        <span className="loader-brand">
          <img src="/logo.webp" alt="" width={44} height={44} />
          <span>
            my<b>Life</b>
          </span>
        </span>
        <a className="loader-tag" href="/quick" onClick={openQuickView}>
          Quick view
        </a>
      </header>

      <section className="loader-intro">
        <p className="loader-hello">Hello, I&apos;m</p>
        <h1 className="loader-name">{profile.name}</h1>
        <p className="loader-role">
          <span>{profile.role}</span>
          <i aria-hidden="true" />
          <span>{profile.focus}</span>
        </p>
      </section>

      <section className="loader-core">
        <div className="loader-device">{showGreeting ? <GlitchGreeting /> : <PingPongDotLoader dotSize={isMobile ? 9 : 12} />}</div>
        {ORDER.map((iconIndex, slot) => {
          const icon = ICONS[iconIndex];
          const offset = slot - 2.5;
          const [x, y] = isMobile ? [offset * 52, 120 + offset * offset * 10] : desktopSpots[slot];
          return (
            <ProfileIcon
              key={icon.name}
              name={icon.name}
              url={icon.url}
              pngSrc={icon.src}
              xOffset={x}
              yOffset={y}
              delay={DELAYS[slot]}
              isMounted={isMounted}
              settled={iconsSettled}
            />
          );
        })}
      </section>

      <section className="loader-actions">
        <ExploreHouseButton onClick={onEnter} disabled={!isSceneReady || leaving} label={isSceneReady ? "Explore myLife" : "Building the house…"} />
        <ResumeButton resumePath={profile.resumeUrl} />
      </section>

      <p className="loader-status" aria-live="polite">
        {isSceneReady ? "the door is open · press Enter" : `warming up the mind · ${Math.round(Math.min(progress, 1) * 100)}%`}
      </p>
    </div>
  );
}
