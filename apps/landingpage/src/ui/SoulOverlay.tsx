import { useEffect } from "react";
import { IntroAnimation } from "@mylife/landing-animation";

export default function SoulOverlay({ leaving, onClose }: { leaving: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={`soul layer${leaving ? " is-leaving" : ""}`}>
      <IntroAnimation onAnimationComplete={onClose} />
      <button type="button" className="soul-close" onClick={onClose} aria-label="Leave and return to the room">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
