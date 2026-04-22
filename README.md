# koraydevecioglu.com

[![CI](https://github.com/koray-devecioglu/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/koray-devecioglu/personal-website/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/live-koraydevecioglu.com-E9A73B)](https://koraydevecioglu.com)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![License: CC BY 4.0](https://img.shields.io/badge/prose-CC%20BY%204.0-orange.svg)](https://creativecommons.org/licenses/by/4.0/)

> Source of **[koraydevecioglu.com](https://koraydevecioglu.com)** — a
> personal site, blog, and living CV. Single repo, single design system,
> single publishing pipeline.

The site is three things in one codebase:

1. **A personal blog** — essays, tutorials, TILs, notes, project
   write-ups, and a lightweight linkroll.
2. **A living CV** — one `resume.json` (JSON Resume 1.0.0) renders to
   `/cv`, `/cv.json`, a print-optimised `/cv/print` surface, and a
   committed `public/cv.pdf`.
3. **An indie-web presence** — `/now`, `/uses`, `/colophon`, `/reading`,
   a site-wide ⌘K command palette with Pagefind search, a custom 404,
   RSS + JSON feeds, and auto-generated OG cards.

No cookies, no trackers, no CMS. Everything is a Markdown file in `git`.

## At a glance

| Concern     | Choice                                                                                |
| ----------- | ------------------------------------------------------------------------------------- |
| Framework   | **Astro 5** — static-first, islands-ready                                             |
| Language    | **TypeScript** (strict, `noUncheckedIndexedAccess`)                                   |
| Styling     | **Tailwind v4** CSS-first + design tokens in `src/styles/tokens.css`                  |
| Content     | **Astro Content Collections + Zod** schemas — build fails on invalid frontmatter      |
| Prose       | **Markdown + MDX**, **Shiki** for code                                                |
| Search      | **Pagefind** — static index, runs entirely in the browser                             |
| Hosting     | **Cloudflare Pages** (free tier, edge everywhere)                                     |
| DNS / Email | **Cloudflare DNS** + **Email Routing** (`hi@koraydevecioglu.com`)                     |
| Analytics   | **Cloudflare Web Analytics** (cookieless, no consent banner needed)                   |
| CI          | **GitHub Actions** — lint · typecheck · test · build · axe-core · Lighthouse · lychee |
| Fonts       | Self-hosted variable Fraunces · Inter · JetBrains Mono (WOFF2, subsetted)             |

Full rationale for every choice — including the two alternatives each
one beat — lives in [`docs/phase-1-architecture.md`](docs/phase-1-architecture.md).

## Quickstart

```sh
pnpm install          # uses the committed lockfile
pnpm dev              # http://localhost:4321 with HMR
```

First-time e2e setup (one-off):

```sh
pnpm test:e2e:install # downloads Chromium for Playwright
```

Before opening a PR:

```sh
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Full quality-gate replay (mirrors CI):

```sh
pnpm test:e2e        # Playwright smoke + axe-core a11y gate
pnpm lhci            # Lighthouse perf / a11y / best-practices / SEO budgets
pnpm lint:links      # lychee over dist/ (needs pnpm build first)
```

## Scripts

| Command                        | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `pnpm dev`                     | Astro dev server with HMR                                        |
| `pnpm build`                   | Production build into `dist/` + Pagefind index                   |
| `pnpm build:astro`             | Astro build only (skips the search-index step)                   |
| `pnpm build:search-index`      | Run `pagefind --site dist`                                       |
| `pnpm preview`                 | Serve the production build locally                               |
| `pnpm typecheck`               | `astro check` (TypeScript + Astro diagnostics)                   |
| `pnpm lint` / `lint:fix`       | ESLint 9 flat config                                             |
| `pnpm format` / `format:check` | Prettier write / check (CI runs `check`)                         |
| `pnpm test`                    | Vitest — unit + content-schema + palette-index                   |
| `pnpm test:e2e`                | Playwright smoke + axe-core accessibility                        |
| `pnpm test:a11y`               | Playwright a11y spec only                                        |
| `pnpm lhci`                    | Lighthouse CI against the preview build                          |
| `pnpm lint:links`              | Lychee link check over `dist/` (needs `pnpm build`)              |
| `pnpm new-post`                | Scaffold a new content file — see [AUTHORING](docs/AUTHORING.md) |
| `pnpm build:cv`                | Re-render `public/cv.pdf` from `/cv/print`                       |

## Repository layout

```
src/
  components/   ui / layout / post / cv / islands
                 ├ ui:      Button, Kbd, Tag, Callout
                 ├ layout:  Header (primary nav + ⌘K), Footer
                 ├ post:    PostCard, PostHeader, PostMeta, PostFooter,
                 │          SeriesBanner, TableOfContents
                 ├ cv:      CVContent (shared between /cv and /cv/print)
                 └ islands: ThemeToggle, CommandPalette (vanilla TS)
  content/      Markdown + MDX content collections
                 ├ _schemas.ts, _tags.ts, config.ts
                 ├ essays/ tutorials/ tils/ notes/ projects/ bookmarks/ series/
                 └ pages/   now, uses, colophon, reading
  data/         links.ts (site + social), resume.json (JSON Resume 1.0.0)
  layouts/      BaseLayout · PostLayout · PageLayout
  lib/          posts · seo · feed · og · i18n · reading-time · resume ·
                palette-index
  pages/        file-system routing — /, /posts, /tags, /series, /cv,
                /now /uses /colophon /reading, /rss.xml /feed.json,
                /og/[slug].png, /404, /sandbox
  styles/       tokens · fonts · prose · cv · cv-print · global
scripts/        new-post.ts · build-cv-pdf.ts
docs/           architecture, design system, content, CV, indie-web,
                quality gates, launch runbook, authoring guide
tests/          Vitest (units, content, resume, palette) + Playwright
                (home, blog, cv, indie-web, palette, a11y, sandbox)
public/         fonts, favicon, cv.pdf (regenerated via pnpm build:cv)
.github/        CI workflow, PR + issue templates
```

## Documentation

Every milestone ships with a doc. Read these in roughly this order
when onboarding:

| Doc                                                            | What it covers                                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/phase-1-architecture.md`](docs/phase-1-architecture.md) | The architecture bible. Stack decisions, content model, SEO, performance, accessibility, rollout. Read this first.                    |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md)               | Tokens, primitives (Button, Kbd, Tag, ThemeToggle), layout shell, typography, color. Landed in M2.                                    |
| [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md)               | Post types, the full frontmatter reference, tag vocabulary, drafts + scheduling, series, the `pnpm new-post` CLI. Reference manual.   |
| [`docs/AUTHORING.md`](docs/AUTHORING.md)                       | **Your first post, start to finish.** The workflow-oriented companion to the content guide. Read this when you're about to write.     |
| [`docs/CV-GUIDE.md`](docs/CV-GUIDE.md)                         | Editing `resume.json`, regenerating the PDF, the three CV surfaces, the print stylesheet.                                             |
| [`docs/INDIE-WEB-GUIDE.md`](docs/INDIE-WEB-GUIDE.md)           | The `/now`, `/uses`, `/colophon`, `/reading` pages, the custom 404, and the ⌘K command palette + Pagefind search.                     |
| [`docs/QUALITY-GATES.md`](docs/QUALITY-GATES.md)               | The four CI quality gates, their budgets, how to run them locally, and what to do when one turns red.                                 |
| [`docs/LAUNCH-RUNBOOK.md`](docs/LAUNCH-RUNBOOK.md)             | Cloudflare Pages, DNS, TLS, Email Routing, Search Console, Bing Webmaster — step-by-step, with rollbacks and post-launch ops recipes. |

The **`CLAUDE.md`** at the repo root is the working brief for the AI
collaborator used to build this. It's preserved deliberately — anyone
reviewing the repo can see exactly what instructions the assistant
was given and what decisions were made collaboratively.

## Milestone status

| Milestone                         | State   | Notes                                                               |
| --------------------------------- | ------- | ------------------------------------------------------------------- |
| **M0** Proposal approved          | ✅      | `docs/phase-1-architecture.md`                                      |
| **M1** Repo scaffold              | ✅      | Astro 5, TS strict, Tailwind v4, CI skeleton                        |
| **M2** Design tokens + primitives | ✅      | Typography, color, primitives, layout shell, sandbox                |
| **M3** Content engine             | ✅      | Zod schemas, `pnpm new-post`, sample posts per type                 |
| **M4** Blog surface               | ✅      | Home, posts, tags, series, feeds, per-post OG, view transitions     |
| **M5** CV surface                 | ✅      | `/cv`, `/cv/print`, `/cv.json`, PDF pipeline                        |
| **M6** Indie-web polish           | ✅      | `/now`, `/uses`, `/colophon`, `/reading`, ⌘K palette, Pagefind, 404 |
| **M7** Quality gates              | ✅      | Lighthouse CI, axe-core, lychee, `--frozen-lockfile`                |
| **M8** Launch                     | ✅      | DNS, SSL, email routing, analytics, Search Console, Bing            |
| **M9** Post-launch                | 🚧 next | Comments (giscus), webmentions, uptime, error monitoring            |

## For would-be forkers

This repo is public so the work can be read, learned from, and
adapted. If you want to stand up your own site from it:

1. Fork → clone → `pnpm install`.
2. Replace `src/data/resume.json`, the `SITE` + `SOCIAL` objects in
   [`src/data/links.ts`](src/data/links.ts), and the four pages under
   `src/content/pages/`.
3. Walk through [`docs/LAUNCH-RUNBOOK.md`](docs/LAUNCH-RUNBOOK.md) —
   it's written to be reusable for any Cloudflare-Pages-hosted
   personal site, not just this one.
4. Regenerate `public/cv.pdf` with `pnpm build:cv`.
5. Flip the `koraydevecioglu.com` references in `astro.config.mjs`,
   `lychee.toml`, and `public/robots.txt` to your own domain.

The **code** (components, TS, CSS, build scripts, CI config) is
[MIT](LICENSE). The **prose** under `src/content/` is
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — you may
share and adapt with attribution, but you shouldn't pass Koray's
essays off as your own writing.

## Contributing

This is a single-author personal site — PRs adding content are out of
scope. But typo fixes, broken-link reports, accessibility issues, or
bugs in the tooling (`new-post`, build scripts, CI) are welcome. Open
an issue first if the change is non-trivial.

## License

- Code: [MIT](LICENSE).
- Prose: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Fonts: their respective open-source licenses (OFL / Apache 2.0).
