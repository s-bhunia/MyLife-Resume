import React from "react";

export interface ProfileIconProps {
  name: string;
  url: string;
  pngSrc: string; // Pass your PNG paths here
  xOffset: number; // Horizontal distance to shoot out
  yOffset: number; // Vertical distance to shoot out
  delay: string;
  isMounted: boolean;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  name,
  url,
  pngSrc,
  xOffset,
  yOffset,
  delay,
  isMounted,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="neon-profile-icon"
      title={name}
      style={{
        background: "white",
        // Starts at center (0,0) scaled down, shoots out to offsets
        transform: isMounted
          ? `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px)) scale(1) rotate(0deg)`
          : `translate(-50%, -50%) scale(0.2) rotate(-45deg)`,
        opacity: isMounted ? 1 : 0,
        transitionDelay: delay,
      }}
    >
      <img src={pngSrc} alt={name} style={{ width: "5vw", height: "5vh" }} />
    </a>
  );
};
