# Adaptive Learning Pipeline Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dual-LLM adaptive learning pipeline that personalizes worksheets using narrative arcs, theme affinities, and multi-signal observation — keeping the end-to-end flow working at every step.

**Architecture:** Two-stage LLM pipeline (Planner → Generator) fed by a Signal Aggregator that pulls from existing services. New services: ThemeAffinityService, NarrativeArcService, SignalAggregatorService, AdaptivePlannerService. New UI: onboarding preferences screen, theme picker, adventure mode in worksheet generator.

**Tech Stack:** TypeScript, Expo/React Native, Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), Zod, Firebase/Firestore, Jest, Playwright (E2E via MCP)

**Testing Strategy:**
- Unit tests via Jest for all new services
- E2E tests via Playwright MCP after each feature slice
- 3rd-grade test user agent for kid-facing UI feedback
- Parent agent for caregiver flow testing
- Every task produces a working app — no broken intermediate states

**Branch Strategy:** Create `feature/adaptive-learning-pipeline` from current `design-system-overhaul`. Incremental commits per task. Merge to main when complete.

---

## Chunk 1: Foundation — Types, ThemeAffinityService, NarrativeArcService

### Task 1: Create branch and new types

**Files:**
- Create: `types/adaptive-pipeline.ts`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feature/adaptive-learning-pipeline
```

- [ ] **Step 2: Create the new types file**

Create `types/adaptive-pipeline.ts` with these types:

```typescript
import { EmotionalState, SkillMastery } from "./adaptive-learning";

// --- Theme Affinity ---
export interface ThemeAffinity {
  theme: string;
  skillScores: Record<string, number>; // skill -> 0-1 score
  lastUsed: Date;
  totalSessions: number;
}

// --- Narrative Arc ---
export type ArcStatus = "active" | "completed" | "pivoted" | "abandoned";

export interface ArcBeat {
  position: number;
  worksheetId: string;
  narrativeSummary: string;
  cliffhanger: string;
  skillsFocused: string[];
  completedAt: Date | null;
}

export interface NarrativeArc {
  id: string;
  studentId: string;
  theme: string;
  title: string;
  character: string;
  targetSkills: string[];
  totalBeats: number;
  currentBeat: number;
  status: ArcStatus;
  beats: ArcBeat[];
  narrativeContext: string;
  createdAt: Date;
  completedAt: Date | null;
  pivotReason: string | null;
}

export interface ArcSummary {
  id: string;
  theme: string;
  title: string;
  status: ArcStatus;
  totalBeats: number;
  completedBeats: number;
  targetSkills: string[];
}

// --- Pivot Detection ---
export interface PivotDecision {
  shouldPivot: boolean;
  triggers: string[];
  confidence: number;
}

// --- Signal Weights ---
export const SIGNAL_WEIGHTS = {
  accuracy: 0.30,
  engagement: 0.25,
  emotion: 0.20,
  speed: 0.15,
  retry: 0.10,
} as const;

export const PIVOT_THRESHOLDS = {
  completionRateMin: 0.60,
  frustrationConsecutiveSessions: 2,
  speedIncreasePercent: 0.50,
  accuracyDropPercent: 0.20,
  triggersRequiredForPivot: 2,
} as const;

export const DECAY_HALF_LIFE_DAYS = 14;
export const ARC_ABANDON_DAYS = 7;

// --- Student Context (input to Planner) ---
export interface StudentContext {
  studentId: string;
  studentName: string;
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

// --- Learning Plan (output of Planner, input to Generator) ---
export interface LearningPlan {
  theme: string;
  arcTitle: string;
  arcBeat: {
    position: number;
    totalBeats: number;
    narrative: string;
    cliffhanger: string;
  };
  subject: string;
  difficulty: string;
  pedagogicalStrategy: string;
  misconceptionsToAddress: string[];
  character: string;
  characterBehavior: string;
  emotionalTone: string;
  questionGuidance: string[];
  themeChoicesForKid?: string[];
}

// --- Session Signals (for affinity computation) ---
export interface SessionSignals {
  sessionId: string;
  studentId: string;
  theme: string;
  skill: string;
  accuracy: number;       // 0-1
  engagement: number;     // 0-1 (completion rate)
  emotionScore: number;   // 0-1 (positive emotion ratio)
  speedScore: number;     // 0-1 (normalized vs baseline)
  retryScore: number;     // 0-1 (retry rate after wrong answers)
  timestamp: Date;
}
```

- [ ] **Step 3: Commit**

```bash
git add types/adaptive-pipeline.ts
git commit -m "feat: add adaptive pipeline types (StudentContext, LearningPlan, NarrativeArc, ThemeAffinity)"
```

---

### Task 2: ThemeAffinityService

**Files:**
- Create: `services/ThemeAffinityService.ts`
- Create: `services/__tests__/ThemeAffinityService.test.ts`

- [ ] **Step 1: Write failing tests**

Create `services/__tests__/ThemeAffinityService.test.ts`:

```typescript
import { ThemeAffinityService } from "../ThemeAffinityService";
import { SessionSignals, SIGNAL_WEIGHTS, DECAY_HALF_LIFE_DAYS } from "@/types/adaptive-pipeline";

// Mock Firestore
jest.mock("@/firebaseConfig", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: { fromDate: (d: Date) => d, now: () => new Date() },
}));

