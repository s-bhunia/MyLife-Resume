import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profile } from "@mylife/profile";
import { NAV_VIEWS, VIEWS } from "../config/views";
import { useMind } from "../state/mind";

function useFullscreen() {
  const [active, setActive] = useState(() => Boolean(document.fullscreenElement));
  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else document.documentElement.requestFullscreen?.().catch(() => undefined);
  };
  return [active, toggle] as const;
}

export function Hud() {
  const view = useMind((s) => s.view);
  const goTo = useMind((s) => s.goTo);
  const [fullscreen, toggleFullscreen] = useFullscreen();

  return (
    <header className="hud">
      <button type="button" className="hud-brand" onClick={() => goTo("home")} aria-label="Back to the centre of the room">
        <img src="/logo.webp" alt="" width={38} height={38} />
        <span className="hud-brand-text">
          <strong>{profile.name}</strong>
          <span>{profile.role}</span>
        </span>
      </button>

      <nav className="hud-nav" aria-label="Rooms of the mind">
        {NAV_VIEWS.map((id, i) => (
          <button key={id} type="button" className={view === id ? "is-active" : undefined} onClick={() => goTo(id)} aria-current={view === id}>
            <span className="hud-nav-index">{String(i + 1).padStart(2, "0")}</span>
            {VIEWS[id].label}
          </button>
        ))}
      </nav>

      <div className="hud-actions">
        <Link to="/quick" className="hud-pill">
          Quick view
        </Link>
        <a className="hud-pill" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
          Résumé
        </a>
        <button type="button" className="hud-icon" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d={fullscreen ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
