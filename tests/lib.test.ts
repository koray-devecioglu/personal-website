/**
 * Pure-library tests: seo, feed, and posts helpers that don't require
 * an Astro runtime. Collection-level assertions live in content.test.ts.
 */

import { describe, expect, it } from "vitest";

import { SITE } from "../src/data/links";
import { absoluteUrl, pageSeo } from "../src/lib/seo";
import { buildJsonFeed, feedItemsFor } from "../src/lib/feed";
import type { ReadablePost } from "../src/lib/posts";
import { collectTags, neighborsFor, postPath } from "../src/lib/posts";

// ── Fixtures ──────────────────────────────────────────────────────────

function makePost(overrides: {
  id: string;
  collection?: ReadablePost["collection"];
  title?: string;
  description?: string;
  date?: Date;
  updated?: Date;
  tags?: string[];
}): ReadablePost {
  return {
    id: overrides.id,
    collection: overrides.collection ?? "essays",
    data: {
      title: overrides.title ?? "Fixture",
      description: overrides.description ?? "A fixture post.",
      date: overrides.date ?? new Date("2026-04-18"),
      updated: overrides.updated,
      tags: overrides.tags ?? [],
      draft: false,
      lang: "en",
      toc: true,
      math: false,
      diagram: false,
    },
    // The rest of the shape isn't consulted by our helpers; cast to the
    // CollectionEntry union to satisfy the type-checker.
    body: "",
    filePath: undefined as unknown as string,
    digest: undefined as unknown as string,
    rendered: undefined,
  } as unknown as ReadablePost;
}

// ── seo ───────────────────────────────────────────────────────────────

describe("pageSeo()", () => {
  it("suffixes the site name by default", () => {
    const out = pageSeo({ title: "Welcome", path: "/posts/welcome/" });
    expect(out.title).toBe(`Welcome · ${SITE.name}`);
  });

  it("respects bare template", () => {
    const out = pageSeo({
      title: SITE.name,
      titleTemplate: "bare",
      path: "/",
    });
    expect(out.title).toBe(SITE.name);
  });

  it("builds an absolute canonical from a relative path", () => {
    const out = pageSeo({ title: "X", path: "/posts/welcome/" });
    expect(out.canonical).toBe(`${SITE.url}/posts/welcome/`);
  });

  it("passes absolute canonical through untouched", () => {
    const out = pageSeo({
      title: "X",
      canonical: "https://elsewhere.example/x",
    });
    expect(out.canonical).toBe("https://elsewhere.example/x");
  });

  it("defaults the OG image when none is provided", () => {
    const out = pageSeo({ title: "X", path: "/" });
    expect(out.ogImage.endsWith("/og/default.png")).toBe(true);
  });

  it("normalises published/updated to ISO strings", () => {
    const out = pageSeo({
      title: "X",
      path: "/x/",
      type: "article",
      published: new Date("2026-01-02T00:00:00Z"),
      updated: "2026-03-04",
    });
    expect(out.published).toBe("2026-01-02T00:00:00.000Z");
    expect(out.updated).toMatch(/^2026-03-04T/);
  });
});

describe("absoluteUrl()", () => {
  it("prepends the site URL", () => {
    expect(absoluteUrl("/x")).toBe(`${SITE.url}/x`);
  });
  it("handles missing leading slash", () => {
    expect(absoluteUrl("x")).toBe(`${SITE.url}/x`);
  });
  it("leaves absolute URLs untouched", () => {
    expect(absoluteUrl("https://example.com/y")).toBe("https://example.com/y");
  });
});

// ── feed ──────────────────────────────────────────────────────────────

describe("feedItemsFor + buildJsonFeed", () => {
  const posts: ReadablePost[] = [
    makePost({
      id: "welcome",
      title: "Welcome",
      description: "First post.",
      date: new Date("2026-04-18"),
      tags: ["astro"],
    }),
    makePost({
      id: "second",
      title: "Second",
      description: "Follow-up.",
      date: new Date("2026-04-19"),
      updated: new Date("2026-04-20"),
    }),
  ];

  it("projects posts to feed-item shape with absolute URLs", () => {
    const items = feedItemsFor(posts);
    expect(items).toHaveLength(2);
    expect(items[0]!.url).toBe(`${SITE.url}${postPath(posts[0]!)}`);
    expect(items[0]!.title).toBe("Welcome");
    expect(items[0]!.tags).toEqual(["astro"]);
  });

  it("builds a JSON Feed 1.1 document", () => {
    const doc = buildJsonFeed(feedItemsFor(posts));
    expect(doc.version).toBe("https://jsonfeed.org/version/1.1");
    expect(doc.title).toBe(SITE.name);
    expect(doc.items).toHaveLength(2);
    expect(doc.items[0]!.date_published).toBe("2026-04-18T00:00:00.000Z");
    // Only the second post has an updated timestamp.
    expect(doc.items[0]!.date_modified).toBeUndefined();
    expect(doc.items[1]!.date_modified).toBe("2026-04-20T00:00:00.000Z");
  });
});

// ── posts helpers ─────────────────────────────────────────────────────

describe("collectTags()", () => {
  it("counts tag frequencies and sorts by count desc, then alpha", () => {
    const posts = [
      makePost({ id: "a", tags: ["astro", "typescript"] }),
      makePost({ id: "b", tags: ["astro"] }),
      makePost({ id: "c", tags: ["typescript", "food"] }),
    ];
    const tags = collectTags(posts);
    expect(tags[0]).toEqual({ tag: "astro", count: 2 });
    expect(tags[1]).toEqual({ tag: "typescript", count: 2 });
    expect(tags[2]).toEqual({ tag: "food", count: 1 });
  });

  it("returns [] for an empty stream", () => {
    expect(collectTags([])).toEqual([]);
  });
});

describe("neighborsFor()", () => {
  // stream is newest-first.
  const stream = [
    makePost({ id: "newest", date: new Date("2026-04-20") }),
    makePost({ id: "middle", date: new Date("2026-04-19") }),
    makePost({ id: "oldest", date: new Date("2026-04-18") }),
  ];

  it("returns newer as next, older as prev", () => {
    const n = neighborsFor(stream, stream[1]!);
    expect(n.next?.id).toBe("newest");
    expect(n.prev?.id).toBe("oldest");
  });

  it("leaves prev undefined for the oldest post", () => {
    const n = neighborsFor(stream, stream[2]!);
    expect(n.prev).toBeUndefined();
    expect(n.next?.id).toBe("middle");
  });

  it("leaves next undefined for the newest post", () => {
    const n = neighborsFor(stream, stream[0]!);
    expect(n.prev?.id).toBe("middle");
    expect(n.next).toBeUndefined();
  });

  it("returns {} when the post isn't in the stream", () => {
    const rogue = makePost({ id: "rogue" });
    expect(neighborsFor(stream, rogue)).toEqual({});
  });
});

describe("postPath()", () => {
  it("always uses /posts/<id>", () => {
    const essay = makePost({ id: "welcome", collection: "essays" });
    const note = makePost({ id: "site-notes", collection: "notes" });
    expect(postPath(essay)).toBe("/posts/welcome");
    expect(postPath(note)).toBe("/posts/site-notes");
  });
});
