import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorksheetConfig, WorksheetQuestion } from "../types/worksheet";

// Based on interactive_worksheet_db_schema.md
export interface WorksheetTemplate {
  id?: string;
  title: string;
  description?: string;
  config: WorksheetConfig;
  questions: WorksheetQuestion[];
  createdBy?: string;
  createdAt: Timestamp;
  version?: number;
}

export interface QuestionAttemptData {
  questionId: string;
  userAnswer?: string;
  isCorrect?: boolean;
  status:
    | "unseen"
    | "seen"
    | "answered"
    | "correct"
    | "incorrect-attempt"
    | "skipped";
  attemptsCount: number;
  lastAttemptTimestamp?: Timestamp;
}

export interface WorksheetAttempt {
  id?: string;
  userId: string;
  worksheetId: string;
  worksheetTitle: string;
  status: "not-started" | "in-progress" | "paused" | "completed";
  score?: number;
  currentQuestionIndex?: number;
  questionsAttemptData: QuestionAttemptData[];
  timeSpentSeconds?: number;
  startedAt: Timestamp;
  lastActivityAt: Timestamp;
  completedAt?: Timestamp;
}

// For local caching if needed
const ASYNC_STORAGE_WORKSHEET_ATTEMPTS_CACHE_PREFIX =
  "@worksheet_attempts_cache_";
const MAX_CACHED_ATTEMPTS_PER_USER = 10;

const worksheetsRef = collection(db, "worksheets");
const worksheetAttemptsRef = collection(db, "worksheetAttempts");

export class StorageService {
  /**
   * Creates a new worksheet template in Firestore.
   * @param templateData Data for the new worksheet template.
   * @returns The ID of the newly created worksheet template document.
   */
  static async createWorksheetTemplate(
    templateData: Omit<WorksheetTemplate, "id" | "createdAt" | "version"> & {
      version?: number;
    }
  ): Promise<string> {
    const docRef = await addDoc(worksheetsRef, {
      ...templateData,
      version: templateData.version || 1,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Starts a new attempt for a given worksheet template.
   * @param userId The ID of the user.
   * @param worksheetId The worksheet template ID.
   * @param worksheetTitle The worksheet title.
   * @param templateQuestions The questions from the template.
   * @returns The ID of the newly created worksheet attempt document.
   */
  static async startWorksheetAttempt(
    userId: string,
    worksheetId: string,
    worksheetTitle: string,
    templateQuestions: WorksheetQuestion[]
  ): Promise<string> {
    const attempt = {
      userId,
      worksheetId,
      worksheetTitle,
      status: "in-progress",
      currentQuestionIndex: 0,
      questionsAttemptData: templateQuestions.map((q) => ({
        questionId: q.id,
        status: "unseen",
        attemptsCount: 0,
      })),
      timeSpentSeconds: 0,
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    };

    const docRef = await addDoc(worksheetAttemptsRef, attempt);
    // Invalidate cache so History tab picks up the new attempt
    await this.invalidateAttemptsCache(userId);
    return docRef.id;
  }

  /**
   * Updates an existing worksheet attempt.
   * @param attemptId The ID of the attempt to update.
   * @param updates Partial updates to apply to the attempt.
   */
  static async updateWorksheetAttempt(
    attemptId: string,
    updates: Partial<
      Omit<WorksheetAttempt, "id" | "userId" | "worksheetId" | "startedAt">
    >
  ): Promise<void> {
    const docRef = doc(db, "worksheetAttempts", attemptId);
    const updateData = {
      ...updates,
      lastActivityAt: serverTimestamp(),
    };
    await updateDoc(docRef, updateData);
  }

  /**
   * Retrieves worksheet attempt history for a specific user.
   * @param userId The ID of the user.
   * @returns A promise that resolves to an array of WorksheetAttempt objects.
   */
  static async getWorksheetAttemptHistory(
    userId: string
  ): Promise<WorksheetAttempt[]> {
    try {
      // Always fetch fresh from Firestore
      const q = query(
        worksheetAttemptsRef,
        where("userId", "==", userId),
        orderBy("startedAt", "desc"),
        limit(MAX_CACHED_ATTEMPTS_PER_USER)
      );

      const snapshot = await getDocs(q);
      const attempts = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WorksheetAttempt[];

      // Update cache for offline use
      await this.cacheWorksheetAttempts(userId, attempts);

      return attempts;
    } catch (error) {
      // Fall back to cache if Firestore is unavailable (offline)
      console.warn("Firestore unavailable, using cached history:", error);
      const cachedAttempts = await this.getCachedWorksheetAttempts(userId);
      if (cachedAttempts.length > 0) {
        return cachedAttempts;
      }
      throw error;
    }
  }

  /**
   * Retrieves a single worksheet attempt by its ID.
   * @param attemptId The ID of the worksheet attempt.
   * @returns A promise that resolves to the WorksheetAttempt object or null if not found.
   */
  static async getWorksheetAttemptById(
    attemptId: string
  ): Promise<WorksheetAttempt | null> {
    try {
      const docRef = doc(db, "worksheetAttempts", attemptId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as WorksheetAttempt;
    } catch (error) {
      console.error("Error fetching worksheet attempt:", error);
      throw error;
    }
  }

  /**
   * Retrieves a single worksheet template by its ID.
   * @param templateId The ID of the worksheet template document.
   * @returns A promise that resolves to the WorksheetTemplate object or null if not found.
   */
  static async getWorksheetTemplateById(
    templateId: string
  ): Promise<WorksheetTemplate | null> {
    try {
      const docRef = doc(db, "worksheets", templateId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as WorksheetTemplate;
    } catch (error) {
      console.error("Error fetching worksheet template:", error);
      throw error;
    }
  }

  /**
   * Deletes a worksheet attempt.
   * @param attemptId The ID of the attempt to delete.
   */
  static async deleteWorksheetAttempt(attemptId: string): Promise<void> {
    try {
      const docRef = doc(db, "worksheetAttempts", attemptId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting worksheet attempt:", error);
      throw error;
    }
  }

  private static async getCachedWorksheetAttempts(
    userId: string
  ): Promise<WorksheetAttempt[]> {
    try {
      const cached = await AsyncStorage.getItem(
        `${ASYNC_STORAGE_WORKSHEET_ATTEMPTS_CACHE_PREFIX}${userId}`
      );
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.warn("Error reading from cache:", error);
      return [];
    }
  }

  private static async invalidateAttemptsCache(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(
        `${ASYNC_STORAGE_WORKSHEET_ATTEMPTS_CACHE_PREFIX}${userId}`
      );
    } catch (error) {
      console.warn("Error invalidating cache:", error);
    }
  }

  private static async cacheWorksheetAttempts(
    userId: string,
    attempts: WorksheetAttempt[]
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${ASYNC_STORAGE_WORKSHEET_ATTEMPTS_CACHE_PREFIX}${userId}`,
        JSON.stringify(attempts)
      );
    } catch (error) {
      console.warn("Error writing to cache:", error);
    }
  }
}
