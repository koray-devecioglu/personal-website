/**
 * Cross-collection helpers for the readable post types.
 *
 * Pages in M4+ compose these freely — `/posts/` needs the flattened
 * stream, `/tags/<tag>` needs the same filtered by tag, `/series/<s>`
 * needs ordered entries. Keeping the plumbing here means the routes
 * themselves stay thin.
 *
 * Conventions enforced:
 *   1. Drafts are never visible in production; they are visible in dev.
 *      `scheduled` posts behave the same until their date passes.
 *   2. "Readable post" === everything except `series` (metadata about
 *      other posts) and `bookmarks` (lightweight link roll, kept out
 *      of the main stream; surfaces via its own linkroll in M6).
 *   3. Every readable post lives at `/posts/<slug>`. No per-type route
 *      duplicates the index — tag pages already separate them.
 */

import { getCollection, type CollectionEntry } from "astro:content";

export type ReadablePostCollection =
  | "essays"
  | "tutorials"
  | "tils"
  | "notes"
  | "projects";

export type ReadablePost = CollectionEntry<ReadablePostCollection>;

export const READABLE_COLLECTIONS: readonly ReadablePostCollection[] = [
  "essays",
  "tutorials",
  "tils",
  "notes",
  "projects",
] as const;

// ── Stream access ──────────────────────────────────────────────────────

/** One call; returns the full readable stream, sorted newest-first. */
export async function getPublishablePosts(): Promise<ReadablePost[]> {
  const buckets = await Promise.all(
    READABLE_COLLECTIONS.map((c) => getCollection(c, publishable)),
  );
  const flat = buckets.flat() as ReadablePost[];
  flat.sort(byDateDesc);
  return flat;
}

/** Scoped to a single type; used internally by `getPublishablePosts`. */
export async function getPublishable<C extends ReadablePostCollection>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection, publishable);
  entries.sort(byDateDesc);
  return entries;
}

// ── Paths + labels ─────────────────────────────────────────────────────

/** Canonical URL path for a readable post. */
export function postPath(entry: ReadablePost): string {
  return `/posts/${entry.id}`;
}

/** Human-readable singular for a collection. Used as the post eyebrow. */
const TYPE_LABELS: Record<ReadablePostCollection, string> = {
  essays: "essay",
  tutorials: "tutorial",
  tils: "TIL",
  notes: "note",
  projects: "project",
};

export function typeLabelFor(post: ReadablePost): string {
  return TYPE_LABELS[post.collection as ReadablePostCollection];
}

/** Human-formatted date ("Apr 21, 2026"). Mono renders next to the ISO. */
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Machine-friendly ISO date ("2026-04-21") for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ── Tags ───────────────────────────────────────────────────────────────

export interface TagEntry {
  tag: string;
  count: number;
}

/** Build a tag → count map from the readable stream, sorted by count desc. */
export function collectTags(posts: readonly ReadablePost[]): TagEntry[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
}

/** All posts tagged with `tag`, in the global newest-first order. */
export function postsWithTag(
  posts: readonly ReadablePost[],
  tag: string,
): ReadablePost[] {
  return posts.filter((p) => (p.data.tags ?? []).includes(tag));
}

// ── Series ─────────────────────────────────────────────────────────────

export interface SeriesBundle {
  entry: CollectionEntry<"series">;
  posts: ReadablePost[];
}

/** All series entries with their ordered, publishable posts resolved. */
export async function getSeriesBundles(): Promise<SeriesBundle[]> {
  const [seriesEntries, posts] = await Promise.all([
    getCollection("series"),
    getPublishablePosts(),
  ]);
  const bySlug = new Map(posts.map((p) => [p.id, p] as const));

  return seriesEntries
    .map((entry) => ({
      entry,
      posts: entry.data.order
        .map((slug) => bySlug.get(slug))
        .filter((p): p is ReadablePost => Boolean(p)),
    }))
    .filter((b) => b.posts.length > 0)
    .sort((a, b) => a.entry.data.title.localeCompare(b.entry.data.title));
}

export interface SeriesPosition {
  seriesId: string;
  title: string;
  summary: string;
  index: number; // 1-based
  total: number;
  prev?: ReadablePost;
  next?: ReadablePost;
}

/**
 * Locate a post inside its series, if any, and surface the adjacent
 * posts. Returns `null` when the post isn't in a series or the
 * series doesn't list it.
 */
export async function seriesPositionFor(
  post: ReadablePost,
): Promise<SeriesPosition | null> {
  if (!post.data.series) return null;

  const bundles = await getSeriesBundles();
  const bundle = bundles.find((b) => b.entry.id === post.data.series);
  if (!bundle) return null;

  const idx = bundle.posts.findIndex((p) => p.id === post.id);
  if (idx === -1) return null;

  return {
    seriesId: bundle.entry.id,
    title: bundle.entry.data.title,
    summary: bundle.entry.data.summary,
    index: idx + 1,
    total: bundle.posts.length,
    prev: idx > 0 ? bundle.posts[idx - 1] : undefined,
    next: idx < bundle.posts.length - 1 ? bundle.posts[idx + 1] : undefined,
  };
}

// ── Prev / next (global stream) ────────────────────────────────────────

export interface Neighbors<T> {
  prev?: T;
  next?: T;
}

/**
 * Prev = published before this post (older). Next = published after
 * (newer). "Newer" intentionally sits on the right so the natural
 * reading-order UI (← older / newer →) lines up.
 */
export function neighborsFor<T extends { id: string; data: { date: Date } }>(
  stream: readonly T[],
  current: T,
): Neighbors<T> {
  const idx = stream.findIndex((p) => p.id === current.id);
  if (idx === -1) return {};
  // stream is newest-first, so idx - 1 is newer, idx + 1 is older.
  return {
    next: idx > 0 ? stream[idx - 1] : undefined,
    prev: idx < stream.length - 1 ? stream[idx + 1] : undefined,
  };
}

// ── Internals ──────────────────────────────────────────────────────────

function publishable(entry: { data: PostDateFields }): boolean {
  if (!import.meta.env.DEV) {
    if (entry.data.draft) return false;
    if (entry.data.scheduled && entry.data.scheduled > new Date()) {
      return false;
    }
  }
  return true;
}

interface PostDateFields {
  draft?: boolean;
  scheduled?: Date;
  date: Date;
}

function byDateDesc(a: { data: PostDateFields }, b: { data: PostDateFields }) {
  return b.data.date.getTime() - a.data.date.getTime();
}
