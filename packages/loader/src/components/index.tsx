import React from "react";
import { Html, useProgress } from "@react-three/drei";

/**
 * Individual Animated Dot Component
 * Used to create a pulsing loading effect.
 */
const Dot = ({ delay }: { delay: number }) => (
  <div
    style={{
      width: "12px",
      height: "12px",
      backgroundColor: "#ffffff",
      borderRadius: "50%",
      display: "inline-block",
      margin: "0 4px",
      animation: `dot-pulse 1.5s infinite ease-in-out ${delay}s`,
    }}
  />
);

/**
 * Main DotLoader Component
 * Designed to be used within a Three.js <Suspense> boundary.
 */
const DotLoader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <div className="dots-container">
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </div>
        <p
          style={{
            marginTop: "15px",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontSize: "14px",
          }}
        >
          {progress.toFixed(0)}% Loaded
        </p>
      </div>
      <style>
        {`
          @keyframes dot-pulse {
            0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </Html>
  );
};

export default DotLoader;
