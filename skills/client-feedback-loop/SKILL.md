---
name: client-feedback-loop
description: Post-ship autonomous client-feedback loop for the website-studio harness — generates a short client-facing feedback form, ingests the client's real response, routes it as a capped (max 2 round) fix list to owner agents, and re-ships. Use after a studio run has shipped and the user wants the actual client to react, not another internal gauntlet round. Complements studio-evolve (which is for the studio owner reviewing gates mid-run); this is for the paying client reviewing the finished thing.
---

# Client Feedback Loop

The gauntlet and `studio-evolve` measure craft floors and calibrate the studio's
own taste against the studio *owner's* taste. Neither one ever asks the person
who is actually going to use or pay for the site. This skill closes that last
gap, autonomously, with a hard cost ceiling so it can't turn into an
open-ended free redesign.

## When to use
- A `_workspace/12_ship-report.md` exists (the run has shipped).
- The user says "get client feedback", "send this to the client", "run the
  feedback loop", or a filled feedback response already exists at
  `_workspace/13_client_feedback/response-round-N.md` and needs to be acted on.

## Protocol

### Step 1 — Generate the feedback request (once per round)
Produce `_workspace/13_client_feedback/request-round-N.md`: a short, non-technical
form the client can fill in under 5 minutes. Reuse `studio-evolve`'s shared
dimensions (distinctiveness, typography & layout craft, copy voice, motion
feel, imagery & brand coherence, the "$10K test") scored 1-10, plus:
- 2-3 open questions keyed to this project's `00_PROJECT_CONTEXT.md` deciding
  questions (§6 of the client intake, if it exists) — "could you find X on the
  page?"
- One free-text field: "what's the first thing you'd change?"
- Explicitly non-technical language — the client is not expected to know what
  a hero section or a signature moment is.

Hand this to the user to send however they send things to their client (email,
share link, whatever) — this skill/CLI does not have a channel to the client.
Nothing else happens until a filled response comes back.

### Step 2 — Ingest the response
When `_workspace/13_client_feedback/response-round-N.md` exists (client's raw
answers, any format — free text is fine), convert it into a ranked fix list in
the same shape as a gauntlet scorecard: severity (BLOCKER/MAJOR/MINOR — a
client "I hate this" on the hero is a BLOCKER even if the gauntlet passed it),
file/section, defect as the client described it (don't editorialize away their
actual words), fix direction, owner agent. Write to
`_workspace/13_client_feedback/round-N-fixlist.md`, first line exactly
`VERDICT: ITERATE` or `VERDICT: PASS` (PASS only if every scored dimension is
≥8 and there's no open blocker/major in the free text — otherwise ITERATE).

**Do not silently reinterpret a client's dislike as a misunderstanding to be
argued away.** If the client is factually wrong about something (a feature
that already exists), note that in the fixlist as a communication gap, but
still surface it — don't just suppress the finding.

### Step 3 — Fix, capped
Dispatch the fixlist to owner agents exactly like a gauntlet ITERATE round
(`frontend-artisan`, `motion-choreographer`, `story-copywriter`,
`visual-asset-director`, `design-systemist` — each touches only its own
findings). **Maximum 2 client-feedback rounds total**, matching the harness's
existing bounded-iteration discipline (gauntlet caps at 4, studio-evolve caps
harness changes at 3). If round 2 still isn't a client PASS, ship anyway with
the open items stated honestly in an updated `12_ship-report.md` — never
silently relabel client dissatisfaction as resolved.

### Step 4 — Re-ship
After fixes land, re-run `p9_ship` (polish + ship report) with an added
section: "Client feedback round N: what changed, what's still open." Append a
row to `_workspace/11_evolution/ledger.md` if that file exists — client rounds
are exactly the kind of real-world signal the calibration experiment is built
to learn from, even outside formal evolution mode.

## Rules
- This is a fix loop, not a redesign loop. If round-1 client feedback reveals
  the direction itself is wrong (not an execution gap), that's a `STRUCTURAL`
  finding — stop, don't spend a fix round patching around a wrong concept, and
  tell the user directly that this needs a new Phase 3 direction pass.
- Every client round is logged, cost and rounds counted — this loop is
  bounded specifically so it can't become the free-form "just one more
  tweak" spiral that swallows budget with no ship discipline.
- Never fabricate a client's response. If no response file exists, the loop
  stops at Step 1 and waits — it does not simulate client feedback.
