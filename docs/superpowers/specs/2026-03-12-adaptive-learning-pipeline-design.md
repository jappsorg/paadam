# Adaptive Learning Pipeline — Design Spec

## Problem

Paadam generates worksheets using a basic config (grade, difficulty, subject, question count) with no personalization. The app has rich adaptive learning infrastructure in types and services (emotional tracking, skill mastery, character personalities, behavioral patterns) but none of it feeds into worksheet generation. Students get generic problems regardless of what themes, contexts, or approaches actually help them learn.

## Goal

Build an adaptive learning pipeline that:
1. Observes what works for each student (themes, contexts, teaching approaches) through implicit signals
2. Uses an LLM to plan pedagogically sound, personalized learning strategies
3. Generates worksheets woven into narrative arcs that make math feel like an adventure
4. Continuously adapts based on engagement, accuracy, emotional state, speed, and persistence

## Architecture: Dual-LLM Pipeline

The system uses two sequential LLM calls separated by a structured checkpoint.

### Flow

```
Kid taps "Start Adventure" or "Next Worksheet"
        │
        ▼
┌─────────────────────┐
│  Signal Aggregator   │ ← Pulls from existing services
│  Builds StudentContext│   (StudentProfile, Session, Character, ThemeAffinity, NarrativeArc)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  LLM Call 1: Planner │ ← Smaller/cheaper model (Haiku or SLM)
│  Outputs: LearningPlan│   Structured JSON via Zod validation
│  (theme, arc beat,   │
│   difficulty, pedagogy│
│   misconceptions,    │
│   character behavior)│
└─────────┬───────────┘
          │
          ▼ (if arc boundary → kid picks from 2-3 theme choices)
          │
          ▼
┌─────────────────────┐
│  LLM Call 2: Generator│ ← More capable model (Sonnet or equivalent)
│  Outputs: Worksheet   │   Narrative wrapper, themed questions,
│  with narrative,      │   character dialogue, arc hooks
│  themed questions     │   Zod-validated structured output
└─────────┬───────────┘
          │
          ▼
    Kid completes worksheet
          │
          ▼
    Signals feed back into Signal Aggregator
```

### Model Flexibility

The architecture is model-agnostic. The Planner outputs structured JSON (suitable for smaller/cheaper models) while the Generator needs more creative capability. The split allows using different models for cost optimization:
- Planner: Haiku, Gemini Flash, or any SLM that handles structured output
- Generator: Sonnet, Gemini Pro, or equivalent

To support weaker generators, the Planner's output schema is prescriptive — it includes detailed narrative beats, pedagogical guidance, and example question framing so the Generator has less creative lifting to do.

## Signal System & Theme Affinity

### Signal Sources

All signals are collected from existing services. No new tracking infrastructure needed.

| Signal | Source | Weight | Question |
|--------|--------|--------|----------|
| Accuracy | QuestionAttempt | 0.30 | Did the theme help them get it right? |
| Engagement | LearningSession | 0.25 | Did they finish? Did they want more? |
| Emotional | EmotionalState | 0.20 | Were they happy, curious, proud? |
| Speed | QuestionAttempt.timeSpent | 0.15 | Did they answer faster with this theme? |
| Retry | QuestionAttempt | 0.10 | Did they persist after mistakes? |

### Theme Affinity Score

```
themeScore = (accuracy × 0.30) + (engagement × 0.25) + (emotion × 0.20)
           + (speed × 0.15) + (retry × 0.10)
```

Each signal normalized to 0-1. Final score is 0-1.

**Per-skill granularity:** Theme scores are tracked per-skill, not globally. A kid might love cooking for fractions but prefer space for geometry. Data model: `themeAffinities[theme][skill] = score`.

**Time decay:** Exponential decay with ~2 week half-life. Interests change; scores adapt.

### Pivot Detection

