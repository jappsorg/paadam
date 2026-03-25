/**
 * Achievement Service
 *
 * Defines all achievements and handles checking/awarding them
 * when a student completes a worksheet or reaches milestones.
 */

import {
  Achievement,
  AchievementCategory,
  AchievementTier,
  Badge,
} from "../types/adaptive-learning";
import { StudentProfileService } from "./StudentProfileService";

// ─── Context passed when checking achievements ───
export interface AchievementContext {
  score: number; // 0-100 percentage
  worksheetType: string; // math, puzzle, word-problem, logic
  totalCompleted: number; // total worksheets completed
  currentStreak: number; // current day streak
  currentLevel: number; // student level
  bondLevel: number; // character bond level 0-100
}

// ─── Lightweight definition used internally ───
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  tier: AchievementTier;
  criteria: {
    check: (ctx: AchievementContext, extras: AchievementExtras) => boolean;
  };
}

// Extra state loaded once for multi-achievement checks
interface AchievementExtras {
  perfectScoreCount: number; // how many 100% scores (stored in profile badges)
  completedTypes: Set<string>; // worksheet types completed at least once
  maxSkillMastery: number; // highest mastery % across all skills
}

// ─── 14 Achievement Definitions ───
const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // --- Milestone: Worksheet completion ---
  {
    id: "first-worksheet",
    name: "First Steps",
    description: "Complete your very first worksheet!",
    emoji: "\u{1F31F}", // star2
    category: "milestone",
    tier: "bronze",
    criteria: {
      check: (ctx) => ctx.totalCompleted >= 1,
    },
  },
  {
    id: "five-worksheets",
    name: "Getting Warmed Up",
    description: "Complete 5 worksheets",
    emoji: "\u{1F4DA}", // books
    category: "milestone",
    tier: "silver",
    criteria: {
      check: (ctx) => ctx.totalCompleted >= 5,
    },
  },
  {
    id: "twenty-five-worksheets",
    name: "Worksheet Wizard",
    description: "Complete 25 worksheets",
    emoji: "\u{1F9D9}", // mage
    category: "milestone",
    tier: "gold",
    criteria: {
      check: (ctx) => ctx.totalCompleted >= 25,
    },
  },

  // --- Skill Mastery: Perfect scores ---
  {
    id: "perfect-score",
    name: "Perfect!",
    description: "Score 100% on any worksheet",
    emoji: "\u{1F4AF}", // 100
    category: "skill-mastery",
    tier: "silver",
    criteria: {
      check: (ctx) => ctx.score === 100,
    },
  },
  {
    id: "three-perfects",
    name: "Triple Perfect",
    description: "Score 100% on 3 worksheets",
    emoji: "\u{1F451}", // crown
    category: "skill-mastery",
    tier: "gold",
    criteria: {
      check: (ctx, extras) => {
        // Count the current score as well if it is 100
        const total = ctx.score === 100 ? extras.perfectScoreCount + 1 : extras.perfectScoreCount;
        return total >= 3;
      },
    },
  },

  // --- Streak achievements ---
  {
    id: "streak-3",
    name: "On a Roll",
    description: "Practice 3 days in a row",
    emoji: "\u{1F525}", // fire
    category: "streak",
    tier: "bronze",
    criteria: {
      check: (ctx) => ctx.currentStreak >= 3,
    },
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Practice 7 days in a row",
    emoji: "\u{26A1}", // zap
    category: "streak",
    tier: "silver",
    criteria: {
      check: (ctx) => ctx.currentStreak >= 7,
    },
  },
  {
    id: "streak-30",
    name: "Unstoppable",
    description: "Practice 30 days in a row!",
    emoji: "\u{1F3C6}", // trophy
    category: "streak",
    tier: "gold",
    criteria: {
      check: (ctx) => ctx.currentStreak >= 30,
    },
  },

  // --- Skill mastery level ---
  {
    id: "skill-mastery-50",
    name: "Getting the Hang of It",
    description: "Reach 50% mastery in any skill",
    emoji: "\u{1F4AA}", // muscle
    category: "skill-mastery",
    tier: "bronze",
    criteria: {
      check: (_ctx, extras) => extras.maxSkillMastery >= 50,
    },
  },
  {
    id: "skill-mastery-80",
    name: "Skill Star",
    description: "Reach 80% mastery in any skill",
    emoji: "\u{2B50}", // star
    category: "skill-mastery",
    tier: "gold",
    criteria: {
      check: (_ctx, extras) => extras.maxSkillMastery >= 80,
    },
  },

  // --- Variety ---
  {
    id: "all-types",
    name: "Jack of All Trades",
    description: "Complete at least 1 of each worksheet type",
    emoji: "\u{1F308}", // rainbow
    category: "learning-behavior",
    tier: "silver",
    criteria: {
      check: (ctx, extras) => {
        const types = new Set(extras.completedTypes);
        types.add(ctx.worksheetType); // include current
        return (
          types.has("math") &&
          types.has("puzzle") &&
          types.has("word-problem") &&
          types.has("logic")
        );
      },
    },
  },

  // --- Level milestones ---
  {
    id: "level-5",
    name: "Rising Star",
    description: "Reach Level 5",
    emoji: "\u{1F680}", // rocket
    category: "milestone",
    tier: "silver",
    criteria: {
      check: (ctx) => ctx.currentLevel >= 5,
    },
  },
  {
    id: "level-10",
    name: "Super Scholar",
    description: "Reach Level 10",
    emoji: "\u{1F393}", // graduation cap
    category: "milestone",
    tier: "gold",
    criteria: {
      check: (ctx) => ctx.currentLevel >= 10,
    },
  },

  // --- Character bond ---
  {
    id: "bond-50",
    name: "Best Friends",
    description: "Reach a buddy bond level of 50+",
    emoji: "\u{1F496}", // sparkling heart
    category: "character-bond",
    tier: "silver",
    criteria: {
      check: (ctx) => ctx.bondLevel >= 50,
    },
  },
];

