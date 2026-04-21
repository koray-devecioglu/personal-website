// Lighthouse CI — quality gate for every PR.
//
// Budgets come straight from docs/phase-1-architecture.md §6:
//   perf >= 95 · a11y = 100 · best-practices >= 95 · seo = 100.
//
// `lhci autorun` boots the built Astro preview, walks the curated URL
// list three times per URL (median of the three wins), and fails the
// job on any score regression below these gates.
module.exports = {
  ci: {
    collect: {
      // Pagefind must exist before LHCI walks the pages, otherwise the
      // ⌘K palette logs a 404 on first open and SEO audits flag it.
      // `pnpm build` runs `astro build` + `pagefind --site dist`.
      startServerCommand: "pnpm preview --host 127.0.0.1 --port 4321",
      startServerReadyPattern: "Local",
      url: [
        "http://127.0.0.1:4321/",
        "http://127.0.0.1:4321/posts",
        "http://127.0.0.1:4321/posts/welcome",
        "http://127.0.0.1:4321/tags",
        "http://127.0.0.1:4321/series",
        "http://127.0.0.1:4321/cv",
        "http://127.0.0.1:4321/now",
        "http://127.0.0.1:4321/uses",
        "http://127.0.0.1:4321/colophon",
        "http://127.0.0.1:4321/reading",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        // Chromium inside GitHub Actions is happier with --no-sandbox;
        // localhost runs keep the default.
        chromeFlags: "--no-sandbox --headless=new",
        // The site ships no client JS on most pages and no telemetry —
        // the PWA category is noise, keep it off.
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 1.0 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1.0 }],
      },
    },
    upload: {
      // No Lighthouse server — CI uploads the HTML reports as a plain
      // workflow artifact instead. `temporary-public-storage` would
      // also work but leaks URLs to a third party.
      target: "filesystem",
      outputDir: "./.lighthouseci",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%.%%EXTENSION%%",
    },
  },
};
