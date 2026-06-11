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

  // Track both width and height for precise boundary calculations
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    // This resize listener is perfectly safe for performance because
    // the Loader component is destroyed entirely once you enter the house.
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

  useEffect(() => {
    if (isSceneReady && showLoaderAfterDelay) {
      // Loader will be hidden by parent component
    }
  }, [isSceneReady, showLoaderAfterDelay]);

  const { width } = windowDimensions;
  const isMobile = width < 768;

  // --- 1. BOUNDARY MATH: Ensure icons NEVER bleed off screen ---
  // A 60px icon needs 30px to clear its own center, plus a 15px safe padding margin = 45px.
  const maxSafeX = width / 2 - 45;

  // --- 2. DYNAMIC ELLIPSE GENERATION ---
  const scaleWidth = Math.max(0.3, Math.min(width / 1400, 1));

  // Calculate the ideal X offset, but strictly clamp it so it never exceeds maxSafeX
  const outerX = Math.min(680 * scaleWidth, maxSafeX);

  // The Top and Bottom icons sit slightly inward (88%) to create a beautiful oval/circle
  const innerX = outerX * 0.88;

  // On tall, narrow mobile screens, we give them a larger vertical spread
  // so they form a clean circle instead of overlapping in the middle.
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

          /* Force shrink the physical icon size slightly on very small phones */
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

      <div style={{ position: "relative" }} aria-hidden="true">
        {!isSceneReady || !showLoaderAfterDelay ? (
          <PingPongDotLoader dotSize={12} />
        ) : (
          <GlitchGreeting />
        )}
        {socialData.map((icon, idx) => (
          <ProfileIcon
            key={idx}
            name={icon.name}
            url={icon.url}
            pngSrc={icon.pngSrc}
            xOffset={icon.x}
            yOffset={icon.y}
            delay={icon.delay}
            isMounted={isMounted}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "8%" : "12%",
          display: "flex",
          // Shrink the gap on mobile so the buttons don't bump into the screen edges
          gap: isMobile ? "15px" : "40px",
          alignItems: "flex-end",
          justifyContent: "center",
          opacity: isMounted ? 1 : 0,

          // 3. FORCE RESPONSIVE BUTTONS: We use a CSS scale transform here.
          // This forces both buttons to shrink by 25% on mobile, regardless of their internal CSS.
          transform: isMounted
            ? `translateY(0) scale(${isMobile ? 0.75 : 1})`
            : `translateY(20px) scale(${isMobile ? 0.75 : 1})`,

          transition: "all 0.8s ease 0.6s",
          transformOrigin: "bottom center", // Ensures they scale down toward the bottom of the screen
        }}
      >
        <ExploreHouseButton onClick={onEnter} />
        <ResumeButton
          onClick={() => window.open("/loader/resume.pdf", "_blank")}
        />
      </div>
    </div>
  );
}
