import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { z } from "astro/zod";

import { SITE, SOCIAL } from "../src/data/links";
import { ALLOWED_TAGS } from "../src/content/_tags";
import {
  bookmarkSchema,
  essaySchema,
  noteSchema,
  pageSchema,
  projectSchema,
  seriesSchema,
  tilSchema,
  tutorialSchema,
} from "../src/content/_schemas";
import { readingTime } from "../src/lib/reading-time";

/**
 * Content-engine tests.
 *
 * These validate the actual files on disk against the same Zod schemas
 * the Astro runtime uses. Runs in plain Vitest — no astro:content, no
 * image loader, no Content Layer — so failures are deterministic and
 * fast. In exchange, the `image()` validator is stubbed to `z.any()`;
 * cover assets are re-checked by `astro build` in CI.
 */

// ── Setup ──────────────────────────────────────────────────────────────

const ROOT = resolve(__dirname, "..");
const CONTENT_ROOT = join(ROOT, "src/content");

const imageStub = () => z.any();

const TYPES = {
  essays: essaySchema(imageStub),
  tutorials: tutorialSchema(imageStub),
  tils: tilSchema(imageStub),
  notes: noteSchema(imageStub),
  projects: projectSchema(imageStub),
  bookmarks: bookmarkSchema(imageStub),
} as const;

type TypeKey = keyof typeof TYPES;

interface LoadedPost {
  type: TypeKey;
  file: string;
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

interface LoadedSeries {
  file: string;
  slug: string;
  data: { title: string; summary: string; order: string[] };
}

function loadPosts(): LoadedPost[] {
  const out: LoadedPost[] = [];
  for (const type of Object.keys(TYPES) as TypeKey[]) {
    const dir = join(CONTENT_ROOT, type);
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!/\.(md|mdx)$/.test(entry.name)) continue;
      const file = join(dir, entry.name);
      const parsed = matter(readFileSync(file, "utf8"));
      out.push({
        type,
        file,
        slug: entry.name.replace(/\.(md|mdx)$/, ""),
        data: parsed.data,
        body: parsed.content,
      });
    }
  }
  return out;
}

function loadSeries(): LoadedSeries[] {
  const dir = join(CONTENT_ROOT, "series");
  const entries = readdirSync(dir, { withFileTypes: true });
  const out: LoadedSeries[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const file = join(dir, entry.name);
    const parsed = matter(readFileSync(file, "utf8"));
    const validated = seriesSchema.parse(parsed.data);
    out.push({
      file,
      slug: entry.name.replace(/\.md$/, ""),
      data: validated,
    });
  }
  return out;
}

const posts = loadPosts();
const seriesEntries = loadSeries();

// ── M1 carry-over: site identity ───────────────────────────────────────

