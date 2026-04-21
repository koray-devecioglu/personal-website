---
title: "Astro 5's content layer takes a `loader`, not a folder"
description: "Placeholder TIL: the Astro 5 migration moved from implicit folder collections to explicit `loader` functions."
date: 2026-04-17
slug: astro-content-layer
tags: [astro, tooling]
sourceLink: https://docs.astro.build/en/guides/content-collections/
---

<!--
  SAMPLE TIL — scaffold only. Replace before M9.
-->

In Astro 4, a folder under `src/content/` was a collection by
convention. In Astro 5, you pick a loader explicitly — usually
`glob({ pattern, base })` — which means the content can live anywhere
the loader points at, including remote sources.

Small change, but it's the seam that makes bookmarks-from-a-JSON-feed
a realistic future feature without rewriting the schema layer.