export class AchievementService {
  private profileService: StudentProfileService;

  constructor(profileService?: StudentProfileService) {
    this.profileService = profileService || new StudentProfileService();
  }

  /**
   * Get all achievement definitions (for display on profile, etc.)
   */
  static getAllDefinitions(): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS;
  }

  /**
   * Get a single achievement definition by ID
   */
  static getDefinition(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
  }

  /**
   * Check all unearned achievements and award any that are now met.
   *
   * Returns the list of newly unlocked achievement definitions.
   */
  async checkAndAwardAchievements(
    studentId: string,
    context: AchievementContext,
  ): Promise<AchievementDefinition[]> {
    const profile = await this.profileService.getProfile(studentId);
    if (!profile) {
      console.warn("[Achievement] Profile not found:", studentId);
      return [];
    }

    const earnedIds = new Set(profile.achievements || []);

    // Build extras from profile data
    const extras = this.buildExtras(profile, earnedIds);

    const newlyEarned: AchievementDefinition[] = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      // Skip already-earned achievements
      if (earnedIds.has(def.id)) continue;

      // Check if the criteria are met
      if (def.criteria.check(context, extras)) {
        newlyEarned.push(def);
        earnedIds.add(def.id);
      }
    }

    // Persist if anything was earned
    if (newlyEarned.length > 0) {
      const updatedAchievements = Array.from(earnedIds);
      const updatedBadges: Badge[] = [
        ...(profile.badges || []),
        ...newlyEarned.map((def) => ({
          achievementId: def.id,
          unlockedAt: new Date(),
          progress: 100,
          displayOnProfile: true,
          timesEarned: 1,
        })),
      ];

      await this.profileService.updateProfile(studentId, {
        achievements: updatedAchievements,
        badges: updatedBadges,
      } as any);

      console.log(
        "[Achievement] Awarded:",
        newlyEarned.map((a) => a.id).join(", "),
      );
    }

    return newlyEarned;
  }

  /**
   * Build extra context from profile data for criteria checks
   */
  private buildExtras(
    profile: any,
    earnedIds: Set<string>,
  ): AchievementExtras {
    // Count perfect scores from badges (each "perfect-score" badge means at least 1)
    // We track how many 100% worksheets via badges tagged with perfect scores
    // For simplicity, count badges that are perfect-score related
    let perfectScoreCount = 0;
    if (earnedIds.has("perfect-score")) {
      perfectScoreCount = 1;
    }
    // Look at the badge timesEarned for "perfect-score" if available
    const perfectBadge = (profile.badges || []).find(
      (b: Badge) => b.achievementId === "perfect-score",
    );
    if (perfectBadge) {
      perfectScoreCount = perfectBadge.timesEarned || 1;
    }

    // Completed worksheet types: derive from profile or stored data
    // We check which type-specific achievements have context
    // For now, track via a stored field or infer from skills
    const completedTypes = new Set<string>();
    const skills = profile.skillsMastery || {};
    for (const skillId of Object.keys(skills)) {
      if (
        skillId.includes("math") ||
        skillId.includes("addition") ||
        skillId.includes("subtraction") ||
        skillId.includes("multiplication") ||
        skillId.includes("division") ||
        skillId.includes("fractions") ||
        skillId.includes("decimals") ||
        skillId.includes("geometry") ||
        skillId.includes("measurement") ||
        skillId.includes("algebra")
      ) {
        completedTypes.add("math");
      }
      if (skillId.includes("puzzle") || skillId.includes("pattern")) {
        completedTypes.add("puzzle");
      }
      if (skillId.includes("word-problem") || skillId.includes("word_problem")) {
        completedTypes.add("word-problem");
      }
      if (skillId.includes("logic")) {
        completedTypes.add("logic");
      }
    }

    // Also check a stored completedWorksheetTypes array if present
    if (profile.completedWorksheetTypes) {
      for (const t of profile.completedWorksheetTypes) {
        completedTypes.add(t);
      }
    }

    // Max skill mastery
    let maxSkillMastery = 0;
    for (const skill of Object.values(skills)) {
      const mastery = (skill as any).masteryLevel || 0;
      if (mastery > maxSkillMastery) {
        maxSkillMastery = mastery;
      }
    }

    return {
      perfectScoreCount,
      completedTypes,
      maxSkillMastery,
    };
  }
}

// Export singleton instance
export const achievementService = new AchievementService();
export default achievementService;