describe("ThemeAffinityService", () => {
  let service: ThemeAffinityService;

  beforeEach(() => {
    service = ThemeAffinityService.getInstance();
    jest.clearAllMocks();
  });

  describe("computeAffinityScore", () => {
    it("computes weighted score from session signals", () => {
      const signals: SessionSignals = {
        sessionId: "s1",
        studentId: "student1",
        theme: "cooking",
        skill: "fractions",
        accuracy: 0.8,
        engagement: 0.9,
        emotionScore: 0.7,
        speedScore: 0.6,
        retryScore: 0.5,
        timestamp: new Date(),
      };

      const score = service.computeAffinityScore(signals);
      const expected =
        0.8 * SIGNAL_WEIGHTS.accuracy +
        0.9 * SIGNAL_WEIGHTS.engagement +
        0.7 * SIGNAL_WEIGHTS.emotion +
        0.6 * SIGNAL_WEIGHTS.speed +
        0.5 * SIGNAL_WEIGHTS.retry;

      expect(score).toBeCloseTo(expected, 4);
    });

    it("clamps score between 0 and 1", () => {
      const signals: SessionSignals = {
        sessionId: "s1",
        studentId: "student1",
        theme: "cooking",
        skill: "fractions",
        accuracy: 1,
        engagement: 1,
        emotionScore: 1,
        speedScore: 1,
        retryScore: 1,
        timestamp: new Date(),
      };

      const score = service.computeAffinityScore(signals);
      expect(score).toBeLessThanOrEqual(1);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("applyDecay", () => {
    it("reduces score based on time elapsed", () => {
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - DECAY_HALF_LIFE_DAYS * 24 * 60 * 60 * 1000);

      const decayed = service.applyDecay(1.0, twoWeeksAgo, now);
      expect(decayed).toBeCloseTo(0.5, 1);
    });

    it("returns original score for recent data", () => {
      const now = new Date();
      const decayed = service.applyDecay(0.8, now, now);
      expect(decayed).toBeCloseTo(0.8, 4);
    });
  });

  describe("getBestThemeForSkill", () => {
    it("returns the theme with highest score for a given skill", () => {
      const affinities: Record<string, Record<string, number>> = {
        cooking: { fractions: 0.88, addition: 0.75 },
        dinosaurs: { fractions: 0.65, addition: 0.82 },
        space: { fractions: 0.72, addition: 0.60 },
      };

      const best = service.getBestThemeForSkill(affinities, "fractions");
      expect(best).toBe("cooking");
    });

    it("returns null for unknown skill", () => {
      const affinities: Record<string, Record<string, number>> = {
        cooking: { fractions: 0.88 },
      };

      const best = service.getBestThemeForSkill(affinities, "geometry");
      expect(best).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest services/__tests__/ThemeAffinityService.test.ts --no-cache
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement ThemeAffinityService**

Create `services/ThemeAffinityService.ts`:

```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  ThemeAffinity,
  SessionSignals,
  SIGNAL_WEIGHTS,
  DECAY_HALF_LIFE_DAYS,
} from "@/types/adaptive-pipeline";

export class ThemeAffinityService {
  private static instance: ThemeAffinityService;
  private static COLLECTION = "theme_affinities";

  static getInstance(): ThemeAffinityService {
    if (!ThemeAffinityService.instance) {
      ThemeAffinityService.instance = new ThemeAffinityService();
    }
    return ThemeAffinityService.instance;
  }

  computeAffinityScore(signals: SessionSignals): number {
    const raw =
      signals.accuracy * SIGNAL_WEIGHTS.accuracy +
      signals.engagement * SIGNAL_WEIGHTS.engagement +
      signals.emotionScore * SIGNAL_WEIGHTS.emotion +
      signals.speedScore * SIGNAL_WEIGHTS.speed +
      signals.retryScore * SIGNAL_WEIGHTS.retry;
    return Math.max(0, Math.min(1, raw));
  }

  applyDecay(score: number, lastUsed: Date, now: Date): number {
    const daysSince = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.pow(0.5, daysSince / DECAY_HALF_LIFE_DAYS);
    return score * decayFactor;
  }

  getBestThemeForSkill(
    affinities: Record<string, Record<string, number>>,
    skill: string,
  ): string | null {
    let bestTheme: string | null = null;
    let bestScore = -1;

    for (const [theme, skills] of Object.entries(affinities)) {
      const score = skills[skill];
      if (score !== undefined && score > bestScore) {
        bestScore = score;
        bestTheme = theme;
      }
    }
    return bestTheme;
  }

  async updateAffinityFromSession(
    studentId: string,
    signals: SessionSignals,
  ): Promise<void> {
    const score = this.computeAffinityScore(signals);
    const docRef = doc(
      db,
      `users/${studentId}/${ThemeAffinityService.COLLECTION}`,
      signals.theme,
    );
    const existing = await getDoc(docRef);

    if (existing.exists()) {
      const data = existing.data() as ThemeAffinity;
      const currentSkillScore = data.skillScores[signals.skill] ?? 0;
      // Exponential moving average: blend new score with existing
      const blended = currentSkillScore * 0.7 + score * 0.3;
      data.skillScores[signals.skill] = Math.max(0, Math.min(1, blended));
      data.lastUsed = new Date();
      data.totalSessions += 1;
      await setDoc(docRef, data);
    } else {
      const newAffinity: ThemeAffinity = {
        theme: signals.theme,
        skillScores: { [signals.skill]: score },
        lastUsed: new Date(),
        totalSessions: 1,
      };
      await setDoc(docRef, newAffinity);
    }
  }

  async getAffinities(
    studentId: string,
  ): Promise<Record<string, Record<string, number>>> {
    const colRef = collection(
      db,
      `users/${studentId}/${ThemeAffinityService.COLLECTION}`,
    );
    const snapshot = await getDocs(colRef);
    const now = new Date();
    const result: Record<string, Record<string, number>> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ThemeAffinity;
      const decayedScores: Record<string, number> = {};
      for (const [skill, score] of Object.entries(data.skillScores)) {
        decayedScores[skill] = this.applyDecay(score, data.lastUsed, now);
      }
      result[data.theme] = decayedScores;
    });

    return result;
  }

  async penalizeTheme(
    studentId: string,
    theme: string,
    penaltyFactor: number = 0.7,
  ): Promise<void> {
    const docRef = doc(
      db,
      `users/${studentId}/${ThemeAffinityService.COLLECTION}`,
      theme,
    );
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const data = existing.data() as ThemeAffinity;
      for (const skill of Object.keys(data.skillScores)) {
        data.skillScores[skill] *= penaltyFactor;
      }
      await setDoc(docRef, data);
    }
  }
}

export const themeAffinityService = ThemeAffinityService.getInstance();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest services/__tests__/ThemeAffinityService.test.ts --no-cache
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add types/adaptive-pipeline.ts services/ThemeAffinityService.ts services/__tests__/ThemeAffinityService.test.ts
git commit -m "feat: add ThemeAffinityService with weighted scoring, decay, and Firestore persistence"
```

---

### Task 3: NarrativeArcService

**Files:**
- Create: `services/NarrativeArcService.ts`
- Create: `services/__tests__/NarrativeArcService.test.ts`

- [ ] **Step 1: Write failing tests**

Create `services/__tests__/NarrativeArcService.test.ts`:

```typescript
import { NarrativeArcService } from "../NarrativeArcService";
import { NarrativeArc, ArcBeat, LearningPlan } from "@/types/adaptive-pipeline";

jest.mock("@/firebaseConfig", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(() => ({ id: "arc-123" })),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: { fromDate: (d: Date) => d, now: () => new Date() },
}));

describe("NarrativeArcService", () => {
  let service: NarrativeArcService;

  beforeEach(() => {
    service = NarrativeArcService.getInstance();
    jest.clearAllMocks();
  });

  describe("createArcFromPlan", () => {
    it("creates a NarrativeArc from a LearningPlan", () => {
      const plan: LearningPlan = {
        theme: "cooking",
        character: "Ada",
        arcTitle: "Chef's Kitchen Challenge",
        arcBeat: { position: 1, totalBeats: 4, narrative: "The bakery needs help!", cliffhanger: "But the oven broke!" },
        subject: "fractions",
        difficulty: "medium",
        pedagogicalStrategy: "Use recipe halving",
        misconceptionsToAddress: ["forgets to carry"],
        characterBehavior: "Ada guides patiently",
        emotionalTone: "encouraging",
        questionGuidance: ["Use food portions"],
      };

      const arc = service.createArcFromPlan("student-1", plan);

      expect(arc.theme).toBe("cooking");
      expect(arc.title).toBe("Chef's Kitchen Challenge");
      expect(arc.totalBeats).toBe(4);
      expect(arc.currentBeat).toBe(0);
      expect(arc.status).toBe("active");
      expect(arc.beats).toEqual([]);
      expect(arc.studentId).toBe("student-1");
    });
  });

  describe("advanceBeat", () => {
    it("adds a beat and increments currentBeat", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Challenge",
        character: "Ada",
        targetSkills: ["fractions"],
        totalBeats: 4,
        currentBeat: 0,
        status: "active",
        beats: [],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const beat: ArcBeat = {
        position: 1,
        worksheetId: "ws-1",
        narrativeSummary: "Gathered ingredients",
        cliffhanger: "The oven is too hot!",
        skillsFocused: ["fractions"],
        completedAt: new Date(),
      };

      const updated = service.advanceBeat(arc, beat);
      expect(updated.currentBeat).toBe(1);
      expect(updated.beats).toHaveLength(1);
      expect(updated.beats[0].narrativeSummary).toBe("Gathered ingredients");
    });

    it("marks arc as completed when last beat is reached", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Challenge",
        character: "Ada",
        targetSkills: ["fractions"],
        totalBeats: 2,
        currentBeat: 1,
        status: "active",
        beats: [{ position: 1, worksheetId: "ws-1", narrativeSummary: "Beat 1", cliffhanger: "", skillsFocused: ["fractions"], completedAt: new Date() }],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const beat: ArcBeat = {
        position: 2,
        worksheetId: "ws-2",
        narrativeSummary: "Final beat",
        cliffhanger: "",
        skillsFocused: ["fractions"],
        completedAt: new Date(),
      };

      const updated = service.advanceBeat(arc, beat);
      expect(updated.status).toBe("completed");
      expect(updated.completedAt).not.toBeNull();
    });
  });

  describe("pivotArc", () => {
    it("sets status to pivoted with reason", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Challenge",
        character: "Ada",
        targetSkills: ["fractions"],
        totalBeats: 4,
        currentBeat: 2,
        status: "active",
        beats: [],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const pivoted = service.pivotArc(arc, "engagement_drop");
      expect(pivoted.status).toBe("pivoted");
      expect(pivoted.pivotReason).toBe("engagement_drop");
    });
  });

  describe("buildNarrativeContext", () => {
    it("compresses arc into a short context string", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Kitchen Challenge",
        character: "Ada",
        targetSkills: ["fractions", "measurement"],
        totalBeats: 4,
        currentBeat: 2,
        status: "active",
        beats: [
          { position: 1, worksheetId: "w1", narrativeSummary: "Gathered ingredients", cliffhanger: "But the recipe is wrong!", skillsFocused: ["measurement"], completedAt: new Date() },
          { position: 2, worksheetId: "w2", narrativeSummary: "Fixed the recipe", cliffhanger: "Now the oven is too hot!", skillsFocused: ["fractions"], completedAt: new Date() },
        ],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const context = service.buildNarrativeContext(arc, []);
      expect(context).toContain("Chef's Kitchen Challenge");
      expect(context).toContain("cooking");
      expect(context).toContain("Beat 2 of 4");
      expect(context).toContain("Gathered ingredients");
      expect(context).toContain("Now the oven is too hot!");
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest services/__tests__/NarrativeArcService.test.ts --no-cache
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement NarrativeArcService**

Create `services/NarrativeArcService.ts`:

```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  NarrativeArc,
  ArcBeat,
  ArcSummary,
  LearningPlan,
  ARC_ABANDON_DAYS,
} from "@/types/adaptive-pipeline";

export class NarrativeArcService {
  private static instance: NarrativeArcService;
  private static COLLECTION = "narrative_arcs";

  static getInstance(): NarrativeArcService {
    if (!NarrativeArcService.instance) {
      NarrativeArcService.instance = new NarrativeArcService();
    }
    return NarrativeArcService.instance;
  }

  createArcFromPlan(studentId: string, plan: LearningPlan): NarrativeArc {
    return {
      id: "", // set on Firestore save
      studentId,
      theme: plan.theme,
      title: plan.arcTitle,
      character: plan.character,
      targetSkills: [plan.subject],
      totalBeats: plan.arcBeat.totalBeats,
      currentBeat: 0,
      status: "active",
      beats: [],
      narrativeContext: "",
      createdAt: new Date(),
      completedAt: null,
      pivotReason: null,
    };
  }

  advanceBeat(arc: NarrativeArc, beat: ArcBeat): NarrativeArc {
    const updated = { ...arc };
    updated.beats = [...arc.beats, beat];
    updated.currentBeat = beat.position;

    if (beat.position >= arc.totalBeats) {
      updated.status = "completed";
      updated.completedAt = new Date();
    }

    return updated;
  }

  pivotArc(arc: NarrativeArc, reason: string): NarrativeArc {
    return {
      ...arc,
      status: "pivoted",
      pivotReason: reason,
      completedAt: new Date(),
    };
  }

  buildNarrativeContext(arc: NarrativeArc, pastArcs: ArcSummary[]): string {
    const lines: string[] = [];
    lines.push(`Active arc: ${arc.title} (${arc.theme}).`);
    lines.push(`Beat ${arc.currentBeat} of ${arc.totalBeats} complete. ${arc.character} is the guide.`);

    if (arc.beats.length > 0) {
      const summaries = arc.beats.map((b) => b.narrativeSummary).join(", ");
      lines.push(`Story so far: ${summaries}.`);
      const lastBeat = arc.beats[arc.beats.length - 1];
      if (lastBeat.cliffhanger) {
        lines.push(`Cliffhanger: ${lastBeat.cliffhanger}`);
      }
    }

    const coveredSkills = [...new Set(arc.beats.flatMap((b) => b.skillsFocused))];
    if (coveredSkills.length > 0) {
      lines.push(`Skills covered: ${coveredSkills.join(", ")}.`);
    }

    lines.push(`Target skills: ${arc.targetSkills.join(", ")}.`);

    if (pastArcs.length > 0) {
      const pastSummary = pastArcs
        .slice(0, 3)
        .map((a) => `${a.title} (${a.status}, ${a.completedBeats} beats)`)
        .join(", ");
      lines.push(`Past arcs: ${pastSummary}.`);
    }

    return lines.join("\n");
  }

  async saveArc(studentId: string, arc: NarrativeArc): Promise<string> {
    const colRef = collection(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`);
    const docRef = doc(colRef);
    const arcWithId = { ...arc, id: docRef.id };
    await setDoc(docRef, arcWithId);
    return docRef.id;
  }

  async getActiveArc(studentId: string): Promise<NarrativeArc | null> {
    const colRef = collection(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`);
    const q = query(colRef, where("status", "==", "active"), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as NarrativeArc;
  }

  async updateArc(studentId: string, arc: NarrativeArc): Promise<void> {
    const docRef = doc(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`, arc.id);
    await setDoc(docRef, arc);
  }

  async getArcHistory(studentId: string, maxArcs: number = 5): Promise<ArcSummary[]> {
    const colRef = collection(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`);
    const q = query(colRef, where("status", "!=", "active"), orderBy("completedAt", "desc"), limit(maxArcs));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data() as NarrativeArc;
      return {
        id: data.id,
        theme: data.theme,
        title: data.title,
        status: data.status,
        totalBeats: data.totalBeats,
        completedBeats: data.beats.length,
        targetSkills: data.targetSkills,
      };
    });
  }

  async checkAndMarkAbandoned(studentId: string): Promise<void> {
    const active = await this.getActiveArc(studentId);
    if (!active) return;

    const lastActivity = active.beats.length > 0
      ? active.beats[active.beats.length - 1].completedAt
      : active.createdAt;

    if (!lastActivity) return;

    const daysSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= ARC_ABANDON_DAYS) {
      const abandoned = { ...active, status: "abandoned" as const, completedAt: new Date() };
      await this.updateArc(studentId, abandoned);
    }
  }
}

export const narrativeArcService = NarrativeArcService.getInstance();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest services/__tests__/NarrativeArcService.test.ts --no-cache
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/NarrativeArcService.ts services/__tests__/NarrativeArcService.test.ts
git commit -m "feat: add NarrativeArcService with arc lifecycle, beat tracking, and narrative context"
```

---

## Chunk 2: SignalAggregatorService & AdaptivePlannerService

### Task 4: SignalAggregatorService

**Files:**
- Create: `services/SignalAggregatorService.ts`
- Create: `services/__tests__/SignalAggregatorService.test.ts`

- [ ] **Step 1: Write failing tests**

Create `services/__tests__/SignalAggregatorService.test.ts`:

```typescript
import { SignalAggregatorService } from "../SignalAggregatorService";

jest.mock("@/firebaseConfig", () => ({ db: {} }));
jest.mock("@/services/StudentProfileService", () => ({
  studentProfileService: {
    getProfile: jest.fn(),
  },
}));
jest.mock("@/services/SessionService", () => ({
  sessionService: {
    getEmotionalMemorySummary: jest.fn(),
  },
}));
jest.mock("@/services/ThemeAffinityService", () => ({
  themeAffinityService: {
    getAffinities: jest.fn(),
  },
}));
jest.mock("@/services/NarrativeArcService", () => ({
  narrativeArcService: {
    getActiveArc: jest.fn(),
    getArcHistory: jest.fn(),
    buildNarrativeContext: jest.fn(),
    checkAndMarkAbandoned: jest.fn(),
  },
}));

describe("SignalAggregatorService", () => {
  let service: SignalAggregatorService;

  beforeEach(() => {
    service = SignalAggregatorService.getInstance();
    jest.clearAllMocks();
  });

  describe("buildStudentContext", () => {
    it("aggregates data from all services into StudentContext", async () => {
      const { studentProfileService } = require("@/services/StudentProfileService");
      const { sessionService } = require("@/services/SessionService");
      const { themeAffinityService } = require("@/services/ThemeAffinityService");
      const { narrativeArcService } = require("@/services/NarrativeArcService");

      studentProfileService.getProfile.mockResolvedValue({
        id: "s1",
        name: "Maya",
        grade: "2",
        characterId: "ada",
        skillMastery: { addition: { masteryLevel: 85 } },
        learningDisposition: {},
      });

      sessionService.getEmotionalMemorySummary.mockResolvedValue({
        recentMood: "positive",
        commonFrustrations: ["carrying"],
        celebrationPatterns: ["completing worksheets"],
        energyPatterns: "high in morning",
        focusPatterns: "good with short sessions",
      });

      themeAffinityService.getAffinities.mockResolvedValue({
        cooking: { fractions: 0.88, addition: 0.75 },
      });

      narrativeArcService.getActiveArc.mockResolvedValue(null);
      narrativeArcService.getArcHistory.mockResolvedValue([]);
      narrativeArcService.checkAndMarkAbandoned.mockResolvedValue(undefined);

      const context = await service.buildStudentContext("s1");

      expect(context.studentId).toBe("s1");
      expect(context.studentName).toBe("Maya");
      expect(context.grade).toBe("2");
      expect(context.themeAffinities).toHaveProperty("cooking");
      expect(context.frustrationTriggers).toContain("carrying");
    });
  });

  describe("computeSessionSignals", () => {
    it("computes normalized signals from session data", () => {
      const sessionData = {
        questionsAttempted: [
          { isCorrect: true, timeSpent: 5000, attemptNumber: 1 },
          { isCorrect: true, timeSpent: 8000, attemptNumber: 1 },
          { isCorrect: false, timeSpent: 12000, attemptNumber: 1 },
          { isCorrect: false, timeSpent: 6000, attemptNumber: 2 }, // retry
        ],
        emotionalStates: [
          { emotion: "curious", intensity: 3 },
          { emotion: "proud", intensity: 4 },
          { emotion: "frustrated", intensity: 2 },
        ],
        totalQuestions: 5,
        questionsCompleted: 4,
      };

      const signals = service.computeSessionSignals(
        "session-1",
        "student-1",
        "cooking",
        "fractions",
        sessionData,
      );

      expect(signals.accuracy).toBeGreaterThan(0);
      expect(signals.accuracy).toBeLessThanOrEqual(1);
      expect(signals.engagement).toBeGreaterThan(0);
      expect(signals.emotionScore).toBeGreaterThan(0);
      expect(signals.retryScore).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest services/__tests__/SignalAggregatorService.test.ts --no-cache
```

Expected: FAIL

- [ ] **Step 3: Implement SignalAggregatorService**

Create `services/SignalAggregatorService.ts`:

```typescript
import { studentProfileService } from "@/services/StudentProfileService";
import { sessionService } from "@/services/SessionService";
import { themeAffinityService } from "@/services/ThemeAffinityService";
import { narrativeArcService } from "@/services/NarrativeArcService";
import { StudentContext, SessionSignals } from "@/types/adaptive-pipeline";

const POSITIVE_EMOTIONS = ["excited", "happy", "calm", "proud", "joyful", "curious"];
const NEGATIVE_EMOTIONS = ["frustrated", "confused", "bored", "anxious"];

export class SignalAggregatorService {
  private static instance: SignalAggregatorService;

  static getInstance(): SignalAggregatorService {
    if (!SignalAggregatorService.instance) {
      SignalAggregatorService.instance = new SignalAggregatorService();
    }
    return SignalAggregatorService.instance;
  }

  async buildStudentContext(studentId: string): Promise<StudentContext> {
    // Check for abandoned arcs first
    await narrativeArcService.checkAndMarkAbandoned(studentId);

    // Fetch all data in parallel
    const [profile, emotionalSummary, affinities, activeArc, arcHistory] =
      await Promise.all([
        studentProfileService.getProfile(studentId),
        sessionService.getEmotionalMemorySummary(studentId),
        themeAffinityService.getAffinities(studentId),
        narrativeArcService.getActiveArc(studentId),
        narrativeArcService.getArcHistory(studentId),
      ]);

    // Extract misconceptions from skill mastery data
    const misconceptions: string[] = [];
    if (profile?.skillMastery) {
      for (const [skill, mastery] of Object.entries(profile.skillMastery)) {
        if (mastery.needsReview) {
          misconceptions.push(`Needs review: ${skill}`);
        }
      }
    }

    // Determine learning velocity
    let learningVelocity = "moderate";
    if (profile?.learningDisposition) {
      const effectiveness = profile.learningDisposition.personalityEffectiveness || [];
      if (effectiveness.length > 0) {
        const avgVelocity =
          effectiveness.reduce((sum: number, e: any) => sum + (e.averageMasteryVelocity || 0), 0) /
          effectiveness.length;
        if (avgVelocity > 2) learningVelocity = "fast";
        else if (avgVelocity < 0.5) learningVelocity = "slow";
      }
    }

    return {
      studentId,
      studentName: profile?.name || "Student",
      grade: profile?.grade || "1",
      character: profile?.characterId || "ada",
      skillMastery: profile?.skillMastery || {},
      themeAffinities: affinities,
      activeArc,
      recentEmotions: emotionalSummary?.recentEmotions || [],
      frustrationTriggers: emotionalSummary?.commonFrustrations || [],
      misconceptions,
      learningVelocity,
      arcHistory,
    };
  }

  computeSessionSignals(
    sessionId: string,
    studentId: string,
    theme: string,
    skill: string,
    sessionData: {
      questionsAttempted: Array<{ isCorrect: boolean; timeSpent: number; attemptNumber: number }>;
      emotionalStates: Array<{ emotion: string; intensity: number }>;
      totalQuestions: number;
      questionsCompleted: number;
    },
  ): SessionSignals {
    const { questionsAttempted, emotionalStates, totalQuestions, questionsCompleted } = sessionData;

    // Accuracy: correct / total first attempts
    const firstAttempts = questionsAttempted.filter((q) => q.attemptNumber === 1);
    const accuracy = firstAttempts.length > 0
      ? firstAttempts.filter((q) => q.isCorrect).length / firstAttempts.length
      : 0;

    // Engagement: completion rate
    const engagement = totalQuestions > 0 ? questionsCompleted / totalQuestions : 0;

    // Emotion: positive ratio
    const positiveCount = emotionalStates.filter((e) =>
      POSITIVE_EMOTIONS.includes(e.emotion),
    ).length;
    const emotionScore = emotionalStates.length > 0
      ? positiveCount / emotionalStates.length
      : 0.5; // neutral default

    // Speed: inverse of average time, normalized (lower time = higher score)
    // Using a simple approach: score = 1 - (avgTime / maxExpectedTime)
    const avgTime = firstAttempts.length > 0
      ? firstAttempts.reduce((sum, q) => sum + q.timeSpent, 0) / firstAttempts.length
      : 0;
    const maxExpectedTime = 30000; // 30 seconds as baseline
    const speedScore = Math.max(0, Math.min(1, 1 - avgTime / maxExpectedTime));

    // Retry: proportion of questions that were retried
    const retries = questionsAttempted.filter((q) => q.attemptNumber > 1);
    const wrongFirstAttempts = firstAttempts.filter((q) => !q.isCorrect);
    const retryScore = wrongFirstAttempts.length > 0
      ? retries.length / wrongFirstAttempts.length
      : 1; // no wrong answers = perfect retry score

    return {
      sessionId,
      studentId,
      theme,
      skill,
      accuracy,
      engagement,
      emotionScore,
      speedScore: Math.max(0, Math.min(1, speedScore)),
      retryScore: Math.max(0, Math.min(1, retryScore)),
      timestamp: new Date(),
    };
  }
}

export const signalAggregatorService = SignalAggregatorService.getInstance();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest services/__tests__/SignalAggregatorService.test.ts --no-cache
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/SignalAggregatorService.ts services/__tests__/SignalAggregatorService.test.ts
git commit -m "feat: add SignalAggregatorService for student context aggregation and session signal computation"
```

---

### Task 5: AdaptivePlannerService (Dual-LLM Pipeline)

**Files:**
- Create: `services/AdaptivePlannerService.ts`
- Create: `services/__tests__/AdaptivePlannerService.test.ts`

- [ ] **Step 1: Write failing tests**

Create `services/__tests__/AdaptivePlannerService.test.ts`:

```typescript
import { AdaptivePlannerService } from "../AdaptivePlannerService";
import { StudentContext, LearningPlan, PIVOT_THRESHOLDS } from "@/types/adaptive-pipeline";

jest.mock("@/firebaseConfig", () => ({ db: {} }));
jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));
jest.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: jest.fn(() => jest.fn()),
}));
jest.mock("@/services/SignalAggregatorService", () => ({
  signalAggregatorService: {
    buildStudentContext: jest.fn(),
  },
}));
jest.mock("@/services/NarrativeArcService", () => ({
  narrativeArcService: {
    createArcFromPlan: jest.fn(),
    saveArc: jest.fn(),
    advanceBeat: jest.fn(),
    updateArc: jest.fn(),
    getActiveArc: jest.fn(),
    buildNarrativeContext: jest.fn(),
  },
}));
jest.mock("@/services/ThemeAffinityService", () => ({
  themeAffinityService: {
    penalizeTheme: jest.fn(),
  },
}));

describe("AdaptivePlannerService", () => {
  let service: AdaptivePlannerService;

  beforeEach(() => {
    service = AdaptivePlannerService.getInstance();
    jest.clearAllMocks();
  });

  describe("detectPivotNeeded", () => {
    it("returns shouldPivot=true when 2+ triggers fire", () => {
      const recentSessions = [
        { completionRate: 0.4, emotionalState: "frustrated", speedChange: 0.1, accuracyChange: -0.1 },
        { completionRate: 0.5, emotionalState: "frustrated", speedChange: 0.2, accuracyChange: -0.15 },
      ];

      const decision = service.detectPivotNeeded(recentSessions);
      expect(decision.shouldPivot).toBe(true);
      expect(decision.triggers.length).toBeGreaterThanOrEqual(2);
    });

    it("returns shouldPivot=false with good engagement", () => {
      const recentSessions = [
        { completionRate: 0.9, emotionalState: "happy", speedChange: 0.0, accuracyChange: 0.05 },
        { completionRate: 0.85, emotionalState: "curious", speedChange: -0.1, accuracyChange: 0.02 },
      ];

      const decision = service.detectPivotNeeded(recentSessions);
      expect(decision.shouldPivot).toBe(false);
    });

    it("returns shouldPivot=true immediately when student explicitly requests change", () => {
      const recentSessions = [
        { completionRate: 0.9, emotionalState: "happy", speedChange: 0.0, accuracyChange: 0.05 },
      ];

      const decision = service.detectPivotNeeded(recentSessions, true);
      expect(decision.shouldPivot).toBe(true);
      expect(decision.triggers).toContain("student_requested_change");
      expect(decision.confidence).toBe(1);
    });
  });

  describe("buildPlannerPrompt", () => {
    it("creates a structured prompt from StudentContext", () => {
      const context: StudentContext = {
        studentId: "s1",
        studentName: "Maya",
        grade: "2",
        character: "ada",
        skillMastery: {},
        themeAffinities: { cooking: { fractions: 0.88 } },
        activeArc: null,
        recentEmotions: [],
        frustrationTriggers: ["carrying"],
        misconceptions: ["Needs review: carrying"],
        learningVelocity: "moderate",
        arcHistory: [],
      };

      const prompt = service.buildPlannerPrompt(context);
      expect(prompt).toContain("Maya");
      expect(prompt).toContain("Grade 2");
      expect(prompt).toContain("cooking");
      expect(prompt).toContain("carrying");
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest services/__tests__/AdaptivePlannerService.test.ts --no-cache
```

Expected: FAIL

- [ ] **Step 3: Implement AdaptivePlannerService**

Create `services/AdaptivePlannerService.ts`:

```typescript
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { signalAggregatorService } from "@/services/SignalAggregatorService";
import { narrativeArcService } from "@/services/NarrativeArcService";
import { themeAffinityService } from "@/services/ThemeAffinityService";
import {
  StudentContext,
  LearningPlan,
  PivotDecision,
  PIVOT_THRESHOLDS,
} from "@/types/adaptive-pipeline";
import { Worksheet } from "@/types/worksheet";
import { ANTHROPIC_MODELS } from "@/constants";

const anthropicProvider = createAnthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
});

// Zod schema for Planner output
const LearningPlanSchema = z.object({
  theme: z.string().describe("The narrative theme (e.g., cooking, dinosaurs, space)"),
  character: z.string().describe("Character guide name (Ada, Max, or Luna)"),
  arcTitle: z.string().describe("Title of the narrative arc"),
  arcBeat: z.object({
    position: z.number().describe("Current beat number in the arc"),
    totalBeats: z.number().min(3).max(5).describe("Total beats in this arc"),
    narrative: z.string().describe("The story narrative for this beat"),
    cliffhanger: z.string().describe("Cliffhanger for the next beat, empty if last beat"),
  }),
  subject: z.string().describe("Math subject to focus on"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  pedagogicalStrategy: z.string().describe("How to teach the concept using the theme"),
  misconceptionsToAddress: z.array(z.string()),
  characterBehavior: z.string().describe("How the character should behave in this beat"),
  emotionalTone: z.string().describe("Emotional tone for the worksheet"),
  questionGuidance: z.array(z.string()).describe("Specific guidance for question generation"),
  themeChoicesForKid: z.array(z.string()).optional().describe("2-3 theme options for next arc, only if this is the last beat"),
});

// Zod schema for Generator output
const AdaptiveWorksheetSchema = z.object({
  title: z.string(),
  narrativeIntro: z.string().describe("Story context before the questions"),
  concept: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      explanation: z.string().optional(),
      narrativeContext: z.string().optional().describe("How this question fits the story"),
    }),
  ),
  characterDialogue: z.object({
    greeting: z.string(),
    encouragement: z.string(),
    hint: z.string(),
    celebration: z.string(),
  }),
  arcProgressionHook: z.string().describe("Teaser for the next beat"),
  narrativeSummary: z.string().describe("One sentence summary of what happened in this beat"),
});

export type AdaptiveWorksheet = z.infer<typeof AdaptiveWorksheetSchema>;

export class AdaptivePlannerService {
  private static instance: AdaptivePlannerService;

  static getInstance(): AdaptivePlannerService {
    if (!AdaptivePlannerService.instance) {
      AdaptivePlannerService.instance = new AdaptivePlannerService();
    }
    return AdaptivePlannerService.instance;
  }

  detectPivotNeeded(
    recentSessions: Array<{
      completionRate: number;
      emotionalState: string;
      speedChange: number;
      accuracyChange: number;
    }>,
    explicitRequest: boolean = false,
  ): PivotDecision {
    const triggers: string[] = [];

    // Trigger 5: Kid explicitly asked for something different (immediate pivot)
    if (explicitRequest) {
      triggers.push("student_requested_change");
      return { shouldPivot: true, triggers, confidence: 1 };
    }

    // Trigger 1: Check completion rate
    const avgCompletion =
      recentSessions.reduce((s, r) => s + r.completionRate, 0) / recentSessions.length;
    if (avgCompletion < PIVOT_THRESHOLDS.completionRateMin) {
      triggers.push("low_completion_rate");
    }

    // Trigger 2: Check frustration
    const frustrationCount = recentSessions.filter(
      (s) => s.emotionalState === "frustrated" || s.emotionalState === "anxious",
    ).length;
    if (frustrationCount >= PIVOT_THRESHOLDS.frustrationConsecutiveSessions) {
      triggers.push("consecutive_frustration");
    }

    // Trigger 3: Check speed increase (rushing)
    const avgSpeedChange =
      recentSessions.reduce((s, r) => s + r.speedChange, 0) / recentSessions.length;
    if (avgSpeedChange > PIVOT_THRESHOLDS.speedIncreasePercent) {
      triggers.push("rushing_through");
    }

    // Trigger 4: Check accuracy drop
    const avgAccuracyChange =
      recentSessions.reduce((s, r) => s + r.accuracyChange, 0) / recentSessions.length;
    if (avgAccuracyChange < -PIVOT_THRESHOLDS.accuracyDropPercent) {
      triggers.push("accuracy_drop");
    }

    return {
      shouldPivot: triggers.length >= PIVOT_THRESHOLDS.triggersRequiredForPivot,
      triggers,
      confidence: Math.min(1, triggers.length / 3),
    };
  }

  buildPlannerPrompt(context: StudentContext): string {
    const lines: string[] = [];
    lines.push(`Student: ${context.studentName}, Grade ${context.grade}`);
    lines.push(`Character guide: ${context.character}`);
    lines.push(`Learning velocity: ${context.learningVelocity}`);

    // Skill mastery
    const skills = Object.entries(context.skillMastery);
    if (skills.length > 0) {
      lines.push(`\nSkill mastery:`);
      for (const [skill, mastery] of skills) {
        lines.push(`  ${skill}: ${mastery.masteryLevel ?? "unknown"}/100`);
      }
    }

    // Theme affinities
    const themes = Object.entries(context.themeAffinities);
    if (themes.length > 0) {
      lines.push(`\nTheme preferences:`);
      for (const [theme, skills] of themes) {
        const topSkill = Object.entries(skills).sort(([, a], [, b]) => b - a)[0];
        lines.push(`  ${theme}: best for ${topSkill?.[0] ?? "general"} (${(topSkill?.[1] ?? 0).toFixed(2)})`);
      }
    }

    // Active arc
    if (context.activeArc) {
      lines.push(`\n${context.activeArc.narrativeContext}`);
    } else {
      lines.push(`\nNo active arc — start a new adventure.`);
    }

    // Frustrations and misconceptions
    if (context.frustrationTriggers.length > 0) {
      lines.push(`\nFrustration triggers: ${context.frustrationTriggers.join(", ")}`);
    }
    if (context.misconceptions.length > 0) {
      lines.push(`Misconceptions: ${context.misconceptions.join(", ")}`);
    }

    // Past arcs
    if (context.arcHistory.length > 0) {
      lines.push(`\nPast arcs: ${context.arcHistory.map((a) => `${a.title} (${a.status})`).join(", ")}`);
    }

    return lines.join("\n");
  }

  async generatePlan(context: StudentContext): Promise<LearningPlan> {
    const studentSummary = this.buildPlannerPrompt(context);

    const { object } = await generateObject({
      model: anthropicProvider(ANTHROPIC_MODELS.CLAUDE_HAIKU),
      schema: LearningPlanSchema,
      messages: [
        {
          role: "system",
          content: `You are an adaptive learning planner for K-5 math students. Given a student's profile, create a personalized learning plan that weaves math into a narrative adventure.

Rules:
- Pick a theme the student responds well to (check theme preferences)
- If there's an active arc, continue it (advance to next beat)
- If no active arc, start a new one (3-5 beats)
- Match difficulty to skill mastery level
- Address known misconceptions
- Use the character's personality in your plan
- If this is the last beat, provide 2-3 theme choices for the next arc
- Make the narrative engaging for a ${context.grade} grader`,
        },
        {
          role: "user",
          content: studentSummary,
        },
      ],
    });

    return object;
  }

  async generateWorksheet(plan: LearningPlan): Promise<AdaptiveWorksheet> {
    const { object } = await generateObject({
      model: anthropicProvider(ANTHROPIC_MODELS.CLAUDE_SONNET),
      schema: AdaptiveWorksheetSchema,
      messages: [
        {
          role: "system",
          content: `You are a creative K-5 math worksheet generator. Generate a worksheet that weaves math problems into the given narrative. Every question should feel like part of the story. The character dialogue should match the character's personality.

Important:
- Generate 5-8 questions appropriate for the difficulty level
- Each question should connect to the narrative theme
- Include the narrative intro that sets the scene
- Character dialogue should be warm and age-appropriate
- The arc progression hook should build excitement for next time`,
        },
        {
          role: "user",
          content: JSON.stringify(plan),
        },
      ],
    });

    return object;
  }

  async generateAdaptiveWorksheet(
    studentId: string,
  ): Promise<{ plan: LearningPlan; worksheet: AdaptiveWorksheet }> {
    // Step 1: Build student context
    const context = await signalAggregatorService.buildStudentContext(studentId);

    // Step 2: Generate learning plan (LLM Call 1) with retry on Zod failure
    let plan: LearningPlan;
    try {
      plan = await this.retryWithValidation(
        () => this.generatePlan(context),
        "Planner",
      );
    } catch (error) {
      console.error("[AdaptivePlanner] Planner failed after retries, falling back to defaults:", error);
      plan = this.buildFallbackPlan(context);
    }

    // Step 3: Generate worksheet (LLM Call 2) with retry on Zod failure
    let worksheet: AdaptiveWorksheet;
    try {
      worksheet = await this.retryWithValidation(
        () => this.generateWorksheet(plan),
        "Generator",
      );
    } catch (error) {
      console.error("[AdaptivePlanner] Generator failed after retries:", error);
      throw error; // Let caller handle fallback to manual mode
    }

    // Step 4: Manage arc state
    if (!context.activeArc) {
      // Create new arc
      const arc = narrativeArcService.createArcFromPlan(studentId, plan);
      await narrativeArcService.saveArc(studentId, arc);
    }

    return { plan, worksheet };
  }

  private async retryWithValidation<T>(
    fn: () => Promise<T>,
    label: string,
    maxRetries: number = 2,
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.warn(`[AdaptivePlanner] ${label} attempt ${attempt + 1} failed, retrying:`, error);
        }
      }
    }
    throw lastError;
  }

  private buildFallbackPlan(context: StudentContext): LearningPlan {
    // Find lowest mastery skill
    const skills = Object.entries(context.skillMastery);
    const targetSkill = skills.length > 0
      ? skills.sort(([, a], [, b]) => (a.masteryLevel ?? 0) - (b.masteryLevel ?? 0))[0][0]
      : "addition";

    // Find best theme for that skill
    const bestTheme = Object.entries(context.themeAffinities)
      .map(([theme, skills]) => ({ theme, score: skills[targetSkill] ?? 0 }))
      .sort((a, b) => b.score - a.score)[0]?.theme ?? "animals";

    return {
      theme: bestTheme,
      arcTitle: `${bestTheme.charAt(0).toUpperCase() + bestTheme.slice(1)} Adventure`,
      arcBeat: { position: 1, totalBeats: 3, narrative: "A new adventure begins!", cliffhanger: "What happens next?" },
      subject: targetSkill,
      difficulty: "easy",
      pedagogicalStrategy: `Practice ${targetSkill} with ${bestTheme} themed problems`,
      misconceptionsToAddress: context.misconceptions.slice(0, 2),
      character: context.character,
      characterBehavior: `${context.character} guides the student with patience and encouragement`,
      emotionalTone: "encouraging and warm",
      questionGuidance: [`Use ${bestTheme} scenarios for ${targetSkill} problems`],
    };
  }
}

export const adaptivePlannerService = AdaptivePlannerService.getInstance();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest services/__tests__/AdaptivePlannerService.test.ts --no-cache
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/AdaptivePlannerService.ts services/__tests__/AdaptivePlannerService.test.ts
git commit -m "feat: add AdaptivePlannerService with dual-LLM pipeline, pivot detection, and fallback"
```

---

### Task 6: Wire SessionService to feed signals on session end

**Files:**
- Modify: `services/SessionService.ts`

- [ ] **Step 1: Add signal hook to endSession()**

At the top of `SessionService.ts`, add import:

```typescript
import { themeAffinityService } from "@/services/ThemeAffinityService";
import { signalAggregatorService } from "@/services/SignalAggregatorService";
```

In the `endSession()` method, after the existing logic that calculates `masteryVelocity` and updates Firestore, add:

```typescript
// Feed signals to adaptive system
try {
  if (session.skillsWorkedOn.length > 0) {
    const signals = signalAggregatorService.computeSessionSignals(
      sessionId,
      session.studentId,
      session.theme || "general", // theme will be set by adaptive pipeline
      session.skillsWorkedOn[0],
      {
        questionsAttempted: session.questionsAttempted.map((q) => ({
          isCorrect: q.isCorrect,
          timeSpent: q.timeSpent,
          attemptNumber: q.attemptNumber,
        })),
        emotionalStates: session.emotionalStates.map((e) => ({
          emotion: e.emotion,
          intensity: e.intensity,
        })),
        totalQuestions: session.questionsAttempted.filter((q) => q.attemptNumber === 1).length,
        questionsCompleted: session.questionsAttempted.filter((q) => q.isCorrect).length,
      },
    );
    await themeAffinityService.updateAffinityFromSession(session.studentId, signals);
  }
} catch (error) {
  console.error("[SessionService] Failed to update adaptive signals:", error);
  // Non-blocking — don't break session end for signal failure
}
```

Also add a `theme` field to the `LearningSession` interface in `types/adaptive-learning.ts`:

```typescript
theme?: string; // narrative theme for this session (set by adaptive pipeline)
```

In `SessionService.startSession()`, add an optional `theme` parameter:

```typescript
async startSession(studentId: string, characterId: string, theme?: string): Promise<LearningSession> {
  // ... existing code ...
  const session: LearningSession = {
    // ... existing fields ...
    theme: theme || undefined,
  };
```

This will be called by the adventure mode in the worksheet generator with the plan's theme:
```typescript
// In adventure mode, start session with theme
await sessionService.startSession(studentId, characterId, plan.theme);
```

- [ ] **Step 2: Verify app still builds**

```bash
npx expo export --platform web 2>&1 | head -20
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add services/SessionService.ts types/adaptive-learning.ts
git commit -m "feat: wire SessionService.endSession() to feed signals into adaptive system"
```

---

## Chunk 3: UI — Onboarding Preferences, Theme Picker, Adventure Mode

### Task 7: Onboarding Preferences Screen

**Files:**
- Create: `components/onboarding/PreferencesSetup.tsx`
- Modify: `components/onboarding/OnboardingFlow.tsx`

- [ ] **Step 1: Create PreferencesSetup component**

Create `components/onboarding/PreferencesSetup.tsx`:

```typescript
import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, fontSizes } from "@/theme";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const THEME_OPTIONS = [
  { id: "dinosaurs", label: "Dinosaurs", emoji: "🦕" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "cooking", label: "Cooking", emoji: "🍕" },
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "fantasy", label: "Fantasy", emoji: "🏰" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
];

const SUBJECT_OPTIONS = [
  { id: "addition", label: "Addition" },
  { id: "subtraction", label: "Subtraction" },
  { id: "multiplication", label: "Multiplication" },
  { id: "division", label: "Division" },
  { id: "fractions", label: "Fractions" },
  { id: "geometry", label: "Geometry" },
  { id: "measurement", label: "Measurement" },
  { id: "time", label: "Time" },
  { id: "money", label: "Money" },
];

interface PreferencesSetupProps {
  studentName: string;
  onComplete: (preferences: {
    favoriteThemes: string[];
    trickySubjects: string[];
  }) => void;
  onSkip: () => void;
}

export function PreferencesSetup({ studentName, onComplete, onSkip }: PreferencesSetupProps) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleTheme = (id: string) => {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What does {studentName} love?</Text>
      <Text style={styles.subtitle}>Pick up to 3 favorites</Text>

      <View style={styles.grid}>
        {THEME_OPTIONS.map((theme) => (
          <Pressable
            key={theme.id}
            style={[styles.themeCard, selectedThemes.includes(theme.id) && styles.themeCardSelected]}
            onPress={() => toggleTheme(theme.id)}
          >
            <Text style={styles.themeEmoji}>{theme.emoji}</Text>
            <Text style={[styles.themeLabel, selectedThemes.includes(theme.id) && styles.themeLabelSelected]}>
              {theme.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.title, { marginTop: spacing.xl }]}>
        Any subjects they find tricky?
      </Text>
      <Text style={styles.subtitle}>Optional — helps us personalize</Text>

      <View style={styles.chipContainer}>
        {SUBJECT_OPTIONS.map((subject) => (
          <Pressable
            key={subject.id}
            style={[styles.chip, selectedSubjects.includes(subject.id) && styles.chipSelected]}
            onPress={() => toggleSubject(subject.id)}
          >
            <Text style={[styles.chipText, selectedSubjects.includes(subject.id) && styles.chipTextSelected]}>
              {subject.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          label={selectedThemes.length > 0 ? "Continue" : "Skip for now"}
          onPress={() => {
            if (selectedThemes.length > 0) {
              onComplete({ favoriteThemes: selectedThemes, trickySubjects: selectedSubjects });
            } else {
              onSkip();
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { fontSize: fontSizes.xl, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.md },
  themeCard: {
    width: 100, height: 100, borderRadius: 16, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent",
  },
  themeCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  themeEmoji: { fontSize: 32, marginBottom: spacing.xs },
  themeLabel: { fontSize: fontSizes.sm, color: colors.text },
  themeLabelSelected: { color: colors.primary, fontWeight: "600" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline,
  },
  chipSelected: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.sm, color: colors.text },
  chipTextSelected: { color: colors.primary, fontWeight: "600" },
  buttons: { marginTop: spacing.xl, alignItems: "center" },
});
```

- [ ] **Step 2: Wire into OnboardingFlow**

Modify `components/onboarding/OnboardingFlow.tsx`. The existing flow uses a `step` state variable with sequential steps (character selection → profile setup → complete). Read the file to find the exact step names and the completion handler.

Add imports:
```typescript
import { PreferencesSetup } from "@/components/onboarding/PreferencesSetup";
import { themeAffinityService } from "@/services/ThemeAffinityService";
```

Add `"preferences"` as a new step after `"profile"` and before the completion step. In the step rendering switch/conditional, add:

```typescript
// After profile setup step, before completion:
case "preferences":
  return (
    <PreferencesSetup
      studentName={studentName}
      onComplete={async (preferences) => {
        // Seed theme affinities with neutral-positive scores
        for (const theme of preferences.favoriteThemes) {
          await themeAffinityService.updateAffinityFromSession(studentId, {
            sessionId: "onboarding",
            studentId,
            theme,
            skill: "general",
            accuracy: 0.5,
            engagement: 0.5,
            emotionScore: 0.5,
            speedScore: 0.5,
            retryScore: 0.5,
            timestamp: new Date(),
          });
        }
        // Store tricky subjects in student profile for misconception tracking
        if (preferences.trickySubjects.length > 0) {
          // Update profile with known tricky areas
          await studentProfileService.updateProfile(studentId, {
            trickySubjects: preferences.trickySubjects,
          });
        }
        setStep("complete"); // or whatever the completion step is named
      }}
      onSkip={() => setStep("complete")}
    />
  );
```

Update the step progression from profile → preferences (change the profile step's `onComplete` to `setStep("preferences")` instead of proceeding to completion).

- [ ] **Step 3: Verify app builds and onboarding flow renders**

```bash
npx expo export --platform web 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add components/onboarding/PreferencesSetup.tsx components/onboarding/OnboardingFlow.tsx
git commit -m "feat: add onboarding preferences screen for theme and subject selection"
```

- [ ] **Step 5: Run 3rd-grade agent to test the onboarding preferences UX**

Launch `third-grade-test-user` agent to evaluate the PreferencesSetup screen for usability, language clarity, and engagement from a child's perspective. Fix any issues identified.

- [ ] **Step 6: Commit fixes from 3rd-grade feedback**

```bash
git add -u
git commit -m "fix: improve onboarding preferences based on 3rd-grade user feedback"
```

---

### Task 8: Theme Picker Screen

**Files:**
- Create: `app/theme-picker/index.tsx`

- [ ] **Step 1: Create theme picker screen**

Create `app/theme-picker/index.tsx`:

```typescript
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, spacing, fontSizes } from "@/theme";

const THEME_VISUALS: Record<string, { emoji: string; color: string }> = {
  cooking: { emoji: "🍕", color: "#FF6B6B" },
  dinosaurs: { emoji: "🦕", color: "#4ECDC4" },
  space: { emoji: "🚀", color: "#6366F1" },
  animals: { emoji: "🐾", color: "#F59E0B" },
  sports: { emoji: "⚽", color: "#10B981" },
  fantasy: { emoji: "🏰", color: "#8B5CF6" },
  art: { emoji: "🎨", color: "#EC4899" },
  ocean: { emoji: "🌊", color: "#06B6D4" },
  music: { emoji: "🎵", color: "#F97316" },
};

export default function ThemePickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    choices: string; // comma-separated theme IDs
    studentId: string;
    character: string;
  }>();

  const choices = (params.choices || "animals,space,cooking").split(",");
  const character = params.character || "Ada";

  const handleSelect = (theme: string) => {
    router.push({
      pathname: "/[type]",
      params: {
        type: "math",
        adventureMode: "true",
        selectedTheme: theme,
        studentId: params.studentId,
      },
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Pick Your Next Adventure!</Text>
        <Text style={styles.subtitle}>{character} is ready to explore with you</Text>

        <View style={styles.cards}>
          {choices.map((theme) => {
            const visual = THEME_VISUALS[theme] || { emoji: "🌟", color: "#6366F1" };
            return (
              <Pressable
                key={theme}
                style={[styles.card, { borderColor: visual.color }]}
                onPress={() => handleSelect(theme)}
              >
                <Text style={styles.cardEmoji}>{visual.emoji}</Text>
                <Text style={styles.cardTitle}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)} Adventure
                </Text>
                <Text style={styles.cardSubtitle}>Tap to start!</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  title: { fontSize: fontSizes.xxl, fontWeight: "800", textAlign: "center", color: colors.text },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  cards: { gap: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: spacing.xl,
    alignItems: "center", borderWidth: 3, elevation: 2,
  },
  cardEmoji: { fontSize: 48, marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSizes.lg, fontWeight: "700", color: colors.text },
  cardSubtitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
});
```

- [ ] **Step 2: Verify the route renders**

```bash
npx expo export --platform web 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/theme-picker/index.tsx
git commit -m "feat: add theme picker screen for adventure selection at arc boundaries"
```

- [ ] **Step 4: Run 3rd-grade agent to evaluate theme picker**

Launch `third-grade-test-user` agent. Fix issues.

- [ ] **Step 5: Commit fixes**

```bash
git add -u
git commit -m "fix: improve theme picker based on 3rd-grade user feedback"
```

---

### Task 9: Adventure Mode in Worksheet Generator

**Files:**
- Modify: `app/[type]/index.tsx`

- [ ] **Step 1: Add adventure mode toggle, narrative UI, and adaptive generation**

In `app/[type]/index.tsx`, add the following complete implementation:

```typescript
// --- New imports at top of file ---
import { adaptivePlannerService, AdaptiveWorksheet } from "@/services/AdaptivePlannerService";
import { narrativeArcService } from "@/services/NarrativeArcService";
import { sessionService } from "@/services/SessionService";
import { LearningPlan } from "@/types/adaptive-pipeline";

// --- New state variables (add alongside existing state) ---
const [adventureMode, setAdventureMode] = useState(false);
const [adaptiveResult, setAdaptiveResult] = useState<{
  plan: LearningPlan;
  worksheet: AdaptiveWorksheet;
} | null>(null);
const [arcProgress, setArcProgress] = useState<{ current: number; total: number; title: string } | null>(null);

// --- Adventure Mode Toggle UI (render above the existing config form) ---
// Add this JSX before the existing config options:
{/* Adventure Mode Toggle */}
<View style={styles.modeToggle}>
  <Pressable
    style={[styles.modeButton, !adventureMode && styles.modeButtonActive]}
    onPress={() => setAdventureMode(false)}
  >
    <Text style={[styles.modeButtonText, !adventureMode && styles.modeButtonTextActive]}>
      Manual
    </Text>
  </Pressable>
  <Pressable
    style={[styles.modeButton, adventureMode && styles.modeButtonActive]}
    onPress={() => setAdventureMode(true)}
  >
    <Text style={[styles.modeButtonText, adventureMode && styles.modeButtonTextActive]}>
      Start Adventure!
    </Text>
  </Pressable>
</View>

{/* Arc Progress (shown when adventure mode is active and arc exists) */}
{adventureMode && arcProgress && (
  <View style={styles.arcProgress}>
    <Text style={styles.arcTitle}>{arcProgress.title}</Text>
    <View style={styles.arcProgressBar}>
      <View style={[styles.arcProgressFill, { width: `${(arcProgress.current / arcProgress.total) * 100}%` }]} />
    </View>
    <Text style={styles.arcProgressText}>
      Beat {arcProgress.current} of {arcProgress.total}
    </Text>
  </View>
)}

{/* Narrative Intro (shown after generation, before questions) */}
{adaptiveResult && (
  <View style={styles.narrativeIntro}>
    <Text style={styles.narrativeCharacter}>
      {adaptiveResult.worksheet.characterDialogue.greeting}
    </Text>
    <Text style={styles.narrativeText}>
      {adaptiveResult.worksheet.narrativeIntro}
    </Text>
  </View>
)}

{/* "I want something different" button (pivot trigger #5) */}
{adventureMode && arcProgress && (
  <Pressable
    style={styles.switchButton}
    onPress={async () => {
      const activeArc = await narrativeArcService.getActiveArc(studentId);
      if (activeArc) {
        const pivoted = narrativeArcService.pivotArc(activeArc, "student_requested_change");
        await narrativeArcService.updateArc(studentId, pivoted);
      }
      // Navigate to theme picker
      router.push({
        pathname: "/theme-picker",
        params: { studentId, character: selectedCharacter },
      });
    }}
  >
    <Text style={styles.switchButtonText}>I want a different adventure!</Text>
  </Pressable>
)}

// --- Adventure mode generation handler ---
const handleAdventureGenerate = async () => {
  try {
    setLoading(true);
    const result = await adaptivePlannerService.generateAdaptiveWorksheet(studentId);
    setAdaptiveResult(result);
    setArcProgress({
      current: result.plan.arcBeat.position,
      total: result.plan.arcBeat.totalBeats,
      title: result.plan.arcTitle,
    });

    // Start session with theme for signal tracking
    await sessionService.startSession(studentId, selectedCharacter, result.plan.theme);

    // Convert adaptive worksheet to existing Worksheet format for the attempt screen
    const worksheet = {
      title: result.worksheet.title,
      concept: result.worksheet.concept,
      questions: result.worksheet.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        explanation: q.explanation,
      })),
    };
    // Save and navigate to attempt
    await saveAndNavigate(worksheet);
  } catch (error) {
    console.error("[WorksheetGenerator] Adventure mode failed, falling back:", error);
    await handleManualGenerate();
  } finally {
    setLoading(false);
  }
};

// --- On worksheet completion callback (in attempt screen or after submit) ---
const handleAdventureComplete = async () => {
  if (!adaptiveResult) return;
  const activeArc = await narrativeArcService.getActiveArc(studentId);
  if (activeArc) {
    const beat = {
      position: adaptiveResult.plan.arcBeat.position,
      worksheetId: "current-worksheet-id", // set from saveAndNavigate result
      narrativeSummary: adaptiveResult.worksheet.narrativeSummary,
      cliffhanger: adaptiveResult.plan.arcBeat.cliffhanger,
      skillsFocused: [adaptiveResult.plan.subject],
      completedAt: new Date(),
    };
    const updatedArc = narrativeArcService.advanceBeat(activeArc, beat);
    await narrativeArcService.updateArc(studentId, updatedArc);

    // If arc completed, navigate to theme picker for next adventure
    if (updatedArc.status === "completed" && adaptiveResult.plan.themeChoicesForKid) {
      router.push({
        pathname: "/theme-picker",
        params: {
          choices: adaptiveResult.plan.themeChoicesForKid.join(","),
          studentId,
          character: selectedCharacter,
        },
      });
    }
  }
};

// --- Additional styles ---
const adventureStyles = StyleSheet.create({
  modeToggle: { flexDirection: "row", borderRadius: 12, overflow: "hidden", marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.outline },
  modeButton: { flex: 1, paddingVertical: spacing.sm, alignItems: "center" },
  modeButtonActive: { backgroundColor: colors.primary },
  modeButtonText: { fontSize: fontSizes.sm, color: colors.text },
  modeButtonTextActive: { color: colors.onPrimary, fontWeight: "700" },
  arcProgress: { backgroundColor: colors.primaryContainer, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  arcTitle: { fontSize: fontSizes.md, fontWeight: "700", color: colors.primary, textAlign: "center" },
  arcProgressBar: { height: 8, backgroundColor: colors.surfaceVariant, borderRadius: 4, marginTop: spacing.sm, overflow: "hidden" },
  arcProgressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  arcProgressText: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs },
  narrativeIntro: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.primary },
  narrativeCharacter: { fontSize: fontSizes.md, fontWeight: "600", color: colors.primary, marginBottom: spacing.sm },
  narrativeText: { fontSize: fontSizes.md, color: colors.text, lineHeight: 24 },
  switchButton: { alignSelf: "center", paddingVertical: spacing.xs, marginTop: spacing.sm },
  switchButtonText: { fontSize: fontSizes.sm, color: colors.textSecondary, textDecorationLine: "underline" },
});
```

- [ ] **Step 2: Verify the app builds and both modes work**

```bash
npx expo export --platform web 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/[type]/index.tsx
git commit -m "feat: add adventure mode to worksheet generator with adaptive pipeline integration"
```

- [ ] **Step 4: E2E test with Playwright MCP**

Use Playwright MCP to navigate to the worksheet generator screen, toggle adventure mode, verify the narrative UI appears, and confirm a worksheet generates successfully. Test both success and fallback paths.

- [ ] **Step 5: Run 3rd-grade agent on the adventure mode UI**

Launch `third-grade-test-user` agent to evaluate the adventure mode experience. Fix issues.

- [ ] **Step 6: Commit E2E and feedback fixes**

```bash
git add -u
git commit -m "fix: polish adventure mode UX based on testing and 3rd-grade feedback"
```

---

## Chunk 4: Discovery Quest, End-to-End Integration, and Final Testing

### Task 10: Discovery Quest Flow for New Students

**Files:**
- Create: `services/DiscoveryQuestService.ts`
- Create: `services/__tests__/DiscoveryQuestService.test.ts`
- Modify: `app/[type]/index.tsx` (wire discovery quest into adventure mode)

- [ ] **Step 1: Write failing tests**

Create `services/__tests__/DiscoveryQuestService.test.ts`:

```typescript
import { DiscoveryQuestService } from "../DiscoveryQuestService";

describe("DiscoveryQuestService", () => {
  let service: DiscoveryQuestService;

  beforeEach(() => {
    service = DiscoveryQuestService.getInstance();
  });

  describe("getDiscoveryPhase", () => {
    it("returns theme_discovery for 0 worksheets", () => {
      expect(service.getDiscoveryPhase(0)).toBe("theme_discovery");
    });
    it("returns theme_contrast for 1 worksheet", () => {
      expect(service.getDiscoveryPhase(1)).toBe("theme_contrast");
    });
    it("returns skill_probe for 2 worksheets", () => {
      expect(service.getDiscoveryPhase(2)).toBe("skill_probe");
    });
    it("returns complete for 3+ worksheets", () => {
      expect(service.getDiscoveryPhase(3)).toBe("complete");
      expect(service.getDiscoveryPhase(10)).toBe("complete");
    });
  });

  describe("generateDiscoveryPlan", () => {
    it("generates easy theme_discovery plan using first favorite theme", async () => {
      const plan = await service.generateDiscoveryPlan("s1", "2", "Ada", "theme_discovery", ["cooking", "space"], null);
      expect(plan.theme).toBe("cooking");
      expect(plan.difficulty).toBe("easy");
      expect(plan.subject).toBe("addition");
      expect(plan.character).toBe("Ada");
      expect(plan.arcBeat.position).toBe(1);
    });

    it("generates theme_contrast plan with different theme", async () => {
      const plan = await service.generateDiscoveryPlan("s1", "2", "Max", "theme_contrast", ["cooking", "space"], null);
      expect(plan.theme).toBe("space");
      expect(plan.difficulty).toBe("easy");
      expect(plan.character).toBe("Max");
    });

    it("generates medium difficulty skill_probe using best theme", async () => {
      const plan = await service.generateDiscoveryPlan("s1", "4", "Luna", "skill_probe", ["cooking"], "cooking");
      expect(plan.theme).toBe("cooking");
      expect(plan.difficulty).toBe("medium");
      expect(plan.subject).toBe("fractions");
      expect(plan.character).toBe("Luna");
    });

    it("picks grade-appropriate subject", async () => {
      const planK = await service.generateDiscoveryPlan("s1", "K", "Ada", "theme_discovery", ["animals"], null);
      expect(planK.subject).toBe("counting");

      const plan5 = await service.generateDiscoveryPlan("s1", "5", "Ada", "theme_discovery", ["animals"], null);
      expect(plan5.subject).toBe("fractions");
    });

    it("throws for complete phase", async () => {
      await expect(service.generateDiscoveryPlan("s1", "2", "Ada", "complete", [], null)).rejects.toThrow("complete");
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest services/__tests__/DiscoveryQuestService.test.ts --no-cache
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement DiscoveryQuestService**

Create `services/DiscoveryQuestService.ts`:

```typescript
import { adaptivePlannerService } from "@/services/AdaptivePlannerService";
import { themeAffinityService } from "@/services/ThemeAffinityService";
import { LearningPlan } from "@/types/adaptive-pipeline";

interface DiscoveryState {
  phase: "theme_discovery" | "theme_contrast" | "skill_probe" | "complete";
  worksheetsCompleted: number;
  themesExplored: string[];
  bestThemeSoFar: string | null;
}

export class DiscoveryQuestService {
  private static instance: DiscoveryQuestService;

  static getInstance(): DiscoveryQuestService {
    if (!DiscoveryQuestService.instance) {
      DiscoveryQuestService.instance = new DiscoveryQuestService();
    }
    return DiscoveryQuestService.instance;
  }

  getDiscoveryPhase(worksheetsCompleted: number): DiscoveryState["phase"] {
    if (worksheetsCompleted === 0) return "theme_discovery";
    if (worksheetsCompleted === 1) return "theme_contrast";
    if (worksheetsCompleted === 2) return "skill_probe";
    return "complete";
  }

  async generateDiscoveryPlan(
    studentId: string,
    grade: string,
    character: string,
    phase: DiscoveryState["phase"],
    favoriteThemes: string[],
    bestThemeSoFar: string | null,
  ): Promise<LearningPlan> {
    const gradeNum = grade === "K" ? 0 : parseInt(grade);

    // Pick appropriate subject for grade
    const gradeSubjects: Record<number, string> = {
      0: "counting", 1: "addition", 2: "addition",
      3: "multiplication", 4: "fractions", 5: "fractions",
    };
    const subject = gradeSubjects[gradeNum] || "addition";

    switch (phase) {
      case "theme_discovery":
        return {
          theme: favoriteThemes[0] || "animals",
          character,
          arcTitle: "Let's Find Your Adventure!",
          arcBeat: { position: 1, totalBeats: 3, narrative: "Welcome to your first quest!", cliffhanger: "More adventures await!" },
          subject,
          difficulty: "easy",
          pedagogicalStrategy: `Introduce ${subject} with ${favoriteThemes[0] || "animal"} themed fun problems`,
          misconceptionsToAddress: [],
          characterBehavior: `${character} is excited to meet the student and cheers them on`,
          emotionalTone: "warm, welcoming, celebratory",
          questionGuidance: ["Keep questions simple", "Use the theme in every question", "Make it fun and confidence-building"],
        };

      case "theme_contrast":
        const contrastTheme = favoriteThemes[1] || "space";
        return {
          theme: contrastTheme,
          character,
          arcTitle: "Let's Find Your Adventure!",
          arcBeat: { position: 2, totalBeats: 3, narrative: "A new world to explore!", cliffhanger: "One more challenge ahead!" },
          subject,
          difficulty: "easy",
          pedagogicalStrategy: `Same skill (${subject}) but now with ${contrastTheme} — lets us compare theme engagement`,
          misconceptionsToAddress: [],
          characterBehavior: `${character} introduces the new theme with enthusiasm`,
          emotionalTone: "encouraging, curious",
          questionGuidance: ["Same difficulty as worksheet 1", "Different theme context", "Note how student responds"],
        };

      case "skill_probe":
        const bestTheme = bestThemeSoFar || favoriteThemes[0] || "animals";
        return {
          theme: bestTheme,
          character,
          arcTitle: "Let's Find Your Adventure!",
          arcBeat: { position: 3, totalBeats: 3, narrative: "The final challenge!", cliffhanger: "" },
          subject,
          difficulty: "medium",
          pedagogicalStrategy: `Use the student's best theme (${bestTheme}) with mixed difficulty to find their level`,
          misconceptionsToAddress: [],
          characterBehavior: `${character} encourages persistence and celebrates effort`,
          emotionalTone: "supportive, builds confidence even on mistakes",
          questionGuidance: ["Mix of easy and medium questions", "Include 1-2 stretch problems", "Use best theme to maximize engagement"],
        };

      default:
        throw new Error("Discovery quest is complete");
    }
  }
}

export const discoveryQuestService = DiscoveryQuestService.getInstance();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest services/__tests__/DiscoveryQuestService.test.ts --no-cache
```

Expected: All 7 tests PASS

- [ ] **Step 5: Commit service**

```bash
git add services/DiscoveryQuestService.ts services/__tests__/DiscoveryQuestService.test.ts
git commit -m "feat: add DiscoveryQuestService with tests for new student cold-start flow"
```

- [ ] **Step 6: Wire discovery quest into adventure mode**

In `app/[type]/index.tsx`, modify the `handleAdventureGenerate` function to check if the student is new (fewer than 3 completed worksheets). If so, route through the discovery quest instead of the normal adaptive pipeline:

```typescript
import { discoveryQuestService } from "@/services/DiscoveryQuestService";

const handleAdventureGenerate = async () => {
  try {
    setLoading(true);

    // Check if student needs discovery quest (< 3 worksheets completed)
    const profile = await studentProfileService.getProfile(studentId);
    const worksheetsCompleted = profile?.worksheetsCompleted ?? 0;
    const phase = discoveryQuestService.getDiscoveryPhase(worksheetsCompleted);

    let result;
    if (phase !== "complete") {
      // Discovery quest: use deterministic plan, then generate worksheet
      const plan = await discoveryQuestService.generateDiscoveryPlan(
        studentId,
        profile?.grade || "1",
        selectedCharacter,
        phase,
        profile?.favoriteThemes || ["animals"],
        profile?.bestThemeSoFar || null,
      );
      const worksheet = await adaptivePlannerService.generateWorksheet(plan);
      result = { plan, worksheet };
    } else {
      // Normal adaptive pipeline
      result = await adaptivePlannerService.generateAdaptiveWorksheet(studentId);
    }

    setAdaptiveResult(result);
    // ... rest of existing handler
  } catch (error) {
    // ... existing fallback
  }
};
```

Also add a `worksheetsCompleted` counter to the student profile, incremented in `handleAdventureComplete`.

- [ ] **Step 7: Commit wiring**

```bash
git add app/[type]/index.tsx
git commit -m "feat: wire discovery quest into adventure mode for new students"
```

---

### Task 11: Parent Agent Testing

- [ ] **Step 1: Create parent agent and test parent flows**

Launch a `general-purpose` agent acting as a **parent** to test:
1. Sign up flow → onboarding → preferences screen
2. Verify theme selection UI is clear for parents
3. Verify subject selection is optional and non-intimidating
4. Ensure the flow is fast (under 30 seconds equivalent)

Fix any issues found.

- [ ] **Step 2: Commit parent flow fixes**

```bash
git add -u
git commit -m "fix: improve parent onboarding flow based on parent agent testing"
```

---

### Task 12: End-to-End Integration Test with Playwright

- [ ] **Step 1: Full E2E flow with Playwright MCP**

Use Playwright MCP to test the complete flow:

1. **New user signup** → onboarding → character selection → profile setup → preferences
2. **First worksheet** (discovery quest) → verify narrative appears → complete it
3. **Second worksheet** → verify different theme → complete it
4. **Third worksheet** → verify adaptive adjustment → complete it
5. **Adventure mode** → verify arc is created → verify beat progression
6. **Theme picker** → verify it appears at arc boundary → select a new theme
7. **Verify fallback** → if LLM fails, manual generation still works

- [ ] **Step 2: Fix any E2E issues found**

```bash
git add -u
git commit -m "fix: resolve E2E integration issues found in Playwright testing"
```

---

### Task 13: 3rd-Grade User Testing of Full Flow

- [ ] **Step 1: Run 3rd-grade agent on complete adventure flow**

Launch `third-grade-test-user` agent to test the full adventure experience:
- Is the narrative engaging?
- Are the theme cards exciting?
- Is the character dialogue age-appropriate?
- Does the arc progression feel rewarding?
- Any confusing UI elements?

- [ ] **Step 2: Implement feedback fixes**

```bash
git add -u
git commit -m "fix: polish full adventure flow based on 3rd-grade user testing"
```

---

### Task 14: Final Verification and Merge

- [ ] **Step 1: Run all unit tests**

```bash
npx jest --no-cache
```

Expected: All tests PASS

- [ ] **Step 2: Verify app builds cleanly**

```bash
npx expo export --platform web 2>&1 | tail -5
```

Expected: Build succeeds

- [ ] **Step 3: Run lint**

```bash
npx expo lint
```

Expected: No errors

- [ ] **Step 4: Final E2E smoke test with Playwright**

Quick Playwright smoke test: open app → navigate to adventure mode → generate one worksheet → verify it renders.

- [ ] **Step 5: Merge to main**

```bash
git checkout main
git merge feature/adaptive-learning-pipeline --no-ff -m "feat: adaptive learning pipeline with dual-LLM, narrative arcs, and theme personalization"
```

- [ ] **Step 6: Ask human for review**

Present the completed work for human review before pushing.
