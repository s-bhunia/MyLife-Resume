import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import BookshelfScene from '../BookshelfScene';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <BookshelfScene />
    </Canvas>
  </React.StrictMode>
);


