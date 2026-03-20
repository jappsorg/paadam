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
  parentFeedback?: string[];
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
