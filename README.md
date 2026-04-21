# koraydevecioglu.com

The source of Koray Devecioglu's personal site — a blog, a living CV, and a
structured content hub for essays, tutorials, notes, TILs, project write-ups,
and whatever else seems worth writing about.

Built with Astro 5, TypeScript (strict), Tailwind v4 (CSS-first), MDX, Shiki,
and Pagefind. Deployed on Cloudflare Pages.

## Quickstart

```sh
pnpm install        # installs deps and generates pnpm-lock.yaml
pnpm dev            # Astro dev server at http://localhost:4321
```

## Scripts

| Command                   | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| `pnpm dev`                | Astro dev server with HMR                                 |
| `pnpm build`              | Production build into `dist/` (+ Pagefind index)          |
| `pnpm build:astro`        | Astro build only (skips the search index step)            |
| `pnpm build:search-index` | Run `pagefind --site dist`                                |
| `pnpm preview`            | Serve the production build locally                        |
| `pnpm typecheck`          | `astro check` (TypeScript + Astro diagnostics)            |
| `pnpm lint`               | ESLint 9 flat config                                      |
| `pnpm lint:fix`           | ESLint with `--fix`                                       |
| `pnpm format`             | Prettier write                                            |
| `pnpm format:check`       | Prettier check (used in CI)                               |
| `pnpm test`               | Vitest unit + content-schema tests                        |
| `pnpm test:e2e`           | Playwright e2e smoke + axe-core a11y gate                 |
| `pnpm test:a11y`          | Playwright a11y spec only (serious/critical)              |
| `pnpm test:e2e:install`   | One-time Playwright browser install                       |
| `pnpm lhci`               | Lighthouse CI against the preview build                   |
| `pnpm lint:links`         | Lychee link check over `dist/` (needs `pnpm build` first) |
| `pnpm new-post`           | Scaffold a new content file (see CONTENT-GUIDE)           |
| `pnpm build:cv`           | Re-render `public/cv.pdf` from `/cv/print`                |

## Layout

```
src/
  components/   — ui / layout / post / cv / islands
                  (post: PostCard, PostHeader, PostMeta, PostFooter,
                   SeriesBanner, TableOfContents
                   cv:   CVContent — shared across /cv and /cv/print
                   islands: ThemeToggle, CommandPalette (vanilla TS))
  content/      — Markdown + MDX content collections + pages/
                  (pages: now, uses, colophon, reading)
  data/         — links.ts, resume.json (JSON Resume 1.0.0)
  layouts/      — BaseLayout + PostLayout + PageLayout
  lib/          — pure utilities
                  (posts, seo, feed, og, i18n, reading-time, resume,
                   palette-index)
  pages/        — file-system routing
                  (/, /posts, /posts/[slug], /tags, /tags/[slug],
                   /series, /series/[slug], /rss.xml, /feed.json,
                   /og/[slug].png, /cv, /cv/print, /cv.json,
                   /now, /uses, /colophon, /reading, /404, /sandbox)
  styles/       — tokens, prose, cv, cv-print, fonts, global
scripts/        — new-post.ts + build-cv-pdf.ts
docs/           — architecture, design system, content guide,
                  cv guide, indie-web guide, quality gates,
                  launch runbook
tests/          — Vitest units + content + resume + palette
                  + Playwright e2e (home, blog, cv, indie-web,
                  palette, a11y, sandbox)
.github/        — CI workflows, issue / PR templates
public/         — fonts, favicon, cv.pdf (regenerated via pnpm build:cv)
```

## Docs

- [`docs/phase-1-architecture.md`](docs/phase-1-architecture.md) — the working
  architecture proposal (will be promoted to `ARCHITECTURE.md` at launch).
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — tokens, primitives, and
  layout shell landed in M2.
- [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) — post types, frontmatter
  reference, tags, and the `pnpm new-post` scaffolder (M3).
- [`docs/CV-GUIDE.md`](docs/CV-GUIDE.md) — how to edit `resume.json`, the
  JSON Resume schema we ship, and how to regenerate `public/cv.pdf` (M5).
- [`docs/INDIE-WEB-GUIDE.md`](docs/INDIE-WEB-GUIDE.md) — the `/now`, `/uses`,
  `/colophon`, `/reading` pages, the custom 404, and the ⌘K command palette
  (M6).
- [`docs/QUALITY-GATES.md`](docs/QUALITY-GATES.md) — the CI quality gates,
  their budgets, how to run them locally, and what to do when one turns red
  (M7).
- [`docs/LAUNCH-RUNBOOK.md`](docs/LAUNCH-RUNBOOK.md) — Cloudflare, DNS, email
  routing, Search Console, Bing Webmaster — the step-by-step for actually
  pointing the canonical domain at this build (M8).

## Status

| Milestone                         | State   |
| --------------------------------- | ------- |
| **M0** Proposal approved          | ✅      |
| **M1** Repo scaffold              | ✅      |
| **M2** Design tokens + primitives | ✅      |
| **M3** Content engine             | ✅      |
| **M4** Blog surface               | ✅      |
| **M5** CV surface                 | ✅      |
| **M6** Indie-web polish           | ✅      |
| **M7** Quality gates              | ✅      |
| **M8** Launch                     | ✅      |
| **M9** Post-launch                | 🚧 next |

## License

Prose content: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Code: [MIT](LICENSE).
