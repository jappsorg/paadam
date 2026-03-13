/**
 * Session Service
 *
 * Manages learning sessions with emotional memory priority
 * Supports "Right to Forget" (session deletion)
 */

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
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  LearningSession,
  EmotionalState,
  BehavioralPattern,
  QuestionAttempt,
} from "../types/adaptive-learning";
import { themeAffinityService } from "@/services/ThemeAffinityService";
import { signalAggregatorService } from "@/services/SignalAggregatorService";

export class SessionService {
  private static readonly SESSIONS_COLLECTION = "sessions";
  private static readonly DELETED_SESSIONS_COLLECTION = "deleted_sessions";

  /**
   * Start a new learning session
   */
  async startSession(
    studentId: string,
    characterId: string,
    theme?: string,
  ): Promise<LearningSession> {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const session: LearningSession = {
      id: sessionId,
      studentId,
      characterId,
      theme: theme || undefined,

      startTime: now,
      endTime: null,
      durationMinutes: 0,

      // Emotional tracking (HIGHEST PRIORITY for agent memory)
      emotionalStates: [],
      overallMood: null,
      frustrationTriggers: [],
      celebrationMoments: [],

      // Behavioral tracking
      behavioralPatterns: [],
      energyLevel: null,
      focusQuality: null,

      // Performance tracking
      questionsAttempted: [],
      skillsWorkedOn: [],
      newSkillsIntroduced: [],
      skillsMastered: [],

      // Session outcomes
      xpEarned: 0,
      achievementsUnlocked: [],
      masteryVelocity: 0, // skills per hour

      // Agent memory summary (generated at session end)
      agentMemorySummary: null,

      // Metadata
      createdAt: now,
      updatedAt: now,
    };

    const docRef = doc(db, SessionService.SESSIONS_COLLECTION, sessionId);
    await setDoc(docRef, this.sessionToFirestore(session));

    console.log("[Session] Started session:", sessionId);
    return session;
  }

  /**
   * Log emotional state during session
   * CRITICAL: This is the highest priority data for agent memory
   */
  async logEmotionalState(
    sessionId: string,
    emotionalState: Omit<EmotionalState, "timestamp">,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const stateWithTimestamp: EmotionalState = {
      ...emotionalState,
      timestamp: new Date(),
    };

    session.emotionalStates.push(stateWithTimestamp);

    // Track frustration triggers
    if (emotionalState.emotion === "frustrated" && emotionalState.context) {
      session.frustrationTriggers.push({
        timestamp: new Date(),
        trigger: emotionalState.context,
        intensity: emotionalState.intensity,
      });
    }

    // Track celebration moments
    if (
      ["excited", "proud", "joyful"].includes(emotionalState.emotion) &&
      emotionalState.context
    ) {
      session.celebrationMoments.push({
        timestamp: new Date(),
        moment: emotionalState.context,
        intensity: emotionalState.intensity,
      });
    }

    await this.updateSession(sessionId, {
      emotionalStates: session.emotionalStates,
      frustrationTriggers: session.frustrationTriggers,
      celebrationMoments: session.celebrationMoments,
    });

    console.log("[Session] Logged emotional state:", emotionalState.emotion);
  }

  /**
   * Log behavioral pattern
   */
  async logBehavioralPattern(
    sessionId: string,
    pattern: Omit<BehavioralPattern, "timestamp">,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const patternWithTimestamp: BehavioralPattern = {
      ...pattern,
      timestamp: new Date(),
    };

    session.behavioralPatterns.push(patternWithTimestamp);

    await this.updateSession(sessionId, {
      behavioralPatterns: session.behavioralPatterns,
    });

    console.log("[Session] Logged behavioral pattern:", pattern.pattern);
  }

