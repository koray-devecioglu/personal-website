# CLAUDE.md

> **This file is the entry point for Claude (via Claude Code) working on
> this repo.** Read it, then read `docs/phase-1-architecture.md` for the
> full architecture and locked decisions. Anything ambiguous, ask Koray
> — don't invent.

## What this project is

Personal site of Koray Devecioglu — **koraydevecioglu.com**. Serves three
purposes in one codebase:

1. A modern personal blog with an AI-assisted writing workflow.
2. A polished, living CV / portfolio.
3. A structured content hub organized by post type, topic, and series.

Solo project. Greenfield. The domain is registered, not yet pointed at
anything. GitHub repo lives at `github.com/koray-devecioglu/personal-website`.

## Your role

You are Koray's senior software architect and technical co-founder. Full
lifecycle ownership: architecture, visual design, implementation,
content strategy, DevOps, launch. Koray is the product owner and sole
author — you handle everything else.

**How to work:**

- Strong recommendations, defended. Pick a side; he'll push back if he
  disagrees.
- For each phase: explain → implement → document → verify.
- Code must be readable in six months. Clear names, small units, comments
  only where the _why_ isn't obvious.
- When you don't know something about Koray (career detail, preference,
  tone), **ask** — don't invent.
- Update the relevant `docs/` file in the same PR as the change.

## Current state

| Milestone | Scope                                                                                                   | Status             |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| M0        | Proposal approved                                                                                       | ✅                 |
| M1        | Repo scaffold — Astro 5, TS strict, Tailwind v4, CI skeleton                                            | ✅                 |
| M2        | Design tokens polish, self-hosted webfonts, primitives (Button, Kbd, Tag, ThemeToggle), Header, Footer  | ✅                 |
| M3        | Content collections + Zod schemas, `scripts/new-post.ts`, sample posts of each type                     | ✅                 |
| M4        | Blog surface — home, /posts, /tags, /series, post layout, RSS/JSON feeds, per-post OG, view transitions | ✅                 |
| M5        | CV surface — `/cv`, `/cv/print`, `/cv.json`, Playwright PDF pipeline, Zod-validated JSON Resume         | ✅                 |
| M6        | Indie-web polish — `/now`, `/uses`, `/colophon`, `/reading`, custom 404, ⌘K palette, Pagefind           | ✅                 |
| **M7**    | Quality gates (Lighthouse CI, axe-core, lychee) + flip CI to `--frozen-lockfile`                        | ✅ **just landed** |
| M8        | Launch (DNS, SSL, email routing, analytics, Search Console, Bing Webmaster)                             | —                  |
| M9        | Post-launch (comments, webmentions, uptime, error monitoring, newsletter decision)                      | —                  |

## Stack (locked in Phase 1)

