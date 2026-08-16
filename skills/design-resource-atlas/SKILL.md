---
name: design-resource-atlas
description: Routing map of every installed design skill, MCP, agent, and registry for website work. Load whenever deciding WHICH tool to use for a design task — brief inference, references, tokens, typography, color, components, motion, imagery, copy, critique, QA, or shipping. Use for questions like "what should I use for X", before reaching for a default approach, and whenever a website-studio agent starts a phase. Also covers known gaps and fallbacks when a tool is down.
---

# Design Resource Atlas

One page: task → best installed resource. Load the target skill via the Skill tool; call MCPs directly. When two rows could apply, prefer the more specific one. Do not rebuild capability that exists in this table.

## Direction & taste
| Task | Use |
|---|---|
| Brief inference, design dials (variance/motion/density), anti-slop pre-flight | `design-taste-frontend` (tasteskill) — always first on a new brief |
| Discovery interrogation, 3 art directions, BRIEF/DESIGN authoring | `atelier:design-direction`, entry via `/atelier:brief` |
| Narrative concepts, story spine | `atelier:story-direction` / `/atelier:story` |
| Live references, current award sites | `atelier:reference-scout` agent; `/atelier:steal` for capture+extraction |
| Inspiration feeds | `mcp__claude_ai_21st-dev__get_inspiration` |
| Attack a locked direction | `atelier:devils-advocate` agent |
| Aesthetic-intent guidance while designing/building | `frontend-design:frontend-design` |
| Style/palette/font-pairing research database (79 styles, 192 palettes, 74 pairings, 119 UX guidelines) | `ui-ux-pro-max` — query it for candidates; the direction lock still decides |
| Brand voice, messaging frameworks | `brand`; logo/CIP/banner production → `design`, `banner-design` |

## Design system
| Task | Use |
|---|---|
| 3-layer token spine (establish/audit) | `ui-craft:tokens`; lint via `mcp__plugin_ui-craft_ui-craft__tokens_lint` |
| Typography: pairing, scale, micro-typography | `ui-craft:typeset` |
| Color strategy: concept-derived palette, restraint audit | `ui-craft:colorize` (audit for over-coloring — not a one-accent mandate) |
| Wireframe/state inventory before code | `ui-craft:shape` |
| Full spec-driven new surface | `ui-craft:sddesign` |

## Build
| Task | Use |
|---|---|
| Stack conventions, layout archetypes, anti-generic build rules | `atelier:award-grade-build` |
| Component search/generation | 21st.dev MCP (`search`, `generate`, `search_logo`); MagicUI MCP (`searchRegistryItems`, `getRegistryItem`) |
| shadcn/Radix component implementation patterns, dark mode | `ui-styling` |
| Library docs (Next.js, Tailwind, React) | context7 MCP (`resolve-library-id` → `query-docs`) |
| Non-happy states (loading/empty/error) | `ui-craft:unhappy`, `ui-craft:harden` |
| Responsive/touch/safe-area pass | `ui-craft:adapt` |
| Data viz of any kind | `dataviz` skill — before the first line of chart code |

## Motion
| Task | Use |
|---|---|
| Any Motion (`motion/react`) work — search docs first | Motion MCP `search-motion-source`/`search-motion-docs`, `generate-css-easing`; `motion` skill |
| 60fps mechanics, jank, FLIP | `web-animation-skills:60fps-animation` |
| Reduced-motion tiers | `web-animation-skills:accessible-animation` |
| Micro-interactions, page transitions, SVG, GSAP scroll | `web-animation-skills:micro-interaction` / `page-transition-animation` / `svg-animation` / `gsap-web` |
| Motion audit / MotionScore | `motion` skill audits; `motion-reviewer` agent for multi-file |
| Scroll-scrubbed cinematic hero | `atelier:cinema` / `atelier:cinematic-scroll` |

## Assets & brand
| Task | Use |
|---|---|
| Asset audit, source-vs-generate-vs-cut | `atelier:asset-direction` / `/atelier:assets` |
| Image prompt templates, style tags, pitfalls | `gpt-image-2-style-library` |
| Image/video/3D generation | Higgsfield MCP (`generate_image[_batch]`, `jobs_wait`, `upscale_image`, `remove_background`, `reframe`, `outpaint_image`) |
| Brand mark, wordmark, application rules | `atelier:brand-director` agent (geometry spec, never generated logo images) |
| Set-consistency review of imagery | `atelier:art-director` agent |
| Audio/voice | ElevenLabs MCP (`text_to_speech`, `compose_music`) |

## Copy
| Task | Use |
|---|---|
| Voice, headline systems, microcopy standards | project `copy-craft` skill |
| Full editorial layer authoring | `atelier:content-editor` agent |
| Slop hunt in copy | `atelier:copy-critic` agent; `ui-craft:clarify` for UX microcopy |

## Critique, QA, ship
| Task | Use |
|---|---|
| Full scoring loop | project `quality-gate` skill + `atelier:visual-gauntlet` / `/atelier:gauntlet` |
| Deterministic instruments | ui-craft MCP: `score_ui`, `check_anti_slop`, `tokens_lint`, `check_fold`, `acceptance_bar` |
| Visual critique / heuristic score | `atelier:design-critic` agent; `ui-craft:heuristic` |
| A11y beyond automation | `atelier:a11y-auditor` or `ui-craft:a11y-auditor` agent |
| Browser rendering/QA | Playwright MCP; gstack `/browse`, `/qa` |
| Final pre-ship gate | `ui-craft:finalize`; `/atelier:polish`, `/atelier:ship` |

## Second opinions & evolution
| Task | Use |
|---|---|
| Independent diff review, pass/fail (no shared aesthetic priors) | `/codex` review — auxiliary instrument in gauntlet rounds |
| Break a modified skill/agent file ("how would an agent still produce the defect?") | `/codex` challenge — after every harness change |
| Attack calibration hypotheses, cross-run continuity | `/codex` consult on the evolution ledger |
| Calibration loop, delta analysis, harness changes | `studio-evolve` skill — the protocol; benchmarks live in `benchmarks/` |

Cross-model agreement is a recommendation, never a decision — the user validates.

## Known gaps, conflicts & fallbacks
- **CoconutUI** is a component *framework*, not a skill — adopt it per-project as a dependency if a brief calls for it; the quarry rows above (21st.dev, MagicUI, shadcn) remain the default.
- **Naming conflict:** the installed `design-system` skill (ui-ux-pro-max bundle) overlaps `ui-craft:tokens`. For the studio pipeline, `ui-craft:tokens` + `tokens_lint` own the token spine; use the bundle's `design-system` only for its slide/spec templates.
- **ui-ux-pro-max is a research database, not an arbiter** — it proposes styles/palettes/pairings; DESIGN.md and the locked direction always win over its suggestions.
- Any MCP down → the owning agent's error-handling section names the fallback; always record the degradation in `_workspace/` notes.
- This atlas goes stale: when a new design skill/MCP is installed, add its row in the same commit.
