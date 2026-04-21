---
name: Applied Learning Strategy - Life Skills x Math
description: Strategic decisions for life-skill-contextualized math feature — domains, density, launch scope, risks, architecture
type: project
---

Applied Learning wraps math practice in real-world life skill contexts (cooking for fractions, money for addition, etc.).

**Domain decisions (2026-03-28):**
- Launch with 3 domains: Money & Finance, Cooking & Recipes, Time & Planning
- Expand to 6 within 4 weeks: add Nutrition & Health, Shopping & Consumer, Environment & Nature
- Cut entirely: Digital Literacy & AI (no math surface), Social Skills & Empathy (qualitative, forced connections)
- Deferred to v2: Safety & Awareness (limited math), Entrepreneurship (overlaps Money for K-3, only viable for 4-5)

**Density decisions:**
- Practice mode: 0% life skill context (pure skill drilling, reduce cognitive load)
- Explore mode: 100% life skill context (replaces fantasy themes as narrative vehicle)
- Challenge mode: 50%, kid-toggleable ("Real-world problems" on/off)

**Key constraints:**
- Mastery gate: No life skill context for base skills below 40% mastery (cognitive overload risk)
- Theme fatigue: If domain used in 3 of last 5 Explore sessions, force nudge to different domain
- Answer type enforcement: Each knowledge graph entry specifies answer type (integer, decimal, fraction)
- Cultural: Add locale field to graph (default en-US), don't build variants yet

**Architecture approach:** Enrich existing AdaptivePlannerService pipeline, no new services. Static knowledge graph in constants/, exposure tracking as field on StudentProfile, life skill domain added to LearningPlan schema.

**Why:** AI-personalized life skill context is genuinely novel in market — no competitor does adaptive per-kid selection. Prodigy uses fantasy (no parent value), Matific uses static curriculum (no personalization), Khan Kids has no context at all. Strong parent positioning: "practiced math AND learned about nutrition."

**How to apply:** All Explore mode work should use life skill domains as theme vocabulary. Knowledge graph is the source of truth for valid base-skill-to-domain mappings per grade band.
