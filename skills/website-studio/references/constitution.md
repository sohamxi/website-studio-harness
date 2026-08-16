# Award-Caliber Digital Experience Constitution

> Canon for every studio run. Supplied by the studio owner 2026-08-16. Every agent reads this before its phase; the gauntlet enforces it.

## Mission

You are not building a competent website. You are building an **exceptional, memorable, highly crafted digital experience** that could credibly compete with work featured by Awwwards, CSS Design Awards, FWA, SiteInspire and elite digital studios.

The target quality is comparable to experiences such as Vantara, Active Theory, Locomotive, Immersive Garden, Resn, Dogstudio, Uncommon, Clay, BASIC/DEPT®, Studio Freight/Darkroom, Build in Amsterdam and similarly excellent contemporary digital work.

These references are **quality benchmarks, not templates**. Never imitate their branding, compositions, assets, copy, or signature interactions. Extract the principles behind their quality and create an original expression appropriate to the project's own story.

## 1. The primary rule

**The website must feel art-directed, not generated.** At every decision ask:

> Could an experienced creative director immediately recognize this as AI-generated or template-derived?

If yes, reject the solution. Common evidence of AI-generated design: generic centered hero; badge + giant heading + paragraph + two buttons; endless rounded cards; excessive gradients; arbitrary glassmorphism; feature grids with icons; identical section spacing; repeated Bento layouts; default shadcn composition; gratuitous animated text; random scroll effects; generic SaaS typography; stock-looking generated imagery; every section behaving independently; decorative motion without narrative purpose. These patterns are allowed only when the concept genuinely demands them.

## 2. Design the experience before designing sections

The site is not a collection of sections. It is a **continuous experience with an emotional arc**. Before UI implementation, define:

- **Experience thesis** — one sentence describing what the visitor should *feel*.
- **Emotional progression** — e.g. `arrival → curiosity → immersion → understanding → surprise → conviction → action`; must be project-specific.
- **Scroll topology** — conventional vertical, pinned cinematic sequences, horizontal passages, depth transitions, image-to-image transformations, spatial navigation, chapter transitions, continuous canvas scenes, editorial pacing, or combinations. Never choose a mechanism merely because it looks impressive.
- **Visual rhythm** — deliberate variation between dense/sparse, loud/quiet, large/intimate, moving/still, image/type, narrative/information, dark/light. Avoid repeating the same visual weight for consecutive sections.

## 3. Reference research must produce principles, not moodboards

Study ~5–8 world-class references, 2–3 adjacent-industry references, 2 unexpected references (architecture, film, publishing, fashion, games, exhibitions, installations, art, industrial design). For every reference identify: why it feels premium; information hierarchy; typographic behavior; composition system; image treatment; motion temperament; scroll behavior; transition vocabulary; navigation model; interaction details; technical mechanisms likely involved; what should **not** be copied.

Produce a **Reference Principle Matrix** — principles like "Large photography functions as environment rather than illustration", "Text appears only after visual context is established", "Transitions preserve spatial continuity rather than cutting between unrelated sections" — never "make ours look like X."

## 4. Concept before design system

The direction phase must produce three genuinely different **experience concepts**, not three color variations. Each must differ in: narrative metaphor, composition, typography, navigation, image behavior, motion language, page rhythm, interaction philosophy, signature moment. (Example axes: Living Editorial / Spatial Expedition / Organic Archive.)

The creative director must attack each concept: Why is this predictable? What looks derivative? Where is the surprise? What part would a user remember tomorrow? Could the concept survive with all animation removed? Does motion amplify the idea or hide a weak idea? Only then lock the direction.

## 5. Design system = rules for expression

DESIGN.md must define more than tokens:

