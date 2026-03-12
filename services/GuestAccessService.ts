/**
 * Guest Access Service
 *
 * Manages temporary caregiver access via QR codes
 * For grandparents, babysitters, etc. who need to see current goals
 * without full parent dashboard access
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { GuestAccess, CaregiverBrief } from "../types/adaptive-learning";

export class GuestAccessService {
  private static readonly COLLECTION = "guest_access";

  /**
   * Generate guest access token with QR code
   */
  async createGuestAccess(
    studentId: string,
    createdBy: string, // parent userId
    options: {
      expiresInHours?: number;
      accessLevel?: "view-only" | "basic-interaction";
      caregiverName?: string;
      caregiverRelation?: string;
    } = {},
  ): Promise<GuestAccess> {
    const accessId = this.generateAccessId();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (options.expiresInHours || 24) * 60 * 60 * 1000,
    );

    const guestAccess: Partial<GuestAccess> = {
      id: accessId,
      studentId,
      caregiverType: (options.caregiverRelation as any) || "other",
      caregiverName: options.caregiverName,

      accessCode: accessId,
      qrCode: "", // Will be generated
      shortUrl: `https://paadam.app/g/${accessId}`,
      token: this.generateToken(),
      qrCodeData: "", // Will be generated from token

      accessLevel: options.accessLevel || "view-only",
      permissions: {
        canViewProgress: true,
        canStartSession: options.accessLevel === "basic-interaction",
        canViewFullHistory: false,
        canEditSettings: false,
      },

      createdBy,
      createdAt: now,
      expiresAt,
      lastUsedAt: undefined,
      usageCount: 0,

      revoked: false,
    };

    // Generate QR code data
    guestAccess.qrCodeData = this.generateQRCodeData(
      guestAccess.token!,
      studentId,
    );
    guestAccess.qrCode = guestAccess.qrCodeData;

    const docRef = doc(db, GuestAccessService.COLLECTION, accessId);
    await setDoc(docRef, {
      ...guestAccess,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.fromDate(now),
      lastUsedAt: null,
    });

    console.log(
      "[GuestAccess] Created guest access:",
      accessId,
      "Expires:",
      expiresAt,
    );
    return guestAccess as GuestAccess;
  }

  /**
   * Validate guest access token
   */
  async validateToken(token: string): Promise<GuestAccess | null> {
    const q = query(
      collection(db, GuestAccessService.COLLECTION),
      where("token", "==", token),
      where("revoked", "==", false),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const guestAccess = this.mapDocToGuestAccess(querySnapshot.docs[0].data());

    // Check expiration
    if (new Date() > guestAccess.expiresAt) {
      await this.revokeAccess(guestAccess.id, "system");
      return null;
    }

    // Update usage
    await this.updateUsage(guestAccess.id);

    return guestAccess;
  }

  /**
   * Get caregiver brief for guest view
   * Returns minimal information about current learning goals
   */
  async getCaregiverBrief(token: string): Promise<CaregiverBrief | null> {
    const guestAccess = await this.validateToken(token);

    if (!guestAccess) {
      return null;
    }

    // Import services (avoid circular dependency)
    const { studentProfileService } = await import("./StudentProfileService");
    const { sessionService } = await import("./SessionService");

    const student = await studentProfileService.getProfile(
      guestAccess.studentId,
    );
    if (!student) {
      return null;
    }

    // Get recent sessions
    const recentSessions = await sessionService.getRecentSessions(
      guestAccess.studentId,
      3,
    );
    const emotionalSummary = await sessionService.getEmotionalMemorySummary(
      guestAccess.studentId,
      5,
    );

    // Get top 3 skills being worked on
    const skillsInProgress = Object.entries(student.skillsMastery)
      .filter(
        ([_, mastery]) => mastery.masteryLevel < 80 && mastery.masteryLevel > 0,
      )
      .sort(
        (a, b) =>
          b[1].lastPracticedAt.getTime() - a[1].lastPracticedAt.getTime(),
      )
      .slice(0, 3)
      .map(([skillId, mastery]) => ({
        skillId,
        masteryLevel: mastery.masteryLevel,
        name: this.getSkillDisplayName(skillId),
      }));

    // Simple encouragement tips based on emotional state
    const encouragementTips = this.generateEncouragementTips(
      emotionalSummary,
      student.selectedCharacterId,
    );

    const character = await this.getCharacterInfo(student.selectedCharacterId);

    const brief: CaregiverBrief = {
      studentName: student.name,
      characterName: this.getCharacterDisplayName(student.selectedCharacterId),
      currentGoals: `Practice ${skillsInProgress[0]?.name || "new skills"}`,
      todaysMission: `Help ${student.name} work on ${skillsInProgress.map((s) => s.name).join(", ")}`,
      encouragementTips,
      whatToAvoid: [
        "Rushing through problems",
        "Skipping explanations",
        "Comparing to siblings",
      ],
      sessionGuidance: `${student.name} learns best with patience and encouragement. Celebrate small wins!`,
      characterInfo: {
        name: character.name,
        personality: character.personality,
        howToReference: `"${character.name} thinks you can do this!"`,
      },
    };

    return brief;
  }

  /**
   * Revoke guest access (manual or automatic expiration)
   */
  async revokeAccess(accessId: string, revokedBy: string): Promise<void> {
    const docRef = doc(db, GuestAccessService.COLLECTION, accessId);
    await updateDoc(docRef, {
      revoked: true,
      revokedAt: Timestamp.fromDate(new Date()),
      revokedBy,
    });

    console.log("[GuestAccess] Revoked access:", accessId);
  }

  /**
   * Get all active guest accesses for a student
   */
  async getActiveAccesses(studentId: string): Promise<GuestAccess[]> {
    const q = query(
      collection(db, GuestAccessService.COLLECTION),
      where("studentId", "==", studentId),
      where("revoked", "==", false),
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();

    const accesses = querySnapshot.docs
      .map((doc) => this.mapDocToGuestAccess(doc.data()))
      .filter((access) => access.expiresAt > now);

    return accesses;
  }

  /**
   * Revoke all guest accesses for a student
   */
  async revokeAllAccesses(studentId: string, revokedBy: string): Promise<void> {
    const accesses = await this.getActiveAccesses(studentId);

    for (const access of accesses) {
      await this.revokeAccess(access.id, revokedBy);
    }

    console.log("[GuestAccess] Revoked all accesses for student:", studentId);
  }

  /**
   * Update usage count
   */
  private async updateUsage(accessId: string): Promise<void> {
    const docRef = doc(db, GuestAccessService.COLLECTION, accessId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      await updateDoc(docRef, {
        usageCount: (data.usageCount || 0) + 1,
        lastUsedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Generate unique access ID
   */
  private generateAccessId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate secure token
   */
  private generateToken(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Generate QR code data (URL that opens guest view)
   */
  private generateQRCodeData(token: string, studentId: string): string {
    const baseUrl = process.env.EXPO_PUBLIC_APP_URL || "https://paadam.app";
    return `${baseUrl}/guest?token=${token}&student=${studentId}`;
  }

  /**
   * Generate encouragement tips based on emotional state
   */
  private generateEncouragementTips(
    emotionalSummary: {
      recentMood: string;
      commonFrustrations: string[];
      celebrationPatterns: string[];
      energyPatterns: string;
    },
    characterId: string | null,
  ): string[] {
    const tips: string[] = [];

    // Mood-based tip
    if (emotionalSummary.recentMood.includes("positive")) {
      tips.push(
        `${this.getCharacterDisplayName(characterId)} has been doing great! Keep celebrating wins together.`,
      );
    } else if (emotionalSummary.recentMood.includes("encouragement")) {
      tips.push(
        "Some extra encouragement today will go a long way. Celebrate small victories!",
      );
    }

    // Energy-based tip
    if (emotionalSummary.energyPatterns === "low") {
      tips.push(
        "Energy has been lower lately. Short, fun practice sessions work best.",
      );
    } else if (emotionalSummary.energyPatterns === "high") {
      tips.push("High energy! Great time for interactive learning games.");
    }

    // Frustration-based tip
    if (emotionalSummary.commonFrustrations.length > 0) {
      tips.push(
        `If frustrated, take breaks! Common challenges: ${emotionalSummary.commonFrustrations[0]}`,
      );
    }

    // Celebration-based tip
    if (emotionalSummary.celebrationPatterns.length > 0) {
      tips.push(
        `Loves celebrating: ${emotionalSummary.celebrationPatterns[0]}. Do more of that!`,
      );
    }

    // Default tips if nothing specific
    if (tips.length === 0) {
      tips.push("Keep sessions short and fun (15-20 minutes is perfect)");
      tips.push("Celebrate every correct answer with enthusiasm!");
    }

    return tips.slice(0, 3); // Max 3 tips
  }

  /**
   * Get display name for skill ID
   */
  private getSkillDisplayName(skillId: string): string {
    // In real app, this would look up from skills database
    const skillNames: Record<string, string> = {
      "add-1digit": "Single-Digit Addition",
      "add-2digit": "Two-Digit Addition",
      "sub-1digit": "Single-Digit Subtraction",
      "mult-tables": "Multiplication Tables",
      "fractions-basic": "Understanding Fractions",
      "fractions-add": "Adding Fractions",
      "geometry-shapes": "Identifying Shapes",
      "measurement-length": "Measuring Length",
      "word-problems-basic": "Word Problems",
    };

    return (
      skillNames[skillId] ||
      skillId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  /**
   * Get display name for character ID
   */
  private getCharacterDisplayName(characterId: string | null): string {
    if (!characterId) return "Learning Companion";

    const characterNames: Record<string, string> = {
      ada: "Ada",
      max: "Max",
      luna: "Luna",
      buddy: "Buddy",
      spark: "Spark",
      coco: "Coco",
      "professor-bear": "Professor Bear",
    };

    return characterNames[characterId] || characterId;
  }

  /**
   * Get character info for caregiver brief
   */
  private async getCharacterInfo(characterId: string | null): Promise<{
    name: string;
    personality: string;
    howToReference: string;
  }> {
    const name = this.getCharacterDisplayName(characterId);

    const personalities: Record<
      string,
      { name: string; personality: string; howToReference: string }
    > = {
      ada: {
        name: "Ada",
        personality: "Calm, methodical, and encouraging",
        howToReference: `"Ada says to take your time and think it through!"`,
      },
      max: {
        name: "Max",
        personality: "Energetic, enthusiastic, and playful",
        howToReference: `"Max is so excited to see you try!"`,
      },
      luna: {
        name: "Luna",
        personality: "Creative, patient, and supportive",
        howToReference: `"Luna believes in you!"`,
      },
    };

    return (
      personalities[characterId || ""] || {
        name,
        personality: "Supportive and encouraging",
        howToReference: `"${name} is cheering you on!"`,
      }
    );
  }

  /**
   * Map Firestore document to GuestAccess
   */
  private mapDocToGuestAccess(data: any): GuestAccess {
    return {
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      lastUsedAt: data.lastUsedAt?.toDate() || null,
    };
  }
}

// Export singleton instance
export const guestAccessService = new GuestAccessService();
export default guestAccessService;
