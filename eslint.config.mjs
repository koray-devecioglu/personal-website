// @ts-check
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".astro/**",
      ".claude/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "public/**",
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,

  {
    // Tighten rules we actually care about. Keep the default-to-recommended
    // mindset and only override what bites us.
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Node-run config files (Astro, ESLint, Playwright, Vitest, scripts/)
  // need the node globals so `process`, `__dirname`, etc. resolve.
  {
    files: [
      "*.{js,mjs,cjs,ts}",
      "astro.config.*",
      "eslint.config.*",
      "playwright.config.*",
      "vitest.config.*",
      "scripts/**/*.{ts,js,mjs}",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // .d.ts files legitimately use triple-slash references for ambient
  // module declarations (Astro generates env.d.ts this way).
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  {
    files: ["**/*.astro"],
    rules: {
      // Astro frontmatter can legitimately have unused imports during
      // scaffolding; keep the warning loud but not blocking.
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
);
