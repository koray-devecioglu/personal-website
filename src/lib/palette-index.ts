/**
 * Command-palette index builder.
 *
 * The palette is an island (see `src/components/islands/CommandPalette.astro`)
 * that needs to know, at render time, about every jump target, post, tag,
 * and series on the site. Rather than fetch an index at runtime, we build
 * the list at SSG time and embed it inside the island as JSON — no
 * network hop, no stale-while-revalidate, no CORS. The entire index for
 * this site is under 10 KB of JSON.
 *
 * Full-text _content_ search is a separate concern: Pagefind handles
 * that in production. The island loads Pagefind lazily on the first
 * query and merges its hits into the result list.
 */

import { SITE, SOCIAL } from "../data/links";
import {
  collectTags,
  formatPostDate,
  getPublishablePosts,
  getSeriesBundles,
  isoDate,
  postPath,
  typeLabelFor,
} from "./posts";

export type PaletteKind = "jump" | "post" | "tag" | "series" | "action";

export interface PaletteItem {
  /** Unique string — used as React key / DOM id. */
  id: string;
  kind: PaletteKind;
  /** Primary display label. */
  title: string;
  /** Muted text shown to the right (e.g. type, date, count). */
  subtitle?: string;
  /** Navigation target. Mutually exclusive with `action`. */
  href?: string;
  /** Action identifier handled client-side. */
  action?: string;
  /** Extra tokens folded into the match haystack but not displayed. */
  keywords?: string[];
  /** Whether this link leaves the site. Renders with an arrow glyph. */
  external?: boolean;
}

/** Static routes that should always be reachable from the palette. */
const JUMP_ROUTES: PaletteItem[] = [
  { id: "jump:home", kind: "jump", title: "Home", href: "/" },
  { id: "jump:posts", kind: "jump", title: "All posts", href: "/posts" },
  { id: "jump:tags", kind: "jump", title: "Tags", href: "/tags" },
  { id: "jump:series", kind: "jump", title: "Series", href: "/series" },
  { id: "jump:cv", kind: "jump", title: "CV", href: "/cv" },
  { id: "jump:now", kind: "jump", title: "Now", href: "/now" },
  { id: "jump:uses", kind: "jump", title: "Uses", href: "/uses" },
  { id: "jump:colophon", kind: "jump", title: "Colophon", href: "/colophon" },
  { id: "jump:reading", kind: "jump", title: "Reading", href: "/reading" },
];

/** Actions the palette can execute client-side. */
const ACTIONS: PaletteItem[] = [
  {
    id: "action:theme",
    kind: "action",
    title: "Toggle theme",
    subtitle: "light · dark · system",
    action: "toggle-theme",
    keywords: ["dark", "light", "mode", "appearance"],
  },
  {
    id: "action:copy-url",
    kind: "action",
    title: "Copy page URL",
    action: "copy-url",
    keywords: ["share", "link", "clipboard"],
  },
  {
    id: "action:rss",
    kind: "action",
    title: "RSS feed",
    subtitle: "/rss.xml",
    href: "/rss.xml",
    keywords: ["feed", "subscribe", "rss"],
  },
  {
    id: "action:json-feed",
    kind: "action",
    title: "JSON feed",
    subtitle: "/feed.json",
    href: "/feed.json",
    keywords: ["feed", "subscribe", "json"],
  },
  {
    id: "action:email",
    kind: "action",
    title: "Send email",
    subtitle: SITE.email,
    href: `mailto:${SITE.email}`,
    external: true,
    keywords: ["contact", "mail", "reach", "write", "hello", "hi"],
  },
  {
    id: "action:source",
    kind: "action",
    title: "View source on GitHub",
    subtitle: "github.com/koray-devecioglu/personal-website",
    href: SOCIAL.github.url + "/personal-website",
    external: true,
    keywords: ["github", "repo", "source", "code"],
  },
];

export interface PaletteIndex {
  items: PaletteItem[];
  /** Grouped IDs — consumed by the island to render section headers. */
  groups: {
    jump: string[];
    posts: string[];
    tags: string[];
    series: string[];
    actions: string[];
  };
}

/**
 * Build the full palette index for the current content set. Safe to
 * call at render time — it's memoised per invocation, but Astro gives
 * each route its own module instance so there's no cross-request leak.
 */
