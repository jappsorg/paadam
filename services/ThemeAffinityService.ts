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
