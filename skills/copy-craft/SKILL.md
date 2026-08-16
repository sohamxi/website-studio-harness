---
name: copy-craft
description: Creative-writing and prompt-engineering standards for all website copy — voice charters, headline systems, microcopy, banned slop patterns, and claim honesty rules. Load before writing or rewriting ANY site copy: headlines, hero text, section narratives, CTAs, empty/error states, alt text, or metadata. Also load when copy "feels generic", when a rewrite is requested ("punchier", "warmer", "more technical"), and during copy critique rounds.
---

# Copy Craft

Copy is designed, not filled in. Layout follows copy; a section built before its sentence exists will read like a caption. These are the standards every word on a studio site must clear.

## 1. Voice charter (write it before the first headline)
Derive from the brief + locked direction and record at the top of the copy deck:
- **Register**: one of severe / warm-expert / playful-precise / editorial / monumental — with two example sentences in it.
- **Person & tense**: who speaks ("we" the studio, "you" the reader, product-as-subject) — pick one, hold it everywhere.
- **Cadence**: sentence-length pattern (e.g., "short declaratives, one long sentence per section, no fragments in body").
- **Vocabulary poles**: 5 words this brand would use, 5 it never would.

Why: register drift between sections is the most common tell of generated copy. A charter makes drift checkable.

## 2. Headline system
- Draft **3 candidates per key headline** in distinct modes: (a) mechanism ("Renders your data as one system"), (b) point of view ("Dashboards lie by averaging"), (c) outcome-with-specificity ("Close the books in 3 days, not 12"). Mark the winner and why.
- The competitor test: if the headline works on a rival's site unchanged, it fails. Specificity comes from the product's actual mechanism, numbers, or opinion — not adjectives.
- Length discipline: hero ≤ 8 words at monumental scale, ≤ 14 otherwise; subhead carries the qualification, never the headline.

## 3. Banned patterns (auto-fail)
- Words: unlock, empower, seamless, supercharge, elevate, effortless, revolutionize, game-changing, next-level, "AI-powered" as a benefit.
- Structures: rhetorical-question heroes ("Ready to …?"), triadic em-dash constructions ("fast — simple — powerful"), "It's not just X, it's Y", benefit lists where every item starts with a gerund.
- Fake momentum: "Join thousands…" without a real number, countdowns without a real deadline, testimonials without a real person.

## 4. Claim honesty
- Every number, logo, quote, and superlative traces to the brief or a named source. Nothing invented — ever. Missing proof → write around it or flag `NEEDS-CLIENT-INPUT:` in the deck.
- Comparatives require a named comparison basis. "2× faster" than what, measured how — or cut it.

## 5. Microcopy & states
Every interactive surface has authored copy in the deck: button labels (verb + object, not "Submit"), form hints, validation errors (say what to do, not what failed), empty states (one line of orientation + one action), loading text, 404, alt text (describe function/content, not "image of"), meta title/description, OG title.

## 6. Prompt-engineering practice for copy generation
When any agent generates copy variants with a model:
- **Bind the charter into the prompt** — paste the register examples and banned list verbatim; "write in a professional tone" produces slop by definition.
- **Generate wide, select narrow**: ask for 5+ genuinely different candidates with the mode labeled (mechanism/POV/outcome), then choose; never accept a single-shot answer for a key line.
- **Iterate by constraint, not adjective**: "cut to 8 words, keep the number, drop the adjective" beats "make it punchier".
- **Show, then ask**: when escalating a register dispute, present two fully-written samples, one per register — decisions on samples are fast, decisions on descriptions are noise.

## 7. Deck format
Keyed by section id (stable across rebuilds):
```
## hero
headline: [winner]         # + 2 alternates below, modes labeled
subhead: …
cta-primary: …             # verb + object
states: {loading, error}
alt: {hero-img: …}
```
The build consumes deck copy verbatim. Trims are requested from the copywriter by section id, never made inline.

For full editorial authoring beyond these standards, delegate to `atelier:content-editor`; for adversarial review, `atelier:copy-critic`.
