# Phase 1 — Architecture Proposal v1

**Project:** koraydevecioglu.com
**Date:** 2026-04-20
**Status:** Awaiting review

---

## Executive summary

Build koraydevecioglu.com as a content-first static site on **Astro 5** (TypeScript strict, Tailwind v4 CSS-first, MDX, Shiki, Pagefind), deployed on **Cloudflare Pages** with **Cloudflare DNS + Email Routing**. Free to run, ships near-zero JS, typed frontmatter via Zod, islands only where interactivity earns its weight (command palette, search, theme toggle). Everything — blog, CV, indie-web pages — lives in one repo with a single design system and one publishing pipeline.

Runway from zero to launch: ~10 working days across 9 milestones. After your sign-off, M1 (repo scaffold) starts.

---

## 1. Stack decision

### Pick: Astro 5 + TypeScript + Tailwind v4 + MDX + Pagefind + Cloudflare Pages

**Why Astro wins for this site:**

- **Zero-JS by default.** Pages render as static HTML. No hydration cost unless we opt in. That directly serves the "Core Web Vitals in the green" and "minimal JS" non-negotiables.
- **Islands where it matters.** Command palette, search, theme toggle can be React/Svelte/Vanilla islands — each its own tiny bundle. No framework monoculture tax.
- **Content Collections + Zod.** First-class typed frontmatter baked into the framework. Build fails if a post's frontmatter drifts from schema. This is exactly what "frontmatter-driven, schema-validated" means.
- **MDX without ceremony.** Mix interactive components into long-form posts when justified; pure markdown when not.
- **Shiki for code.** Same engine VS Code uses; any TextMate theme works; no client-side JS for highlighting.
- **Pagefind for search.** Static index built at deploy; search runs entirely in the browser with no backend. Ships after initial interaction. Under 100KB for typical archives.
- **Tailwind v4 CSS-first.** Tokens live in `@theme` in a CSS file — single source of truth, no JS config sprawl.
- **Maintainable in six months.** The content model is markdown files in folders. The runtime is plain HTML. Future-you doesn't need to relearn a framework to fix a typo.

### Runner-up 1: Next.js 15 (App Router) on Vercel

Strong React ecosystem, server components, familiar DX.

- **Wins:** biggest community, React talent pool, RSC patterns are elegant for some use cases.
- **Loses:** overkill for a content site. Default JS payload is heavier even with RSC. Vercel Hobby has stricter bandwidth limits than Cloudflare Pages. Content Collections-equivalent (`content-collections`, `velite`, `contentlayer`) is third-party and less settled. More moving parts against "maintainable by one person."

### Runner-up 2: Eleventy (11ty) 3.0

The purest static-site generator. Zero opinions, zero JS by default.

- **Wins:** even lighter than Astro. Minimal dependencies. Extremely stable.
- **Loses:** no built-in component model — Nunjucks/WebC/JSX are all bolt-ons, each with trade-offs. TypeScript story is weaker. Islands for the command palette require hand-rolling a bundler pipeline. More code to write for the same outcome.

### Not considered: SvelteKit

Optimized for apps, not content sites. Would be a weird fit here.

### Stack bill of materials

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 5 | See above |
| Language | TypeScript (strict) | Self-explanatory |
| Package manager | pnpm | Fast, strict, Corepack-managed |
| Node | LTS, pinned via `.node-version` + `.nvmrc` | Reproducibility |
| Styling | Tailwind v4 (CSS-first) + CSS custom properties | Tokens as the source of truth; no config sprawl |
| Content | Astro Content Collections + Zod | Typed frontmatter, build-time validation |
| Markdown | Remark/rehype pipeline + MDX | Plugins: GFM, smartypants, footnotes, slug, autolink-headings, reading-time, Shiki, KaTeX (gated), Mermaid (gated) |
| Syntax highlighting | Shiki (dual theme: light/dark) | Zero-JS, VS Code themes |
| Search | Pagefind | Static, client-side, free, ~100KB |
| Icons | Lucide (tree-shaken SVG) | Clean, consistent, no icon fonts |
| Testing | Vitest (unit/schema), Playwright (e2e smoke) | Standard, fast |
| Linting | ESLint 9 flat config + Prettier | Standard |
| Quality gates | Lighthouse CI + axe-core + lychee (links) | All free, all in Actions |
| Dependencies | Renovate | Better than Dependabot for weekly grouped PRs |
| Hosting | Cloudflare Pages | Free, unlimited bandwidth, edge everywhere, no cold starts (static) |
| DNS | Cloudflare | Free, fast, integrates with Pages |
| Email | Cloudflare Email Routing | Free forwarding to personal inbox |
| Analytics | Cloudflare Web Analytics | Free, privacy-respecting, no cookies |
| Comments | giscus (GitHub Discussions) | Free, no DB, lazy-loaded, opt-in per post |
| Monitoring | UptimeRobot (uptime, free) + Sentry (errors, free tier) | Opt-in after M8 |

