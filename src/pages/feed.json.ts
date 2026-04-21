/**
 * JSON Feed 1.1 endpoint.
 *
 * Mirror of `/rss.xml` in the JSON Feed 1.1 shape, for readers whose
 * aggregators prefer JSON. Cheaper to parse, friendlier to inspect in
 * a browser.
 */
import { getPublishablePosts } from "../lib/posts";
import { buildJsonFeed, feedItemsFor } from "../lib/feed";

export async function GET() {
  const posts = await getPublishablePosts();
  const items = feedItemsFor(posts);
  const doc = buildJsonFeed(items);

  return new Response(JSON.stringify(doc, null, 2), {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
    },
  });
}
