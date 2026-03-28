# Applied Learning — Life Skills as Math Context

**Date:** 2026-03-28
**Status:** Approved

## Summary

Expand Paadam beyond abstract math by weaving real-world life skills INTO math practice. Instead of "What is 1/2 + 1/4?", the kid gets "Chef Ada's recipe needs 1/2 cup flour and 1/4 cup sugar. How much total?" The life skill is the context; math is the engine. The adaptive engine personalizes which context each kid sees based on theme affinity, exposure history, and the 80/20 balance rule.

## Motivation

Abstract math drills are the #1 cause of disengagement in K-5 learning apps. Applied Learning makes math feel useful — kids learn fractions by cooking, addition by shopping, percentages by reading nutrition labels. Parents see dual value: "my kid practiced fractions AND learned about nutrition." No major competitor does this with per-kid personalization.

## Architecture

### Two-Part Knowledge System

**Part 1: Life Skill Graph (static, in code)**

A typed constant mapping base skills to life skill applications by grade range. Lives in `constants/lifeSkillGraph.ts`.

```typescript
interface LifeSkillApplication {
  id: string;
  baseSkill: string;            // e.g., "fractions", "addition"
  lifeSkillDomain: LifeSkillDomain;
  gradeRange: string[];         // e.g., ["3", "4", "5"]
  promptGuidance: string[];     // hints for the AI generator
  exampleContext: string;       // e.g., "doubling a cookie recipe"
  answerType: 'integer' | 'decimal' | 'fraction';
  locale: string;               // default "en-US", extensible
}

type LifeSkillDomain =
  | 'money'      // Money & Finance
  | 'cooking'    // Cooking & Recipes
  | 'time'       // Time & Planning
  | 'nutrition'  // Nutrition & Health
  | 'shopping'   // Shopping & Consumer
  | 'environment'; // Environment & Nature
```

**Part 2: Per-Kid Exposure Record (Firestore, on StudentProfile)**

```typescript
interface LifeSkillExposure {
  [domain: string]: {
    timesExposed: number;
    lastSeenAt: Date | null;
    engagementScore: number;  // 0-1, derived from completion rate + accuracy
  };
}
```

Added as `lifeSkillExposure` field on `StudentProfile`. Defaults to empty object for new students.

### How the Adaptive Engine Uses It

**Mode-dependent density (per strategist recommendation):**

| Mode | Life Skill Density | Rationale |
|------|-------------------|-----------|
| **Practice** | 0% | Skill drilling — minimize cognitive load |
| **Explore** | 100% | Narrative arcs ARE the applied learning vehicle |
| **Challenge** | 50% (toggle) | Optional "Real-world problems" toggle |

**Explore mode flow (enhanced):**

1. Engine determines base skill to practice (existing `skillsMastery`)
2. Engine reads theme affinities (existing `themeAffinities`)
3. **NEW:** Engine queries life skill graph for valid applications of this base skill at this grade
4. **NEW:** Engine reads `lifeSkillExposure` — finds least-exposed domains
5. **NEW:** 80/20 decision:
   - 80%: Pick life skill domain that aligns with kid's preferred themes
   - 20%: Nudge toward an unexposed domain
   - Hard rule: If base skill mastery < 40%, skip life skill context entirely (avoid cognitive overload)
   - Staleness guard: If a domain was used in 3 of last 5 sessions, force a different domain
6. Engine enriches the planner prompt:
   ```
   "Student needs fractions, likes dinosaurs, Grade 3.
    Apply through: cooking context (least exposed).
    Guidance: Use recipe doubling/halving, measuring ingredients.
    Answer type: fraction.
    Weave cooking naturally into a dinosaur theme."
   ```
7. LLM generates plan and worksheet (existing flow)
8. **NEW:** After completion, update `lifeSkillExposure` on student profile

### Launch Domains (3 for v1, expand to 6 in v2)

**v1 Launch:**
1. **Money & Finance** — Broadest math coverage (K-5), universal parent appeal
2. **Cooking & Recipes** — Best fractions vehicle, research-backed (Saxe, 1988)
3. **Time & Planning** — Fills K-1 gap, maps to elapsed-time standards

**v2 Expansion (4 weeks post-launch):**
4. Nutrition & Health
5. Shopping & Consumer
6. Environment & Nature

