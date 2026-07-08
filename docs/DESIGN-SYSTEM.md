# Design system

> The authoritative catalog of tokens, primitives, and layout shells that
> land in M2. Additions through M4–M6 extend this document — they do not
> supersede it.

## Principles

- **Content sets the grid; chrome does not.** Page widths are measured in
  reading length, not container-query vibes. Header/footer/nav are quiet.
- **Humanist editorial, not engineer cosplay.** Serif body. Monospace is
  structural seasoning — dates, type badges, kbd hints, code — never
  decorative costume.
- **Dark mode is not an inverted light mode.** The dark palette is hand-
  picked, not auto-inverted.
- **Every motion has a job.** 120ms / 200ms / 400ms, `ease-out` default.
  All motion is guarded by `prefers-reduced-motion: reduce`.
- **No cookies, anywhere.** The design system ships zero-tracking by
  construction.

## Tokens

All tokens live in [`src/styles/tokens.css`](../src/styles/tokens.css).
Changing typography, accent, spacing, or motion should happen there and
nowhere else. Tailwind v4 consumes the tokens via the `@theme` block in
[`src/styles/global.css`](../src/styles/global.css).

### Typography

Three families, self-hosted WOFF2, variable-weight, `font-display: swap`:

| Token          | Family                | Use                                     |
| -------------- | --------------------- | --------------------------------------- |
| `--font-serif` | **Fraunces Variable** | Display + long-form body                |
| `--font-sans`  | **Inter Variable**    | UI chrome (nav, buttons, form controls) |
| `--font-mono`  | **JetBrains Mono**    | Code, dates, type badges, kbd hints     |

Font files live in [`public/fonts/`](../public/fonts). Subsetted to
`latin` + `latin-ext` (Turkish-ready). The latin cut of Fraunces is
preloaded in `<head>`; other cuts load on demand.

Type scale is fluid via `clamp()`:

```
--text-xs .. --text-display
```

### Color

OKLCH throughout. Neutrals are warm (paper in light mode, charcoal in
dark). One accent hue: **warm ochre / amber**.

| Token             | Light                     | Dark                    |
| ----------------- | ------------------------- | ----------------------- |
| `--bg`            | warm near-white           | charcoal                |
| `--fg`            | near-black, slight warmth | soft off-white          |
| `--accent`        | ochre                     | lighter amber           |
| `--accent-strong` | deep ochre                | bright amber            |
| `--accent-on`     | readable on accent fill   | readable on accent fill |
| `--focus-ring`    | bold ochre ring           | bold amber ring         |
| `--scrim`         | near-black 40% alpha      | near-black 55% alpha    |

### Spacing, radii, motion

- Spacing scale: `--space-1` (4px) through `--space-24` (96px).
- Radii: `--radius-sm` / `--radius-md` / `--radius-lg`.
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg` (hover lifts).
- Motion: `--motion-micro` (120ms) / `--motion-standard` (200ms) /
  `--motion-page` (400ms) / `--motion-reveal` (550ms, entrance
  choreography). Easings: `--ease-out` (default), `--ease-in-out`,
  `--ease-spring` (shallow overshoot for tactile micro-lifts — settle,
  don't bounce). All durations zero out under
  `prefers-reduced-motion: reduce`.

### Content widths

- `--content-narrow` (`68ch`) — reading column.
- `--content-wide` (`78rem`) — index grids, CV timeline, header/footer.

## Primitives

Every component lives under `src/components/ui/` or
`src/components/layout/`. Each owns its own scoped `<style>`; global CSS
stays small.

### Button

`src/components/ui/Button.astro`. Polymorphic: `href` → `<a>`, otherwise
`<button>`. External links automatically get `rel="noopener noreferrer"`.

| Prop       | Values                            | Default     |
| ---------- | --------------------------------- | ----------- |
| `variant`  | `primary` · `secondary` · `ghost` | `secondary` |
| `size`     | `sm` · `md` · `lg`                | `md`        |
| `disabled` | `boolean`                         | `false`     |

```astro
<Button variant="primary" href="/posts">Read the blog</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

