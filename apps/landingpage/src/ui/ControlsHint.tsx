import { useEffect, useState } from "react";

const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

export function ControlsHint() {
  const [visible, setVisible] = useState(true);
  const touch = isTouch();

  useEffect(() => {
    const hide = window.setTimeout(() => setVisible(false), 9000);
    let armed = false;
    const arm = window.setTimeout(() => (armed = true), 2500);
    const dismiss = () => armed && setVisible(false);
    window.addEventListener("pointerdown", dismiss);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(arm);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  const items = touch
    ? [
        ["Drag", "look around"],
        ["Two fingers", "move"],
        ["Pinch", "zoom"],
        ["Tap", "anything that glows"],
      ]
    : [
        ["Drag", "look around"],
        ["Right-drag", "move"],
        ["Scroll", "zoom"],
        ["Click", "anything that glows"],
      ];

  return (
    <div className={`hint${visible ? " is-on" : ""}`} role="note">
      {items.map(([key, action]) => (
        <span key={key}>
          <kbd>{key}</kbd>
          {action}
        </span>
      ))}
    </div>
  );
}
