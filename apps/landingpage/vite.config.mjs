import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "three"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "three"],
    exclude: ["@mylife/bookshelf", "@mylife/loader", "@mylife/tube-clock", "@mylife/globe", "@mylife/book-slider"],
  },
  server: {
    fs: {
      allow: ["../."],
    },
  },
  publicDir: "public",
});
