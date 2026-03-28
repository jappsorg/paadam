import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
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
import { LLM_MODELS } from "@/constants";
import { getApplicationsForSkill, getLeastExposedDomain, LifeSkillDomain } from "@/constants/lifeSkillGraph";

const openrouter = createOpenRouter({
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
});

// Zod schema for Planner output
const LearningPlanSchema = z.object({
  grade: z.string().describe("The student's grade level (e.g., K, 1, 2, 3, 4, 5)"),
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
  lifeSkillDomain: z.string().optional().describe("Life skill domain being applied: money, cooking, or time"),
  lifeSkillGuidance: z.array(z.string()).optional().describe("Specific guidance for weaving life skill context into questions"),
  parentSummary: z.string().optional().describe("One-sentence parent-friendly summary of what the child practiced"),
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
  lifeSkillDomain: z.string().optional().describe("Life skill domain applied in this worksheet"),
  parentSummary: z.string().optional().describe("Parent-friendly one-sentence summary of what was practiced"),
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

    // Parent observations
    if (context.parentFeedback && context.parentFeedback.length > 0) {
      lines.push(`\nParent observations (incorporate these into your planning):`);
      context.parentFeedback.forEach((note) => lines.push(`  - "${note}"`));
    }

    // Life skill applied learning context
    const grade = context.grade;
    const primarySkill = Object.entries(context.skillMastery)
      .sort(([, a], [, b]) => (a.masteryLevel ?? 0) - (b.masteryLevel ?? 0))
      .find(([, s]) => (s.masteryLevel ?? 0) >= 40)?.[0]; // Only apply life skills if mastery >= 40%

    if (primarySkill) {
      const applications = getApplicationsForSkill(primarySkill, grade);
      if (applications.length > 0) {
        const validDomains = [...new Set(applications.map(a => a.lifeSkillDomain))] as LifeSkillDomain[];
        const lifeSkillExposure = (context as any).lifeSkillExposure || {};

        // 80/20 rule: mostly use preferred themes, occasionally nudge toward unexposed
        const shouldNudge = Math.random() < 0.2;
        let selectedDomain: LifeSkillDomain;

        if (shouldNudge) {
          selectedDomain = getLeastExposedDomain(lifeSkillExposure, validDomains);
        } else {
          // Pick domain that aligns with existing theme preferences
          selectedDomain = validDomains[0]; // Default to first valid
          for (const domain of validDomains) {
            // Check if any theme affinity matches this domain
            const domainThemes: Record<string, string[]> = {
              money: ['shopping', 'treasure', 'business', 'market'],
              cooking: ['food', 'baking', 'kitchen', 'restaurant', 'cooking'],
              time: ['travel', 'space', 'adventure', 'race', 'sports'],
            };
            const themes = domainThemes[domain] || [];
            const hasAffinity = Object.keys(context.themeAffinities).some(t =>
              themes.some(dt => t.toLowerCase().includes(dt))
            );
            if (hasAffinity) {
              selectedDomain = domain;
              break;
            }
          }
        }

        // Check staleness: if domain used 3 of last 5, force different
        const domainExposure = lifeSkillExposure[selectedDomain];
        if (domainExposure && domainExposure.timesExposed >= 3) {
          const alternatives = validDomains.filter(d => d !== selectedDomain);
          if (alternatives.length > 0) {
            selectedDomain = getLeastExposedDomain(lifeSkillExposure, alternatives);
          }
        }

        const selectedApps = applications.filter(a => a.lifeSkillDomain === selectedDomain);
        const guidance = selectedApps.flatMap(a => a.promptGuidance);

        lines.push(`\nApplied Learning Context:`);
        lines.push(`Life skill domain: ${selectedDomain}`);
        lines.push(`Weave this real-world context into the math problems naturally.`);
        lines.push(`Guidance: ${guidance.slice(0, 3).join('; ')}`);
        lines.push(`Generate a one-sentence parentSummary describing what the child practiced in parent-friendly language.`);
        lines.push(`Example: "Maya practiced fractions by helping Chef Ada double a pancake recipe."`);
      }
    }

    return lines.join("\n");
  }

  async generatePlan(context: StudentContext): Promise<LearningPlan> {
    const studentSummary = this.buildPlannerPrompt(context);

    const { object } = await generateObject({
      model: openrouter(LLM_MODELS.CLAUDE_HAIKU),
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
- Make the narrative engaging for a ${context.grade} grader
- If Applied Learning Context is provided, weave the life skill naturally into the narrative theme
- Set lifeSkillDomain to the domain name if applied learning is used
- Set lifeSkillGuidance to specific guidance for question generation
- Generate a parentSummary: one sentence for parents describing what was practiced`,
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
      model: openrouter(LLM_MODELS.CLAUDE_SONNET),
      schema: AdaptiveWorksheetSchema,
      messages: [
        {
          role: "system",
          content: `You are a creative K-5 math worksheet generator. Generate a worksheet that weaves math problems into the given narrative. Every question should feel like part of the story. The character dialogue should match the character's personality.

Important:
- This is a TEXT-ONLY app — NO images or visual aids. All questions must be self-contained in text.
- CRITICAL: Every question MUST require a CALCULATION or REASONING to solve. Never generate questions where the answer is simply restated from the question. BAD: "There are 5 monkeys. How many monkeys are there?" GOOD: "There are 3 monkeys in a tree and 2 more climb up. How many monkeys are in the tree now?" Always give TWO or more quantities that need to be combined, compared, or operated on.
- For young grades (K-1), use simple addition/subtraction with small numbers but always require actual math to find the answer.
- The plan includes the student's grade level — ALL questions MUST be appropriate for that grade
- Generate 5-8 questions appropriate for both the grade level and difficulty level
- Each question should connect to the narrative theme
- Include the narrative intro that sets the scene
- Character dialogue should be warm and age-appropriate
- The arc progression hook should build excitement for next time
- Answers should be numeric values only (e.g., "5" not "5 penguins")
- INTERACTIVE CLOCK: For Time-related questions, the app has an interactive clock where kids drag hands. Format time answers as "H:MM" (e.g., "3:30", "10:15"). Ask questions like "What time will it be in 2 hours?" and let the child set the clock to answer.`,
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

  buildFallbackPlan(context: StudentContext): LearningPlan {
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
      grade: context.grade,
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
