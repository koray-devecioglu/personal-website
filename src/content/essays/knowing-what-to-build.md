---
title: "Code is easy now. Knowing what to build isn't."
description: "AI made code generation cheap. The bottleneck moved upstream — to problem framing, constraint-setting, and the small decisions that decide whether what gets built was worth building at all."
date: 2026-05-01
slug: knowing-what-to-build
tags: [architecture, tooling, ai]
series: software-engineering-and-ai
draft: true
comments: true
---

The hardest engineering work happens before code exists.

It always has.

AI just makes it more obvious.

## The cheapest part of the job

For most of my career, the bottleneck was typing.

Now it isn't.

I can generate a working endpoint, a UI component, a migration, a
schema, a test — in minutes. Sometimes seconds.

That's a real shift. But it has a side effect people don't talk about:

> When generation gets cheap, the cost of building the wrong thing goes
> way down.

So it happens more often.

## What gets built when nobody framed the problem

Without a clear problem statement, AI will happily help you build:

- something nobody asked for
- something for the wrong audience
- a fix that solves the surface, not the cause
- a change that creates two new problems
- a duplicate of code that already exists somewhere

It will do all of this fast. Polished. Tested. Documented.

Speed is not the same as direction.

## Framing is the actual work

The work that matters most usually looks like this:

- understanding what someone is actually trying to do
- noticing what they didn't say
- finding the underlying problem behind the requested solution
- spotting the constraint everyone forgot
- asking the question that makes the rest of the work simpler

None of this shows up in a commit.

But it decides whether the commit was worth making.

## Constraints, not capabilities

A surprising amount of engineering is choosing what _not_ to build.

- this version doesn't need real-time
- this surface doesn't need to scale
- this tool doesn't need a UI
- this change doesn't need a migration
- this product doesn't need that feature

Subtraction is judgment work.

It's also the work AI is least useful for. AI optimizes for completion.
Engineering often requires the opposite — leaving things uncompleted on
purpose.

## The decisions inside the decisions

Every shipped feature is a chain of small decisions:

- what counts as done
- what error states matter
- what edge cases to ignore on purpose
- where to put the seam
- which tradeoff to accept now
- what to defer until later

These decisions don't show up in screenshots. But they decide whether
the thing holds.

A generated feature with the wrong decisions inside it is worse than a
slower, smaller feature with the right ones.

## Thinking looks like nothing

I've learned this the hard way: some of my best engineering decisions
did not produce more code. They removed code, delayed code, or changed
the shape of the problem entirely.

Clear thinking has no progress bar.

No commit count. No demo. No screenshot for the standup.

It's also uncomfortable, because the real questions are usually:

- am I building this for the right reason
- do I actually understand the problem
- is there a simpler shape I'm not seeing
- will this still make sense in three months
- what am I avoiding by jumping straight to code

Sitting with those questions feels less productive than typing.

It's the most productive thing you can do.

## What this looks like in practice

It's not a method. It's a habit.

Before opening the editor:

- write what the problem actually is, in plain language
- write what you're _not_ going to do
- write the constraint you're respecting
- write what done looks like

Then generate the code.

The whole point of generation getting cheap is that you can spend the
saved time deciding _what_ to generate, not _how_.

## Final thought

Generated code is fast.

Unclear thinking is slow no matter how fast you ship.

The new skill is not just writing code.

It is not even guiding AI.

It is the older, quieter skill that always made engineers good: knowing
what is worth building, and being clear enough to say so.