Any 2 of these 5 triggers cause an arc pivot:
1. Completion rate drops below 60%
2. Frustration emotions in 2+ consecutive sessions
3. Speed increases 50%+ from rolling average (rushing = disengaged)
4. Accuracy drops 20%+ from rolling average
5. Kid explicitly asks for something different

**On pivot:** Current arc gracefully pauses ("The bakery will wait for you!"), theme affinity penalized, kid picks from 2-3 new adventure options, difficulty may adjust down.

## Narrative Arc Management

### Arc Structure (3-5 Beats)

Each arc is a short quest with narrative progression:

- **Beat 1 (Hook):** Set the scene, introduce the quest, easy problems to build confidence. "Chef Ada needs your help! The bakery has 3 orders..."
- **Beats 2-3 (Rising Challenge):** Difficulty ramps, new concepts introduced through story tension. "Oh no, we need to double the recipe! How much flour is half of..."
- **Beats 4-5 (Climax & Reward):** Hardest problems, story resolution, celebration moment. "The bakery is saved! You made 12 perfect cupcakes!"

### Arc Data Model

```typescript
NarrativeArc {
  id: string;
  studentId: string;
  theme: string;                    // "cooking"
  title: string;                    // "Chef's Kitchen Challenge"
  character: string;                // "Ada"
  targetSkills: string[];           // ["fractions", "measurement"]
  totalBeats: number;               // 3-5, set by Planner
  currentBeat: number;
  status: "active" | "completed" | "pivoted" | "abandoned";
  beats: [{
    position: number;
    worksheetId: string;            // links to generated worksheet
    narrativeSummary: string;       // "Helped Ada gather ingredients"
    cliffhanger: string;            // "But the oven is too hot!"
    skillsFocused: string[];
    completedAt: timestamp;
  }];
  narrativeContext: string;         // compressed running summary for Planner
  createdAt: timestamp;
  completedAt?: timestamp;
  pivotReason?: string;
}
```

### Arc Transitions

- **Natural completion:** All beats finished → celebration + XP bonus + character bond increase → kid picks next adventure from 2-3 curated options
- **Pivot (engagement drop):** Pivot triggers detected → arc gracefully pauses → theme affinity penalized → kid picks new adventure
- **Abandoned (long gap):** 7+ days idle → arc marked abandoned → fresh start with discovery on return

### Narrative Memory

The Signal Aggregator compresses arc history into a concise narrative context string (~200-300 tokens) for the Planner. This keeps prompts small for SLMs while providing continuity.

```
"Active arc: Chef's Kitchen Challenge (cooking).
  Beat 2 of 4 complete. Ada is the guide.
  Story so far: Helped Ada gather ingredients, mixed the batter.
  Cliffhanger: The oven temperature needs to be set — fractions!
  Skills covered: addition, basic measurement.
  Next skill target: fractions (intro).
  Past arcs: Dino Explorer (completed, 5 beats), Space Cadet (pivoted at beat 2)."
```

## Character Integration

Characters (Ada the owl, Max the puppy, Luna the cat) serve as **narrators/guides within the arc**, not separate from it. "Luna leads you through the Enchanted Garden."

The adaptive system selects the best character independently from the best theme. A kid who responds well to Max's energy shouldn't be locked into action themes if they need a calm cooking arc. Character effectiveness data (already tracked via `PersonalityEffectiveness`) informs the Planner's character selection.

## Cold Start & Discovery Quest

### Phase 1: Parent/Caregiver Input (During Signup)

One new screen added to onboarding (~30 seconds):
- **"What does [child name] love?"** — Pick 2-3 from visual icons: Dinosaurs, Space, Cooking, Animals, Sports, Fantasy, Art, Music, Ocean
- **"Any subjects they find tricky?"** — Optional multi-select of math subjects

This seeds initial theme affinities at 0.5 (neutral-positive) instead of 0.0 (unknown).

### Phase 2: Discovery Quest (First Session, 3 Worksheets)