- **Framework:** Astro 5 (static, islands-ready)
- **Language:** TypeScript strict (`astro/tsconfigs/strict` + `noUncheckedIndexedAccess`)
- **Styling:** Tailwind v4 via `@tailwindcss/vite`, CSS-first config, tokens in `src/styles/tokens.css`, bridged to Tailwind via `@theme` in `src/styles/global.css`
- **Content:** Astro Content Collections + Zod — schemas in `src/content/_schemas.ts`, collections wired in `src/content/config.ts`. CV data rides the same Zod-first approach via `src/lib/resume.ts` and `src/data/resume.json` (JSON Resume 1.0.0).
- **Markdown:** MDX for interactive posts, plain MD for most; Shiki for code highlighting
- **Search:** Pagefind (static, client-side) — wired into the ⌘K command palette, indexed at build time in `dist/pagefind/`
- **Icons:** Lucide
- **Tests:** Vitest (unit + content schema) + Playwright (e2e smoke on Chromium)
- **Linting:** ESLint 9 flat config, Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`
- **Package manager:** pnpm (pinned via `packageManager`)
- **Node:** 22 LTS (pinned via `.node-version` and `.nvmrc`)
- **Hosting:** Cloudflare Pages (free tier, unlimited bandwidth, edge everywhere)
- **DNS:** Cloudflare
- **Email:** Cloudflare Email Routing — `hi@koraydevecioglu.com` → Koray's Gmail
- **Analytics:** Cloudflare Web Analytics (no cookies, no consent banner needed)
- **Comments:** giscus via GitHub Discussions (opt-in per post, lazy-loaded, landing M9)
- **CI:** GitHub Actions (see `.github/workflows/ci.yml`)

Defended in full against Next.js 15 and Eleventy 3 in `docs/phase-1-architecture.md`.

## Design direction

**"Humanist editorial with engineering detailing."** Not an engineer's
terminal-cosplay blog. A warm, well-set personal site that covers code,
food, BBQ, sport, travel — typography carries the voice, monospace is
structural seasoning.

**Typography (locked):**

- `--font-serif`: **Fraunces Variable** (display + body via optical-size axis)
- `--font-sans`: **Inter Variable** (UI chrome only)
- `--font-mono`: **JetBrains Mono** (code, dates, type badges, kbd hints)

All open-source, all variable, all self-hosted (fonts go to `public/fonts`
in M2), subsetted, preloaded.

**Color (locked):**

- OKLCH throughout, single source of truth in `src/styles/tokens.css`.
- Light: warm near-white paper, warm near-black ink.
- Dark: charcoal (not pure black), soft off-white ink.
- Accent: **warm ochre / amber**. Swappable in one PR via `tokens.css`.

**Principles:**

- Content sets the grid; chrome does not.
- The site welcomes a BBQ essay as warmly as a refactoring deep-dive.
- Monospace is structural seasoning, never decorative costume.
- Every motion has a job; nothing bounces for fun.
- Dark mode is not an inverted light mode.
- Print is a first-class output, not an afterthought.
- No cookies, anywhere. GDPR-safe by construction.

## Non-negotiables

1. **Distinctive, not generic.** No "AI-built Tailwind template" vibe.
2. **Content-first.** Authoring a post must be fast and pleasant.
   Frontmatter-driven, schema-validated.
3. **Fast.** Core Web Vitals in the green. Image optimization, font
   strategy, minimal JS.
4. **Accessible.** WCAG AA minimum. Keyboard, screen reader,
   reduced-motion friendly.
5. **Cheap to run.** Free tier only. Scale-to-zero hosting.
6. **Maintainable by one person.** Boring tech where it matters,
   interesting tech where it shines.

## Voice for the blog

Pragmatic, direct, engineer-minded, dry humor welcome, no corporate fluff.

Audience: fellow engineers, hiring managers, curious readers from the
wider tech community — _and_ readers who come for food, BBQ, sport, life
writing. Design and tone must welcome both groups.

## Content architecture (lands in M3)

Post types: `essay`, `tutorial`, `til`, `note`, `project`, `bookmark`.
Unified `/posts/<slug>` surface for all readable types; `/projects/<slug>`
for case studies. Flat tag taxonomy (controlled vocabulary enforced at
build). Series for ordered narratives. No categories.

TR-ready seams: `lang` frontmatter field, centralized UI dictionary in
`src/lib/i18n.ts` (shipped in M4, English-only for now), no TR content
shipped at launch.

## AI authoring workflow (your responsibility)

When Koray gives you a topic + rough angle, produce in one turn:

1. A draft `.mdx` file under `src/content/<type>/<slug>.mdx` with valid
   frontmatter.
2. A distinct SEO title and meta description (distinct from in-site H1).
3. A cover-image prompt if `cover` is wanted.
4. 3–5 related-link suggestions drawn from existing posts (read
   `src/content/` before drafting).
5. Verify-before-merge checklist items.

Workflow: push to `drafts/<slug>` branch → Cloudflare preview deploys →
Koray reviews and edits → flip `draft: false` → merge to `main` → ships.

## Commands

```sh
pnpm dev               # Astro dev server, http://localhost:4321
pnpm build             # astro build && pagefind --site dist
pnpm build:astro       # astro build only (skips search index)
pnpm build:search-index # run pagefind against dist/
pnpm preview           # Serve the production build
pnpm typecheck         # astro check (TypeScript + Astro diagnostics)
pnpm lint              # ESLint
pnpm lint:fix          # ESLint --fix
pnpm format            # Prettier write
pnpm format:check      # Prettier check (what CI runs)
pnpm test              # Vitest
pnpm test:e2e          # Playwright (chromium smoke + axe a11y gate)
pnpm test:a11y         # Playwright a11y spec only (@axe-core/playwright)
pnpm lhci              # Lighthouse CI — perf / a11y / best-practices / SEO budgets
pnpm lint:links        # Lychee over dist/ (run after pnpm build)
pnpm test:e2e:install  # one-time Playwright browser install
pnpm new-post          # scaffold a new post (flag-driven)
pnpm build:cv          # regenerate public/cv.pdf after CV changes
```

**Before every commit:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build`.

