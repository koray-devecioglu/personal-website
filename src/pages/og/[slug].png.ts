/**
 * Per-post OG image endpoint.
 *
 * Generates one PNG per publishable post at build time using satori +
 * resvg. Runs during `astro build`; no runtime server needed. The
 * resulting file sits at `/og/<slug>.png` and is what every post's
 * `og:image` / `twitter:image` points at.
 *
 * A `/og/default.png` is handed out the same way — for pages (home,
 * indexes) that don't have a post behind them.
 */
import type { APIContext } from "astro";

import { getPublishablePosts, formatPostDate, typeLabelFor } from "../../lib/posts";
import { renderOgCard } from "../../lib/og";
import { SITE } from "../../data/links";

export async function getStaticPaths() {
  const posts = await getPublishablePosts();
  const postRoutes = posts.map((post) => ({
    params: { slug: post.id },
    props: {
      kind: "post" as const,
      title: post.data.title,
      eyebrow: typeLabelFor(post),
      footer: formatPostDate(post.data.date),
    },
  }));

  return [
    ...postRoutes,
    {
      params: { slug: "default" },
      props: {
        kind: "default" as const,
        title: SITE.name,
        eyebrow: "Personal site",
        footer: "",
      },
    },
  ];
}

interface Props {
  kind: "post" | "default";
  title: string;
  eyebrow: string;
  footer: string;
}

export async function GET(context: APIContext) {
  const { title, eyebrow, footer } = context.props as Props;

  const png = await renderOgCard({ title, eyebrow, footer });

  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
