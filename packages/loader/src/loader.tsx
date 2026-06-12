import { useState, useEffect } from "react";

import { PingPongDotLoader } from "./PingPongLoader";
import { GlitchGreeting } from "./GlitchTextLoader";
import { ProfileIcon } from "./ProfileIcon";
import { ResumeButton } from "./ResumeButton";
import { ExploreHouseButton } from "./myLifeButton";

export default function Loader({
  onEnter,
  isSceneReady,
}: {
  onEnter: () => void;
  isSceneReady: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [showLoaderAfterDelay, setShowLoaderAfterDelay] = useState(false);

  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", handleResize);

    const mountTimer = setTimeout(() => setIsMounted(true), 150);

    return () => {
      clearTimeout(mountTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setShowLoaderAfterDelay(true);
    }, 7000);
    return () => clearTimeout(delayTimer);
  }, []);

  const { width } = windowDimensions;
  const isMobile = width < 768;

  // --- DESKTOP BOUNDARY MATH ---
  const maxSafeX = width / 2 - 45;
  const scaleWidth = Math.max(0.3, Math.min(width / 1400, 1));
  const outerX = Math.min(680 * scaleWidth, maxSafeX);
  const innerX = outerX * 0.88;
  const scaleHeight = isMobile ? 0.95 : Math.max(0.6, scaleWidth);
  const spreadY = 150 * scaleHeight;

  const socialData = [
    {
      name: "Meta",
      url: "#",
      pngSrc: "/loader/meta.svg",
      x: -innerX,
      y: -spreadY,
      delay: "0.1s",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/s-bhunia/",
      pngSrc: "/loader/linkedin.svg",
      x: -outerX,
      y: 0,
      delay: "0.3s",
    },
    {
      name: "GitHub",
      url: "https://github.com/s-bhunia",
      pngSrc: "/loader/github.svg",
      x: -innerX,
      y: spreadY,
      delay: "0.5s",
    },
    {
      name: "YouTube",
      url: "#",
      pngSrc: "/loader/youtube.svg",
      x: innerX,
      y: -spreadY,
      delay: "1.1s",
    },
    {
      name: "Medium",
      url: "https://medium.com/@santanubhunia9836",
      pngSrc: "/loader/medium.svg",
      x: outerX,
      y: 0,
      delay: "0.9s",
    },
    {
      name: "Discord",
      url: "#",
      pngSrc: "/loader/discord.svg",
      x: innerX,
      y: spreadY,
      delay: "0.7s",
    },
  ];

  return (
    <div className="loader-screen">
      <style>{`
          .loader-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
            background-color: #0d0d14;
            overflow: hidden;
            position: absolute; 
            top: 0;
            left: 0;
            z-index: 999; 
          }

          .neon-profile-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 1; 
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: #12121c;
            border-radius: 50%;
            box-shadow: 0 0 15px 4px rgba(255, 255, 255, 0.5);
            z-index: 20;
            cursor: pointer;
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, box-shadow 0.35s ease, filter 0.35s ease;
          }

          @media (max-width: 480px) {
            .neon-profile-icon {
              width: 50px;
              height: 50px;
            }
          }

          .neon-profile-icon:focus-visible {
            outline: 2px solid rgba(0, 255, 255, 0.8);
            outline-offset: 2px;
          }

          .neon-profile-icon.icon-hovered {
            background: #1a1a24;
            box-shadow: 0 0 25px 12px rgba(0, 255, 255, 0.7), 0 0 50px 25px rgba(0, 255, 255, 0.3);
            filter: brightness(1.15);
          }

          .neon-profile-icon.icon-pressed {
            box-shadow: 0 0 35px 20px rgba(0, 255, 255, 0.9), 0 0 70px 35px rgba(0, 255, 255, 0.4);
            filter: brightness(1.35);
          }

          @media (prefers-reduced-motion: reduce) {
            .neon-profile-icon {
              transition: none;
            }
          }
        `}</style>

      {/* Shift the central loaders and icons UP on mobile 
        to balance the layout and make room for the stacked buttons.
      */}
      <div
        style={{
          position: "relative",
          transform: isMobile ? "translateY(-10vh)" : "none",
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-hidden="true"
      >
        {!isSceneReady || !showLoaderAfterDelay ? (
          <PingPongDotLoader dotSize={12} />
        ) : (
          <GlitchGreeting />
        )}

        {socialData.map((icon, idx) => {
          // --- MOBILE SPATIAL ARC MATH ---
          // Rather than a circle, we calculate a sleek parabolic curve below the text
          const offset = idx - 2.5; // Centers the 6 items (-2.5 to 2.5)
          const mobileX = offset * 55; // Spread them horizontally
          const mobileY = 130 + Math.pow(offset, 2) * 12; // Bend them downward into a "smile"

          const finalX = isMobile ? mobileX : icon.x;
          const finalY = isMobile ? mobileY : icon.y;

          return (
            <ProfileIcon
              key={idx}
              name={icon.name}
              url={icon.url}
              pngSrc={icon.pngSrc}
              xOffset={finalX}
              yOffset={finalY}
              delay={icon.delay}
              isMounted={isMounted}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "6%" : "12%",
          display: "flex",
          // Change to vertical stack on mobile for better ergonomics
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "20px" : "40px",
          alignItems: "center",
          justifyContent: "center",
          opacity: isMounted ? 1 : 0,
          transform: isMounted
            ? `translateY(0) scale(${isMobile ? 0.9 : 1})`
            : `translateY(20px) scale(${isMobile ? 0.9 : 1})`,
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s",
          transformOrigin: "bottom center",
        }}
      >
        {/* Placed ExploreHouse on top so the hover/tap house-popup expands upward cleanly */}
        <ExploreHouseButton onClick={onEnter} />
        <ResumeButton
          onClick={() => window.open("/loader/resume.pdf", "_blank")}
        />
      </div>
    </div>
  );
}
