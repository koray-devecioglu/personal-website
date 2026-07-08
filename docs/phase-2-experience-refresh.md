# Phase 2 — Experience refresh: "Living Editorial"

> Proposal + implementation record for the post-launch redesign pass.
> Written the way `docs/phase-1-architecture.md` was: audit first,
> directions weighed in the open, one recommendation defended, then a
> phased plan. Koray asked for a site that feels "modern, interactive,
> playful, polished, and fun to explore" without losing the professional
> register — and explicitly _not_ random animation everywhere.

## 1. Audit — where the site actually stands

The good news first: this is not an old static portfolio. It launched
2026-04-22 on a locked, deliberate design system. The audit therefore
splits into _what is genuinely strong_ (don't touch) and _where the
"fun to explore" request has room to land_ (do touch).

### Strong — keep, protect

- **Architecture.** Astro 5 static output, TS strict, content
  collections with Zod, one-source-of-truth tokens in OKLCH, Tailwind v4
  bridged via `@theme`. Component units are small and documented.
  There is essentially no cleanup debt; Phase 1 of the classic
  "audit and cleanup" pass reduces to a handful of nits.
- **Performance posture.** ~0 KB of framework JS on most pages. Two
  islands (theme toggle, ⌘K palette) in vanilla TS. Self-hosted,
  subsetted variable fonts with a preloaded critical cut. LHCI, axe,
  and lychee gates in CI.
- **Accessibility.** Focus rings never removed, AA-checked contrast
  documented inline in `tokens.css`, `prefers-reduced-motion` zeroes the
  motion tokens globally, skip link, `aria-current` nav.
- **Foundations for motion already exist but are underused**: motion
  duration/easing tokens, Astro's `ClientRouter` (view transitions)
  already installed in `BaseLayout`.

### Gaps — where "static portfolio" feeling creeps in

1. **The home page is spare to a fault.** Text hero + a flat list of
   posts. It doesn't say who Koray is beyond one sentence, doesn't show
   the career, the project, the series, or the "code _and_ BBQ" range
   that the whole design brief promises. First-time visitors get no
   reason to explore.
2. **Nothing moves.** The motion tokens exist but the only transitions
   are color fades on hover. No entrance choreography, no scroll
   response, no shared-element continuity between the post list and the
   post page. View transitions are installed but used only as a default
   crossfade.
3. **Cards don't invite.** `PostCard` is an editorial row (good
   instinct) but hover feedback is a single color change and the post
   _type_ (essay / TIL / tutorial) — a real navigational signal — isn't
   visible in lists.
4. **Header is static.** Non-sticky, so navigation disappears on long
   essays; active state is a plain border.
5. **The CV reads as a Word document.** Correct, printable, but the
   screen version has zero visual hierarchy beyond headings — a decade
   of career with no timeline shape to it.
6. **No structured data.** Solid meta/OG tags, but no JSON-LD `Person`
   / `WebSite` / `BlogPosting`, which is a cheap, real SEO gap.
7. **Mobile nav wraps** under the wordmark — functional but the least
   designed corner of the chrome.

### Dependency verdict (checked before proposing anything)

