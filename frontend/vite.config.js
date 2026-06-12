import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
        swSrc: "public/sw.js",
        swDest: "dist/sw.js",
      },
      manifest: false,
    }),
  ],
  server: {
    host: true,
    allowedHosts: [
      "becomes-proceeds-danish-earning.trycloudflare.com",
      "urw-phd-play-relates.trycloudflare.com",
      "nylon-html-suggest-forming.trycloudflare.com",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-map": ["leaflet", "react-leaflet", "react-leaflet-cluster"],
          "vendor-data": ["axios", "@tanstack/react-query", "zustand"],
          "vendor-chart": ["chart.js", "react-chartjs-2"],
          "vendor-i18n": ["i18next", "react-i18next"],
        },
      },
    },
  },
});
