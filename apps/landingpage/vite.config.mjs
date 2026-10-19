import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const WORKSPACE = ["@mylife/bookshelf", "@mylife/loader", "@mylife/tube-clock", "@mylife/globe", "@mylife/book-slider", "@mylife/chatbot", "@mylife/core-engine", "@mylife/profile", "@mylife/study-desk", "@mylife/landing-animation", "@mylife/scroll"];

const CHUNKS = [
  ["three-core", /node_modules\/(\.pnpm\/)?three@/],
  ["r3f", /node_modules\/(\.pnpm\/)?(@react-three\+fiber|its-fine|suspend-react)/],
  ["state", /node_modules\/(\.pnpm\/)?(zustand|jotai|use-sync-external-store)/],
  ["drei", /node_modules\/(\.pnpm\/)?(@react-three\+drei|three-stdlib|camera-controls|troika|maath|@monogrid|meshline|stats-gl|three-mesh-bvh)/],
  ["react", /node_modules\/(\.pnpm\/)?(react@|react-dom@|scheduler@|react-router)/],
  ["markdown", /node_modules\/(\.pnpm\/)?(react-markdown|micromark|mdast|hast|unist|unified|remark|vfile|property-information|space-separated|comma-separated|decode-named|character-entities|html-url|trim-lines|devlop|bail|is-plain-obj|trough|ccount|zwitch|longest-streak|estree|style-to)/],
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei", "jotai", "zustand"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "three"],
    exclude: WORKSPACE,
  },
  server: {
    fs: { allow: ["../.."] },
    proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, "/");
          if (path.includes("vite/preload-helper") || path.includes("commonjsHelpers")) return "react";
          for (const [name, test] of CHUNKS) if (test.test(path)) return name;
          return undefined;
        },
      },
    },
  },
  publicDir: "public",
});
