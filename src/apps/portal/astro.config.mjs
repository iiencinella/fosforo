// @ts-check
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// forced-rebuild-$(date)
export default defineConfig({
  site: "https://www.fosforo.com.ar",
  output: "static",
  adapter: vercel(),
  integrations: [react()],
  build: { inlineStylesheets: "always" },
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { "@": resolve(__dirname, "./src") } },
  },
});
// forced-rebuild-1788049593
