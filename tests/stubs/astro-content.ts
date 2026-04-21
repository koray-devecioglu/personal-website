/**
 * Stub for `astro:content` used by vitest.
 *
 * Pure library helpers in `src/lib/posts.ts` reference
 * `getCollection` / `CollectionEntry` from `astro:content`. When the
 * tests hit any of those helpers they pass in hand-built fixtures, so
 * the runtime surface never fires — this stub exists purely to let the
 * module graph resolve.
 */

export async function getCollection(): Promise<unknown[]> {
  return [];
}

export type CollectionEntry<_C> = unknown;

export async function getEntry(): Promise<undefined> {
  return undefined;
}

export async function render(): Promise<{ Content: () => null; headings: [] }> {
  return { Content: () => null, headings: [] };
}
