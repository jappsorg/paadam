import { WorksheetMode } from '@/types/worksheet';

interface SuggestionInput {
  completedWorksheetCount: number;
  averageScore: number;
  skillsMastery: Record<string, { needsReview?: boolean; masteryLevel?: number }>;
  currentStreak: number;
  recentAccuracy: number;
  dispositionConfidence?: number;
  challengeSeeking?: number;
}

export interface ModeSuggestion {
  mode: WorksheetMode;
  reason: string;
  skillName?: string;
}

export function getSuggestion(input: SuggestionInput): ModeSuggestion {
  const {
    completedWorksheetCount,
    averageScore,
    skillsMastery,
    currentStreak,
    recentAccuracy,
    dispositionConfidence,
    challengeSeeking,
  } = input;

  // Tier 1: 0-2 completed worksheets
  if (completedWorksheetCount <= 2) {
    if (completedWorksheetCount >= 1 && averageScore < 70) {
      return {
        mode: 'practice',
        reason: "Let's practice what we tried last time!",
      };
    }
    return {
      mode: 'explore',
      reason: "Let's discover something fun together!",
    };
  }

  // Find skills needing review
  const reviewSkills = Object.entries(skillsMastery)
    .filter(([, s]) => s.needsReview)
    .sort((a, b) => (a[1].masteryLevel ?? 0) - (b[1].masteryLevel ?? 0));

  // Tier 3: 8+ worksheets with confident disposition data
  if (
    completedWorksheetCount >= 8 &&
    dispositionConfidence !== undefined &&
    dispositionConfidence >= 0.5 &&
    challengeSeeking !== undefined
  ) {
    if (challengeSeeking >= 7 && recentAccuracy >= 80) {
      return {
        mode: 'challenge',
        reason: "You're on fire! Ready to test yourself?",
      };
    }
  }

  // Tier 2: 3+ worksheets
  if (reviewSkills.length >= 2) {
    const skillName = reviewSkills[0][0];
    return {
      mode: 'practice',
      reason: `Your ${skillName} could use some love!`,
      skillName,
    };
  }

  if (currentStreak >= 3 && recentAccuracy >= 80) {
    return {
      mode: 'challenge',
      reason: "You're on a roll! Ready for a challenge?",
    };
  }

  return {
    mode: 'explore',
    reason: "Let's explore something new today!",
  };
}
