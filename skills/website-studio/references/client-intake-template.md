# Client Intake Form

> Companion to `input-contract.md`. Fill what you can in under 10 minutes and hand
> this back before Phase 0 runs — every field you answer here is `CLIENT-PROVIDED`
> and overrides the studio's own `DERIVED` inference for that field. Skipping a
> field is fine; the studio will infer it and mark the inference `DERIVED`
> (visible, reversible) in `00_PROJECT_CONTEXT.md`. **The one section worth the
> most effort is §7, Reference Anchors — it is the single field whose absence
> caused the largest documented miscalibration in this harness's history (Run 1,
> "Slow Waves": −2.1 to −2.5 on composition/imagery from a wrong sparse-editorial
> guess). Five minutes here is worth more than any other field.**

Save the filled-in copy as `_workspace/00_input/client-intake.md` before starting
a run (`website-studio init --dir <path> --brief-file ...` still works the same
way; this file is additional, optional, and read first if present).

---

## 1. Who you are
- Company / project name:
- One-line description of what you do:
- Industry / sector:
- Stage (pre-launch / early / established / rebrand):
- Primary market / geography:

## 2. Who the site is for
- Primary audience (who, specifically — not "everyone"):
- What are they deciding when they land on this site? (e.g. "should I book this villa", "should I trust this vendor with our payroll")
- Their sophistication level (first-time buyer / informed comparer / expert):
- What objection or fear stops them converting?

## 3. What the site needs to do
- Website type (corporate / product / launch / campaign / portfolio / ecommerce / editorial / institutional):
- Primary goal (the one action that matters):
- Primary CTA (exact words if you have them):
- Secondary goals, if any:

## 4. Brand
- Do you have an existing brand (logo, colors, type, guidelines)? If yes, link/attach.
- Brand personality in 3-5 words:
- Anything the design must NOT do (colors to avoid, tone to avoid, category clichés you're sick of):
- Brand strength: none / light (a color or two) / established (full system, extend it) / strict (must stay compliant)

## 5. Content reality
- Do you have final copy, or does it need to be written from scratch?
- Do you have real photography/video, or does it need to be generated/sourced?
- Any facts, numbers, or claims that MUST appear verbatim (pricing, certifications, addresses)?

## 6. Deciding questions
List the 3-6 questions a real visitor needs answered before they'll act (this
becomes the sufficiency checklist the gauntlet scores against — a page can be
defect-free and still fail if these aren't answered on the page). Examples for a
hospitality site: "What are the rooms actually like? What will I eat? What's
there to do? Where exactly is it? What does it cost? Can I trust it?" — yours
will differ by category.
1.
2.
3.

## 7. Reference anchors — THE MOST IMPORTANT SECTION
List 3-5 websites (any category, not just competitors) and score each 1-10 for
how much you'd want your site to feel like it, with a one-line reason. This is
not "copy this" — it calibrates density, abundance, pacing, and tone against
your actual taste, not the studio's guess.

| Site (URL) | Score (1-10) | One-line reason |
|---|---|---|
| | | |
| | | |
| | | |

Optional: 1-2 sites you dislike / want to avoid resembling, and why.

## 8. Creative appetite
- Motion appetite: minimal / restrained / expressive / cinematic / immersive / experimental / let the studio infer
- Innovation appetite: conservative / progressive / ambitious / experimental / let the studio infer
- Desired premium level: standard / premium / world-class / award-caliber

## 9. Technical / operational constraints
- Preferred stack, if any (default is Next.js + Tailwind + shadcn/ui):
- CMS needed?
- Multilingual?
- Accessibility requirement (default WCAG AA):
- Anything else that's a hard constraint, not a preference:

## 10. Anything else
Free text — the thing that doesn't fit a field above but you'd tell a human
designer in the first five minutes of a kickoff call.

---

## For the studio (Phase 0 instructions)
Read this file before `00_PROJECT_CONTEXT.md` is built. Every filled field here
is `PROVIDED` (client-authoritative) per `input-contract.md` §2 — do not
silently override it. Every field left blank falls back to the normal
`DERIVED` / `RECOMMENDED` inference process, and the inference must be recorded
with confidence + rationale as usual. §7's reference anchors, if provided,
directly set the audience-density register (constitution §2 visual rhythm,
quality-gate §2C sufficiency) — do not let a DERIVED "less is more" instinct
override a client-scored anchor list.
