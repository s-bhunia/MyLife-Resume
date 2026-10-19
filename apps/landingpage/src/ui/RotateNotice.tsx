import { useState } from "react";
import { Link } from "react-router-dom";

export function RotateNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rotate" role="dialog" aria-label="Rotate your device">
      <div className="rotate-phone" aria-hidden="true" />
      <h2>Turn your phone sideways</h2>
      <p>The rooms of this mind are wide. Landscape gives you the full view.</p>
      <div className="rotate-actions">
        <Link to="/quick" className="hud-pill">
          Open quick view
        </Link>
        <button type="button" className="hud-pill is-ghost" onClick={() => setDismissed(true)}>
          Stay in portrait
        </button>
      </div>
    </div>
  );
}
