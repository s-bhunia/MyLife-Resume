import { useState, useEffect, useRef } from "react";
import "./loader.css";
import { ChatbotAPI } from "@mylife/chatbot";
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

  // Guard against double invocation in React StrictMode (dev only)
  const healthCheckRanRef = useRef(false);
  useEffect(() => {
    if (healthCheckRanRef.current) return;
    healthCheckRanRef.current = true;
    (async () => {
      try {
        const ok = await ChatbotAPI.healthCheck();
        console.log("Health check result:", ok);
      } catch (e) {
        console.error("Health check failed", e);
      }
    })();
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
      url: "https://www.youtube.com/@InitToInfinity",
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
      url: "https://discord.gg/CtJcquwaK7",
      pngSrc: "/loader/discord.svg",
      x: innerX,
      y: spreadY,
      delay: "0.7s",
    },
  ];

  return (
    <div className="loader-screen">
      {/* Styles moved to loader.css */}

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
          bottom: isMobile ? "12%" : "12%",
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
        <ResumeButton />
      </div>
    </div>
  );
}