- **Foundation**: spacing, grid, breakpoints, typography, radii, palette, elevation, media ratios.
- **Composition grammar**: alignment rules, intentional grid breaks, maximum text widths, image scale rules, overlap behavior, whitespace philosophy.
- **Typography behavior**: display/editorial/utility typography, responsive scaling, line-breaking strategy, tracking, capitalization, optical hierarchy.
- **Image language**: crops, aspect ratios, framing, subject positioning, grading, texture, contrast, depth, transitions; whether imagery behaves as content, environment, interface, or scenery.
- **Motion grammar**: temperament, easing families, entrance/exit behavior, scroll-linked behavior, hover behavior, cursor behavior, duration ranges, parallax depth rules, reduced-motion behavior.
- **Interaction grammar**: buttons, links, menus, media, navigation and cursor interactions must feel like members of the **same physical universe**.

Do not require exactly one accent color if the creative concept calls for something richer. Restraint is desirable. Arbitrary restriction is not.

## 6. Assets are art direction, not filler

Before generating assets, define a **visual production bible**: subject, environment, lens language, camera distance, depth of field, lighting, time of day, color science, texture, composition, negative space, subject placement, emotional tone, image continuity, exclusions.

Generate **sets**, not unrelated individual pictures — several images on one site must plausibly belong to the same campaign. Reject: obvious AI gloss, inconsistent lighting, impossible materials, hyper-saturated cinematic clichés, random camera perspectives, generic stock compositions. The visual-asset-director must perform a complete set review before approval.

## 7. Component libraries are raw material

Tailwind, shadcn, 21st.dev, MagicUI may accelerate implementation but must **never dictate the final visual identity**. Treat library components as raw engineering primitives; modification, rewriting and custom implementation are encouraged. Custom SVG, canvas, WebGL, shaders, Three.js/R3F, GSAP, ScrollTrigger, Web Animations, custom pointer interaction, masks, video compositing, scroll-linked image sequences may be used when they materially improve the concept. Do not introduce advanced technology solely to impress. The correct question: "What technical mechanism best expresses the creative idea while remaining performant?"

## 8. Build visual continuity

Sections must not feel mounted one below another. Transitions should answer: why does this next piece of content appear now? Prefer continuity mechanisms: an image becoming the next environment; typography transitioning into imagery; scale establishing spatial depth; shared objects crossing section boundaries; chapter markers; color-field transitions; geometry persisting between scenes; deliberate silence between major sequences. The entire site should feel choreographed as **one composition in time**.

## 9. Motion must have a temperament

Do not "add animations." Design **motion behavior**. Choose one dominant temperament (serene, elastic, mechanical, weightless, tactile, cinematic, playful, precise, organic); all interactions derive from it. Structure as micro motion (hover, focus, links, buttons, menus), meso motion (section reveals, galleries, type/image relationships), macro motion (page transitions, hero sequence, spatial transformations). Every project receives **one memorable signature interaction**. One. Everything else supports it.

## 10. Fluidity is a performance requirement

"Premium" means motion feels physically uninterrupted. Prefer compositor-friendly animation where practical; exceptions permitted for deliberate canvas/WebGL where experiential value justifies cost. Avoid: uncontrolled layout animation, competing RAF loops, scroll-handler thrashing, unnecessary React renders during animation, huge unoptimized textures, decoding large media during interaction, multiple independent animation clocks, expensive full-viewport effects without reason. Synchronize animation systems around a coherent frame lifecycle. Desktop beauty does not excuse mobile jank. **Mobile is an independently art-directed experience, not a compressed desktop site.**

## 11. Performance budget

Target field-quality Core Web Vitals: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**. Design graceful quality tiers: Tier A (powerful desktop — complete experience), Tier B (typical laptop/tablet — visually equivalent, reduced computational complexity), Tier C (mobile/low-power — simplified effects preserving art direction), Reduced motion (narratively understandable and visually complete without motion dependence). Do not create a "lite site" — create alternate implementations of the same idea.

## 12. Responsive design must be compositional

Never merely stack desktop columns. For major breakpoints reconsider: crop, typography, spacing, sequence, interaction, navigation, scroll behavior, density, visual hierarchy. A signature desktop interaction may become a different interaction on touch. Preserve the **idea**, not necessarily the implementation.

## 13. Copy and design are one system

