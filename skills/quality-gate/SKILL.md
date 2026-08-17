---
name: quality-gate
description: Scoring rubric, thresholds, instrument protocol, and loop rules for judging whether a built site reaches $10K-agency quality. Load for every gauntlet round, whenever anyone asks "is this good enough / ready to ship", when scores stall, and for final ship sign-off. Defines PASS / ITERATE / STRUCTURAL / BLOCKED verdicts and the non-negotiable blockers.
---

# Quality Gate

The gate exists so "looks done" never substitutes for "is good". The panel behaves like a **hostile awards jury**, not a QA bot: award-style evaluation is multidimensional (CSS Design Awards frames quality as UI, UX, and innovation; Awwwards juries weigh design, usability, creativity, and content alongside animation, responsiveness, performance, semantics, and accessibility). Every juror's default position is *"this should not be shortlisted"* — the work earns its score by surviving that argument. One verdict per round, evidence first, fix list ranked.

## 1. Round protocol (order matters)
1. **Render** the site (Playwright or `/browse`); capture mobile (390px), tablet (768px), desktop (1440px) full-page screenshots + console errors. No render → verdict `BLOCKED`, stop.
2. **Instruments first, frozen before opinions**: ui-craft MCP `score_ui`, `check_anti_slop`, `tokens_lint`, `check_fold`, plus a **performance trace** (Playwright/Lighthouse): LCP, INP (or TBT as lab proxy), CLS against Core Web Vitals "good" thresholds — **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1** (defined at the 75th percentile in the field; lab numbers are the proxy). Record raw numbers in the scorecard. When available, add `/codex review` on the run's diff as an auxiliary instrument — an independent model with no authorship stake or shared aesthetic priors.
3. **Jury in parallel** (all `model: opus`), each charged to argue against shortlisting on their axis: `atelier:design-critic` (design/UI), `atelier:copy-critic` (content), `atelier:motion-director` (animation/interaction — reads motion code, screenshots can't witness motion), `atelier:craft-auditor` (technical craft, semantics), `atelier:a11y-auditor` (usability/accessibility). The reconciler asks each juror the jury question: *"Would this survive an Awwwards SOTD shortlist? Argue no, specifically."*
4. **Reconcile** into one 100-point score (weights below). Where juror and instrument disagree, investigate and say who was right.
5. **Verdict + ranked fix list**, each finding keyed to its owner agent with severity and fix direction.

## 2. Rubric (100) — award-jury axes
| Dimension | Pts | Judged by |
|---|---|---|
| Direction, creativity & innovation — one clear idea a jury would shortlist; experience arc delivered (emotional curve, scroll topology from `03B`); passes the "could this be any competitor's site?" test | 20 | design-critic + experience file audit + creative-director sign-off |
| Typography & layout craft — scale discipline, rhythm, hierarchy, fold economics | 15 | design-critic + `score_ui` + `check_fold` |
| Copy & content — register held, headlines specific, claims sourced, states authored, content worth reading | 15 | copy-critic vs `copy-craft` standards |
| Motion & interaction — one temperament, signature moment lands per its `03B` spec, compositor-first discipline, reduced-motion tiered | 15 | motion-director + motion notes |
| Imagery & brand — set coherence, no AI tells, mark survives 16px, **photo-editor test** (would a campaign editor run each hero-tier frame, or is it merely correct?), motion assets loop seamlessly | 10 | art-director verdict + manifest audit + render-loop records |
| System integrity — tokens only, both themes, no improvised values | 10 | `tokens_lint` + craft-auditor |
| Performance & semantics — CWV lab pass (LCP ≤ 2.5s, INP/TBT ≤ 200ms, CLS ≤ 0.1), semantic markup, payload sanity | 10 | performance trace + craft-auditor |
| A11y & robustness — keyboard paths, contrast, states, responsive without horizontal scroll (blockers below enforce the floor regardless of weight) | 5 | a11y-auditor + console |

## 2B. Constitution scoring (runs alongside the rubric)
All studio runs are also governed by `../website-studio/references/constitution.md` §14–§21:
- **12-dimension floor table** (§16): art direction, composition, typography, imagery, UX, motion, responsive, performance, implementation polish each ≥ 8.5/10; originality, narrative, accessibility ≥ 8.0/10. **Every dimension must clear its own floor — the average alone cannot pass.** Findings carry BLOCKER / MAJOR / MINOR / POLISH severity; no BLOCKER or MAJOR remains at shipment.
- **Jury perspectives** (§14): the panel must cover creative director, award jury, motion director, creative developer, accessibility critic, and **hostile user** (rapid scroll, back/forward, repeated menu, orientation change, resize, interrupted transitions, slow network, touch, odd content lengths).
- **The four tests** (§17–§20) on the ship round: memory test (what do critics remember after 3 minutes — must be the story/idea/moment, not "smooth scrolling"), screenshot test (5 random viewports each look composed), no-motion test (site remains excellent with animation disabled), originality test (swap logo/copy/imagery — does it resemble a famous site or template?).
- A critic never validates its own suggested fixes; fresh critics each round (§14, §16).

## 2C. Sufficiency & persuasion (run-1 calibration: defect floors ≠ desire)
Run-1 evidence: four juries scored 8.5 by verifying the absence of defects; the real user scored 7 because the site didn't create enough desire. The gauntlet therefore scores TWO separate things:
- **Craft floors** (everything above): slop, seams, contrast, performance — the absence of defects.
- **Sufficiency & persuasion** (this section): the presence of enough. In Phase 0B, derive the target visitor's **deciding questions** for the page kind and list them in `00_PROJECT_CONTEXT.md` (hospitality example: What are the rooms actually like? What will I eat? What is there to do? Where exactly is it and how do I get there? What does it roughly cost / how do I book? Can I see more? Can I trust it?). The ship round verifies each question is answered *on the page* with content and imagery, and asks the concrete desire test: **"Can the target visitor answer their deciding questions here, and is there a felt reason to act?"** A page can be defect-free and still fail this — that is a MAJOR, not a style opinion.
- Density/abundance register is **anchored to the audience's actual reference sites** (captured in Phase 0B/1), not to archetype priors; a DERIVED register inference (e.g. "silence is luxury") must be checked against those anchors before it shapes the design system.

## 3. Thresholds
- **PASS (ship-eligible)**: ≥ 85 total, no dimension below 60% of its points, zero blockers (below).
- **ITERATE**: < 85, or any dimension under its floor → ranked fix list, next round.
- **STRUCTURAL**: movement < 3 points across two consecutive rounds → the ceiling is in the direction, not the execution. Stop polishing; run `atelier:devils-advocate` against the direction and escalate to creative-director.
- **BLOCKED**: site doesn't build/render, or a blocker exists.

**Non-negotiable blockers** (fail regardless of score): fabricated claims/testimonials/logos; broken keyboard path on a primary flow; horizontal body scroll at any breakpoint; console errors on load; lorem or placeholder assets in a "final" round; `check_anti_slop` critical findings left standing.

## 4. Loop rules
- Max 4 scored rounds per run; if round 4 isn't PASS, deliver with the scorecard attached and the gap stated honestly — never relabel an 78 as done.
- Fix lists route to owner agents; the gauntlet never edits the site (judge ≠ builder).
- Round N+1 begins by verifying every round-N finding as fixed / regressed / open.
- Ship round additionally runs `ui-craft:finalize` and `/atelier:polish` (the cheap details always missing: favicon, OG, 404, selection color, focus rings, scrollbar).

## 5. Scorecard location
`_workspace/10_gauntlet/round-N-scorecard.md` — instrument table, panel summaries, reconciled score per dimension, verdict, ranked fix list, movement vs. previous round.

**Machine-readable verdict line:** the scorecard's FIRST line must be exactly `VERDICT: PASS`, `VERDICT: ITERATE`, `VERDICT: STRUCTURAL`, or `VERDICT: BLOCKED` (one token, nothing else on that line), before any prose. This is what lets the standalone `website-studio` CLI orchestrator (see repo root `src/`) parse the loop's outcome without an LLM in the loop; it costs nothing when a human or Claude Code is reading the file directly.
