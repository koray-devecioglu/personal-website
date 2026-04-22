# Content guide

_Authored for M3. Updated as new types and fields land._

This is the **reference manual** for writing on the site. It covers
the available post types, what each frontmatter field does, how tags
are governed, and the one-command scaffolder.

> Looking for a "sit down and write my first post" walkthrough?
> See [**`AUTHORING.md`**](./AUTHORING.md) — the workflow-oriented
> companion to this document. Use this one as a lookup; use that one
> as a tutorial.

For the "why" behind these decisions, see
[`docs/phase-1-architecture.md`](./phase-1-architecture.md) §4.

## TL;DR

```bash
pnpm new-post --type essay --title "Welcome to the refit"
pnpm dev
```

Open the generated file in `src/content/<type>/`, replace the
placeholder body, and push. The Zod schema validates on every boot —
if you break a contract you'll know immediately.

## Post types

There are six readable types plus one meta type. Every readable type
shares a core schema (title, description, date, tags, cover, …) and
adds its own fields on top.

| Folder                   | Type       | Extra fields beyond core                           | Used for                                       |
| ------------------------ | ---------- | -------------------------------------------------- | ---------------------------------------------- |
| `src/content/essays/`    | `essay`    | —                                                  | Long-form writing, opinion, narrative.         |
| `src/content/tutorials/` | `tutorial` | `prereqs[]`, `stack[]`                             | Step-by-step, how-to, with explicit prereqs.   |
| `src/content/tils/`      | `til`      | `sourceLink?`                                      | "Today I learned" — small, dated, linkable.    |
| `src/content/notes/`     | `note`     | —                                                  | Loose thinking, work-in-progress, scratchpads. |
| `src/content/projects/`  | `project`  | `role`, `stack[]`, `status`, `featured`, `links[]` | Project write-ups, case studies.               |
| `src/content/bookmarks/` | `bookmark` | `url`, `via?`                                      | Linkroll — URL + a sentence of commentary.     |
| `src/content/series/`    | `series`   | `title`, `summary`, `order[]` (no core)            | Metadata describing a sequence of posts.       |

## The core schema

Every readable post validates against this shape. Fields are optional
unless noted.

| Field          | Type                | Notes                                                             |
| -------------- | ------------------- | ----------------------------------------------------------------- |
| `title`        | `string` (required) | ≤ 120 chars.                                                      |
| `description`  | `string` (required) | ≤ 300 chars. Used as the dek and the OG description.              |
| `date`         | `date` (required)   | Authored-at date. ISO format (`2026-04-21`) is simplest.          |
| `updated`      | `date`              | Use when a post changes materially after publish.                 |
| `slug`         | `string`            | Overrides the filename. Kebab-case.                               |
| `tags`         | `Tag[]`             | Must be in the allow-list (`src/content/_tags.ts`). Default `[]`. |
| `series`       | `string` (slug)     | Attach to a series. The series' `order[]` must list this post.    |
| `draft`        | `boolean`           | Hidden in production, visible in dev. Default `false`.            |
| `scheduled`    | `date`              | Hidden in production until this date passes.                      |
| `cover`        | `image`             | Cover image asset. Optimized by Astro at build time.              |
| `coverAlt`     | `string`            | **Required when `cover` is set.** No exceptions.                  |
| `ogImage`      | `string`            | OG override. If absent, generated at build time.                  |
| `canonical`    | `url`               | Set when the post is a copy of something published elsewhere.     |
| `lang`         | `"en" \| "tr"`      | Default `"en"`.                                                   |
| `translations` | `{ lang, slug }[]`  | Sibling translations.                                             |
| `toc`          | `boolean`           | Render a TOC. Default `true`.                                     |
| `math`         | `boolean`           | Opt-in KaTeX. Default `false`.                                    |
| `diagram`      | `boolean`           | Opt-in Mermaid. Default `false`.                                  |

## Tags

Tags live in a controlled vocabulary at
[`src/content/_tags.ts`](../src/content/_tags.ts). The schema rejects
anything outside the list — this is deliberate. It costs a one-line PR
to add a tag, and it's the friction that prevents four spellings of
"typescript" from accumulating over five years.

The list is broad on purpose: engineering, writing craft, food, BBQ,
travel, running, books, and site-meta. If you need a category that
truly isn't listed, add it in the same PR that introduces the first
post using it.

Rules:

- kebab-case, lowercase, no acronym expansion (`bbq`, not `barbecue`)
- singular nouns unless the plural is idiomatic
- no tags starting with digits or hyphens

## Drafts and scheduling

```yaml
draft: true
```

Draft posts are visible in `pnpm dev` and completely absent from
production builds — including the sitemap, RSS, and all index pages.
Ship when you remove the flag.

```yaml
scheduled: 2026-05-01
```

Same behavior as `draft`, but flips itself off automatically on the
given date. Useful for time-sensitive writing or coordinated releases.

## Series

A series is a sequenced set of posts. Posts name their series; the
series file owns the ordering. This means there's one source of truth
for "what comes next".

```yaml
# src/content/series/building-this-site.md
---
title: "Building this site"
summary: "A running chronicle of the rebuild."
order:
  - welcome
  - how-m2-landed
---
```

```yaml
# src/content/essays/welcome.md
---
title: "Welcome"
series: building-this-site
---
```

The test harness (`tests/content.test.ts`) asserts both directions:
every post's series FK resolves, and every slug in an `order[]`
resolves to a real post.

## `pnpm new-post`

The scaffolder writes a file with valid frontmatter so you spend zero
time fighting the schema.

```bash
pnpm new-post --type <type> --title "<title>" [options]
```

| Flag            | Notes                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| `--type`        | Required. `essay` \| `tutorial` \| `til` \| `note` \| `project` \| `bookmark`. |
| `--title`       | Required. Human title; also used to derive the slug unless `--slug`.           |
| `--slug`        | Optional. Kebab-case.                                                          |
| `--description` | Optional. Defaults to a TODO placeholder.                                      |
| `--tags`        | Optional. Comma-separated; each must be in the allow-list.                     |
| `--series`      | Optional. Existing series slug.                                                |
| `--url`         | Required for `--type bookmark`.                                                |
| `--mdx`         | Use `.mdx` instead of `.md`. Needed for component imports.                     |
| `--draft`       | Start in draft state.                                                          |
| `--help`        | Print usage.                                                                   |

Examples:

```bash
pnpm new-post --type til --title "Astro loader takes a base option" \
  --tags astro,tooling

pnpm new-post --type essay --title "Sauce science" \
  --tags food,bbq --mdx

pnpm new-post --type bookmark --title "Zod" \
  --url https://zod.dev --tags typescript,tooling
```

Any violation (unknown tag, invalid slug, duplicate file) exits
non-zero with a clear message. The script validates its own output
against the Zod schema before writing — if CI is green locally, the
scaffolder is producing shippable files.

## Writing `.mdx` posts

Use `.mdx` only when the post needs a component — a `Callout`, an
interactive chart, a custom diagram. Plain prose should stay in `.md`
for portability and render speed.

```mdx
---
title: "…"
description: "…"
date: 2026-04-19
---

import Callout from "../../components/ui/Callout.astro";

<Callout tone="tip" title="Why this matters">
  One-sentence pitch.
</Callout>
```

Imports are relative to the MDX file. `src/content/essays/foo.mdx`
reaches `src/components/ui/Callout.astro` as `../../components/ui/Callout.astro`.

## Local verification

Before opening a PR with new content, run:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

`pnpm test` is the one that'll yell if a post breaks the schema or a
series FK dangles.
