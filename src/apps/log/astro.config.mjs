// @ts-check
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
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
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  },
});
