import { useEffect, useRef } from "react";
import { useHoverInfo } from "@mylife/core-engine/hover";

export function Tooltip() {
  const info = useHoverInfo();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const node = ref.current;
      if (!node || event.pointerType === "touch") return;
      const flip = event.clientX > window.innerWidth - 260;
      node.style.transform = `translate3d(${event.clientX + (flip ? -16 : 18)}px, ${event.clientY + 20}px, 0) translateX(${flip ? "-100%" : "0"})`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={ref} className={`tip${info ? " is-on" : ""}`} aria-hidden="true">
      <strong>{info?.label}</strong>
      {info?.hint && <span>{info.hint}</span>}
    </div>
  );
}
