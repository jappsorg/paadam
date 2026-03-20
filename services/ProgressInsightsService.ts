// services/ProgressInsightsService.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ParentNote } from "@/types/parent-notes";
import { studentProfileService } from "./StudentProfileService";
import { sessionService } from "./SessionService";

export interface WeeklySnapshot {
  practiceTimeMinutes: number;
  practiceTimePrevWeek: number;
  accuracy: number;
  accuracyPrevWeek: number;
  currentStreak: number;
  xpEarnedThisWeek: number;
}

export interface SkillOverviewItem {
  skillId: string;
  skillName: string;
  masteryLevel: number;
  color: "green" | "yellow" | "red" | "gray";
  questionsAttempted: number;
  questionsCorrect: number;
  recentAccuracy: number;
  lastPracticedAt: Date | null;
  needsReview: boolean;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  scorePercent: number | null;
  topic: string;
  date: Date;
  status: string;
}

export class ProgressInsightsService {
  private static instance: ProgressInsightsService;

  static getInstance(): ProgressInsightsService {
    if (!ProgressInsightsService.instance) {
      ProgressInsightsService.instance = new ProgressInsightsService();
    }
    return ProgressInsightsService.instance;
  }

  async getWeeklySnapshot(studentId: string): Promise<WeeklySnapshot> {
    const profile = await studentProfileService.getProfile(studentId);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

    const attemptsRef = collection(db, "worksheetAttempts");
    const thisWeekQ = query(
      attemptsRef,
      where("userId", "==", studentId),
      where("startedAt", ">=", Timestamp.fromDate(startOfWeek)),
      orderBy("startedAt", "desc"),
    );
    const prevWeekQ = query(
      attemptsRef,
      where("userId", "==", studentId),
      where("startedAt", ">=", Timestamp.fromDate(startOfPrevWeek)),
      where("startedAt", "<", Timestamp.fromDate(startOfWeek)),
      orderBy("startedAt", "desc"),
    );

    const [thisWeekSnap, prevWeekSnap] = await Promise.all([
      getDocs(thisWeekQ),
      getDocs(prevWeekQ),
    ]);

    const calcStats = (docs: any[]) => {
      let totalTime = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalXP = 0;
      docs.forEach((d) => {
        const data = d.data();
        totalTime += data.durationMinutes || 0;
        totalXP += data.xpEarned || 0;
        if (data.answers) {
          const answers = Object.values(data.answers) as any[];
          totalQuestions += answers.length;
          totalCorrect += answers.filter((a: any) => a.isCorrect).length;
        }
      });
      return {
        time: totalTime,
        accuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
        xp: totalXP,
      };
    };

    const thisWeek = calcStats(thisWeekSnap.docs);
    const prevWeek = calcStats(prevWeekSnap.docs);

    return {
      practiceTimeMinutes: thisWeek.time,
      practiceTimePrevWeek: prevWeek.time,
      accuracy: thisWeek.accuracy,
      accuracyPrevWeek: prevWeek.accuracy,
      currentStreak: profile?.currentStreak || 0,
      xpEarnedThisWeek: thisWeek.xp,
    };
  }

  async getSkillOverview(studentId: string): Promise<SkillOverviewItem[]> {
    const profile = await studentProfileService.getProfile(studentId);
    const mastery = (profile as any)?.skillMastery || {};

    return Object.entries(mastery).map(([skillId, data]: [string, any]) => {
      const level = data.masteryLevel ?? 0;
      let color: SkillOverviewItem["color"] = "gray";
      if (level >= 80) color = "green";
      else if (level >= 40) color = "yellow";
      else if (level > 0) color = "red";

      return {
        skillId,
        skillName: skillId.charAt(0).toUpperCase() + skillId.slice(1).replace(/-/g, " "),
        masteryLevel: level,
        color,
        questionsAttempted: data.questionsAttempted || 0,
        questionsCorrect: data.questionsCorrect || 0,
        recentAccuracy: data.recentAccuracy || 0,
        lastPracticedAt: data.lastPracticedAt?.toDate?.() || null,
        needsReview: data.needsReview || false,
      };
    });
  }

  async getRecentActivity(studentId: string, count: number = 5): Promise<RecentActivityItem[]> {
    const attemptsRef = collection(db, "worksheetAttempts");
    const q = query(
      attemptsRef,
      where("userId", "==", studentId),
      orderBy("startedAt", "desc"),
      limit(count),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      const answers = data.answers ? Object.values(data.answers) as any[] : [];
      const correct = answers.filter((a: any) => a.isCorrect).length;
      const total = answers.length;
      return {
        id: d.id,
        title: data.title || "Worksheet",
        scorePercent: total > 0 ? Math.round((correct / total) * 100) : null,
        topic: data.config?.subject || "Math",
        date: data.startedAt?.toDate?.() || new Date(),
        status: data.status || "in_progress",
      };
    });
  }

  async getEmotionalSummary(studentId: string) {
    return sessionService.getEmotionalMemorySummary(studentId);
  }

  // --- Parent Notes ---

  async saveParentNote(parentUserId: string, studentId: string, text: string): Promise<void> {
    const notesRef = collection(db, "users", parentUserId, "parent_notes");
    await addDoc(notesRef, {
      studentId,
      text: text.slice(0, 500),
      createdAt: Timestamp.now(),
      consumedByPlanner: false,
    });
  }

  async getParentNotes(parentUserId: string, studentId: string, count: number = 3): Promise<ParentNote[]> {
    const notesRef = collection(db, "users", parentUserId, "parent_notes");
    const q = query(
      notesRef,
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc"),
      limit(count),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ParentNote));
  }

  async getUnconsumedNotes(parentUserId: string, studentId: string): Promise<ParentNote[]> {
    const notesRef = collection(db, "users", parentUserId, "parent_notes");
    const q = query(
      notesRef,
      where("studentId", "==", studentId),
      where("consumedByPlanner", "==", false),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ParentNote));
  }

  async markNotesConsumed(parentUserId: string, noteIds: string[]): Promise<void> {
    const promises = noteIds.map((noteId) => {
      const noteRef = doc(db, "users", parentUserId, "parent_notes", noteId);
      return updateDoc(noteRef, { consumedByPlanner: true });
    });
    await Promise.all(promises);
  }
}

export const progressInsightsService = ProgressInsightsService.getInstance();
