import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // `astro:content` is a virtual module owned by the Astro build.
      // Lib helpers that import it for their types + runtime call are
      // tested here with a no-op stub so the graph resolves.
      "astro:content": fileURLToPath(
        new URL("./tests/stubs/astro-content.ts", import.meta.url),
      ),
    },
  },
  test: {
    // Vitest scope: fast unit + content schema tests.
    // Playwright handles e2e (see playwright.config.ts).
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**", ".astro/**"],
    environment: "node",
    globals: false,
    reporters: ["default"],
  },
});
