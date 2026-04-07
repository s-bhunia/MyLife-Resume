import { useState, useEffect } from "react";

import { PingPongDotLoader } from "./PingPongLoader";
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
  const [_minTimeElapsed, _setMinTimeElapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    // 2. Keep track of screen size
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Trigger the explosive pop-out animation shortly after load
    const mountTimer = setTimeout(() => setIsMounted(true), 150);

    // Simulate network request ending (Changed to 'false' to end loading)
    // const loadTimer = setTimeout(() => setIsLoading(true), 8000);

    // Set minimum time elapsed
    const minLoadTimeTimer = setTimeout(() => {
      _setMinTimeElapsed(true);
    }, 3000); // Set your desired minimum time here (e.g., 3000 for 3 seconds)

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(minLoadTimeTimer); // Cleanup the new timer
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 3. Calculate a dynamic scale based on screen width (max 1 for desktop)
  const scale = Math.min(windowWidth / 1400, 1);

  // Configure your icons here - multiplying by 'scale' keeps them on-screen!
  const socialData = [
    {
      name: "Meta",
      url: "#",
      pngSrc: "/loader/meta.svg",
      x: -600 * scale,
      y: -150 * scale,
      delay: "0.1s",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/s-bhunia/",
      pngSrc: "/loader/linkedin.svg",
      x: -680 * scale,
      y: 0,
      delay: "0.2s",
    },
    {
      name: "GitHub",
      url: "https://github.com/s-bhunia",
      pngSrc: "/loader/github.svg",
      x: -600 * scale,
      y: 150 * scale,
      delay: "0.3s",
    },
    {
      name: "YouTube",
      url: "#",
      pngSrc: "/loader/youtube.svg",
      x: 600 * scale,
      y: -150 * scale,
      delay: "0.6s",
    },
    {
      name: "Twitter",
      url: "#",
      pngSrc: "/loader/medium.svg",
      x: 680 * scale,
      y: 0,
      delay: "0.5s",
    },
    {
      name: "Discord",
      url: "#",
      pngSrc: "/loader/discord.svg",
      x: 600 * scale,
      y: 150 * scale,
      delay: "0.4s",
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

          /* The Neon Spring Animation Setup */
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

          /* Neon Glow Hover Effect */
          .neon-profile-icon.icon-hovered {
            background: #1a1a24;
            box-shadow: 0 0 25px 12px rgba(0, 255, 255, 0.7), 0 0 50px 25px rgba(0, 255, 255, 0.3);
            filter: brightness(1.15);
          }

          /* Active/Press Effect */
          .neon-profile-icon.icon-pressed {
            box-shadow: 0 0 35px 20px rgba(0, 255, 255, 0.9), 0 0 70px 35px rgba(0, 255, 255, 0.4);
            filter: brightness(1.35);
          }

          /* Button Styles */
          .action-btn {
            padding: 12px 28px;
            font-size: 1.1em;
            font-weight: 600;
            color: #fff;
            background: transparent;
            border: 1px solid #ffffff;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .action-btn:hover {
            background: #fff;
            color: #000;
            box-shadow: 0 0 25px rgba(255,255,255,0.4);
            transform: translateY(-2px);
          }

          /* Mobile adjustments for buttons */
          @media (max-width: 768px) {
            .action-btn {
              padding: 10px 20px;
              font-size: 1em;
            }
          }
        `}</style>

      {/* Center Stage: Loader + Icons */}
      <div style={{ position: "relative" }}>
        {!isSceneReady || <PingPongDotLoader dotSize={12} />}v
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

      {/* 4. Buttons are now absolutely positioned at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          display: "flex",
          gap: "40px",
          alignItems:
            "flex-end" /* This keeps the text of both buttons aligned on the bottom! */,
          justifyContent: "center",
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.6s",
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
