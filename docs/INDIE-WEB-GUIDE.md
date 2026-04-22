# Indie-web guide

Four standalone pages — `/now`, `/uses`, `/colophon`, `/reading` —
plus a custom 404 and a site-wide command palette (⌘K). Everything
below lives under the M6 milestone.

## Standalone pages

Source: `src/content/pages/{now,uses,colophon,reading}.md`
Schema: `src/content/_schemas.ts` → `pageSchema`
Route: `src/pages/{name}.astro` wraps `PageLayout` and loads the entry.

### Frontmatter

```yaml
---
title: "Now"
description: "One-line summary used for <title>, meta description, OG."
updated: 2026-04-21
lang: en # optional, defaults to "en"
noindex: false # optional, hides the page from crawlers and Pagefind
---
```

### Editing

1. Edit the markdown under `src/content/pages/<name>.md`.
2. Bump `updated:` to today.
3. `pnpm dev` to preview. `pnpm test` to verify the schema still holds.
4. Commit. The page redeploys with the rest of the site.

### When to add a new page

A new standalone page is appropriate when the content is evergreen
and navigational (the site's answer to "about me", "what I use",
etc.). Date-ordered content belongs in a post collection; rotating
short updates belong on `/now`.

To add one:

1. Write the markdown under `src/content/pages/<slug>.md`.
2. Create `src/pages/<slug>.astro` as a thin route that calls
   `getEntry("pages", "<slug>")` and renders `<PageLayout>`.
3. Link it from `Footer.astro`'s indie-web nav and add a matching
   entry to `JUMP_ROUTES` in `src/lib/palette-index.ts`.
4. Cover it with a line in `tests/e2e/indie-web.spec.ts`.

## 404

`src/pages/404.astro` — a quiet apology, jump targets to the primary
sections, and a ⌘K nudge. Marked `noindex`.

- Astro emits `dist/404.html`.
- Cloudflare Pages serves it automatically for any unmatched path.
- Excluded from the sitemap (see `astro.config.mjs` → sitemap filter).
- Excluded from Pagefind (via `data-pagefind-ignore` on `<html>`
  whenever `seo.noindex` is set in `BaseLayout`).

## Command palette

`src/components/islands/CommandPalette.astro` — single-file vanilla
TypeScript island. Opens on:

- Click on the header trigger (`⌘K` visual affordance).
- `⌘K` / `Ctrl+K` anywhere on the page.
- `/` when the user isn't already typing in a field.

### Data sources

The palette's built-in index is computed at SSG time by
`src/lib/palette-index.ts` → `buildPaletteIndex()`. It aggregates:

| Section | Source                                                |
| ------- | ----------------------------------------------------- |
| Jump    | Static `JUMP_ROUTES` table in `palette-index.ts`      |
| Posts   | `getPublishablePosts()` (title + type + date + tags)  |
| Tags    | `collectTags()` (counted, sorted)                     |
| Series  | `getSeriesBundles()` (titles + post counts)           |
| Actions | Static `ACTIONS` table (theme, copy URL, feeds, repo) |

The full payload is inlined as `<script type="application/json">`
inside the component. Typical size: ~8 KB.

### Pagefind (full-text)

`pagefind` (installed as a devDependency) runs after `astro build`
via `pnpm build:search-index` and emits `dist/pagefind/`. The palette
dynamically imports `/pagefind/pagefind.js` the first time the user
types. Content matches merge into the Posts section (deduped by URL).
When Pagefind isn't available (dev, or a build that didn't run the
indexer), the static index still covers the whole palette.

The build script is idempotent: `pnpm build` runs `astro build`
followed by `pagefind --site dist`. CI calls `pnpm build`, so
deployed sites always carry the index. Locally, running `pnpm build`
once before `pnpm preview` is enough to exercise Pagefind end-to-end.

### Keyboard

| Key             | Action                           |
| --------------- | -------------------------------- |
| `⌘K` / `Ctrl+K` | Toggle open / close              |
| `/`             | Open (when not typing elsewhere) |
| `↑` / `↓`       | Move selection                   |
| `↵`             | Activate current item            |
| `Esc`           | Close                            |

### Actions

- **Toggle theme** — cycles between `light` and `dark` (persisted
  in `localStorage`). Dispatches a `theme-change` event for any
  other theme-aware island.
- **Copy page URL** — writes `window.location.href` to the clipboard.
- **RSS feed / JSON feed** — navigates to `/rss.xml`, `/feed.json`.
- **Send email** — opens a `mailto:` to `SITE.email`
  (`hi@koraydevecioglu.com`). Single source of truth for the
  address lives in `src/data/links.ts`.
- **View source on GitHub** — opens the repo in a new tab.

### Accessibility

- Renders in a native `<dialog>` opened with `showModal()`. The
  browser provides the focus trap, Escape-to-close, and the backdrop.
- `role=listbox` on the results list; each hit is a `role=option`
  with `aria-selected` tracked by the input's `aria-activedescendant`.
- Mouse hover moves the selection; clicks activate directly.
- Motion respects `prefers-reduced-motion`.
