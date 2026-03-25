import { LearningPlan } from "@/types/adaptive-pipeline";

type DiscoveryPhase = "theme_discovery" | "theme_contrast" | "skill_probe" | "complete";

export class DiscoveryQuestService {
  private static instance: DiscoveryQuestService;

  static getInstance(): DiscoveryQuestService {
    if (!DiscoveryQuestService.instance) {
      DiscoveryQuestService.instance = new DiscoveryQuestService();
    }
    return DiscoveryQuestService.instance;
  }

  getDiscoveryPhase(worksheetsCompleted: number): DiscoveryPhase {
    if (worksheetsCompleted === 0) return "theme_discovery";
    if (worksheetsCompleted === 1) return "theme_contrast";
    if (worksheetsCompleted === 2) return "skill_probe";
    return "complete";
  }

  generateDiscoveryPlan(
    studentId: string,
    grade: string,
    character: string,
    phase: DiscoveryPhase,
    favoriteThemes: string[],
    bestThemeSoFar: string | null,
  ): LearningPlan {
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
          grade,
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

      case "theme_contrast": {
        const contrastTheme = favoriteThemes[1] || "space";
        return {
          grade,
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
      }

      case "skill_probe": {
        const bestTheme = bestThemeSoFar || favoriteThemes[0] || "animals";
        return {
          grade,
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
      }

      default:
        throw new Error("Discovery quest is complete");
    }
  }
}

export const discoveryQuestService = DiscoveryQuestService.getInstance();
