/**
 * SEO helpers.
 *
 * Every page that cares about metadata calls `pageSeo(...)` — which
 * takes page-level bits and returns a normalised payload
 * (title, description, canonical URL, OG image URL, indexability).
 * `BaseLayout.astro` reads the payload and renders the tags.
 *
 * Kept pure (no Astro-only imports) so vitest can validate it.
 */

import { SITE } from "../data/links";

export interface SeoInput {
  /** Page title. Will be suffixed with the site name unless already
   * identical or explicitly suppressed via `titleTemplate: "bare"`. */
  title: string;
  description?: string;
  /** Path (relative) or absolute URL. Canonical is always absolute. */
  path?: string;
  /** Override the default OG image (e.g. "/og/<slug>.png"). */
  ogImage?: string;
  /** A third-party canonical when the post is a republication. */
  canonical?: string;
  /** Opt the page out of indexing. Used for /sandbox and drafts. */
  noindex?: boolean;
  /** "site" (default) → "Title · Site"; "bare" → "Title". */
  titleTemplate?: "site" | "bare";
  /** Used for per-post OG image tags. */
  type?: "website" | "article";
  /** ISO date for article:published_time (articles only). */
  published?: Date | string;
  /** ISO date for article:modified_time (articles only). */
  updated?: Date | string;
  /** Tag names for `article:tag` meta. */
  tags?: readonly string[];
}

export interface SeoOutput {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  noindex: boolean;
  type: "website" | "article";
  published?: string;
  updated?: string;
  tags: readonly string[];
}

const DEFAULT_OG = "/og/default.png";

export function pageSeo(input: SeoInput): SeoOutput {
  const description = input.description ?? SITE.description;

  const title =
    input.titleTemplate === "bare" || input.title === SITE.name
      ? input.title
      : `${input.title} · ${SITE.name}`;

  const canonical = absoluteUrl(input.canonical ?? input.path ?? "/");
  const ogImage = absoluteUrl(input.ogImage ?? DEFAULT_OG);

  return {
    title,
    description,
    canonical,
    ogImage,
    noindex: Boolean(input.noindex),
    type: input.type ?? "website",
    published: normaliseDate(input.published),
    updated: normaliseDate(input.updated),
    tags: input.tags ?? [],
  };
}

/** Join a path to SITE.url without creating `//` or losing the scheme. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = SITE.url.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

function normaliseDate(input: Date | string | undefined): string | undefined {
  if (!input) return undefined;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
