// @ts-check
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://fosforo.org",
  output: "server",
  adapter: vercel(),
  build: {
    inlineStylesheets: "always",
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr:
      process.env.NODE_ENV === "production"
        ? {
            noExternal: true,
          }
        : undefined,
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom/client",
      ],
    },
  },
});
