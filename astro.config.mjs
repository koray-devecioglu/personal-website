// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Single source of truth for the site's canonical URL. Override per-env via
// ASTRO_SITE if we ever need to (e.g. preview domains).
const SITE = process.env.ASTRO_SITE ?? "https://koraydevecioglu.com";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  build: {
    format: "directory",
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  integrations: [
    mdx(),
    sitemap({
      // Dev-only surfaces that happen to be built in prod are still
      // excluded from the sitemap. `noindex` metadata handles crawlers
      // that reach them anyway.
      filter: (page) =>
        !page.includes("/sandbox") &&
        !page.includes("/cv/print") &&
        !page.includes("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
