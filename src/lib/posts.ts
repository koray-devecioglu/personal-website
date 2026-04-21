/**
 * Cross-collection helpers for the readable post types.
 *
 * Pages in M4+ will compose these freely — e.g. `/writing/` needs
 * essays + tutorials + TILs flattened and sorted; a tag page needs the
 * same, filtered by tag; `/now/` wants "latest thing across anything
 * human-facing".
 *
 * Two conventions enforced here:
 *   1. Drafts are never visible in production; they are visible in dev.
 *      `scheduled` posts behave the same as drafts until their date.
 *   2. "Readable post" === everything except `series` (which is metadata
 *      about other posts) and `bookmarks` (lightweight link roll, kept
 *      separate so it doesn't drown the main stream).
 */

import { getCollection, type CollectionEntry } from "astro:content";

export type ReadablePostCollection =
  | "essays"
  | "tutorials"
  | "tils"
  | "notes"
  | "projects";

export type ReadablePost = CollectionEntry<ReadablePostCollection>;

/** One call; returns the full readable stream, sorted newest-first. */
export async function getPublishablePosts(): Promise<ReadablePost[]> {
  const buckets = await Promise.all([
    getCollection("essays", publishable),
    getCollection("tutorials", publishable),
    getCollection("tils", publishable),
    getCollection("notes", publishable),
    getCollection("projects", publishable),
  ]);

  const flat = buckets.flat() as ReadablePost[];
  flat.sort(byDateDesc);
  return flat;
}

/** Same idea, but scoped to a single type — used by `/essays/` etc. */
export async function getPublishable<C extends ReadablePostCollection>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection, publishable);
  entries.sort(byDateDesc);
  return entries;
}

function publishable(entry: { data: PostDateFields }): boolean {
  // `import.meta.env.DEV` is true in `astro dev` / `astro check` and
  // false in production builds. This is the one line that prevents
  // drafts from shipping.
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
