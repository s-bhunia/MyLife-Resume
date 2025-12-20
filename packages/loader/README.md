# @mylife/loader

A simple loading component for React Three Fiber applications.

## Installation

```bash
npm install @mylife/loader
```

## Usage

Wrap your Three.js scene with `<Suspense>` and use the `DotLoader` component as a fallback.

```tsx
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import DotLoader from "@mylife/loader";

function App() {
  return (
    <Canvas>
      <Suspense fallback={<DotLoader />}>
        <YourScene />
      </Suspense>
    </Canvas>
  );
}
```

## Component

The `DotLoader` displays animated dots and the loading progress percentage.
