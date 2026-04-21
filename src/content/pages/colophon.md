---
title: "Colophon"
description: "What this site is built with, how it's deployed, and the decisions behind the stack."
updated: 2026-04-21
---

This site is a single-author project. Everything below is a deliberate
choice, defended in `docs/phase-1-architecture.md`.

## Stack

- **[Astro 5](https://astro.build)** — static site generator with
  islands for the few places interactivity earns its weight.
- **TypeScript (strict)** — `astro/tsconfigs/strict` plus
  `noUncheckedIndexedAccess`. The build fails before a typo does.
- **[Tailwind v4](https://tailwindcss.com)** — CSS-first config; design
  tokens live in `src/styles/tokens.css` and bridge to Tailwind via
  `@theme` in `src/styles/global.css`.
- **[MDX](https://mdxjs.com)** for posts that want interactive
  components; plain Markdown for the rest.
- **[Shiki](https://shiki.style)** for syntax highlighting — same
  engine VS Code uses, zero client-side JS.
- **[Pagefind](https://pagefind.app)** for search — a static index
  built at deploy time; runs entirely in the browser.
- **[Content Collections + Zod](https://docs.astro.build/en/guides/content-collections/)**
  for typed frontmatter. Schemas live in `src/content/_schemas.ts`.

## Typography

- **Serif:** [Fraunces Variable](https://fonts.google.com/specimen/Fraunces) —
  display and body, optical-size axis doing the heavy lifting.
- **Sans:** [Inter Variable](https://rsms.me/inter/) — UI chrome only.
- **Mono:** [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — code,
  dates, type badges, keyboard hints.

Everything open-source, all three variable, all self-hosted from
`/public/fonts`. Critical subsets are preloaded; the rest swap in on
second paint.

## Color

- OKLCH throughout, single source of truth in `src/styles/tokens.css`.
- Light: warm near-white paper, warm near-black ink.
- Dark: charcoal, soft off-white ink — explicitly _not_ an inverted
  light mode.
- Accent: warm ochre. Swappable in one PR.

## Content

- Posts are markdown files under `src/content/<type>/`.
- The CV is JSON under `src/data/resume.json`, validated against a
  local JSON Resume 1.0.0 Zod schema and rendered three ways: `/cv`
  for screen, `/cv/print` → `public/cv.pdf` for PDF, `/cv.json` as a
  machine-readable export.

## Infrastructure

- **[Cloudflare Pages](https://pages.cloudflare.com)** for hosting —
  free tier, edge everywhere, unlimited bandwidth.
- **[Cloudflare DNS + Email Routing](https://www.cloudflare.com/products/email-routing/)**
  — `hi@koraydevecioglu.com` forwards straight to my inbox. No
  mailboxes to manage.
- **[Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)**
  — no cookies, no consent banner, no tracking pixels.
- **GitHub Actions** for CI: lint, typecheck, test, build, Playwright
  smoke. Lighthouse + axe + lychee land in M7.

## AI assistance

Draft copy and some refactors are produced with the help of large
language models, always reviewed and edited before merging. The
repository and every decision in it are mine; the AI is a very fast
reviewer, not a ghost-writer.

## Licensing

- **Prose**: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  — share and adapt with attribution.
- **Code**: [MIT](https://opensource.org/license/mit) — once the
  `LICENSE` file lands in M8.

## Source

This site lives at [github.com/koray-devecioglu/personal-website](https://github.com/koray-devecioglu/personal-website).
Issues and pull requests are welcome.