Framed as a fun intro adventure, not a placement test. The character guides the kid through it.

1. **Worksheet 1 (Theme Discovery):** Parent's top theme pick, easy difficulty, core skill for grade. Measures baseline accuracy, speed, engagement.
2. **Worksheet 2 (Theme Contrast):** Different theme, same skill, slight difficulty bump. Compares theme preference signal vs worksheet 1.
3. **Worksheet 3 (Skill Probe):** Best-performing theme so far, mixed difficulty (easy + medium + 1 hard), tests adjacent skill. Measures skill level, difficulty sweet spot, persistence.

**After discovery:** The system has theme affinities with real data, skill baselines, difficulty calibration, emotional baseline, and speed baseline. Enough to start the first real narrative arc.

**Principles:** Make it feel like play, not assessment. Start easy. Give a win in the first 2 minutes. Celebrate everything. Never call it a "test." Don't show scores during discovery.

## Codebase Changes

### New Services

| Service | File | Purpose |
|---------|------|---------|
| SignalAggregatorService | `services/SignalAggregatorService.ts` | Pulls from existing services, builds StudentContext |
| ThemeAffinityService | `services/ThemeAffinityService.ts` | Per-skill theme scores, decay, penalization |
| NarrativeArcService | `services/NarrativeArcService.ts` | Arc CRUD, beat tracking, pivot/complete/abandon lifecycle |
| AdaptivePlannerService | `services/AdaptivePlannerService.ts` | Orchestrates dual-LLM pipeline, pivot detection, theme curation |

### Modified Services

| Service | Change |
|---------|--------|
| WorksheetService | Add `generateFromPlan(plan)` method. Existing `generateWorksheet(config)` preserved for manual mode. |
| SessionService | On `endSession()`, call `ThemeAffinityService.updateAffinityFromSession()` and `AdaptivePlannerService.detectPivotNeeded()`. |

### New Types

```typescript
// types/adaptive-pipeline.ts

StudentContext {
  studentId: string;
  grade: string;
  character: string;
  skillMastery: Record<string, SkillMastery>;
  themeAffinities: Record<string, Record<string, number>>;
  activeArc: NarrativeArc | null;
  recentEmotions: EmotionalState[];
  frustrationTriggers: string[];
  misconceptions: string[];
  learningVelocity: string;
  arcHistory: ArcSummary[];
}

LearningPlan {
  theme: string;
  arcTitle: string;
  arcBeat: { position: number; totalBeats: number; narrative: string; cliffhanger: string };
  subject: string;
  difficulty: string;
  pedagogicalStrategy: string;
  misconceptionsToAddress: string[];
  characterBehavior: string;
  emotionalTone: string;
  questionGuidance: string[];
  themeChoicesForKid?: string[];
}

ThemeAffinity {
  theme: string;
  skillScores: Record<string, number>;
  lastUsed: timestamp;
  totalSessions: number;
}

PivotDecision {
  shouldPivot: boolean;
  triggers: string[];
  confidence: number;
}
```

### UI Changes

| Screen | File | Change |
|--------|------|--------|
| Theme Picker | `app/theme-picker/index.tsx` | New. 2-3 adventure cards at arc boundaries. |
| Onboarding Preferences | `app/onboarding/preferences.tsx` | New. Visual icon grid for theme interests + optional subject difficulty. |
| Worksheet Screen | `app/[type]/index.tsx` | Modified. Add "Start Adventure" mode, arc progress display, narrative context before questions. |

### New Firestore Collections

- `users/{uid}/narrative_arcs/{arcId}` — Arc state, beats, narrative context
- `users/{uid}/theme_affinities/{themeId}` — Per-theme, per-skill affinity scores

### Untouched

AuthService, StorageService, CharacterService, StudentProfileService (read from, not modified), all existing types in `adaptive-learning.ts` and `worksheet.ts`, design system, navigation, existing manual worksheet generation flow.
