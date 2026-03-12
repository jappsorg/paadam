/**
 * Student Profile Service
 *
 * Manages student profiles, skill mastery, learning disposition tracking,
 * XP/leveling, streaks, and character relationships
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
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CharacterService } from "./CharacterService";
import {
  StudentProfile,
  SkillMastery,
  LearningDisposition,
  PersonalityEffectiveness,
  Grade,
} from "../types/adaptive-learning";

export class StudentProfileService {
  private static readonly COLLECTION = "students";

  /**
   * Create a new student profile
   */
  async createProfile(
    userId: string,
    data: {
      name: string;
      grade: Grade;
      dateOfBirth?: Date;
      preferredLanguage?: string;
    },
  ): Promise<StudentProfile> {
    const studentId = this.generateStudentId();
    const now = new Date();

    const profile: StudentProfile = {
      id: studentId,
      userId,
      name: data.name,
      grade: data.grade,
      dateOfBirth: data.dateOfBirth,
      preferredLanguage: data.preferredLanguage || "en",

      // XP and leveling
      level: 1,
      xp: 0,
      xpToNextLevel: 100,

      // Streak tracking
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      totalPracticeTime: 0, // minutes

      // Character relationship
      selectedCharacterId: null, // Must choose during onboarding
      characterBondLevel: 0,

      // Learning disposition (starts null, populated after 5 sessions)
      learningDisposition: null,
      dispositionConfidence: 0,

      // Skills
      skillsMastery: {},

      // Metadata
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    };

    const docRef = doc(db, StudentProfileService.COLLECTION, studentId);
    await setDoc(docRef, {
      ...profile,
      createdAt: Timestamp.fromDate(profile.createdAt),
      updatedAt: Timestamp.fromDate(profile.updatedAt),
      lastActiveAt: Timestamp.fromDate(profile.lastActiveAt),
      dateOfBirth: profile.dateOfBirth
        ? Timestamp.fromDate(profile.dateOfBirth)
        : null,
    });

    console.log("[StudentProfile] Created profile:", studentId);
    return profile;
  }

  /**
   * Get student profile by ID
   */
  async getProfile(studentId: string): Promise<StudentProfile | null> {
    const docRef = doc(db, StudentProfileService.COLLECTION, studentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.mapDocToProfile(docSnap.data());
  }

  /**
   * Get all students for a user (parent)
   */
  async getUserStudents(userId: string): Promise<StudentProfile[]> {
    const q = query(
      collection(db, StudentProfileService.COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.mapDocToProfile(doc.data()));
  }

  /**
   * Update student profile
   */
  async updateProfile(
    studentId: string,
    updates: Partial<StudentProfile>,
  ): Promise<void> {
    const docRef = doc(db, StudentProfileService.COLLECTION, studentId);

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects to Timestamps
    if (updates.dateOfBirth) {
      updateData.dateOfBirth = Timestamp.fromDate(updates.dateOfBirth);
    }
    if (updates.lastPracticeDate) {
      updateData.lastPracticeDate = Timestamp.fromDate(
        updates.lastPracticeDate,
      );
    }

    await updateDoc(docRef, updateData);
    console.log("[StudentProfile] Updated profile:", studentId);
  }

  /**
   * Update skill mastery for a specific skill
   */
  async updateSkillMastery(
    studentId: string,
    skillId: string,
    updates: Partial<SkillMastery>,
  ): Promise<void> {
    const profile = await this.getProfile(studentId);
    if (!profile) {
      throw new Error(`Student profile not found: ${studentId}`);
    }

    const currentMastery =
      profile.skillsMastery[skillId] || this.createInitialSkillMastery(skillId);

    const updatedMastery: SkillMastery = {
      ...currentMastery,
      ...updates,
      lastPracticedAt: new Date(),
    };

    profile.skillsMastery[skillId] = updatedMastery;

    await this.updateProfile(studentId, {
      skillsMastery: profile.skillsMastery,
    });

    console.log(
      "[StudentProfile] Updated skill mastery:",
      skillId,
      updatedMastery.masteryLevel,
    );
  }

  /**
   * Award XP and handle leveling up
   */
  async awardXP(
    studentId: string,
    xp: number,
  ): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    xpAwarded: number;
  }> {
    const profile = await this.getProfile(studentId);
    if (!profile) {
      throw new Error(`Student profile not found: ${studentId}`);
    }

    const newXP = profile.xp + xp;
    let newLevel = profile.level;
    let leveledUp = false;

    // Check for level up
    while (newXP >= profile.xpToNextLevel) {
      newLevel++;
      leveledUp = true;
    }

    const xpToNextLevel = this.calculateXPForNextLevel(newLevel);

    await this.updateProfile(studentId, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel,
    });

    console.log("[StudentProfile] Awarded XP:", xp, "New level:", newLevel);

    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      xpAwarded: xp,
    };
  }

  /**
   * Update streak based on practice
   */
  async updateStreak(studentId: string): Promise<{
    currentStreak: number;
    streakIncreased: boolean;
    longestStreak: number;
  }> {
    const profile = await this.getProfile(studentId);
    if (!profile) {
      throw new Error(`Student profile not found: ${studentId}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = profile.currentStreak;
    let streakIncreased = false;

    if (!profile.lastPracticeDate) {
      // First practice
      currentStreak = 1;
      streakIncreased = true;
    } else {
      const lastPractice = new Date(profile.lastPracticeDate);
      lastPractice.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 0) {
        // Same day, no change
      } else if (daysDiff === 1) {
        // Consecutive day, increase streak
        currentStreak++;
        streakIncreased = true;
      } else {
        // Streak broken, reset
        currentStreak = 1;
      }
    }

    const longestStreak = Math.max(profile.longestStreak, currentStreak);

    await this.updateProfile(studentId, {
      currentStreak,
      longestStreak,
      lastPracticeDate: new Date(),
    });

    console.log("[StudentProfile] Updated streak:", currentStreak);

    return {
      currentStreak,
      streakIncreased,
      longestStreak,
    };
  }

  /**
   * Update learning disposition based on session data
   * Called after analyzing session effectiveness with different personalities
   */
  async updateLearningDisposition(
    studentId: string,
    disposition: LearningDisposition,
  ): Promise<void> {
    await this.updateProfile(studentId, {
      learningDisposition: disposition,
      dispositionConfidence: disposition.confidence,
    });

    console.log(
      "[StudentProfile] Updated learning disposition:",
      disposition.primaryStyle,
    );
  }

  /**
   * Track personality effectiveness
   * Used to determine if character swap is recommended
   */
  async trackPersonalityEffectiveness(
    studentId: string,
    sessionId: string,
    characterId: string,
    metrics: {
      masteryVelocity: number; // skills mastered per hour
      engagementScore: number; // 0-100
      frustrationLevel: number; // 0-100
      completionRate: number; // 0-1
    },
  ): Promise<void> {
    const profile = await this.getProfile(studentId);
    if (!profile || !profile.learningDisposition) {
      return;
    }

    const effectivenessData =
      profile.learningDisposition.personalityEffectiveness || [];

    // Find existing entry for this character
    const existingIndex = effectivenessData.findIndex(
      (e) => e.characterId === characterId,
    );

    if (existingIndex >= 0) {
      // Update existing
      const existing = effectivenessData[existingIndex];
      effectivenessData[existingIndex] = {
        ...existing,
        sessionsCompleted: existing.sessionsCompleted + 1,
        averageMasteryVelocity:
          (existing.averageMasteryVelocity * existing.sessionsCompleted +
            metrics.masteryVelocity) /
          (existing.sessionsCompleted + 1),
        averageEngagement:
          (existing.averageEngagement * existing.sessionsCompleted +
            metrics.engagementScore) /
          (existing.sessionsCompleted + 1),
        lastUsed: new Date(),
      };
    } else {
      // Add new entry
      const newEntry: PersonalityEffectiveness = {
        characterId,
        characterName: CharacterService.getCharacterById(characterId)?.name || characterId,
        energyLevel: "medium",
        teachingStyle: "supportive",
        sessionsCompleted: 1,
        totalSessionsWithPersonality: 1,
        averageMasteryVelocity: metrics.masteryVelocity,
        averageEngagement: metrics.engagementScore,
        frustrationIncidents: 0,
        voluntarySessionStarts: 1,
        averageSessionDuration: 0,
        lastUsed: new Date(),
      };
      effectivenessData.push(newEntry);
    }

    // Update disposition
    const updatedDisposition: LearningDisposition = {
      ...profile.learningDisposition,
      personalityEffectiveness: effectivenessData,
    };

    await this.updateLearningDisposition(studentId, updatedDisposition);
  }

  /**
   * Get recommended character based on personality effectiveness
   */
  async getRecommendedCharacter(studentId: string): Promise<{
    recommendedCharacterId: string;
    reason: string;
    currentEffectiveness: number;
    recommendedEffectiveness: number;
  } | null> {
    const profile = await this.getProfile(studentId);
    if (
      !profile ||
      !profile.learningDisposition ||
      !profile.selectedCharacterId
    ) {
      return null;
    }

    const effectivenessData =
      profile.learningDisposition.personalityEffectiveness || [];

    if (effectivenessData.length < 2) {
      // Need data from at least 2 characters to compare
      return null;
    }

    // Find current character effectiveness
    const currentData = effectivenessData.find(
      (e) => e.characterId === profile.selectedCharacterId,
    );
    if (!currentData) {
      return null;
    }

    // Find best alternative
    const alternatives = effectivenessData
      .filter(
        (e) =>
          e.characterId !== profile.selectedCharacterId &&
          e.sessionsCompleted >= 3,
      )
      .sort((a, b) => b.averageMasteryVelocity - a.averageMasteryVelocity);

    if (alternatives.length === 0) {
      return null;
    }

    const bestAlternative = alternatives[0];

    // Recommend swap if alternative is 20% better
    const improvementThreshold = 1.2;
    if (
      bestAlternative.averageMasteryVelocity >
      currentData.averageMasteryVelocity * improvementThreshold
    ) {
      return {
        recommendedCharacterId: bestAlternative.characterId,
        reason: `Based on past sessions, ${bestAlternative.characterId} helped you learn ${Math.round((bestAlternative.averageMasteryVelocity / currentData.averageMasteryVelocity - 1) * 100)}% faster!`,
        currentEffectiveness: currentData.averageMasteryVelocity,
        recommendedEffectiveness: bestAlternative.averageMasteryVelocity,
      };
    }

    return null;
  }

  /**
   * Update character bond level
   */
  async updateCharacterBond(
    studentId: string,
    bondIncrease: number,
  ): Promise<number> {
    const profile = await this.getProfile(studentId);
    if (!profile) {
      throw new Error(`Student profile not found: ${studentId}`);
    }

    const newBondLevel = Math.min(
      100,
      profile.characterBondLevel + bondIncrease,
    );

    await this.updateProfile(studentId, {
      characterBondLevel: newBondLevel,
    });

    console.log("[StudentProfile] Updated bond level:", newBondLevel);
    return newBondLevel;
  }

  /**
   * Add practice time
   */
  async addPracticeTime(studentId: string, minutes: number): Promise<void> {
    const profile = await this.getProfile(studentId);
    if (!profile) {
      throw new Error(`Student profile not found: ${studentId}`);
    }

    await this.updateProfile(studentId, {
      totalPracticeTime: profile.totalPracticeTime + minutes,
      lastActiveAt: new Date(),
    });
  }

  /**
   * Create initial skill mastery object
   */
  private createInitialSkillMastery(skillId: string): SkillMastery {
    return {
      skillId,
      masteryLevel: 0, // 0-100
      questionsAttempted: 0,
      questionsCorrect: 0,
      currentDifficulty: 1, // 1-5
      consecutiveCorrect: 0,
      lastPracticedAt: new Date(),
      needsReview: false,
    };
  }

  /**
   * Calculate XP needed for next level
   */
  private calculateXPForNextLevel(level: number): number {
    // Progressive XP curve: Level 1->2 = 100, Level 2->3 = 150, etc.
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Generate unique student ID
   */
  private generateStudentId(): string {
    return `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Map Firestore document to StudentProfile
   */
  private mapDocToProfile(data: any): StudentProfile {
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
      dateOfBirth: data.dateOfBirth?.toDate() || undefined,
      lastPracticeDate: data.lastPracticeDate?.toDate() || null,
    };
  }
}

// Export singleton instance
export const studentProfileService = new StudentProfileService();
export default studentProfileService;
