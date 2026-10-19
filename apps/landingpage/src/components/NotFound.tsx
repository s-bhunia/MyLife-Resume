import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="app-error">
      <p style={{ margin: 0, font: "500 0.8rem/1 var(--font-mono)", color: "var(--flame)", letterSpacing: "0.1em" }}>404 · MEMORY NOT FOUND</p>
      <h1>This thought never existed.</h1>
      <p style={{ margin: 0, color: "var(--ink-2)" }}>The page you're looking for isn't part of this mind, yet.</p>
      <Link to="/" className="hud-pill" style={{ justifySelf: "center", marginTop: 8 }}>
        Back to the mind
      </Link>
    </main>
  );
}