describe("site identity", () => {
  it("has the correct domain", () => {
    expect(SITE.domain).toBe("koraydevecioglu.com");
    expect(SITE.url).toBe("https://koraydevecioglu.com");
  });

  it("has a valid email", () => {
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});

describe("social links", () => {
  it.each(Object.entries(SOCIAL))("%s URL is well-formed", (_key, social) => {
    expect(() => new URL(social.url)).not.toThrow();
    expect(social.url).toMatch(/^https:\/\//);
  });
});

// ── Schema conformance ────────────────────────────────────────────────

describe("content collections", () => {
  it("find at least one post per type", () => {
    for (const type of Object.keys(TYPES) as TypeKey[]) {
      const count = posts.filter((p) => p.type === type).length;
      expect(count, `expected at least one ${type} post`).toBeGreaterThan(0);
    }
  });

  it("find at least one series", () => {
    expect(seriesEntries.length).toBeGreaterThan(0);
  });

  it.each(posts)(
    "$type/$slug validates against its Zod schema",
    ({ type, data, file }) => {
      const schema = TYPES[type];
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new Error(
          `Schema validation failed for ${file}:\n${result.error.toString()}`,
        );
      }
    },
  );
});

// ── Tag allow-list ────────────────────────────────────────────────────

describe("tag allow-list", () => {
  // The Zod schema already enforces the enum; this test double-books
  // the invariant with a clearer error message when someone adds a
  // misspelled tag.
  it.each(posts)("$type/$slug uses only allowed tags", ({ data, file }) => {
    const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
    const bad = tags.filter((t) => !(ALLOWED_TAGS as readonly string[]).includes(t));
    expect(bad, `${file} uses unknown tag(s): ${bad.join(", ")}`).toHaveLength(0);
  });

  it("has a reasonable allow-list size", () => {
    expect(ALLOWED_TAGS.length).toBeGreaterThanOrEqual(5);
    expect(ALLOWED_TAGS.length).toBeLessThanOrEqual(40);
  });

  it("has no duplicate or mis-cased tags", () => {
    const set = new Set(ALLOWED_TAGS);
    expect(set.size).toBe(ALLOWED_TAGS.length);
    for (const t of ALLOWED_TAGS) {
      expect(t, `${t} is not kebab-case`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});

// ── Series integrity ──────────────────────────────────────────────────

describe("series FK integrity", () => {
  const seriesBySlug = new Map(seriesEntries.map((s) => [s.slug, s]));

  it.each(posts.filter((p) => p.data.series))(
    "$type/$slug references an existing series",
    ({ data, file }) => {
      const fk = data.series as string;
      expect(seriesBySlug.has(fk), `${file} references unknown series "${fk}"`).toBe(
        true,
      );
    },
  );

  it.each(posts.filter((p) => p.data.series))(
    "$type/$slug appears in its series' order[]",
    ({ data, slug, file }) => {
      const fk = data.series as string;
      const series = seriesBySlug.get(fk);
      expect(series, `missing series ${fk}`).toBeDefined();
      expect(
        series!.data.order,
        `${file} is not listed in series "${fk}" order[]`,
      ).toContain(slug);
    },
  );

  it.each(seriesEntries)(
    "series $slug.order[] resolves to existing posts",
    ({ data, file }) => {
      const knownSlugs = new Set(posts.map((p) => p.slug));
      for (const s of data.order) {
        expect(
          knownSlugs.has(s),
          `${file} lists "${s}" in order[], but no post has that slug`,
        ).toBe(true);
      }
    },
  );
});

// ── Cover / coverAlt ──────────────────────────────────────────────────

describe("cover/coverAlt contract", () => {
  it.each(posts)("$type/$slug has coverAlt iff it has cover", ({ data, file }) => {
    const hasCover = Boolean(data.cover);
    const hasAlt = Boolean(data.coverAlt);
    if (hasCover) {
      expect(
        hasAlt,
        `${file} has a cover image but no coverAlt — accessibility regression`,
      ).toBe(true);
    }
  });
});

// ── Standalone pages (/now, /uses, /colophon, /reading) ──────────────

describe("pages collection", () => {
  const pagesDir = join(CONTENT_ROOT, "pages");
  const files = readdirSync(pagesDir, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(md|mdx)$/.test(e.name))
    .map((e) => e.name);

  const REQUIRED = ["now.md", "uses.md", "colophon.md", "reading.md"];

  it.each(REQUIRED)("ships the required indie-web page: %s", (name) => {
    expect(files, `missing ${name} under src/content/pages/`).toContain(name);
  });

  it.each(files)("%s validates against pageSchema", (name) => {
    const parsed = matter(readFileSync(join(pagesDir, name), "utf8"));
    const result = pageSchema.safeParse(parsed.data);
    if (!result.success) {
      throw new Error(
        `Schema validation failed for pages/${name}:\n${result.error.toString()}`,
      );
    }
  });
});

// ── Reading time utility ──────────────────────────────────────────────

describe("readingTime()", () => {
  it("strips fenced code before counting", () => {
    const withCode =
      "word ".repeat(100) + "\n```\nconst x = " + "y ".repeat(500) + "\n```\n";
    const a = readingTime(withCode);
    const b = readingTime("word ".repeat(100));
    expect(a.words).toBe(b.words);
  });

  it("never returns less than 1 minute", () => {
    expect(readingTime("hi").minutes).toBe(1);
    expect(readingTime("").minutes).toBe(1);
  });

  it("scales roughly linearly at 240 wpm", () => {
    const thousand = "word ".repeat(1000);
    const rt = readingTime(thousand);
    expect(rt.words).toBe(1000);
    // 1000 / 240 ≈ 4.17 — rounds to 4
    expect(rt.minutes).toBe(4);
  });
});