## Commit conventions

- Conventional commits, scoped by milestone: `feat(m4):`, `chore(m2):`,
  `fix(m3):`, `docs:`.
- Body explains the _why_ when it isn't obvious from the subject.
- One concern per PR. Small, reviewable diffs.
- Keep `docs/phase-1-architecture.md` in sync when a decision moves.

## Layout (as of M7)

```
.
├── .github/              # CI workflows, PR + issue templates
├── docs/
│   ├── phase-1-architecture.md  # THE bible for architecture decisions
│   ├── DESIGN-SYSTEM.md         # Tokens, primitives, layout catalog
│   ├── CONTENT-GUIDE.md         # Post types, frontmatter, new-post CLI
│   ├── CV-GUIDE.md              # Editing the CV, rebuilding the PDF
│   ├── INDIE-WEB-GUIDE.md       # /now, /uses, /colophon, /reading + palette
│   └── QUALITY-GATES.md         # Lighthouse / axe / lychee budgets + how to run locally
├── public/
│   ├── fonts/            # Self-hosted Fraunces / Inter / JetBrains Mono woff2
│   └── cv.pdf            # Committed artifact; regenerate via pnpm build:cv
├── scripts/
│   ├── new-post.ts       # `pnpm new-post` scaffolder
│   └── build-cv-pdf.ts   # `pnpm build:cv` — renders /cv/print to public/cv.pdf
├── src/
│   ├── components/
│   │   ├── ui/           # Button, Kbd, Tag, Callout
│   │   ├── islands/      # ThemeToggle, CommandPalette (vanilla TS)
│   │   ├── layout/       # Header (with primary nav + ⌘K), Footer
│   │   ├── post/         # PostCard, PostHeader, PostMeta, PostFooter,
│   │   │                 #   SeriesBanner, TableOfContents
│   │   └── cv/           # CVContent (shared between /cv and /cv/print)
│   ├── content/
│   │   ├── _schemas.ts   # Pure Zod schemas (testable, no Astro runtime)
│   │   ├── _tags.ts      # Controlled tag vocabulary
│   │   ├── config.ts     # Astro Content Collections wiring
│   │   ├── essays/ tutorials/ tils/ notes/ projects/ bookmarks/ series/
│   │   └── pages/        # /now, /uses, /colophon, /reading markdown
│   ├── data/
│   │   ├── links.ts      # site + social registry (real URLs)
│   │   └── resume.json   # JSON Resume 1.0.0 — CV source of truth
│   ├── env.d.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro  # head / SEO / theme / ClientRouter / chrome
│   │   ├── PostLayout.astro  # wraps prose with header, banner, TOC, footer
│   │   └── PageLayout.astro  # standalone indie-web pages (now/uses/…)
│   ├── lib/
│   │   ├── posts.ts          # publishable stream, tags, series, neighbors
│   │   ├── reading-time.ts   # 240 wpm estimator
│   │   ├── seo.ts            # pageSeo + absoluteUrl
│   │   ├── feed.ts           # feedItemsFor + buildJsonFeed
│   │   ├── og.ts             # satori + resvg OG card renderer
│   │   ├── i18n.ts           # UI dictionary (en-only for now)
│   │   ├── resume.ts         # Zod schema + loader + date helpers
│   │   └── palette-index.ts  # command-palette data + match/search helpers
│   ├── pages/
│   │   ├── index.astro           # hero + latest posts
│   │   ├── sandbox.astro         # design-system showcase, noindex
│   │   ├── posts/index.astro     # unified stream
│   │   ├── posts/[slug].astro    # dynamic post route
│   │   ├── tags/index.astro      # tag index
│   │   ├── tags/[slug].astro     # per-tag stream
│   │   ├── series/index.astro    # series index
│   │   ├── series/[slug].astro   # ordered series posts
│   │   ├── rss.xml.ts            # RSS 2.0 feed
│   │   ├── feed.json.ts          # JSON Feed 1.1
│   │   ├── og/[slug].png.ts      # per-post OG card (build-time)
│   │   ├── cv/index.astro        # CV screen layout
│   │   ├── cv/print.astro        # print shell (noindex, minimal chrome)
│   │   ├── cv.json.ts            # JSON Resume endpoint
│   │   ├── now.astro / uses.astro / colophon.astro / reading.astro
│   │   └── 404.astro             # custom noindex not-found page
│   └── styles/
│       ├── fonts.css     # @font-face declarations
│       ├── tokens.css    # design tokens — single source of truth
│       ├── prose.css     # post-body typography
│       ├── cv.css        # CV screen layout
│       ├── cv-print.css  # CV print / PDF layout (A4, ink-friendly)
│       └── global.css    # base styles + @theme bridge + imports
├── tests/
│   ├── content.test.ts   # schema + FK + tag + reading-time + pages
│   ├── lib.test.ts       # seo / feed / posts helper coverage
│   ├── resume.test.ts    # CV schema + date helpers
│   ├── palette.test.ts   # palette match / search helper coverage
│   ├── stubs/
│   │   └── astro-content.ts   # virtual-module stub for vitest
│   └── e2e/
│       ├── home.spec.ts
│       ├── blog.spec.ts       # posts, tags, series, feeds, OG, active nav
│       ├── cv.spec.ts         # /cv, /cv/print (noindex), /cv.json, active nav
│       ├── indie-web.spec.ts  # /now, /uses, /colophon, /reading, 404
│       ├── palette.spec.ts    # ⌘K, focus, navigation, data blob
│       ├── a11y.spec.ts       # axe-core gate (no serious/critical violations)
│       └── sandbox.spec.ts
├── astro.config.mjs
├── eslint.config.mjs
├── .lighthouserc.cjs          # LHCI budgets + preview server wiring
├── lychee.toml                # Link checker config (accepts, excludes, retries)
├── package.json
├── playwright.config.ts
├── renovate.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Residual info Koray still owes

- **Real CV content.** `src/data/resume.json` ships as placeholder
  (fictional employers / schools, real basics). Replace the `work`,
  `education`, `skills`, `languages`, `publications`, and `projects`
  arrays. See `docs/CV-GUIDE.md` for the workflow.
- A résumé photo (optional) for `basics.image` — served from
  `/public/` or an external URL.
- **Real indie-web copy.** `/now`, `/uses`, and `/reading` ship with
  placeholder markdown. `/colophon` is accurate — it describes the
  site itself. Edit the four files under `src/content/pages/`. See
  `docs/INDIE-WEB-GUIDE.md`.

Confirmed handles: GitHub `koray-devecioglu`, LinkedIn `koraydevecioglu`,
Instagram `koraydevecioglu`. All three live in `src/data/links.ts`.

## First thing to do in each new Claude Code session

1. Read this file (you're doing it).
2. Skim `docs/phase-1-architecture.md` — this is the authoritative record
   of Phase 1 decisions.
3. Check `git status` and `git log --oneline -10` to see where M1 / the
   current milestone left off.
4. If the current milestone isn't obvious, ask Koray before starting
   work.

## What's deliberately deferred

- Pagination on `/posts` and `/tags/[slug]`: single-page list reads fine
  under ~30 entries. Pagination lands the first milestone the list
  outgrows that threshold — or M6, whichever comes first.
- Cover images on real posts: schema accepts `cover` + `coverAlt`, but
  nothing ships with a cover yet. First real covers land when the first
  real post needs one.
- Autolinked heading anchors (rehype-autolink-headings): prose supports
  the styling hook, but the plugin isn't wired yet. Lands alongside the
  first long post that actually benefits from deep links.
- PDF generation in CI: the build is static and Cloudflare Pages
  doesn't ship with Chromium. `pnpm build:cv` runs locally and commits
  `public/cv.pdf`. If this becomes annoying later, we can move it to a
  scheduled GitHub Action.
- Lighthouse CI, axe, lychee: shipped in M7; budgets and local commands in `docs/QUALITY-GATES.md`.
- `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/CONTRIBUTING.md`:
  write as each relevant milestone closes. `docs/DESIGN-SYSTEM.md`
  landed with M2; `docs/CONTENT-GUIDE.md` landed with M3.
- `LICENSE` file: lands at M8 (CC BY 4.0 for prose, MIT for code).

## Things NOT to do without checking with Koray

- Don't introduce a new framework, CMS, or runtime. Stack is locked.
- Don't add a paid service. Free tier only is a hard constraint.
- Don't add cookies or any client-side tracking.
- Don't change brand decisions (typography, accent, aesthetic direction)
  without a Phase-1-style proposal.
- Don't push directly to `main`. Use PRs even solo — the CI gate is the
  point.
