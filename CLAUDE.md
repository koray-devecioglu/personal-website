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

| Milestone | Scope                                                                                                  | Status             |
| --------- | ------------------------------------------------------------------------------------------------------ | ------------------ |
| M0        | Proposal approved                                                                                      | ✅                 |
| M1        | Repo scaffold — Astro 5, TS strict, Tailwind v4, CI skeleton                                           | ✅                 |
| M2        | Design tokens polish, self-hosted webfonts, primitives (Button, Kbd, Tag, ThemeToggle), Header, Footer | ✅                 |
| **M3**    | Content collections + Zod schemas, `scripts/new-post.ts`, sample posts of each type                    | ✅ **just landed** |
| M4        | Blog surface (home, /posts, /tags, /series, post layout, feeds, sitemap, per-post OG)                  | ← **next**         |
| M5        | CV surface (`/cv`, `/cv/print`, `/cv.pdf`, JSON Resume export) — needs Koray's LinkedIn URL            | —                  |
| M6        | Indie-web polish (`/now`, `/uses`, `/colophon`, `/reading`, 404, command palette, Pagefind search)     | —                  |
| M7        | Quality gates (Lighthouse CI, axe-core, lychee) + flip CI to `--frozen-lockfile`                       | —                  |
| M8        | Launch (DNS, SSL, email routing, analytics, Search Console, Bing Webmaster)                            | —                  |
| M9        | Post-launch (comments, webmentions, uptime, error monitoring, newsletter decision)                     | —                  |

## Stack (locked in Phase 1)

- **Framework:** Astro 5 (static, islands-ready)
- **Language:** TypeScript strict (`astro/tsconfigs/strict` + `noUncheckedIndexedAccess`)
- **Styling:** Tailwind v4 via `@tailwindcss/vite`, CSS-first config, tokens in `src/styles/tokens.css`, bridged to Tailwind via `@theme` in `src/styles/global.css`
- **Content:** Astro Content Collections + Zod — schemas in `src/content/_schemas.ts`, collections wired in `src/content/config.ts`
- **Markdown:** MDX for interactive posts, plain MD for most; Shiki for code highlighting
- **Search:** Pagefind (static, client-side, landing in M6)
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
`src/lib/i18n.ts` (landing M4), no TR content shipped at launch.

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
pnpm dev              # Astro dev server, http://localhost:4321
pnpm build            # Production build to dist/
pnpm preview          # Serve the production build
pnpm typecheck        # astro check (TypeScript + Astro diagnostics)
pnpm lint             # ESLint
pnpm lint:fix         # ESLint --fix
pnpm format           # Prettier write
pnpm format:check     # Prettier check (what CI runs)
pnpm test             # Vitest
pnpm test:e2e         # Playwright (chromium smoke)
pnpm test:e2e:install # one-time Playwright browser install
```

**Before every commit:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build`.

## Commit conventions

- Conventional commits, scoped by milestone: `feat(m4):`, `chore(m2):`,
  `fix(m3):`, `docs:`.
- Body explains the _why_ when it isn't obvious from the subject.
- One concern per PR. Small, reviewable diffs.
- Keep `docs/phase-1-architecture.md` in sync when a decision moves.

## Layout (as of M3)

```
.
├── .github/              # CI workflows, PR + issue templates
├── docs/
│   ├── phase-1-architecture.md  # THE bible for architecture decisions
│   ├── DESIGN-SYSTEM.md         # Tokens, primitives, layout catalog
│   └── CONTENT-GUIDE.md         # Post types, frontmatter, new-post CLI
├── public/
│   └── fonts/            # Self-hosted Fraunces / Inter / JetBrains Mono woff2
├── scripts/
│   └── new-post.ts       # `pnpm new-post` scaffolder
├── src/
│   ├── components/
│   │   ├── ui/           # Button, Kbd, Tag, Callout
│   │   ├── islands/      # ThemeToggle (hydrates client-side)
│   │   └── layout/       # Header, Footer
│   ├── content/
│   │   ├── _schemas.ts   # Pure Zod schemas (testable, no Astro runtime)
│   │   ├── _tags.ts      # Controlled tag vocabulary
│   │   ├── config.ts     # Astro Content Collections wiring
│   │   ├── essays/       # Sample + real posts
│   │   ├── tutorials/
│   │   ├── tils/
│   │   ├── notes/
│   │   ├── projects/
│   │   ├── bookmarks/
│   │   └── series/
│   ├── data/links.ts     # site + social registry (placeholder URLs)
│   ├── env.d.ts
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── posts.ts      # getPublishablePosts, draft/scheduled filter
│   │   └── reading-time.ts  # 240 wpm estimator
│   ├── pages/
│   │   ├── index.astro   # M1 placeholder, replaced in M4
│   │   └── sandbox.astro # design-system showcase, noindex
│   └── styles/
│       ├── fonts.css     # @font-face declarations
│       ├── tokens.css    # design tokens — single source of truth
│       └── global.css    # base styles + @theme bridge
├── tests/
│   ├── content.test.ts   # schema + FK + tag + reading-time harness
│   └── e2e/
│       ├── home.spec.ts
│       └── sandbox.spec.ts
├── astro.config.mjs
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
├── renovate.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Residual info Koray still owes

- (M5) Anything LinkedIn wouldn't show but should be on the CV page —
  side projects, open source, talks, writing elsewhere.

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

- Blog surface (home feed, `/posts`, `/tags`, `/series`, post layout,
  RSS, per-post OG images): lands in M4. Schemas and sample content
  exist now; routes do not.
- Cover images on real posts: schema accepts `cover` + `coverAlt`, but
  M3's sample posts don't ship any. First real covers land with M4.
- Command palette, search: land in M6.
- Lighthouse CI, axe, lychee: stubbed in `ci.yml`. Land in M7.
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
