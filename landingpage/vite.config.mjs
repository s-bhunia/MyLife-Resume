import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure linked workspace packages resolve deps from this app
    preserveSymlinks: true,
    dedupe: ["react", "react-dom", "three"],
  },
  optimizeDeps: {
    include: ["three"],
  },
  server: {
    fs: {
      // allow serving files from the monorepo packages
      allow: [".."],
    },
  },
  publicDir: "public",
});
