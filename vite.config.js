import { defineConfig } from "vite";

// User site served at the root domain (https://jonathantheofilas.github.io),
// so the base path is '/'.
export default defineConfig({
  base: "/",
  build: {
    target: "es2020",
    outDir: "dist",
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ["gsap"],
        },
      },
    },
  },
});
