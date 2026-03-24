import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { TravelGlobe } from "./index";

// Import JSON data
import locationData from "./locations.json";

function App() {
  return (
    // Disable default context menu on the container to allow Right-Click Drag
    <div
      style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />

          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />

          {/* Pass data from JSON */}
          <TravelGlobe
            origin={locationData.origin}
            destinations={locationData.destinations}
          />

          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={20}
            // Note: We keep rotation enabled for Left Click (Camera Move)
            // Right Click is handled by TravelGlobe for Object Move
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
