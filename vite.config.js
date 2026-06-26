import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

// User site served at the root domain (https://jonathantheofilas.github.io),
// so the base path is '/'.
export default defineConfig({
  base: "/",
  plugins: [glsl()],
  build: {
    target: "es2020",
    outDir: "dist",
    assetsInlineLimit: 4096,
  },
});
