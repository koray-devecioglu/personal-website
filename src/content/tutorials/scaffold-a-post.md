---
title: "Scaffolding a new post in sixty seconds"
description: "Placeholder tutorial: how to use `pnpm new-post` to bootstrap any content type with valid frontmatter."
date: 2026-04-20
slug: scaffold-a-post
tags: [astro, tooling, writing]
draft: true
prereqs:
  [
    "Node 22 and pnpm 9 installed",
    "Repo cloned and `pnpm install` run at least once",
  ]
stack: ["astro", "typescript", "zod"]
---

<!--
  SAMPLE TUTORIAL — scaffold only. Replace before M9.
-->

1. `pnpm new-post --type essay --title "<something short>"` drops a
   file in `src/content/essays/` with the required frontmatter already
   filled in.
2. `pnpm dev` boots the site; the new post validates against the
   Zod schema on load.
3. When you're done drafting, drop `draft: true` and push.

Every flag is documented in `docs/CONTENT-GUIDE.md`.
