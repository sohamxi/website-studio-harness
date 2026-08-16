---
name: asset-art-direction
description: Image-generation prompt engineering and set-consistency rules for website assets. Load before generating, sourcing, or reviewing ANY site imagery — hero images, section backgrounds, textures, OG images, favicons, video loops — and whenever imagery "reads as AI-generated", a new asset is requested, or an existing set needs extending. Pairs the gpt-image-2-style-library templates with Higgsfield generation and DESIGN.md treatment rules.
---

# Asset Art Direction

Great sites don't have good images; they have one photographic idea executed consistently. This skill turns DESIGN.md into generation prompts that come back on-brand, and keeps the set coherent.

## 1. Order of operations
1. **Audit** (via `atelier:asset-direction`): list every asset the layout archetypes require → client-supplied / generate / draw-as-geometry / cut. Cut aggressively — a texture the design survives without is noise.
   **The shot list must cover three tiers** (Slow Waves run-1 BLOCKER: a detail-only set never showed the visitor where they were):
   - **Establishing** — at least one site-in-context frame ("where am I"): the place in its landscape, the building among its surroundings.
   - **Place/room** — one frame per named space or product the copy sells.
   - **Detail** — texture and material close-ups, plus **one frame per asserted copy fact** (an "outdoor shower" in the copy needs an outdoor shower in the set).
   Banning a category's clichés (drone shots, turquoise pools) must never quietly become banning the category — spec the non-cliché version of the establishing shot instead.
   **Sufficiency is coverage by function, not count** (run-1 calibration + codex review): the set must serve every function the visitor needs — the offering itself (each room/product category, with a small gallery where categories exist), the place, amenities/experiences, **people and life** (tasteful human presence when the register calls for it — an unpopulated set reads as a rendering), proof, and the booking/act moment. Consistency and no-tells are floors; a set can pass both and still be *thin*. When the register calls for life, include at least one **motion asset** (ambient video loop, generated or sourced). And plan **asset-driven interactions** at direction time, not as decoration: carousels/galleries, hover-reveals, scroll-linked sequences, image-led transitions — how assets are *used* separates 9+ reference sites from consistent-but-static sets. Benchmark the register against the client's own reference sites when supplied.
2. **Identity before imagery**: brand mark, favicon, and wordmark are geometry (SVG spec via `atelier:brand-director`), never generated raster. Generated logos die at 16px and carry artifacts.
3. **Write the set spec** (once per site, before any prompt): grade, grain, light logic, lens language, palette temperature — derived from DESIGN.md's asset treatment rules.
4. **Generate per-asset prompts** from the set spec (below), batch via Higgsfield, review as a set.

## 2. Prompt construction
Build every prompt in four bound layers — never freehand:

| Layer | Source | Example |
|---|---|---|
| Template | `gpt-image-2-style-library` — pick the matching category/style tag, reuse its structure and note its listed pitfalls | "editorial product still life, single subject…" |
| Set spec | your set spec, pasted verbatim into every prompt of the set | "muted warm grade, visible 35mm grain, single soft key light from left, shallow depth" |
| Subject | this asset's content, concrete nouns only | "anodized aluminum audio interface on travertine" |
| Negative space & crop | where the layout needs text/UI room | "upper third empty, horizontal composition, subject lower right" |

Rules:
- One set spec per site. Vary only the subject layer between assets — that is what makes six images read as one shoot.
- Concrete nouns beat adjectives ("travertine, 5pm side light" > "premium, elegant").
- Text in images: never. Typography is HTML.
- Humans: avoid unless the brief demands them; if so, no direct-to-camera stock smiles, hands out of frame or verified.

## 3. Generation mechanics (Higgsfield MCP)
- Multiple assets → `generate_image_batch` + `jobs_wait`, then one `show_generation_by_ids`; unsure about model → `models_explore(action:'recommend')`.
- Edits to an existing asset use the dedicated tool, not regeneration: `upscale_image` (2K/4K for heroes), `outpaint_image` (need more canvas), `reframe` (aspect), `remove_background` (cutouts).
- Generate 2–3 candidates per hero-tier asset; one for supporting textures.

## 4. Set review (non-negotiable)
After generation, spawn `atelier:art-director` over the **entire set** (including client-supplied photos). Accept/reject at set level — and gate on **coverage against the three-tier shot list**, not only on grade consistency: a perfectly consistent set that never establishes the place fails the review. Known tells to kill on sight: mismatched grades between images, hex-perfect gradient skies, melted or pseudo-text, impossible reflections/shadows, over-symmetric composition, plastic skin.

Two rejections on the same axis → change the set spec's grade/lens language, not the seed.

## 4B. The render loop (cycle-2 calibration: "good render" ≠ "editor's pick")
A single accepted render per prompt caps quality at "fine." Hero-tier assets go through a loop:

1. **Research the true form first.** Before prompting anything culturally or materially specific (a bread, a boat, a roof, a garment), state its distinguishing physical facts in the prompt ("poee: round, flat, pocketed, bran-dusted, blistered — not a European roll"). The model defaults to the global generic; naming the true form is what prevents it. If you don't know the true form, look it up before generating.
2. **Speak cinematographer, not adjective.** Lens focal length and aperture (35mm f/4, 50mm f/2.8), film stock (Portra 160/400 for this register), light direction and hour, camera height, atmospheric layers (mist, backlight, wet ground). "Premium, elegant" produces stock; "28mm low to the ground, long palm shadows striping toward camera, hazy backlight" produces a frame.
3. **2–3 candidates per hero-tier asset**, varying one axis deliberately (angle, hour, distance) — never identical rerolls.
4. **Evaluate against a rubric, in writing:** subject fidelity (is the thing the *true* thing?), light logic, grade match to set, composition for its slot, believability (tells), and the **photo-editor test: would a campaign editor run this frame, or is it merely correct?** Score each candidate; pick or reject all.
5. **Re-prompt diagnostically.** When a render fails, name *which prompt layer* failed (subject / set-spec / composition / camera) and change that layer specifically. Re-rolling an unchanged prompt is not iteration.

## 4C. Motion assets (loops)
- Ambient loops must be **seamless**: either palindrome them (forward + reversed concat, trim one duplicate frame — water, foliage, smoke, rain all survive reversal) or crossfade tail into head. A visible restart breaks the spell and reads cheaper than no video at all.
- Integrate with a poster of the identical frame and a slow opacity fade-in gated on `playing`, so the still-to-motion handover is imperceptible. Always compress for web (target < 2MB; crf ~26, scaled to display size, `-movflags +faststart`, no audio track).
- Reduced motion and small screens keep the still. The loop is a grace note, not a dependency.

## 5. Manifest
Every asset ships with its provenance in `_workspace/07_assets/manifest.md`: id, section, source, exact prompt, model, candidates considered, verdict. Why: re-runs and extensions must reproduce the set, and the gauntlet audits imagery against the manifest.

## 6. Fallbacks
- Generation down → finished prompts marked `PENDING-GENERATION` + geometry/gradient placeholders in DESIGN.md palette. Never gray boxes, never unsplash-random.
- OG image: compose in code (brand mark + headline on token background) before reaching for generation — it's sharper and always on-brand.
