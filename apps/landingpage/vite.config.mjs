import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "three", '@react-three/fiber', 'jotai'],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "three"],
    exclude: ["@mylife/bookshelf", "@mylife/loader", "@mylife/tube-clock", "@mylife/globe", "@mylife/book-slider", "@mylife/chatbot", "@mylife/core-engine"],
  },
  server: {
    fs: {
      allow: ["../."],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  publicDir: "public",
});
