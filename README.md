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

| Command                 | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `pnpm dev`              | Astro dev server with HMR                       |
| `pnpm build`            | Production build into `dist/`                   |
| `pnpm preview`          | Serve the production build locally              |
| `pnpm typecheck`        | `astro check` (TypeScript + Astro diagnostics)  |
| `pnpm lint`             | ESLint 9 flat config                            |
| `pnpm lint:fix`         | ESLint with `--fix`                             |
| `pnpm format`           | Prettier write                                  |
| `pnpm format:check`     | Prettier check (used in CI)                     |
| `pnpm test`             | Vitest unit + content-schema tests              |
| `pnpm test:e2e`         | Playwright e2e smoke                            |
| `pnpm test:e2e:install` | One-time Playwright browser install             |
| `pnpm new-post`         | Scaffold a new content file (see CONTENT-GUIDE) |
| `pnpm build:cv`         | Re-render `public/cv.pdf` from `/cv/print`      |

## Layout

```
src/
  components/   — ui / layout / post / cv / islands
                  (post: PostCard, PostHeader, PostMeta, PostFooter,
                   SeriesBanner, TableOfContents
                   cv:   CVContent — shared across /cv and /cv/print)
  content/      — Markdown + MDX content collections
  data/         — links.ts, resume.json (JSON Resume 1.0.0)
  layouts/      — BaseLayout (head/SEO/theme/router) + PostLayout
  lib/          — pure utilities
                  (posts, seo, feed, og, i18n, reading-time, resume)
  pages/        — file-system routing
                  (/, /posts, /posts/[slug], /tags, /tags/[slug],
                   /series, /series/[slug], /rss.xml, /feed.json,
                   /og/[slug].png, /cv, /cv/print, /cv.json, /sandbox)
  styles/       — tokens, prose, cv, cv-print, fonts, global
scripts/        — new-post.ts + build-cv-pdf.ts
docs/           — architecture, design system, content guide, cv guide
tests/          — Vitest units + content + resume schema + Playwright e2e
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

## Status

| Milestone                         | State   |
| --------------------------------- | ------- |
| **M0** Proposal approved          | ✅      |
| **M1** Repo scaffold              | ✅      |
| **M2** Design tokens + primitives | ✅      |
| **M3** Content engine             | ✅      |
| **M4** Blog surface               | ✅      |
| **M5** CV surface                 | ✅      |
| **M6** Indie-web polish           | 🚧 next |
| **M7** Quality gates              | —       |
| **M8** Launch                     | —       |

## License

Prose content: CC BY 4.0. Code: MIT (will land in `LICENSE` file at M8).
