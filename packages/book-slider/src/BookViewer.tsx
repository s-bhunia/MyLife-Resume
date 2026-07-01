// src/BookViewer.tsx
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Provider } from "jotai";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

export interface BookViewerProps {
  bookName: string;
  onClose: () => void;
}

export function BookViewer({
  bookName,
  onClose,
}: BookViewerProps): React.ReactNode {
  return (
    // The Provider ensures fresh Jotai state every time a book is opened
    <Provider>
      {/* Overlay container to sit on top of your existing portfolio canvas */}
      <div className="fixed inset-0 z-50 bg-black/80">
        <UI bookName={bookName} onClose={onClose} />
        <Loader />

        {/* Restored the independent Canvas and your exact camera settings */}
        <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
          <group position-y={0}>
            <Suspense fallback={null}>
              <Experience bookName={bookName} />
            </Suspense>
          </group>
        </Canvas>
      </div>
    </Provider>
  );
}
