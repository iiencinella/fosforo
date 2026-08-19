// @ts-check
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { defineConfig } from "astro/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://fosforo.org",
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
    ssr:
      process.env.NODE_ENV === "production"
        ? {
            noExternal: true,
          }
        : undefined,
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  },
});
