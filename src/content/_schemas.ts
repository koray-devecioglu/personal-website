/**
 * Pure Zod schemas for content collections.
 *
 * Lives here (not in config.ts) so that vitest can import and apply the
 * schemas directly, without booting the Astro runtime. config.ts wraps
 * these with `defineCollection` + the appropriate loader.
 *
 * Shape follows docs/phase-1-architecture.md §4 verbatim. Every
 * readable type intersects with the core schema; per-type extensions
 * add fields without overriding.
 *
 * Cross-collection checks (e.g. "this post's `series` FK points to an
 * existing series; the series' `order[]` contains this post") are not
 * expressible as single-collection Zod refinements — they live in the
 * vitest harness instead (tests/content.test.ts).
 */

import { z } from "astro/zod";
import { ALLOWED_TAGS } from "./_tags";

// Astro's schema factory hands us `image()` when it runs the real
// loaders. In a pure-Zod context (tests, scripts/new-post) we don't
// have that — callers provide a stub that matches the same shape.
type ImageFactory = () => z.ZodTypeAny;

const tag = z.enum(ALLOWED_TAGS as unknown as [string, ...string[]]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().regex(slugPattern, {
  message:
    "Slugs must be kebab-case: lowercase letters, digits, and single hyphens only.",
});

const translation = z.object({
  lang: z.enum(["en", "tr"]),
  slug,
});

/**
 * The core schema shared by every readable post type (essay, tutorial,
 * TIL, note, project, bookmark).
 *
 * Returns a plain `ZodObject` so per-type schemas can `.extend()` it
 * without losing refinements. The cover/coverAlt cross-field refinement
 * is applied once, at the end, by `finalise()`.
 */
export function postCore(image: ImageFactory) {
  return z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(300),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    slug: slug.optional(),
    tags: z.array(tag).default([]),

    // `series` is validated here only as a non-empty slug string. Its
    // existence as an FK into the `series` collection is asserted in
    // the vitest harness, not the Zod layer.
    series: slug.optional(),

    draft: z.boolean().default(false),
    scheduled: z.coerce.date().optional(),

    cover: image().optional(),
    coverAlt: z.string().min(1).optional(),
    ogImage: z.string().optional(),
    canonical: z.string().url().optional(),

    lang: z.enum(["en", "tr"]).default("en"),
    translations: z.array(translation).optional(),

    // Per-post render toggles. Default-on for TOC; default-off for the
    // heavier dependencies (KaTeX, Mermaid) so they load only when a
    // post actually uses them.
    toc: z.boolean().default(true),
    math: z.boolean().default(false),
    diagram: z.boolean().default(false),
  });
}

/**
 * Applies cross-field refinements that every post type shares.
 * Call this *after* any per-type `.extend()` so the refinement covers
 * the final shape.
 */
export function finalise<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.refine(
    (data) => {
      const hasCover = Boolean((data as { cover?: unknown }).cover);
      const hasAlt = Boolean((data as { coverAlt?: unknown }).coverAlt);
      return !hasCover || hasAlt;
    },
    {
      message: "coverAlt is required when cover is set.",
      path: ["coverAlt"],
    },
  );
}

// ── Per-type extensions ────────────────────────────────────────────────

export function essaySchema(image: ImageFactory) {
  return finalise(postCore(image));
}

export function tutorialSchema(image: ImageFactory) {
  return finalise(
    postCore(image).extend({
      prereqs: z.array(z.string().min(1)).default([]),
      stack: z.array(z.string().min(1)).default([]),
    }),
  );
}

export function tilSchema(image: ImageFactory) {
  return finalise(
    postCore(image).extend({
      sourceLink: z.string().url().optional(),
    }),
  );
}

export function noteSchema(image: ImageFactory) {
  return finalise(postCore(image));
}

export function projectSchema(image: ImageFactory) {
  const projectLink = z.object({
    label: z.string().min(1),
    url: z.string().url(),
  });
  return finalise(
    postCore(image).extend({
      role: z.string().min(1),
      stack: z.array(z.string().min(1)).default([]),
      status: z.enum(["active", "shipped", "archived", "paused"]).default("active"),
      featured: z.boolean().default(false),
      links: z.array(projectLink).default([]),
    }),
  );
}

export function bookmarkSchema(image: ImageFactory) {
  return finalise(
    postCore(image).extend({
      url: z.string().url(),
      via: z.string().min(1).optional(),
    }),
  );
}

// ── Indie-web standalone pages ────────────────────────────────────────

/**
 * The small set of evergreen standalone pages (`/now`, `/uses`,
 * `/colophon`, `/reading`) share a minimal shape: a title, a one-line
 * description for SEO + social, and an `updated` date that surfaces on
 * the page itself. Markdown bodies render through the same prose
 * pipeline as posts, so authors get the same typography for free.
 */
export const pageSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  updated: z.coerce.date(),
  lang: z.enum(["en", "tr"]).default("en"),

  /** Whether to hide from feeds and sitemap-level surfacing. Always true
   * for these pages — they are navigational, not time-ordered content. */
  noindex: z.boolean().default(false),
});

export type PageFrontmatter = z.infer<typeof pageSchema>;

// ── Series ─────────────────────────────────────────────────────────────

/**
 * A `series` entry names the narrative and enumerates its posts in
 * reading order. The `order[]` array is the single source of truth for
 * sequencing — post files carry the series FK but not their position.
 */
export const seriesSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  order: z.array(slug).min(1),
});
