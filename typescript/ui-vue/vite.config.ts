import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  clearScreen: false,
  resolve: {
    // markdown-it-mermaid depends on Mermaid 7, whose D3 runtime crashes in
    // Vite's strict ESM output. Route the plugin to the modern runtime instead.
    alias: {
      mermaid: fileURLToPath(
        new URL("./node_modules/mermaid/dist/mermaid.core.mjs", import.meta.url),
      ),
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:2024",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