export async function buildPaletteIndex(): Promise<PaletteIndex> {
  const [posts, seriesBundles] = await Promise.all([
    getPublishablePosts(),
    getSeriesBundles(),
  ]);
  const tagEntries = collectTags(posts);

  const postItems: PaletteItem[] = posts.map((post) => {
    const typeLabel = typeLabelFor(post);
    const dateLabel = formatPostDate(post.data.date);
    return {
      id: `post:${post.id}`,
      kind: "post",
      title: post.data.title,
      subtitle: `${typeLabel} · ${dateLabel}`,
      href: postPath(post),
      keywords: [
        typeLabel,
        isoDate(post.data.date),
        ...(post.data.tags ?? []),
        post.data.description,
      ].filter((s): s is string => Boolean(s)),
    };
  });

  const tagItems: PaletteItem[] = tagEntries.map(({ tag, count }) => ({
    id: `tag:${tag}`,
    kind: "tag",
    title: `#${tag}`,
    subtitle: `${count} post${count === 1 ? "" : "s"}`,
    href: `/tags/${tag}`,
  }));

  const seriesItems: PaletteItem[] = seriesBundles.map(({ entry, posts: ordered }) => ({
    id: `series:${entry.id}`,
    kind: "series",
    title: entry.data.title,
    subtitle: `${ordered.length} post${ordered.length === 1 ? "" : "s"}`,
    href: `/series/${entry.id}`,
    keywords: [entry.data.summary],
  }));

  const items: PaletteItem[] = [
    ...JUMP_ROUTES,
    ...postItems,
    ...tagItems,
    ...seriesItems,
    ...ACTIONS,
  ];

  return {
    items,
    groups: {
      jump: JUMP_ROUTES.map((i) => i.id),
      posts: postItems.map((i) => i.id),
      tags: tagItems.map((i) => i.id),
      series: seriesItems.map((i) => i.id),
      actions: ACTIONS.map((i) => i.id),
    },
  };
}

// ── Matching helpers (exported for Vitest) ─────────────────────────────

/**
 * Fold display + keywords into the single string the palette matches
 * against. Lower-case, whitespace-normalised, stripped of diacritics.
 */
export function haystackFor(item: PaletteItem): string {
  return normalise(
    [item.title, item.subtitle ?? "", ...(item.keywords ?? [])].join(" "),
  );
}

/**
 * Case-insensitive, diacritic-insensitive, subsequence-aware match
 * score. Higher is better; `null` means no match.
 *
 * Scoring:
 *   - Exact prefix on title: +1000
 *   - Any token starts with query: +500
 *   - Literal substring anywhere: +250
 *   - Subsequence match with tight gaps: gradient from +100 down
 *
 * Good enough for a site with a few hundred items and zero latency
 * budget. No fuzzy library, no dependency.
 */
export function matchScore(item: PaletteItem, rawQuery: string): number | null {
  const q = normalise(rawQuery).trim();
  if (!q) return 0;

  const titleNorm = normalise(item.title);
  const haystack = haystackFor(item);

  if (titleNorm.startsWith(q)) return 1000 - q.length;
  const tokens = haystack.split(/\s+/);
  if (tokens.some((t) => t.startsWith(q))) return 500 - q.length;
  if (haystack.includes(q)) return 250;

  // Subsequence over the title only — keeps posts about "Astro" from
  // scoring on an "a" query just because the haystack is long.
  const sub = subsequenceScore(titleNorm, q);
  if (sub === null) return null;
  return sub;
}

function subsequenceScore(source: string, query: string): number | null {
  let si = 0;
  let score = 0;
  let prevMatch = -2;
  for (let qi = 0; qi < query.length; qi++) {
    const qch = query[qi]!;
    let found = -1;
    while (si < source.length) {
      if (source[si] === qch) {
        found = si;
        break;
      }
      si++;
    }
    if (found === -1) return null;
    const gap = found - prevMatch - 1;
    score += Math.max(1, 12 - gap);
    prevMatch = found;
    si++;
  }
  return score;
}

function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Filter + sort an index against a query. Returns the top `limit` hits.
 * Empty query returns the first `limit` items as-is (stable order).
 */
export function searchIndex(
  items: readonly PaletteItem[],
  query: string,
  limit = 40,
): PaletteItem[] {
  if (!query.trim()) return items.slice(0, limit);
  const scored: { item: PaletteItem; score: number }[] = [];
  for (const item of items) {
    const score = matchScore(item, query);
    if (score === null) continue;
    scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
