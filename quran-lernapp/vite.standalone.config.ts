import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

/** Baut die App als eine einzige HTML-Datei (offline, per Doppelklick). `npm run build:html` */
export default defineConfig({
  root: path.resolve(import.meta.dirname, "standalone"),
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(import.meta.dirname, "src") },
      { find: "next/link", replacement: path.resolve(import.meta.dirname, "standalone/next-link.tsx") },
      { find: "next/navigation", replacement: path.resolve(import.meta.dirname, "standalone/next-navigation.ts") },
    ],
  },
  build: { outDir: path.resolve(import.meta.dirname, "dist-html"), emptyOutDir: true, assetsInlineLimit: 100_000_000 },
});