---

## 2. Directory layout

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # Build, lint, types, tests, Lighthouse, axe, links
│   │   └── preview-comment.yml   # Posts preview URL + Lighthouse to PR
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── docs/
│   ├── ARCHITECTURE.md           # The locked architecture (promoted from this file)
│   ├── CONTENT-GUIDE.md          # How to write & publish a post
│   ├── DESIGN-SYSTEM.md          # Tokens, principles, component catalogue
│   ├── RUNBOOK.md                # Operational playbook (incidents, DNS, etc.)
│   └── CONTRIBUTING.md           # Future-me after six months away
├── public/
│   ├── fonts/                    # Self-hosted, subsetted, preloaded
│   ├── favicon.svg               # Plus PNG fallbacks, apple-touch-icon
│   ├── robots.txt
│   └── .well-known/              # webfinger, security.txt, etc.
├── scripts/
│   ├── new-post.ts               # Scaffold a post with valid frontmatter
│   ├── build-cv-pdf.ts           # Playwright → /cv.pdf at build time
│   └── check-links.ts            # Used by CI
├── src/
│   ├── assets/                   # Logo, default OG background, site-wide imagery
│   ├── components/
│   │   ├── ui/                   # Button, Kbd, Tag, Callout, Prose
│   │   ├── layout/               # Header, Footer, Nav, SkipLink
│   │   ├── post/                 # PostCard, PostMeta, Toc, SeriesNav, RelatedPosts, ReadingProgress
│   │   ├── cv/                   # Timeline, SkillMatrix, ProjectCard, PrintFooter
│   │   └── islands/              # CommandPalette.tsx, Search.tsx, ThemeToggle.ts
│   ├── content/
│   │   ├── config.ts             # Collections + Zod schemas
│   │   ├── essays/
│   │   ├── tutorials/
│   │   ├── tils/
│   │   ├── notes/
│   │   ├── projects/
│   │   ├── bookmarks/
│   │   ├── series/
│   │   └── cv/
│   │       ├── about.md
│   │       ├── experience.json
│   │       ├── skills.json
│   │       └── highlights.json
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PostLayout.astro
│   │   └── CvLayout.astro
│   ├── lib/
│   │   ├── seo.ts
│   │   ├── feed.ts
│   │   ├── og-image.ts           # Satori/resvg-based runtime OG
│   │   └── reading-time.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── posts/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── tags/{index,[tag]}.astro
│   │   ├── series/{index,[series]}.astro
│   │   ├── projects/{index,[slug]}.astro
│   │   ├── cv/
│   │   │   ├── index.astro
│   │   │   └── print.astro
│   │   ├── {about,now,uses,colophon,reading}.astro
│   │   ├── 404.astro
│   │   ├── rss.xml.ts
│   │   ├── atom.xml.ts
│   │   ├── feed.json.ts
│   │   ├── sitemap-index.xml.ts
│   │   ├── og/[...slug].png.ts
│   │   └── cv.pdf.ts             # Serves the prebuilt PDF
│   ├── styles/
│   │   ├── tokens.css            # Design tokens — single source of truth
│   │   ├── global.css            # Reset, base elements, focus styles
│   │   └── prose.css             # Long-form typography
│   └── env.d.ts
├── tests/
│   ├── content.test.ts           # Asserts all collections parse
│   └── e2e/                      # home, post, cv, search, 404
├── .editorconfig
├── .gitignore
├── .node-version
├── .nvmrc
├── .prettierrc
├── astro.config.mjs
├── eslint.config.mjs
├── package.json
├── pnpm-lock.yaml
├── renovate.json
├── tsconfig.json
└── README.md
```

**Routing intentions:**

- **Unified post surface.** `/posts` indexes every readable type (essays, tutorials, TILs, notes). Filters by type live in the URL (`?type=tutorial`) and in the sidebar. Individual posts live at `/posts/<slug>`, regardless of type. This keeps URLs short and makes series that span types (common for engineering content) natural.
- **Projects get their own surface.** `/projects` and `/projects/<slug>` because project write-ups are CV artifacts as much as blog posts.
- **Bookmarks** render as a firehose `/bookmarks` + feed; individual pages are optional.
- **CV** lives at `/cv`, with `/cv/print` as a dedicated print view and `/cv.pdf` serving the prebuilt PDF.

---

## 3. Design system skeleton

### Direction: "Humanist editorial with engineering detailing"

A site that reads like a warm, well-set book. The content here is wider than "software engineer writes about code" — it stretches to food, barbecue, sport, travel, whatever Koray finds worth writing about — and the aesthetic must feel inviting across all of it. Typography carries the voice. Monospace appears as structural seasoning (dates, reading time, type badges, code, keyboard hints), never as costume. No terminal cosplay, no gradient-blob hero, no "Hi I'm Koray 👋". Home and About frame Koray as a person with multiple interests; the engineering CV is a surface among others, not the site's thesis.

**Principles, in one sentence each:**

- *Content sets the grid; chrome does not.*
- *The site welcomes a BBQ essay as warmly as a refactoring deep-dive.*
- *Monospace is structural seasoning (metadata, code, keyboard hints), never decorative costume.*
- *Every motion has a job; nothing bounces for fun.*
- *Dark mode is not an inverted light mode.*
- *Print is a first-class output, not an afterthought.*

### Tokens (single source of truth: `src/styles/tokens.css`)

**Typography** — three families, self-hosted WOFF2, subsetted, preloaded. All open-source, all variable fonts:

- `--font-serif`: **Fraunces Variable** — display *and* body, via its optical-size axis. Warm, slightly quirky (SOFT and WONK axes let us tune terminal softness and glyph eccentricity), editorial, distinctive without shouting. Carries pull quotes and long-form reading equally well.
- `--font-sans`: **Inter Variable** — UI chrome only (nav, buttons, labels, form controls). Neutral, legible at small sizes, tuned for UI.
- `--font-mono`: **JetBrains Mono Variable** — code, date ranges, type badges, keyboard hints, numeric columns in CV / tables. Ligatures off by default (they're divisive in prose contexts).

*Why serif body, not sans:* the content spread (tech + food + sport + life) is closer to a personal essay publication than a tech blog. Serif body reads welcoming and editorial; sans body reads tech-publication. This is the single biggest identity lever and we're pulling it toward "writer's site."

**Type scale** — fluid, `clamp()`-based, 1.2 modular ratio on narrow screens, 1.25 on wide:

- `--text-xs` through `--text-display` with matching `--leading-*` and `--tracking-*`.

**Color** — OKLCH, one neutral ramp + one accent ramp, light + dark:

- Light: `--bg` warm near-white (OKLCH ~98% L, slight yellow chroma), `--fg` near-black with a hint of warmth.
- Dark: `--bg` charcoal (not pure black — reduces eye strain), `--fg` soft off-white.
- One accent hue, used sparingly: links, focus rings, inline `<mark>`, selection background. **Accent direction locked: warm ochre / amber.** Chosen because it (a) complements the humanist-editorial typography, (b) reads well against both light and dark backgrounds in OKLCH, and (c) feels equally at home on a food post and a systems-design essay. All color lives in `tokens.css` — swapping the accent later is one PR.

**Spacing & layout** — 4px baseline, scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. Content max-width ~68ch for long-form. Asymmetric grid on wider viewports: a wide reading column with a left rail for metadata (date, type tag, reading time) at narrow viewports collapses to stacked.

**Motion** — 120ms (micro), 200ms (standard), 400ms (page transition). `ease-out` default, spring only for the one or two "delight" interactions. All motion guarded by `prefers-reduced-motion: reduce`.

**Elevation** — two shadow tokens only (`--shadow-sm`, `--shadow-md`). Outlines and rules carry most of the structural weight.

**Focus** — a single, loud focus ring that works on both themes. Never removed.

### Three sample components (described, not yet coded)

**1. PostCard** — used on `/`, `/posts`, `/tags/[tag]`, `/series/[series]`.

```
┌─────────────────────────────────────────────────────────────┐
│  TUTORIAL · 2026-03-18 · 8 min          ── ── ── ── ── ──   │
│                                                             │
│  How I stopped writing flaky E2E tests                     │
│  ─────────────────────────────────────                     │
│  Three ideas that dropped our flake rate by 87%            │
│  on the playwright suite I own at $DAYJOB.                 │
│                                                             │
│  #testing  #playwright  #engineering                        │
└─────────────────────────────────────────────────────────────┘
```

The type badge (`TUTORIAL`) and date are mono, small, uppercase. Title is serif, heavy, wraps. Excerpt is sans, two lines clamped. Tags are tiny mono chips. Hover shifts the badge color to accent and extends the title underline — card never scales.

**2. CommandPalette** (⌘K) — an island, React.

```
┌─────────────────────────────────────────────────────────────┐
│  > _                                                        │
├─────────────────────────────────────────────────────────────┤
│  Jump                                                       │
│    →  Home                                          g h     │
│    →  All posts                                     g p     │
│    →  CV                                            g c     │
│  Posts (matched via Pagefind)                               │
│    →  How I stopped writing flaky E2E tests                 │
│    →  Notes on OKLCH                                        │
│  Actions                                                    │
│    →  Toggle theme                                  ⌘ .     │
│    →  Copy page URL                                 ⌘ ⇧ c   │
└─────────────────────────────────────────────────────────────┘
```

Keyboard-first (arrow keys, enter, esc, tab cycles groups). Shortcuts live in the right gutter in mono. Sections are Jump (static routes), Posts (Pagefind search), Tags, Series, Actions. Loads on first ⌘K press, not on page load.

**3. CVTimelineItem** — used on `/cv`.

```
┌─────────────────────────────────────────────────────────────┐
│ 2023.05 – now   │  Senior Software Engineer                │
│ Istanbul        │  $COMPANY · full-time                    │
│                 │  ───────────────────────                 │
│                 │  Led the migration from X to Y; cut p95   │
│                 │  latency by 43% and onboarded a team…     │
│                 │  (click to expand impact bullets)         │
└─────────────────────────────────────────────────────────────┘
```

Fixed-width left column in mono (date range + location). Title in serif, company/meta in sans, impact summary in sans. Expands to full bullets on click. Print stylesheet expands everything, strips the expand affordance, and tightens the leading for one-page fit.

---

## 4. Content architecture

### Post types (Astro Content Collections)

| Type | Where | Feel | Frontmatter extras |
|---|---|---|---|
| `essay` | `src/content/essays/` | Long-form opinion/argument | — |
| `tutorial` | `src/content/tutorials/` | Step-by-step guide | `prereqs[]`, `stack[]` |
| `til` | `src/content/tils/` | Today-I-learned, short | `sourceLink?` |
| `note` | `src/content/notes/` | Loose thinking, draft-ish | — |
| `project` | `src/content/projects/` | Case study / write-up | `role`, `stack[]`, `links`, `status`, `featured?` |
| `bookmark` | `src/content/bookmarks/` | Pocket-style linkpost with commentary | `url`, `via?` |

All share a **core schema** enforced by Zod at build time:

```ts
// Sketch — final shape lands in M3
const core = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(), // override
  tags: z.array(z.string().regex(/^[a-z0-9-]+$/)),    // validated against allow-list
  series: z.string().optional(),                      // FK to series collection
  draft: z.boolean().default(false),
  scheduled: z.coerce.date().optional(),              // hidden until this date
  cover: image().optional(),
  coverAlt: z.string().optional(),                    // required if cover present (refine)
  ogImage: z.string().optional(),                     // overrides generated OG
  canonical: z.string().url().optional(),
  lang: z.enum(['en', 'tr']).default('en'),
  translations: z.array(z.object({
    lang: z.enum(['en', 'tr']),
    slug: z.string(),
  })).optional(),
  toc: z.boolean().default(true),
  math: z.boolean().default(false),                   // gates KaTeX loading
  diagram: z.boolean().default(false),                // gates Mermaid loading
});
```

Per-type extensions are intersected on top. A tags allow-list lives alongside the schema, so a typo'd tag fails the build.

### Series

`src/content/series/<slug>.md` has its own schema (`title`, `summary`, `order[]`). Post → series is a string FK; Zod refines to ensure the series exists and the post appears in the order array.

### Drafts & scheduled posts

- `draft: true` → never built.
- `scheduled: <date>` → built but excluded from feeds and indexes until the date passes. Daily Cloudflare Pages build is triggered via Cloudflare Cron Trigger (free) to flip scheduled posts live.

### Slug strategy

- Default slug = filename sans extension.
- Optional `slug:` in frontmatter overrides.
- URLs: `/posts/<slug>` (all readable types), `/projects/<slug>`, `/bookmarks` (list only, no individual pages unless the bookmark is heavily annotated).

### TR-ready seams (but not shipping TR)

- Every post has `lang` (default `'en'`). Every layout sets `<html lang>` and emits `hreflang` links.
- `translations[]` array on frontmatter is already modeled.
- Route structure stays `/posts/...` for now; when TR arrives we add `/tr/posts/...` and the English tree stays untouched.
- Copy strings (nav labels, UI chrome) are centralized in `src/lib/i18n.ts` as a dictionary, even though it only holds `en` today.

### AI authoring workflow

You give me a topic + rough angle. I produce, in one turn:

1. A draft `.mdx` file under `src/content/<type>/<slug>.mdx` with valid frontmatter (title, description, tags from the allow-list, type, series if applicable, date = today).
2. A distinct **SEO title** and **meta description** (distinct from the in-site H1/dek).
3. A **cover-image prompt** (if `cover` is wanted).
4. 3–5 **related-link suggestions** drawn from your existing posts (I'll read `src/content/` before drafting to cross-reference — this is why the content repo is the source of truth).
5. A `post-checklist.md` diff with items you should verify before merge (alt text, links resolve, frontmatter complete, et cetera).

Workflow:

1. Push to `drafts/<slug>` branch. Cloudflare Pages auto-deploys a preview.
2. You review on the preview, edit in VS Code, push more commits.
3. Flip `draft: false`. Merge to `main`. It ships.

---

## 5. Hosting, DNS, domain, email

### Hosting — Cloudflare Pages

- Free tier: 500 builds/month, unlimited bandwidth, unlimited requests, unlimited seats. Vercel Hobby has 100GB/month bandwidth — Cloudflare is the safer long-term bet at zero cost.
- Static output, so zero cold starts. Edge-served everywhere.
- Git integration: `main` → production, PR branches → preview subdomains.
- Build command: `pnpm build`. Build image: latest LTS Node.

### DNS — Cloudflare

- Change nameservers at your registrar to Cloudflare's. Zero downtime (domain isn't currently pointed anywhere per brief).
- Apex `koraydevecioglu.com` → Pages project via CNAME flattening.
- `www.koraydevecioglu.com` → 301 redirect to apex (Page Rule or Bulk Redirects, free).
- SSL: Cloudflare automatic, Full (Strict).
- HSTS: enabled, `max-age=31536000; includeSubDomains; preload` after we've run clean for two weeks.

### Email — Cloudflare Email Routing

- Free inbound forwarding. Adds correct MX + SPF + DKIM records.
- **Locked mapping:** `hi@koraydevecioglu.com` → your personal Gmail. Plus a catch-all for everything else to the same inbox.
- Outbound (sending from the domain) is a later decision; Resend's free tier is the clean path when you want it.

### Analytics — Cloudflare Web Analytics

- Free, privacy-respecting, no cookies, no consent banner needed.
- Server-side beacon, doesn't inflate JS payload.
- Gives you page views, top referrers, Core Web Vitals field data. That's sufficient for a personal site.
- Upgrade path, if you ever need session-level: Umami self-host on Fly.io free tier, ~45 min of work.

---

## 6. CI/CD plan

### Branching

- `main` is protected, trunk-based.
- Short-lived feature branches (`feat/*`, `fix/*`, `drafts/*`) → PR → review (you) → merge.
- No `develop`, no release branches. This is a personal site; overhead isn't earned.

### `ci.yml` (on PR + on push to main)

1. Checkout, setup Node via `.node-version`, enable Corepack, install pnpm.
2. `pnpm install --frozen-lockfile`.
3. `pnpm typecheck` (TS strict).
4. `pnpm lint` (ESLint) + `pnpm format:check` (Prettier).
5. `pnpm test` (Vitest — content schema smoke + lib units).
6. `pnpm build` (Astro — catches schema errors, missing assets, broken imports).
7. `pnpm test:e2e` (Playwright smoke: `/`, one post, `/cv`, `/404`, command palette opens).
8. **Lighthouse CI** with a perf budget — fail the job if: perf &lt; 95, a11y &lt; 100, best-practices &lt; 95, SEO = 100.
9. **axe-core** scan on built pages — fail on any serious/critical violations.
10. **lychee** link checker over `./dist` — fail on external 4xx/5xx and any internal break.
11. Upload Lighthouse + axe reports as artifacts.

### `preview-comment.yml` (on PR)

After Cloudflare Pages emits the preview URL, comment it on the PR with a mini Lighthouse run against the preview.

### Renovate

- Config: group patches + minors into one weekly PR; auto-merge on green. Majors get their own PR and wait for human review.
- Node pinned (`node: ">=22.x <23"`), pnpm pinned via Corepack.

### Secrets

- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` → GitHub encrypted secrets, only used by preview-comment workflow.
- No other secrets needed at launch (analytics, comments are cookieless / self-contained).

---

## 7. Roadmap — zero to launch

| Milestone | Scope | Rough duration | Exit criterion |
|---|---|---|---|
| **M0** | This proposal approved | — | Your sign-off + answers to the questions below |
| **M1** | Repo scaffold | Day 1 | `pnpm dev` runs; ESLint + TS + Prettier + Vitest + Playwright + CI skeleton green |
| **M2** | Design tokens + primitives + layouts | Day 2–3 | Tokens locked; Button / Kbd / Tag / ThemeToggle / Header / Footer rendered on a sandbox page |
| **M3** | Content engine | Day 3–4 | Collections + Zod schemas shipped; `scripts/new-post.ts` works; one sample post of each type in the repo; `pnpm build` green with no schema errors |
| **M4** | Blog surface | Day 4–6 | `/`, `/posts`, `/tags`, `/series`, post layout with TOC + reading progress + related posts; RSS/Atom/JSON feeds; sitemap; per-post OG image generator |
| **M5** | CV surface | Day 6–8 | `/cv`, `/cv/print`, `/cv.pdf` (build-time Playwright); JSON Resume export. *Requires your career details — I'll ask at the start of M5.* |
| **M6** | Indie-web polish | Day 8–9 | `/now`, `/uses`, `/colophon`, `/reading`; custom 404; command palette; Pagefind search wired into the palette |
| **M7** | Quality gates in CI | Day 9–10 | Lighthouse CI, axe-core, lychee all running and green; Renovate installed |
| **M8** | Launch | Day 10–11 | DNS cut over to Cloudflare; HTTPS green; email forwarding live; analytics receiving; Search Console + Bing Webmaster verified; sitemap submitted; announce post published |
| **M9** | Post-launch polish | Ongoing | Comments (giscus), webmentions, uptime + error monitoring, newsletter decision |

Day estimates assume focused evenings/weekend time, not full workdays. Nothing here requires a heroic push — slippage is fine, the plan has no hard deadlines.

---

## 8. Decisions I'm making without asking you

1. **Astro 5 + TypeScript strict + Tailwind v4 (CSS-first) + MDX + Shiki + Pagefind** as the stack.
2. **Cloudflare Pages + Cloudflare DNS + Cloudflare Email Routing** for hosting/domain/email.
3. **Cloudflare Web Analytics** as the analytics baseline (privacy-respecting, free, no cookies, no consent banner).
4. **pnpm** package manager; Node LTS pinned via `.node-version` and `.nvmrc`.
5. **Trunk-based Git** with protected `main` and preview deploys per PR.
6. **Renovate** over Dependabot.
7. **Fraunces (serif, display + body) + Inter Variable (UI sans) + JetBrains Mono (structural mono)** as the typographic baseline — all free, self-hosted, subsetted, preloaded.
8. **Accent color: warm ochre / amber** in OKLCH. Single accent token; trivially swappable.
9. **OKLCH color tokens**, light + dark + `prefers-color-scheme`-auto, persisted theme override, View Transitions API for a crossfade on toggle.
10. **Giscus via GitHub Discussions** for comments, opt-in per post, disabled by default for TILs and bookmarks, lazy-loaded below the fold. No Disqus, no Commento.
11. **No newsletter at launch.** Buttondown free tier is my recommendation when you want one.
12. **MDX for interactive posts, plain Markdown for most.** Frontmatter identical for both.
13. **Unified post surface at `/posts/<slug>`** — essays, tutorials, TILs, notes all live there. Projects get `/projects/<slug>`. Rejecting `/essays/`, `/tutorials/`, etc. as separate tops because they fragment navigation and make cross-type series awkward.
14. **Flat tag taxonomy** (kebab-case, controlled vocabulary enforced at build). Series for ordered narratives. **No categories** — redundant with type + tags.
15. **Humanist editorial aesthetic, not "nerd cosplay"**: no green-on-black terminal pastiche, no `~/$ whoami` hero, no software-engineer monolithic framing on home or About. Editorial typography with monospace used structurally.
16. **Home + About frame Koray as a multi-interest person**, not a software-engineer-only brand. Engineering CV is a surface among others, not the thesis.
17. **Reading time = 240 wpm** (literature-adjusted, not the corporate 200).
18. **Two restrained easter eggs:** (a) a `?verbose` query param that inlines footnotes in long-form posts; (b) a console signature on first page load with a "how this site was built" link. Both discoverable, neither noisy.
19. **No cookies at all**, anywhere. No consent banner needed. GDPR-safe by construction.
20. **Content license: CC BY 4.0 for prose; MIT for code snippets.** Industry-standard, generous, clearly attributed.
21. **Dark mode is not an inverted light mode** — dedicated dark palette with its own contrast decisions.
22. **Print stylesheet for `/cv`** plus a build-time Playwright-rendered `/cv.pdf`.
23. **Footer line: `© Koray Devecioglu 2026`** — no city, no jurisdiction. License note appears as a separate small line below.
24. **Name pronunciation affordance on /about** — small audio clip + phonetic (IPA + plain). Trivially removable if it doesn't land.

---

## 9. Open items from you

**Resolved (2026-04-20):**

- Framework choice: architect's call ✅
- Language scope: English with TR-ready schema ✅
- Visual identity: design from scratch ✅
- Budget: free tier only ✅
- Social presence: LinkedIn + GitHub + Instagram (icon-only footer links, plus `rel=me`) ✅
- Exposed email: `hi@koraydevecioglu.com` ✅
- Accent color: my call, kept trivially swappable → **warm ochre / amber locked** ✅
- Typeface direction: **humanist editorial**, not engineer-specific → Fraunces + Inter + JetBrains Mono locked ✅
- CV confidentiality: LinkedIn will be the source; current-role specifics will be scrubbed / softened ✅
- Name pronunciation affordance: yes (trial), removable later ✅
- Legal footer: `© Koray Devecioglu 2026`, no city, license on its own line ✅

**Residual asks (non-blocking for M1; needed before M2 closes and before M5):**

1. **LinkedIn profile URL** — needed for footer icon link + will feed M5 (CV page).
2. **Instagram profile URL** — needed for footer icon link.
3. **GitHub handle confirmation** — defaulting to `koray-devecioglu` (matches the repo owner) unless you have a personal handle you'd rather surface.
4. **(M5, later)** Anything LinkedIn wouldn't show but you'd want on the CV page — side projects, open-source, talks, writing elsewhere.

M1 (repo scaffold) can start without these; placeholders go into `src/data/links.ts` and are filled in when the URLs arrive.

---

## 10. What happens after you approve

1. You send the three URLs (or say "go ahead with placeholders").
2. I kick off M1 — repo scaffold — and open the first PR so you see the pattern.
3. Once M1 lands on `main`, I promote the locked parts of this document into `docs/ARCHITECTURE.md` and archive this file, so the repo stays single-source-of-truth.

---

*End of Phase 1 proposal.*
