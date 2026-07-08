/**
 * JSON-LD builders.
 *
 * Small, pure functions (no Astro imports — vitest-friendly, mirroring
 * lib/seo.ts) that produce schema.org payloads. Pages hand the result
 * to BaseLayout's `jsonLd` prop, which owns serialisation and the
 * <script type="application/ld+json"> tag.
 *
 * Kept deliberately minimal: only properties Google's rich-results
 * parsers actually consume. No review stars, no fake aggregate
 * anything.
 */

import { SITE, SOCIAL } from "../data/links";
import { absoluteUrl } from "./seo";

export type JsonLd = Record<string, unknown>;

/** The site owner. Used standalone on / and /cv, embedded in posts. */
export function personJsonLd(options?: { jobTitle?: string }): JsonLd {
  return {
    "@type": "Person",
    "@id": `${SITE.url}/#person`,
    name: SITE.name,
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    ...(options?.jobTitle ? { jobTitle: options.jobTitle } : {}),
    sameAs: [SOCIAL.github.url, SOCIAL.linkedin.url, SOCIAL.instagram.url],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#person` },
  };
}

export interface BlogPostingInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/posts/welcome". */
  path: string;
  published: Date;
  updated?: Date;
  tags?: readonly string[];
  /** Site-relative OG image path. */
  image?: string;
}

export function blogPostingJsonLd(input: BlogPostingInput): JsonLd {
  return {
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.published.toISOString(),
    ...(input.updated ? { dateModified: input.updated.toISOString() } : {}),
    ...(input.tags && input.tags.length > 0 ? { keywords: input.tags.join(", ") } : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    author: personJsonLd(),
    inLanguage: SITE.locale,
  };
}

/**
 * Serialise for a <script type="application/ld+json"> body. Escapes
 * `<` so post titles like "<Component /> patterns" can't break out of
 * the script element.
 */
export function jsonLdSerialize(items: JsonLd | JsonLd[]): string {
  const graph = Array.isArray(items) ? items : [items];
  const payload =
    graph.length === 1
      ? { "@context": "https://schema.org", ...graph[0] }
      : { "@context": "https://schema.org", "@graph": graph };
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
