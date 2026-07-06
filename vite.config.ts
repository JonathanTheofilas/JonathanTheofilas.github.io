import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// User site served at the root domain (https://jonathantheofilas.github.io),
// so the base path stays '/'.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    target: "es2022",
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three";
          if (
            id.includes("@react-three/fiber") ||
            id.includes("@react-three/drei")
          )
            return "r3f";
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          )
            return "react";
        },
      },
    },
  },
});
