# Project Input Contract

> Canon for every studio run. Supplied by the studio owner 2026-08-16. Phase 0/1 executes this contract before any creative work.

Every website begins with a project-specific input object. The pipeline must never behave as though it is designing for a generic company. All creative, narrative, visual, interaction, content and technical decisions must derive from the specific organization, audience, offering and goals.

## 0. Project variables (the PROJECT object)

The orchestrator receives some or all of: **core identity** (company_name, short name, sector, industry, company_type, stage, year_founded, geography: primary_market / operating_regions / languages) · **what the organization does** (one_line_description, products[], flagship_product, business_model, differentiators[], proof_points[], mission, vision, values[]) · **audience** (primary_audience {description, motivations, fears_or_objections, sophistication_level}, secondary_audiences[], desired_perception[], undesired_perception[]) · **website objective** (website_type: corporate/product/launch/campaign/portfolio/ecommerce/editorial/institutional, primary_goal, secondary_goals[], primary_cta, secondary_cta, desired_user_actions[], success_metrics[]) · **brand** (existing_brand {exists: true/false/partial, guidelines, logo_assets, colors[], typography[], iconography, photography_style, illustration_style, existing_design_system}, brand_personality[], brand_tone, brand_constraints[], brand_freedoms[], brand_avoid[]) · **creative direction from user** (creative_guidance, desired_feeling[], visual_keywords[], experience_keywords[], motion_appetite: minimal/restrained/expressive/cinematic/immersive/experimental/infer, innovation_appetite: conservative/progressive/ambitious/experimental/infer, desired_premium_level: standard/premium/world-class/award-caliber, references[{url, reason}], disliked_references[{url, reason}]) · **competitive context** (competitors[], adjacent_brands[], category_conventions[], category_cliches_to_avoid[]) · **content** (content_status: final/partial/placeholder/needs_creation, supplied_copy, supplied_assets, required_pages[], required_sections[], required_messages[], required_proof[]) · **technical/operational constraints** (preferred_stack, framework, cms, integrations[], authentication_required, ecommerce_required, multilingual, accessibility_requirement [default WCAG AA], seo_priority, performance_priority [high by default], browser_support, device_priorities[], hosting_environment) · **business/legal** (deadline, compliance_requirements[], legal_disclaimers[], regulated_claims[]) · **special instructions** (must_include[], must_avoid[], user_notes).

## 1. Variables are allowed to be partial

Do not require every field. Classify each input internally as:
- **PROVIDED** — explicitly supplied; authoritative unless contradictory.
- **DERIVED** — reasonably inferred from supplied material or research; record the inference and confidence.
- **UNKNOWN** — cannot be responsibly established; do not fabricate.
- **RECOMMENDED** — a strategic choice proposed by the system; clearly distinguish recommendations from facts.

## 2. User input has highest authority

Explicitly provided facts, product details, brand requirements, mandatory colors, audience info, positioning, specific copy, required sections, compliance constraints, preferred technology, and desired creative characteristics become project constraints. Agents may challenge a constraint during strategic review when it substantially harms the outcome, but must never silently override. Surface conflicts as `USER CONSTRAINT` vs `SYSTEM RECOMMENDATION`.

## 3. Phase 0 — normalize the ask

Convert the raw request + PROJECT object into `_workspace/00_PROJECT_CONTEXT.md` — the shared source of truth for every downstream agent. It must contain: **Company** · **Offering** · **Audience** · **Business objective** · **Primary conversion** · **Brand** (existing identity + constraints) · **Creative ambition** · **Content reality** (exists vs must be produced) · **Technical reality** · **Non-negotiables** · **Open assumptions** · **Unknowns**.

## 4. Do not block the pipeline for non-critical missing information

Infer where safe → research where appropriate → make an explicit strategic recommendation → mark the assumption (value, status, confidence, rationale) → continue. Do not repeatedly ask questions the creative team can responsibly resolve itself.

## 5. Stop only for true blockers

A clarification is justified only when different answers cause fundamentally different products: ecommerce vs informational; which brand the project is for; whether an existing identity is legally locked; whether authenticated functionality is required; whether supplied copy is legally mandated. Everything else: professional judgment.

## 6. Every phase must read project context

No agent may begin from its phase instructions alone. Before execution every agent reads `00_PROJECT_CONTEXT.md` plus relevant upstream artifacts. Every output must answer: "Why is this correct for **this company, this audience and this objective**?" — not merely "Is this aesthetically good?"

## 7. Traceability

Important creative decisions trace to project inputs: `Decision: … / Reason: …` (e.g., "Avoid conventional enterprise-blue UI — user requested a warm, human brand; competitors overwhelmingly use blue"). This prevents arbitrary creative decisions.

## 8. The brand should change the website's DNA

Changing only logo, name, accent color, photographs, copy must **not** be enough to convert one generated website into another. Company context must materially influence: narrative architecture, page structure, visual metaphor, typography, spacing, image language, navigation, interaction model, motion temperament, density, content hierarchy, signature experience. A wildlife conservation institution, luxury hotel, AI infrastructure company, architecture practice and consumer fintech company must not emerge with the same skeleton.

## 9. Brand guidance strength levels

- **LEVEL 0 — no brand**: establish an appropriate digital visual language from first principles.
- **LEVEL 1 — light guidance** (logo, a color or two, personality words): ingredients, not a complete system.
- **LEVEL 2 — established brand**: extend into digital interaction and motion without redesigning the brand.
- **LEVEL 3 — strict system**: remain compliant; find originality through composition, storytelling, motion, interaction, pacing, spatial design. Do not confuse creative ambition with breaking brand governance.

## 10. Reference URL interpretation

A user-supplied reference site never means "make ours look like that." Translate it into admired qualities (craft, drama, editorial composition, storytelling, smoothness, interaction quality, motion, 3D, image scale, typography, pacing, originality, sophistication), document them as DERIVED if unstated, and create an original implementation appropriate to the PROJECT variables.

## 11. Project-specific success statement

Before Phase 1, write the **Experience Success Statement**:

> For **[primary audience]**, create a **[type of digital experience]** for **[company]** that makes them feel **[desired emotional response]**, clearly communicates **[core message/value]**, differentiates the organization from **[competitive/category context]**, and ultimately encourages **[primary action]**.

Every downstream creative decision must support this statement.

## 12. Project-specific creative north star

Phase 0 also generates `CREATIVE_NORTH_STAR` (yaml): company, audience, experience_thesis, desired_emotions[], business_goal, conversion, must_feel[], must_not_feel[], creative_ambition, motion_appetite, innovation_appetite, brand_strength (0–3), signature_opportunity (initial hypothesis). The North Star remains visible to every agent and the orchestrator.

## 13. Final principle

**Variables constrain the problem, not the creativity.** The objective is not to force every project through the same design machine — it is to give an elite multidisciplinary digital studio enough context to produce a website that feels as though it could only have been created for this specific organization.