### Tag

`src/components/ui/Tag.astro`. Small mono chip, always prefixed with `#`
(sigil rendered by the component, callers pass raw slugs).

| Prop      | Values              | Default |
| --------- | ------------------- | ------- |
| `variant` | `solid` · `outline` | `solid` |
| `href`    | `string?`           | —       |

### Kbd

`src/components/ui/Kbd.astro`. Semantically a `<kbd>`. Compose for chords:

```astro
<Kbd>⌘</Kbd><Kbd>K</Kbd>
```

### ThemeToggle

`src/components/islands/ThemeToggle.astro`. Three-state cycle:
`system → light → dark → system`. Persists to `localStorage` under the
`theme` key:

- `"light"` / `"dark"` — explicit override, applied to `<html data-theme>`
  by the inline script in `BaseLayout` before first paint.
- `"system"` — key cleared from storage, `data-theme` absent, CSS falls
  through to `prefers-color-scheme`.

The toggle uses `document.startViewTransition` for a crossfade on
browsers that support it and when the user hasn't opted out of motion.
Everywhere else the swap is instant.

## Motion layer (Phase-2 experience refresh)

See `docs/phase-2-experience-refresh.md` for the full rationale. The
choreography rides three mechanisms, all dependency-free:

### Scroll reveal — `[data-reveal]`

Put `data-reveal` on any element and it fades/rises in when it enters
the viewport (or on load, if it starts there). Styles live in
`src/styles/motion.css`; the observer lives in
`src/components/islands/ScrollReveal.astro` (included once by
`BaseLayout`, re-arms on `astro:page-load`).

Safety model — the hidden state is double-gated, so content can only be
hidden for users who will definitely see it revealed:

- `html[data-js]` (set pre-paint by `BaseLayout`) — no JS, nothing hides.
- `prefers-reduced-motion: no-preference` — reduced motion, nothing hides.
- `@media print` force-reveals everything — paper never scrolls.

Stagger is batch-relative: elements revealed by the same observer
callback cascade in DOM order; an element scrolled into view alone
reveals with zero delay.

### View-transition morphs

`PostCard` and `PostHeader` share a per-post `transition:name`
(`post-title-<collection>-<slug>`), so list → article navigation morphs
the title into place. Non-supporting browsers get the ClientRouter
crossfade.

### Micro-interactions

- Header: sticky translucent glass (`color-mix` + `backdrop-filter`);
  nav underline draws in from the left on hover, stays on the active item.
- Button: 1px lift + `--shadow-md` on primary hover, 1px press on
  `:active`, `--ease-spring`.
- Cards (home): 2px lift, accent top bar scales in, shadow deepens.
- PostCard: mono type badge; hover arrow slides in after the title.
- Hero title: Fraunces `opsz` 48 → 144 "breathing" hover
  (reduced-motion users get no hover state at all).

## Layout shell

- `src/components/layout/Header.astro` — wordmark (serif, links home) +
  theme toggle. **Nav is intentionally empty at M2**; surfaces are added
  in M4 (Writing) / M5 (CV) / M6 (About, colophon, …).
- `src/components/layout/Footer.astro` — copyright + license line,
  social icons (GitHub, LinkedIn, Instagram — last two resolve once
  Koray hands over real URLs), mailto, colophon stub.
- `src/layouts/BaseLayout.astro` wires both into every page.

## Sandbox

`/sandbox` renders every token, primitive, and layout piece landed in
M2 on a single URL. Excluded from the sitemap and carries
`<meta name="robots" content="noindex, follow">` — reachable by direct
URL for design review, invisible to crawlers.

## Non-goals for M2

- Content schemas (lands in M3).
- Post layout, prose stylesheet, reading progress, TOC (M4).
- Command palette, Pagefind search (M6).
- Lighthouse CI, axe-core, lychee (M7).
- Per-post OG image generation (M4).