  /**
   * Log question attempt
   */
  async logQuestionAttempt(
    sessionId: string,
    attempt: Omit<QuestionAttempt, "timestamp">,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const attemptWithTimestamp: QuestionAttempt = {
      ...attempt,
      timestamp: new Date(),
    };

    session.questionsAttempted.push(attemptWithTimestamp);

    // Track skills worked on
    if (!session.skillsWorkedOn.includes(attempt.skillId)) {
      session.skillsWorkedOn.push(attempt.skillId);
    }

    await this.updateSession(sessionId, {
      questionsAttempted: session.questionsAttempted,
      skillsWorkedOn: session.skillsWorkedOn,
    });
  }

  /**
   * End session and generate agent memory summary
   */
  async endSession(
    sessionId: string,
    summary: {
      overallMood: "positive" | "neutral" | "negative";
      energyLevel: "high" | "medium" | "low";
      focusQuality: "excellent" | "good" | "fair" | "poor";
      agentMemorySummary: string;
      xpEarned: number;
      skillsMastered: string[];
      achievementsUnlocked: string[];
    },
  ): Promise<LearningSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 60000,
    );

    // Calculate mastery velocity
    const masteryVelocity =
      durationMinutes > 0
        ? summary.skillsMastered.length / (durationMinutes / 60)
        : 0;

    await this.updateSession(sessionId, {
      endTime,
      durationMinutes,
      overallMood: summary.overallMood,
      energyLevel: summary.energyLevel,
      focusQuality: summary.focusQuality,
      agentMemorySummary: summary.agentMemorySummary,
      xpEarned: summary.xpEarned,
      skillsMastered: summary.skillsMastered,
      achievementsUnlocked: summary.achievementsUnlocked,
      masteryVelocity,
    });

    console.log(
      "[Session] Ended session:",
      sessionId,
      `Duration: ${durationMinutes}min`,
    );

    // Feed signals to adaptive system
    try {
      if (session.skillsWorkedOn.length > 0) {
        const signals = signalAggregatorService.computeSessionSignals(
          sessionId,
          session.studentId,
          session.theme || "general",
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

    return (await this.getSession(sessionId))!;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<LearningSession | null> {
    const docRef = doc(db, SessionService.SESSIONS_COLLECTION, sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.firestoreToSession(docSnap.data());
  }

  /**
   * Get recent sessions for a student (for agent memory)
   */
  async getRecentSessions(
    studentId: string,
    count: number = 10,
  ): Promise<LearningSession[]> {
    const q = query(
      collection(db, SessionService.SESSIONS_COLLECTION),
      where("studentId", "==", studentId),
      where("endTime", "!=", null),
      orderBy("endTime", "desc"),
      limit(count),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.firestoreToSession(doc.data()));
  }

  /**
   * Get sessions by date range
   */
  async getSessionsByDateRange(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LearningSession[]> {
    const q = query(
      collection(db, SessionService.SESSIONS_COLLECTION),
      where("studentId", "==", studentId),
      where("startTime", ">=", Timestamp.fromDate(startDate)),
      where("startTime", "<=", Timestamp.fromDate(endDate)),
      orderBy("startTime", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.firestoreToSession(doc.data()));
  }

  /**
   * Delete session (Right to Forget)
   * Moves session to deleted_sessions collection for audit trail
   */
  async deleteSession(
    sessionId: string,
    reason: string,
    deletedBy: string,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Move to deleted_sessions collection
    const deletedRecord = {
      originalSessionId: sessionId,
      studentId: session.studentId,
      sessionDate: session.startTime,
      durationMinutes: session.durationMinutes,
      deletionReason: reason,
      deletedBy,
      deletedAt: new Date(),
      // Store minimal metadata (no PII, no detailed questions)
      hadFrustration: session.frustrationTriggers.length > 0,
      skillsWorkedOn: session.skillsWorkedOn,
      overallMood: session.overallMood,
    };

    const deletedDocRef = doc(
      db,
      SessionService.DELETED_SESSIONS_COLLECTION,
      sessionId,
    );
    await setDoc(deletedDocRef, {
      ...deletedRecord,
      sessionDate: Timestamp.fromDate(deletedRecord.sessionDate),
      deletedAt: Timestamp.fromDate(deletedRecord.deletedAt),
    });

    // Delete original session
    const sessionDocRef = doc(
      db,
      SessionService.SESSIONS_COLLECTION,
      sessionId,
    );
    await deleteDoc(sessionDocRef);

    console.log(
      "[Session] Deleted session (Right to Forget):",
      sessionId,
      "Reason:",
      reason,
    );
  }

  /**
   * Get deleted sessions for audit (parent dashboard)
   */
  async getDeletedSessions(studentId: string): Promise<any[]> {
    const q = query(
      collection(db, SessionService.DELETED_SESSIONS_COLLECTION),
      where("studentId", "==", studentId),
      orderBy("deletedAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      sessionDate: doc.data().sessionDate?.toDate(),
      deletedAt: doc.data().deletedAt?.toDate(),
    }));
  }

  /**
   * Get emotional memory summary for agent
   * Returns prioritized emotional patterns from recent sessions
   */
  async getEmotionalMemorySummary(
    studentId: string,
    sessionCount: number = 10,
  ): Promise<{
    recentMood: string;
    commonFrustrations: string[];
    celebrationPatterns: string[];
    energyPatterns: string;
    focusPatterns: string;
  }> {
    const sessions = await this.getRecentSessions(studentId, sessionCount);

    // Analyze mood distribution
    const moods = sessions.map((s) => s.overallMood).filter(Boolean);
    const positiveMoods = moods.filter((m) => m === "positive").length;
    const negativeMoods = moods.filter((m) => m === "negative").length;

    let recentMood = "neutral";
    if (positiveMoods > negativeMoods * 2) recentMood = "generally positive";
    else if (negativeMoods > positiveMoods * 2)
      recentMood = "needs encouragement";

    // Extract common frustrations
    const allFrustrations = sessions.flatMap((s) =>
      s.frustrationTriggers.map((f) => f.trigger),
    );
    const frustrationCounts = this.countOccurrences(allFrustrations);
    const commonFrustrations = Object.entries(frustrationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);

    // Extract celebration patterns
    const allCelebrations = sessions.flatMap((s) =>
      s.celebrationMoments.map((c) => c.moment),
    );
    const celebrationCounts = this.countOccurrences(allCelebrations);
    const celebrationPatterns = Object.entries(celebrationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([moment]) => moment);

    // Energy patterns
    const energyLevels = sessions.map((s) => s.energyLevel).filter(Boolean);
    const energyPatterns = this.getMostCommon(energyLevels) || "varies";

    // Focus patterns
    const focusQualities = sessions.map((s) => s.focusQuality).filter(Boolean);
    const focusPatterns = this.getMostCommon(focusQualities) || "varies";

    return {
      recentMood,
      commonFrustrations,
      celebrationPatterns,
      energyPatterns,
      focusPatterns,
    };
  }

  /**
   * Update session
   */
  private async updateSession(
    sessionId: string,
    updates: Partial<LearningSession>,
  ): Promise<void> {
    const docRef = doc(db, SessionService.SESSIONS_COLLECTION, sessionId);

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects
    if (updates.endTime) {
      updateData.endTime = Timestamp.fromDate(updates.endTime);
    }

    await updateDoc(docRef, updateData);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert session to Firestore format
   */
  private sessionToFirestore(session: LearningSession): any {
    return {
      ...session,
      startTime: Timestamp.fromDate(session.startTime),
      endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null,
      createdAt: Timestamp.fromDate(session.createdAt),
      updatedAt: Timestamp.fromDate(session.updatedAt),
    };
  }

  /**
   * Convert Firestore document to session
   */
  private firestoreToSession(data: any): LearningSession {
    return {
      ...data,
      startTime: data.startTime?.toDate() || new Date(),
      endTime: data.endTime?.toDate() || null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  /**
   * Count occurrences in array
   */
  private countOccurrences(arr: string[]): Record<string, number> {
    return arr.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get most common item in array
   */
  private getMostCommon<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;

    const counts = arr.reduce(
      (acc, item) => {
        const key = String(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? (mostCommon[0] as any) : null;
  }
}

// Export singleton instance
export const sessionService = new SessionService();
export default sessionService;