- No React/Vue/Svelte anywhere → **Framer Motion / React Spring are
  non-starters** (they'd drag a runtime in for chrome-level effects).
- **GSAP / Lenis / Three.js: rejected.** The effects this brief needs —
  entrance reveals, stagger, scroll-triggered visibility, shared-element
  page transitions, hover micro-interactions — are all achievable with
  CSS transitions + one ~50-line IntersectionObserver island + Astro's
  built-in view transitions. Adding 30–90 KB of animation runtime to a
  site whose brand is "fast and hand-set" would be paying for a costume.
- **Zero new runtime dependencies** in this whole phase. That is a
  feature of the plan, not an accident.

## 2. Five creative directions

| #   | Direction                                                                                            | Feeling it creates                   | Pros                               | Cons                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Minimal premium portfolio** — sharpen what exists, add almost no motion                            | Quiet luxury; a beautifully set book | Zero risk; cheap; ages well        | Doesn't answer the brief — still reads static; personality stays hidden                                                       |
| 2   | **Playful interactive developer portfolio** — mascots, drag toys, konami codes, springy everything   | Dribbble-demo energy; memorable      | Very "fun to explore"; shows craft | High risk of childish; fights the humanist-editorial brand and the hiring-manager audience; heavy JS                          |
| 3   | **Futuristic / tech-inspired** — dark-first, glassmorphism, glows, terminal motifs                   | Cyberpunk product-launch             | Instantly "modern" to some eyes    | Exactly what CLAUDE.md forbids ("terminal cosplay", generic AI-template vibe); alienates the food/travel half of the audience |
| 4   | **Story-driven personal homepage** — long scrolling narrative about Koray, chapters, big photography | Editorial feature piece; intimate    | Best storytelling; unique          | Needs photography and long copy that don't exist yet; heavy content dependency; hides the blog                                |
| 5   | **Motion-heavy but elegant** — scroll-jacked scenes, parallax everywhere, Lenis smooth-scroll        | Awwwards submission                  | Impressive on first visit          | Wrong for a _reading_ site; costs CWV budget; motion for its own sake violates "every motion has a job"                       |

### Recommendation: **"Living Editorial"** — direction 1's discipline + direction 2's warmth + direction 4's storytelling, in that priority order

The brand ("humanist editorial with engineering detailing") is right and
launched three months ago; throwing it away would be a redesign of a
redesign. What the site is missing is not a new identity — it's
**liveliness and narrative**. So: keep the typography, palette, and
editorial voice untouched, and add three layers on top:

1. **A choreography layer** — entrance reveals with stagger,
   shared-element view transitions (post title morphs from list to
   article), a sticky glass header. Every motion tied to an event the
   user caused: arriving, scrolling, hovering, navigating.
2. **A storytelling layer on the home page** — who Koray is _now_
   (pulled live from the CV data), what the site covers (the code/BBQ
   range as three editorial doors), the career in one glance (mini
   timeline teaser feeding /cv), the series as bodies of work.
3. **A detailing layer** — type badges on cards, an optical-size
   "breathing" hover on the display serif (Fraunces' opsz axis is
   already in the font files — a typographic toy, which is exactly
   on-brand playfulness), tactile buttons, a timeline-shaped CV.

Feeling created: _a well-set magazine that notices you're there._
Professional at first glance, rewarding on the second.

## 3. Phased plan

### Phase 1 — Audit & cleanup ✅ (this document)

Codebase audited file-by-file; findings above. Cleanup actions folded
into later phases because the debt list is short: unused `@fontsource`
dev-deps stay (they're the documented source of the committed woff2
files), no dead code found worth a standalone pass.
**Test:** n/a — no behavior change.

### Phase 2 — Design-system & motion foundation

- **What:** New tokens (`--motion-reveal`, `--ease-spring`,
  `--shadow-lg`); new `src/styles/motion.css` with a `[data-reveal]` /
  `[data-reveal-stagger]` primitive; `data-js` flag set before first
  paint; a `ScrollReveal` island (IntersectionObserver, ~50 lines,
  re-arms on `astro:page-load`); sticky translucent blurred header with
  an animated underline on nav links; button press/lift
  micro-interactions.
- **Why:** every later phase composes these primitives instead of
  inventing per-page animation.
- **Files:** `tokens.css`, `global.css`, `motion.css` (new),
  `components/islands/ScrollReveal.astro` (new), `BaseLayout.astro`,
  `Header.astro`, `ui/Button.astro`.
- **Risks:** hidden-content trap (reveal styles must only apply when JS
  is present _and_ motion is allowed — no-JS users and reduced-motion
  users must see everything immediately); sticky header vs. anchor
  scroll (needs `scroll-padding-top`).
- **Test:** toggle `prefers-reduced-motion` and JS-off; axe pass;
  keyboard focus unaffected.

### Phase 3 — Home page: layout, structure, storytelling

- **What:** Rebuilt `index.astro`: choreographed hero (staggered
  entrance, opsz hover on the display line, subtle static amber wash);
  a "currently" strip generated from `resume.json` (role, company,
  city — one source of truth, no copy drift); "what you'll find here"
  as three editorial doors (engineering / fire & food / away from the
  desk) with linked tag chips; latest-writing list (staggered); series
  showcase cards; mini career-timeline teaser (four stops from
  `resume.json`) linking to /cv. New strings via `lib/i18n.ts`.
- **Why:** this is where "static portfolio" feeling dies — the page
  gains narrative and reasons to click deeper, all from data that
  already exists.
- **Files:** `pages/index.astro`, `lib/i18n.ts`, possibly a small
  `components/home/` folder.
- **Risks:** home page weight (mitigation: still zero JS beyond the
  shared island; pure HTML/CSS sections); tone drift (mitigation: all
  copy in the site's existing voice, short).
- **Test:** `pnpm test` (i18n snapshot-free, schema tests unaffected),
  visual pass at 360/768/1280 px, LCP element still the hero title.

### Phase 4 — Interaction & continuity layer

- **What:** Shared-element view transitions (`transition:name` on post
  titles: list card → article header morph); `PostCard` gains a mono
  type badge, meta polish, and a quiet hover lift of the whole entry;
  reveal stagger on /posts, /tags, /series indexes.
- **Why:** navigation stops feeling like page swaps and starts feeling
  like one continuous surface — the single highest-leverage "modern
  feel" trick available, and it's free (already shipped in Astro).
- **Files:** `PostCard.astro`, `PostHeader.astro`, `posts/index.astro`,
  `tags/[slug].astro`, `series/[slug].astro`, `PostLayout.astro`.
- **Risks:** duplicate `transition:name` (must be slug-unique);
  Safari/Firefox fall back to crossfade — acceptable degradation.
- **Test:** e2e blog spec still green; manual nav in Chromium.

### Phase 5 — Project & experience surfaces

- **What:** `/cv` screen layout becomes a visual timeline — vertical
  rail, node per role, accent node + "present" pulse-free highlight on
  the current role — done **entirely in `cv.css`** so `/cv/print` and
  the PDF pipeline are untouched. Skills section becomes chip clusters.
- **Why:** a decade of career gets a shape; the page becomes the
  portfolio piece it claims to be. Print stays a Word-clean document.
- **Files:** `cv.css` only (plus one structural class in
  `CVContent.astro` if needed — verified harmless for print).
- **Risks:** print regression (mitigation: no markup-dependent print
  selectors change; rebuild-diff `public/cv.pdf` locally only if markup
  moves).
- **Test:** `pnpm test:e2e` cv spec, visual check of /cv/print.

### Phase 6 — Responsiveness, accessibility, SEO, performance

- **What:** JSON-LD (`WebSite` + `Person` on home, `Person` on /cv,
  `BlogPosting` on posts); reduced-motion re-audit of everything added;
  contrast check on new surfaces; mobile pass on the new home sections
  and sticky header; `scroll-padding-top` for anchor links under the
  sticky header.
- **Why:** the refresh must not spend the site's hard-won budgets;
  structured data is the cheapest real SEO win available.
- **Files:** `lib/seo.ts` or per-page `<script type="application/ld+json">`,
  `BaseLayout.astro`, touched styles.
- **Test:** `pnpm lhci` budgets, `pnpm test:a11y`, Rich Results test on
  the built HTML.

### Phase 7 — Final polish & verification

- **What:** full gate run (`typecheck`, `lint`, `format:check`, `test`,
  `build`, e2e where the environment allows), doc sync
  (`DESIGN-SYSTEM.md` motion section, `CLAUDE.md` milestone table),
  commit trail per phase.
- **Test:** the gates _are_ the test.

## 4. Quick wins vs. bigger bets

**Quick wins (hours):** sticky glass header · nav underline animation ·
post title view-transition morph · type badges on cards · JSON-LD ·
button micro-interactions · reveal-on-load hero.

**Bigger bets (this phase's real work):** home-page storytelling
sections · CV timeline · reveal system as a reusable primitive.

**Deferred (needs Koray or a later phase):** real photography and an
"about" narrative (direction 4 fully realized needs assets that don't
exist); real `/now`, `/uses`, `/reading` copy (still placeholder);
webmentions/uptime/newsletter (M9 remainder); first cover images.

## 5. What deliberately does not change

Typography, palette, accent, voice, information architecture, URL
structure, print output, the no-cookie stance, the zero-framework-JS
stance, and every CI budget. This phase adds choreography and
narrative, not a new identity.
