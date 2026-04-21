/**
 * RSS 2.0 feed endpoint.
 *
 * Summary + link, not full content. Aggregators that want full text
 * can follow the link and fetch the page — keeps feeds portable and
 * the XML payload small.
 */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import { SITE } from "../data/links";
import { getPublishablePosts } from "../lib/posts";
import { feedItemsFor } from "../lib/feed";

export async function GET(context: APIContext) {
  const posts = await getPublishablePosts();
  const items = feedItemsFor(posts);

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: items.map((item) => ({
      link: item.url,
      title: item.title,
      description: item.summary,
      pubDate: item.published,
      categories: [...item.tags],
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
