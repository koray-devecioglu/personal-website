import { defineConfig } from "vitest/config";

export default defineConfig({
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
