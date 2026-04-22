# Authoring guide — your first post, start to finish

The workflow-oriented companion to [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).
That document is the reference manual (every field, every type, every
rule); this one is the tutorial — sit down with it when you're about
to publish something and you'll have a post shipping inside 20 minutes.

## 0. Prerequisites (one-time)

```sh
pnpm install
pnpm test:e2e:install   # only needed once for the full CI replay
```

You'll author in your editor of choice, verify in the browser, and
commit + push to ship. The dev server has HMR, so a save re-renders
the page within ~50 ms.

## 1. Decide the type (10 seconds)

| If the post is…                                                | Use type   | Lives in                 |
| -------------------------------------------------------------- | ---------- | ------------------------ |
| Long-form writing with an argument or narrative                | `essay`    | `src/content/essays/`    |
| Step-by-step "how to do X" with explicit prereqs               | `tutorial` | `src/content/tutorials/` |
| A short "today I learned" — one idea, often with a source link | `til`      | `src/content/tils/`      |
| Loose thinking, work-in-progress, a scratchpad                 | `note`     | `src/content/notes/`     |
| A case study / retrospective of a shipped project              | `project`  | `src/content/projects/`  |
| A link with a sentence of commentary                           | `bookmark` | `src/content/bookmarks/` |

When in doubt, start as a `note`. Notes have the softest contract and
they can graduate into an `essay` by renaming the file and moving it
between folders — frontmatter aside, the content is the content.

## 2. Scaffold the file (1 command)

The `pnpm new-post` script writes a file with valid frontmatter so
you never fight the schema:

```sh
# A quick TIL
pnpm new-post --type til --title "Astro loader takes a base option" --tags astro,tooling

# An essay that wants MDX for a Callout / component
pnpm new-post --type essay --title "Sauce science" --tags food,bbq --mdx

# A bookmark
pnpm new-post --type bookmark --title "Zod" --url https://zod.dev --tags typescript,tooling

# An essay in a series
pnpm new-post --type essay --title "Part two" --series building-this-site --mdx

# A draft you're not ready to show yet
pnpm new-post --type essay --title "Half-baked idea" --draft
```

The script:

- Picks the right folder based on `--type`.
- Derives the slug from the title (kebab-case) unless you pass
  `--slug`.
- Fills the frontmatter with valid, schema-compliant placeholders.
- Validates its own output against the Zod schema before writing.
- Exits non-zero on any bad input (unknown tag, duplicate slug,
  missing `--url` on a bookmark, …).

