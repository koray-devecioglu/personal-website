/**
 * Unit coverage for the palette search helpers.
 *
 * The command palette's client script duplicates `normalise`,
 * `matchScore`, and `searchIndex` so the module can run entirely
 * in-browser. We test the server-side copies here — the duplicated
 * logic is one-page, identical, and small enough to audit by eye. If
 * that ever drifts, add a contract test that loads both via a vite
 * tsx transform and compares outputs on a shared fixture.
 */
import { describe, expect, it } from "vitest";

import {
  haystackFor,
  matchScore,
  searchIndex,
  type PaletteItem,
} from "../src/lib/palette-index";

function item(
  partial: Partial<PaletteItem> & Pick<PaletteItem, "id" | "title">,
): PaletteItem {
  return { kind: "jump", ...partial };
}

describe("matchScore", () => {
  const home = item({ id: "home", title: "Home" });
  const posts = item({ id: "posts", title: "All posts" });
  const astroTag = item({
    id: "tag-astro",
    kind: "tag",
    title: "#astro",
    subtitle: "3 posts",
    keywords: ["astro", "framework"],
  });

  it("matches exact prefixes with the highest score", () => {
    const prefix = matchScore(home, "ho");
    const substr = matchScore(astroTag, "tr");
    expect(prefix).toBeGreaterThan(substr ?? 0);
  });

  it("returns null when there's no possible match", () => {
    expect(matchScore(home, "zzz")).toBeNull();
  });

  it("is case- and diacritic-insensitive", () => {
    const cafe = item({ id: "cafe", title: "Café Routine" });
    expect(matchScore(cafe, "cafe")).not.toBeNull();
    expect(matchScore(cafe, "CAF")).not.toBeNull();
  });

  it("scores token-start matches above plain substrings", () => {
    const tokenHit = matchScore(posts, "po");
    const substringOnly = matchScore(
      item({ id: "x", title: "Looking at topology" }),
      "po",
    );
    expect(tokenHit ?? 0).toBeGreaterThan(substringOnly ?? 0);
  });

  it("matches keywords but scores them below title hits", () => {
    const titleHit = matchScore(astroTag, "ast");
    const kwHit = matchScore(
      item({
        id: "kw-only",
        title: "Unrelated",
        keywords: ["astronaut"],
      }),
      "ast",
    );
    expect(titleHit ?? 0).toBeGreaterThanOrEqual(kwHit ?? 0);
  });

  it("returns 0 on empty query (passthrough)", () => {
    expect(matchScore(home, "")).toBe(0);
    expect(matchScore(home, "   ")).toBe(0);
  });
});

describe("searchIndex", () => {
  const items: PaletteItem[] = [
    item({ id: "home", title: "Home" }),
    item({ id: "posts", title: "All posts" }),
    item({ id: "tags", title: "Tags" }),
    item({
      id: "astro",
      kind: "tag",
      title: "#astro",
      keywords: ["framework"],
    }),
    item({ id: "cv", title: "CV" }),
  ];

  it("returns input order when query is empty", () => {
    const out = searchIndex(items, "");
    expect(out.map((i) => i.id)).toEqual(["home", "posts", "tags", "astro", "cv"]);
  });

  it("ranks exact prefixes first", () => {
    const out = searchIndex(items, "po");
    expect(out[0]?.id).toBe("posts");
  });

  it("drops items that don't match", () => {
    const out = searchIndex(items, "zzz");
    expect(out).toHaveLength(0);
  });

  it("honours the limit parameter", () => {
    const out = searchIndex(items, "", 2);
    expect(out).toHaveLength(2);
  });
});

describe("haystackFor", () => {
  it("folds title, subtitle, and keywords into a searchable string", () => {
    const h = haystackFor(
      item({
        id: "x",
        title: "Hello",
        subtitle: "subtitle text",
        keywords: ["kw1", "kw2"],
      }),
    );
    expect(h).toContain("hello");
    expect(h).toContain("subtitle text");
    expect(h).toContain("kw1");
    expect(h).toContain("kw2");
  });

  it("lower-cases and strips diacritics", () => {
    const h = haystackFor(item({ id: "x", title: "Café" }));
    expect(h.trim()).toBe("cafe");
  });
});
