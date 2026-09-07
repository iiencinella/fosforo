import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**/*.ts",
        "src/pages/api/**/*.ts",
        "src/middleware.ts",
      ],
      // Modulos de integracion con Supabase: se cubren en E2E contra DB real.
      exclude: [
        "src/lib/supabase.ts",
        "src/lib/auth-supabase.ts",
        "src/lib/content-types-repository.ts",
        "src/lib/entries-repository.ts",
        "src/lib/taxonomies-repository.ts",
        "src/lib/media-repository.ts",
        "src/lib/search-repository.ts",
        "**/*.test.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 70,
        lines: 80,
      },
    },
  },
});
