import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/pokeapi": {
        target: "https://pokeapi.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pokeapi/, ""),
      },
    },
  },
});
