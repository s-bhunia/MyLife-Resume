import React from "react";

export interface ProfileIconProps {
  name: string;
  url: string;
  pngSrc: string;
  xOffset: number;
  yOffset: number;
  delay: string;
  isMounted: boolean;
  settled: boolean;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({ name, url, pngSrc, xOffset, yOffset, delay, isMounted, settled }) => (
  <a
    href={url}
    target={url.startsWith("mailto:") ? undefined : "_blank"}
    rel="noreferrer"
    className="neon-profile-icon"
    title={name}
    aria-label={name}
    style={
      {
        "--x": `${xOffset}px`,
        "--y": `${yOffset}px`,
        transitionDelay: isMounted && !settled ? delay : "0s",
        opacity: isMounted ? 1 : 0,
        transform: isMounted
          ? `translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(var(--s, 1))`
          : `translate(-50%, -50%) scale(0.2) rotate(-45deg)`,
      } as React.CSSProperties
    }
  >
    <img src={pngSrc} alt="" width={26} height={26} />
  </a>
);
