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

| Command                 | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `pnpm dev`              | Astro dev server with HMR                      |
| `pnpm build`            | Production build into `dist/`                  |
| `pnpm preview`          | Serve the production build locally             |
| `pnpm typecheck`        | `astro check` (TypeScript + Astro diagnostics) |
| `pnpm lint`             | ESLint 9 flat config                           |
| `pnpm lint:fix`         | ESLint with `--fix`                            |
| `pnpm format`           | Prettier write                                 |
| `pnpm format:check`     | Prettier check (used in CI)                    |
| `pnpm test`             | Vitest unit + content-schema tests             |
| `pnpm test:e2e`         | Playwright e2e smoke                           |
| `pnpm test:e2e:install` | One-time Playwright browser install            |

## Layout

```
src/
  assets/       — site-wide imagery (logo, default OG)
  components/   — ui / layout / post / cv / islands
  content/      — Markdown + MDX content collections (added in M3)
  data/         — static data modules (links, site metadata)
  layouts/      — top-level page skeletons
  lib/          — pure utilities (seo, feed, reading-time, og-image)
  pages/        — Astro file-system routing
  styles/       — tokens.css, global.css, prose.css
docs/           — architecture, content guide, runbook, contributing
tests/          — Vitest units + Playwright e2e
.github/        — CI workflows, issue / PR templates
```

## Docs

- [`docs/phase-1-architecture.md`](docs/phase-1-architecture.md) — the working
  architecture proposal (will be promoted to `ARCHITECTURE.md` at launch).
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — tokens, primitives, and
  layout shell landed in M2.

## Status

| Milestone                         | State   |
| --------------------------------- | ------- |
| **M0** Proposal approved          | ✅      |
| **M1** Repo scaffold              | ✅      |
| **M2** Design tokens + primitives | ✅      |
| **M3** Content engine             | 🚧 next |
| **M4** Blog surface               | —       |
| **M5** CV surface                 | —       |
| **M6** Indie-web polish           | —       |
| **M7** Quality gates              | —       |
| **M8** Launch                     | —       |

## License

Prose content: CC BY 4.0. Code: MIT (will land in `LICENSE` file at M8).