Run `pnpm new-post --help` for the full flag list, or see the
[content guide](CONTENT-GUIDE.md#pnpm-new-post) for the table.

## 3. Write

Open the file the scaffolder created — `src/content/<type>/<slug>.md`
(or `.mdx`). You'll see frontmatter and a placeholder body:

```yaml
---
title: "Astro loader takes a base option"
description: "TODO: write a 1-sentence dek for OG + search preview."
date: 2026-04-22
tags: [astro, tooling]
sourceLink: # optional for TILs
---
TODO: write the body.
```

Replace the `TODO`s. The only non-obvious moves:

- **`description`** is the OG / Twitter / search-preview blurb. Keep
  it distinct from the title — don't rephrase the title here. One
  punchy sentence, ≤300 chars.
- **`tags`** must be in the controlled vocabulary
  ([`src/content/_tags.ts`](../src/content/_tags.ts)). If you need a
  tag that isn't listed, add it in the same PR as the first post that
  uses it — the build will tell you.
- **`updated`** — leave it out on a fresh post. Add it later if you
  revise materially.

Start the dev server and watch it render live:

```sh
pnpm dev
# open http://localhost:4321/posts/<slug>
```

The post automatically appears on:

- The home page (latest-posts block).
- `/posts` — unified stream, newest first.
- `/tags/<tag>` for each of its tags.
- `/series/<slug>` if it's attached to one.
- `/rss.xml` and `/feed.json`.
- The ⌘K command palette (reopen it — the index is built on page
  load).

## 4. Polish prose

The site uses a serif reading column (Fraunces) with the prose
stylesheet in [`src/styles/prose.css`](../src/styles/prose.css). A few
patterns worth knowing:

### Code

Fenced blocks render through Shiki — zero client-side JS. The code
language tag matters for highlighting:

````md
```ts
const double = (n: number): number => n * 2;
```
````

### Callouts (MDX only)

The `Callout` component is the recommended way to flag a tip,
warning, or aside. Requires an `.mdx` file:

```mdx
import Callout from "../../components/ui/Callout.astro";

<Callout tone="tip" title="Why this matters">
  One-sentence pitch.
</Callout>
```

`tone` accepts `tip`, `note`, `warning`. The import path is relative
to the MDX file — from `src/content/essays/foo.mdx` that's
`../../components/ui/Callout.astro`.

### Footnotes, smartypants, GFM

All standard. Footnotes via `[^1]`, smart quotes via smartypants
(automatic), tables + task lists + strikethrough via GFM (automatic).

### Images

Drop the image into `src/content/<type>/<slug>/cover.jpg` (or any
name) and reference it via frontmatter:

```yaml
cover: ./cover.jpg
coverAlt: "A short, meaningful alt text — required whenever cover is set."
```

Astro optimises it at build time. **`coverAlt` is not optional** when
`cover` is set — the schema rejects covers without alt text. This is
deliberate; good accessibility is not a choice we leave to "later".

### Math (KaTeX) and diagrams (Mermaid)

Both are opt-in per post to keep baseline bundles small:

````yaml
math: true # enables KaTeX rendering for $…$ and $$…$$
diagram: true # enables Mermaid for ```mermaid code blocks
````

## 5. Local verify (30 seconds)

Before you commit, run the verify gate:

```sh
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

The one to watch is `pnpm test`. The Vitest `content.test.ts` spec
walks every post in every collection and:

- Validates the frontmatter against the Zod schema.
- Checks the series FK — every post's `series` points at an existing
  series, and every slug in a series' `order[]` points at an
  existing post.
- Asserts the tag vocabulary hasn't drifted.

If the build is green locally, the post will ship.

## 6. Commit + ship

```sh
git checkout -b post/<slug>      # or just work on a shared `drafts` branch
git add src/content/<type>/<slug>.md
git commit -m "content: add \"Your title here\""
git push -u origin HEAD
gh pr create --fill              # or open a PR in the GitHub UI
```

CI runs four jobs in parallel (format / lint / typecheck / tests /
build, Playwright + axe-core, Lighthouse budgets, lychee link check).
If all four are green, merge to `main`; Cloudflare Pages redeploys
automatically within a minute.

## 7. Drafts and scheduling

Two escape hatches when a post isn't ready:

```yaml
draft: true
```

`draft: true` posts are visible in `pnpm dev` but **completely absent**
from production builds — not in the sitemap, not in feeds, not in the
⌘K palette. Ship by removing the flag.

```yaml
scheduled: 2026-05-01
```

Same behaviour as `draft` but it flips itself off on the given date.
Useful for time-sensitive writing (conference coincidence, coordinated
launches).

## 8. Editing published posts

Small fixes (typos, broken links) — edit and push, no ceremony.

Material revisions — bump the `updated` field so readers see the
post is fresh:

```yaml
date: 2026-04-01
updated: 2026-06-15
```

The post layout displays both dates and feeds carry the update. Don't
backdate substantive revisions by editing `date` — the archive should
be honest about when the first version shipped.

## 9. Taking a post down

Rare, but occasionally needed. Three options, in increasing severity:

| Goal                                 | How                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Keep the URL, return a `noindex`     | Add `noindex: true` to frontmatter. (Stops fresh indexing, doesn't unindex.)      |
| Hide from the site but keep the file | Flip `draft: true`. The URL 404s in prod.                                         |
| Remove entirely                      | Delete the file. Add a redirect to an appropriate replacement in your edge layer. |

Deletion is a sharp edge — external links and RSS readers will
break. Prefer `draft: true` unless you're sure.

## Anti-patterns — things to not do

- **Don't add content in `src/pages/`.** That directory is for
  routes, not markdown. The site's routing is file-based but content
  flows through collections. If you find yourself wanting a new
  standalone page (`/now`-style), see the
  [indie-web guide](INDIE-WEB-GUIDE.md#when-to-add-a-new-page).
- **Don't invent new tags inline.** The schema rejects them. Add to
  [`src/content/_tags.ts`](../src/content/_tags.ts) in the same PR.
- **Don't skip `description`.** It's not optional. Missing
  descriptions tank the SEO Lighthouse score and produce ugly social
  previews.
- **Don't embed third-party scripts.** Cookies and trackers are a
  hard `no` on this site — they'd fail CI (axe-core flags consent
  problems) and more importantly, they violate the "no cookies,
  anywhere" rule in [`CLAUDE.md`](../CLAUDE.md).
- **Don't commit generated output in a content PR.** The CV PDF is
  the one exception, and only for CV PRs (`pnpm build:cv` is
  documented in [`CV-GUIDE.md`](CV-GUIDE.md)).

## Cheat sheet

```sh
# New post with tags
pnpm new-post --type essay --title "Title" --tags writing,site-news

# Verify locally
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Ship
git checkout -b post/my-slug
git add src/content/essays/my-slug.md
git commit -m "content: add \"Title\""
git push -u origin HEAD
gh pr create --fill
```

That's the whole loop. A typical post — from `pnpm new-post` to a
green PR — is 15–30 minutes of tool time plus however long the
writing itself takes.
