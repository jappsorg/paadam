import { studentProfileService } from "@/services/StudentProfileService";
import { sessionService } from "@/services/SessionService";
import { themeAffinityService } from "@/services/ThemeAffinityService";
import { narrativeArcService } from "@/services/NarrativeArcService";
import { StudentContext, SessionSignals } from "@/types/adaptive-pipeline";
import { progressInsightsService } from "./ProgressInsightsService";

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

    // Fetch parent feedback notes
    let parentFeedback: string[] = [];
    try {
      const parentUserId = profile?.userId || studentId;
      const notes = await progressInsightsService.getUnconsumedNotes(parentUserId, studentId);
      parentFeedback = notes.map((n) => n.text);
      if (notes.length > 0) {
        const noteIds = notes.filter((n) => n.id).map((n) => n.id!);
        await progressInsightsService.markNotesConsumed(parentUserId, noteIds);
      }
    } catch (err) {
      console.warn("[SignalAggregator] Could not load parent notes:", err);
    }

    // Extract misconceptions from skill mastery data
    const misconceptions: string[] = [];
    if (profile?.skillMastery) {
      for (const [skill, mastery] of Object.entries(profile.skillMastery)) {
        if ((mastery as any).needsReview) {
          misconceptions.push(`Needs review: ${skill}`);
        }
      }
    }

    // Determine learning velocity
    let learningVelocity = "moderate";
    if (profile?.learningDisposition) {
      const effectiveness = (profile.learningDisposition as any).personalityEffectiveness || [];
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
      parentFeedback,
      lifeSkillExposure: profile?.lifeSkillExposure || {},
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
