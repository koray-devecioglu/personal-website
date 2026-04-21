/**
 * Feed payload builders.
 *
 * Both `/rss.xml` and `/feed.json` read the same underlying list —
 * `feedItemsFor(posts)` — and then the endpoint-specific serializers
 * project to RSS or JSON Feed 1.1 shape. Keeps the two formats in lock-
 * step without copy-pasted date logic.
 *
 * Pure — no Astro imports — so vitest can exercise it directly.
 */

import { SITE } from "../data/links";
import { absoluteUrl } from "./seo";
import type { ReadablePost } from "./posts";
import { postPath } from "./posts";

export interface FeedItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  published: Date;
  updated?: Date;
  tags: readonly string[];
}

export function feedItemsFor(posts: readonly ReadablePost[]): FeedItem[] {
  return posts.map((post) => {
    const url = absoluteUrl(postPath(post));
    return {
      id: url,
      url,
      title: post.data.title,
      summary: post.data.description,
      published: post.data.date,
      updated: post.data.updated,
      tags: post.data.tags ?? [],
    };
  });
}

// ── JSON Feed 1.1 ──────────────────────────────────────────────────────
// https://www.jsonfeed.org/version/1.1/

export interface JsonFeedDocument {
  version: "https://jsonfeed.org/version/1.1";
  title: string;
  description: string;
  home_page_url: string;
  feed_url: string;
  language: string;
  authors: { name: string; url: string }[];
  items: JsonFeedItem[];
}

interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  date_published: string;
  date_modified?: string;
  tags?: readonly string[];
}

export function buildJsonFeed(items: readonly FeedItem[]): JsonFeedDocument {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE.name,
    description: SITE.description,
    home_page_url: SITE.url,
    feed_url: absoluteUrl("/feed.json"),
    language: SITE.locale,
    authors: [{ name: SITE.name, url: SITE.url }],
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      summary: item.summary,
      date_published: item.published.toISOString(),
      ...(item.updated && { date_modified: item.updated.toISOString() }),
      ...(item.tags.length > 0 && { tags: item.tags }),
    })),
  };
}
