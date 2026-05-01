---
title: "Everything works. Until it doesn't."
description: "AI is good at generating the happy path. But real software lives in delays, retries, partial failures, and assumptions that eventually break. Reliability begins where the happy path ends."
date: 2026-05-02
slug: everything-works-until-it-doesnt
tags: [architecture, devops, ai]
series: software-engineering-and-ai
comments: true
---

![Editorial illustration of a clean confident paper path running into the foreground, then unraveling into broken bridges, fissures, and dead-ends in the distance — suggesting that software works on the happy path but lives in everything that happens after.](/images/posts/everything-works-until-it-doesnt/cover.webp)

Everything works.

Until it doesn't.

That's where engineering actually lives.

---

AI is very good at generating code that runs.

It compiles. It passes the tests it was asked to pass. The function returns the value it was asked to return.

In ideal conditions, the output looks finished.

But ideal conditions are not where software runs.

> The happy path is the demo. The system is everything else.

## The happy path is the easy part

Every piece of software has a path through it where everything goes
right.

The request arrives. The dependency answers. The user enters valid
input. The disk has space. The clock is correct. The cache is warm. The
third-party API is up.

That path is where AI shines. It is also the path that gets shown in
demos, screenshots, and tweets.

It is roughly five percent of the code's life.

## Real software lives in the unhappy paths

A real system is the sum of the things that go wrong, not the things
that go right.

- A request times out halfway through.
- The dependency answers, but slowly, and your retry logic answers it
  again.
- A user enters something the form did not anticipate.
- Two updates land in the wrong order.
- A migration runs against a row count nobody planned for.
- One clock somewhere is five minutes off.
- The queue backs up because a worker quietly died.

None of this shows up in a generated function. None of it has to. The
function did its job — in the conditions it was asked about.

## Failure modes are the actual API

![Editorial illustration of the clean front and the cluttered back of the same machine meeting at a central seam, suggesting that a system's real contract is what happens behind the polished surface.](/images/posts/everything-works-until-it-doesnt/failure-modes.webp)

A function's signature tells you what happens when things go right.

A system's signature is what happens when they don't.

What does the service return when its database is down? What happens to
in-flight requests during a deploy? Is the second click idempotent if
the first one timed out? Does the queue retry the message, drop it, or
quietly hold it forever?

Those answers are the real contract. Users feel them, oncall engineers
fight them, and the next team to touch the code inherits them.

That contract rarely emerges from generation. It emerges from design.

## Generated code rarely imagines what breaks

AI is very good at producing the next plausible token. It is much weaker
at imagining the next plausible failure.

Failure modes do not look like the training data. They look like an
empty array where one element was assumed, a network blip at the worst
possible millisecond, a customer with a name longer than a column.

You can ask AI for error handling, and you will get error handling —
usually a try/catch, a sensible-looking log line, a fallback value. That
covers the failure modes the model has seen named in code.

It does not cover the ones nobody named.

The ones that come from your particular system, your particular load,
your particular users, your particular history.

## Reliability is a design choice, not a feature

This is the part that often surprises people new to production:

> Reliability is not something you bolt on later.

It is a property of the shape of the system.

Idempotency is a shape the system has, or it does not. Backpressure, the
same. So with timeouts, circuit breakers, bounded queues, tiered
retries, graceful degradation, and deliberate failure isolation. None of
these are features you add at the end. They are decisions about the
joints.

You do not add reliability to a fragile system by writing more code. You
add it by changing the system's shape.

That work does not look like generation. It looks like sitting with a
diagram and asking, again and again, _what happens here when this
dies?_

## Experience is a library of failure modes

This is where seniority shows up most clearly.

Senior engineers are not faster typists. They are not better at syntax.
They are people who carry a library in their head — a long, hard-earned
catalog of ways systems break.

Cache stampedes. Thundering herds. Clock drift. Off-by-one in a
paginated cursor. The retry that turned one outage into three. A
migration that locked the wrong table. An SDK that swallowed errors. A
deploy that was technically backwards-compatible and operationally a
disaster.

You do not learn that catalog by reading. You learn it by being on the
other side of it.

AI does not have that catalog. Not really. It has a pattern of words
that have appeared near the word "outage" in public text. That is not
the same thing.

## The work moved into the unhappy paths

The first essay in this series argued the work moved from typing to
thinking. The third one argued it moved further still — into framing
and judgment.

This is where the rest of it went.

If AI handles more of the happy path, then the engineer's leverage is
not in writing the path itself. It is in everything the path does not
see — the failure surface, the operational shape, the degradation
strategy, the question of what the system does when one of its
assumptions turns out to be wrong.

The job did not get easier. It moved into the harder half.

## Final thought

AI can generate code that works in ideal conditions.

Software, however, does not run in ideal conditions. It runs in
production — under load, across time zones, against real users, on
infrastructure that occasionally lies. It runs in the gap between what
the code assumes and what the world actually does.

Engineering is the work of closing that gap.

Reliability does not begin where the happy path begins. It begins where
the happy path ends.
