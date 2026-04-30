---
title: "Launch day lessons (and a few tiny scars)"
description: "What launch week taught me: where things broke, what saved time, and the small habits that kept stress low."
date: 2026-04-26
slug: launch-day-lessons
tags: [site-news, devops, writing]
series: building-this-site
comments: true
---

Launch day was mostly calm.

Which is exactly how you know a lot of small panic happened earlier.

![Launch checklist illustration with completed tasks and one remaining writing item.](/images/series/launch-checklist.svg)

Here are the lessons I want to remember while they are still fresh.

## 1) The runbook is not documentation. It is insurance.

Writing `docs/LAUNCH-RUNBOOK.md` felt excessive while everything was
green locally.

Then real-world setup began:

- Cloudflare UI names had changed.
- A Worker was created by accident instead of a Pages project.
- `www` looked "stuck" even though DNS was already fine.

Because there was a checklist, these were detours, not disasters.

## 2) "One more tiny CI tweak" is rarely tiny

The quality gates paid off, but launch week still surfaced edge cases:

- action versions drifting with Node runtime changes,
- link-check exclusions that were valid pre-DNS and wrong post-DNS,
- artifact upload assumptions around hidden folders.

None of these were hard. All of them were annoying. Documenting each
fix immediately prevented repeat confusion.

## 3) Boring infrastructure wins

Cloudflare Pages + DNS + Email Routing + Analytics was not flashy.
That was the point.

I wanted:

- fast setup,
- low ongoing cost,
- clear rollback steps,
- no cookie banner.

It delivered exactly that.

## 4) Keep release energy for writing, not firefighting

The biggest surprise was emotional, not technical:

once the site was stable, the real work became obvious again:
write good posts.

Everything in this rebuild was meant to reduce friction between idea
and publish button.

Now the scaffolding is done. The interesting part starts.

Thanks for reading this build log. Next up: less "how the site works,"
more "what I’m actually thinking about."