### Knowledge Graph Mappings (v1)

**K-1 (Ages 5-7)**
| Base Skill | Domain | Prompt Guidance |
|-----------|--------|-----------------|
| Counting | Money | Count coins in a piggy bank, count bills |
| Addition (1-digit) | Money | Add prices of toys, combine coins |
| Subtraction (1-digit) | Cooking | Started with 8 cookies, ate 3 |
| Telling time | Time | School starts at 8:00, wake up at 7:00 |
| Patterns | Time | Daily routine patterns, days of the week |
| Comparison | Money | Which toy costs more? How much more? |

**2-3 (Ages 7-9)**
| Base Skill | Domain | Prompt Guidance |
|-----------|--------|-----------------|
| Multi-digit add/sub | Money | Budget $50, items cost $12, $23, $8 |
| Intro fractions | Cooking | Recipe serves 4, need to serve 2 |
| Multiplication | Money | Each pack costs $3, want 4 packs |
| Elapsed time | Time | Movie starts at 2:15, ends at 4:00 |
| Measurement | Cooking | Recipe needs 2 cups, only have 1-cup measurer |
| Patterns | Time | Calendar patterns, schedule repetitions |

**4-5 (Ages 9-11)**
| Base Skill | Domain | Prompt Guidance |
|-----------|--------|-----------------|
| Fraction operations | Cooking | Triple this recipe: 2/3 cup flour times 3 |
| Decimals | Money | Sales tax 8%, item costs $24.50 |
| Multi-step problems | Money | Compare unit prices, calculate savings |
| Estimation/rounding | Time | Flight is 4h 47m, about how many hours? |
| Geometry (area/perimeter) | Cooking | Baking pan is 9x13, need to cover with foil |
| Division | Time | 180 minutes shared among 4 activities equally |

### Parent-Facing Touchpoints

**Touchpoint 1: Post-worksheet summary (v1)**
On the results screen, below the score, show:
> "Maya practiced fractions by helping Chef Ada double a pancake recipe. She got 4/5 correct!"

Implementation: Add `lifeSkillContext` field to the `AdaptiveWorksheet` schema. The planner generates a one-sentence parent summary.

**Touchpoint 2: Life skill badges on Profile (v1)**
Horizontal row of domain icons on the Profile screen. Each fills in as the kid gets exposure. Empty badges create visual pull for the 20% nudge.

### Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Cognitive overload for struggling kids | Skip life skill context if mastery < 40% |
| LLM generates non-numeric answers | `answerType` field constrains generator; existing "answers must be numeric" prompt |
| Cultural assumptions (US currency) | `locale` field on graph entries, default "en-US" |
| Parent perception of "teaching" claims | Frame as "practiced math through X scenarios", not "learned X" |
| Theme fatigue | Staleness guard: if domain used 3 of last 5 sessions, force different domain |

### Data Model Changes

**StudentProfile (Firestore):** Add optional `lifeSkillExposure: LifeSkillExposure` field.

**AdaptiveWorksheet schema (Zod):** Add optional `lifeSkillDomain: string` and `parentSummary: string` fields.

**LearningPlan schema (Zod):** Add optional `lifeSkillDomain: string` and `lifeSkillGuidance: string[]` fields.

### Files Affected

**New:**
- `constants/lifeSkillGraph.ts` — Graph data + types + query helpers
- `components/profile/LifeSkillBadges.tsx` — Badge row for Profile screen

**Modified:**
- `types/adaptive-learning.ts` — Add `LifeSkillExposure` type to `StudentProfile`
- `types/adaptive-pipeline.ts` — Add life skill fields to `LearningPlan`
- `services/AdaptivePlannerService.ts` — Enrich planner prompt with life skill context
- `services/SignalAggregatorService.ts` — Include life skill exposure in student context
- `services/StudentProfileService.ts` — Update exposure after worksheet completion
- `app/profile.tsx` — Render `LifeSkillBadges`
- `app/attempt/[userWorksheetId].tsx` — Show parent summary on results screen

### Out of Scope (v1)
- Challenge mode "Real-world problems" toggle (v2)
- Weekly parent digest notifications (v2)
- Locale variants beyond en-US (v2)
- Domains 4-6 (Nutrition, Shopping, Environment) (v2)
- Post-generation answer validation (v2)
