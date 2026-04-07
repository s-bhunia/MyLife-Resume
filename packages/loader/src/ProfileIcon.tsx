import React, { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Calculate scale and glow state based on interactions
  const getScale = () => {
    if (!isMounted) return 0.2;
    if (isPressed) return 0.92;
    if (isHovered) return 1.25;
    return 1;
  };

  const scale = getScale();

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`neon-profile-icon ${isHovered ? "icon-hovered" : ""} ${isPressed ? "icon-pressed" : ""}`}
      title={name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        background: "white",
        // Starts at center (0,0) scaled down, shoots out to offsets with smooth transitions
        transform: isMounted
          ? `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px)) scale(${scale}) rotate(0deg)`
          : `translate(-50%, -50%) scale(0.2) rotate(-45deg)`,
        opacity: isMounted ? 1 : 0,
        transitionDelay: !isMounted ? delay : "0s",
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, box-shadow 0.35s ease, filter 0.35s ease",
      }}
    >
      <img src={pngSrc} alt={name} style={{ width: "5vw", height: "5vh", pointerEvents: "none" }} />
    </a>
  );
};
