/**
 * JSON-LD builder coverage — shapes, conditional fields, and the
 * script-safe serialisation (the `<` escape is what keeps a post
 * titled "<Component /> patterns" from closing the script element).
 */
import { describe, expect, it } from "vitest";

import {
  blogPostingJsonLd,
  jsonLdSerialize,
  personJsonLd,
  websiteJsonLd,
} from "../src/lib/structured-data";
import { SITE, SOCIAL } from "../src/data/links";

describe("personJsonLd", () => {
  it("identifies Koray with stable @id and all social profiles", () => {
    const person = personJsonLd();
    expect(person["@type"]).toBe("Person");
    expect(person["@id"]).toBe(`${SITE.url}/#person`);
    expect(person.sameAs).toEqual([
      SOCIAL.github.url,
      SOCIAL.linkedin.url,
      SOCIAL.instagram.url,
    ]);
    expect(person).not.toHaveProperty("jobTitle");
  });

  it("includes jobTitle only when provided", () => {
    expect(personJsonLd({ jobTitle: "Software engineer" }).jobTitle).toBe(
      "Software engineer",
    );
  });
});

describe("websiteJsonLd", () => {
  it("links the site to the person as publisher", () => {
    const site = websiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(site.url).toBe(SITE.url);
    expect(site.publisher).toEqual({ "@id": `${SITE.url}/#person` });
  });
});

describe("blogPostingJsonLd", () => {
  const base = {
    title: "Welcome",
    description: "First post.",
    path: "/posts/welcome",
    published: new Date("2026-04-01T00:00:00Z"),
  };

  it("builds absolute URLs and ISO dates", () => {
    const post = blogPostingJsonLd(base);
    expect(post.url).toBe(`${SITE.url}/posts/welcome`);
    expect(post.datePublished).toBe("2026-04-01T00:00:00.000Z");
    expect(post).not.toHaveProperty("dateModified");
    expect(post).not.toHaveProperty("keywords");
  });

  it("adds modified date, keywords, and image when present", () => {
    const post = blogPostingJsonLd({
      ...base,
      updated: new Date("2026-05-01T00:00:00Z"),
      tags: ["astro", "writing"],
      image: "/og/welcome.png",
    });
    expect(post.dateModified).toBe("2026-05-01T00:00:00.000Z");
    expect(post.keywords).toBe("astro, writing");
    expect(post.image).toBe(`${SITE.url}/og/welcome.png`);
  });
});

describe("jsonLdSerialize", () => {
  it("wraps a single item with @context, no @graph", () => {
    const out = JSON.parse(jsonLdSerialize(personJsonLd()));
    expect(out["@context"]).toBe("https://schema.org");
    expect(out["@type"]).toBe("Person");
    expect(out).not.toHaveProperty("@graph");
  });

  it("wraps multiple items in @graph", () => {
    const out = JSON.parse(jsonLdSerialize([websiteJsonLd(), personJsonLd()]));
    expect(out["@graph"]).toHaveLength(2);
  });

  it("escapes < so payloads cannot close the script element", () => {
    const serialized = jsonLdSerialize(
      blogPostingJsonLd({
        title: "</script><script>alert(1)</script>",
        description: "x",
        path: "/posts/x",
        published: new Date("2026-01-01T00:00:00Z"),
      }),
    );
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });
});