Copy length affects composition; composition affects copy. Deck copy is semantically locked, but the build may introduce deliberate line breaks, responsive line-break variants, typographic grouping, display fragments, and semantic emphasis without changing meaning. Avoid generic AI phrases ("redefine what's possible", "where innovation meets…", "unlock the power of…", "built for the future", "seamlessly", "elevate your…", "transform your journey"). Language must sound specific to this organization.

## 14. The gauntlet must be brutal

The gauntlet is not bug QA — it is an attempt to **disqualify the website from excellence**. Fresh critics each round. Minimum perspectives: **Creative Director** (concept, identity, composition, memorability); **Award Jury** (design, UX/usability, originality, content, polish); **Motion Director** (choreography, easing, physicality, rhythm, scroll response, transition continuity, reduced-motion); **Creative Developer** (implementation quality, rendering, frame stability, responsive behavior, architecture, loading strategy); **Accessibility Critic** (keyboard, focus, screen-reader semantics, contrast, reduced motion); **Hostile User** (rapid scrolling, back/forward navigation, repeated menu opening, orientation change, viewport resize, interrupted transitions, slow network, touch, odd content lengths).

## 15. Visual QA requires real rendered output

Critics may not approve work by reading JSX or CSS. Inspect the actual rendered website. Capture: desktop hero, desktop full-page, tablet, mobile, navigation opened, hover states, complex interactive scenes, transition states. Record representative scroll-throughs; inspect movement, not merely screenshots. Perform screenshot comparison after fixes to detect visual regressions.

## 16. Gauntlet scoring

Score independently 0–10. **Every category must clear its individual threshold — overall average alone cannot pass.**

| Dimension | Required |
|---|---:|
| Art direction | ≥ 8.5 |
| Composition | ≥ 8.5 |
| Typography | ≥ 8.5 |
| Imagery | ≥ 8.5 |
| UX | ≥ 8.5 |
| Motion | ≥ 8.5 |
| Originality | ≥ 8.0 |
| Narrative | ≥ 8.0 |
| Responsive design | ≥ 8.5 |
| Performance | ≥ 8.5 |
| Accessibility | ≥ 8.0 |
| Implementation polish | ≥ 8.5 |

Any critic may issue BLOCKER / MAJOR / MINOR / POLISH. No BLOCKER or MAJOR may remain at shipment. After corrections, run another fresh gauntlet. Do not let the same critic validate its own suggested fixes.

## 17. The memory test

Ask five independent critics: "After browsing this website for three minutes, what three things do you remember?" If answers are primarily "smooth scrolling / nice typography / animations / big images", the concept has failed. They should remember: the organization, the central story, a distinctive visual idea, a specific interaction or scene, the desired emotional impression. Technology should disappear behind the experience.

## 18. The screenshot test

Randomly capture five viewport screenshots. Every screenshot should look intentionally composed. No filler sections, accidental whitespace, weak transitions, generic card walls, unresolved typography, arbitrary image crops. The experience cannot depend solely on movement to make weak static design feel interesting.

## 19. The no-motion test

Disable animations. The website must remain beautiful, legible, coherent, well composed, emotionally recognizable. Motion should multiply excellent design; it must never rescue mediocre design.

## 20. The originality test

Before final approval: if the logo, copy and imagery were replaced, would this immediately resemble another famous website or common template? If yes, revisit the concept. References influence standards of craft; they must not determine the outcome.

## 21. Definition of done

Not done because implementation is complete, sections exist, responsive CSS works, animations execute, or Lighthouse passes. Done only when:

1. The narrative is immediately understandable. 2. The experience has one unmistakable creative idea. 3. Visual language is consistent. 4. Static composition is excellent. 5. Motion feels intentional and physical. 6. Interaction feels coherent. 7. Desktop and mobile are independently polished. 8. The website remains usable without motion. 9. Performance remains excellent under realistic conditions. 10. Accessibility is intentional. 11. No obvious component-library aesthetic remains. 12. There is at least one moment worth remembering. 13. Critics can no longer identify a major weakness. 14. The experience feels authored rather than assembled.

The standard is not "This is a good AI-generated website." The standard is: **"This is excellent digital craft. How was this made?"**
