import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
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
  createdAt: FirebaseFirestoreTypes.Timestamp;
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
  lastAttemptTimestamp?: FirebaseFirestoreTypes.Timestamp;
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
  startedAt: FirebaseFirestoreTypes.Timestamp;
  lastActivityAt: FirebaseFirestoreTypes.Timestamp;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
}

// For local caching if needed
const ASYNC_STORAGE_WORKSHEET_ATTEMPTS_CACHE_PREFIX =
  "@worksheet_attempts_cache_";
const MAX_CACHED_ATTEMPTS_PER_USER = 10;

export class StorageService {
  private static worksheetsCollection = firestore().collection("worksheets");
  private static worksheetAttemptsCollection =
    firestore().collection("worksheetAttempts");

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
    const docRef = await this.worksheetsCollection.add({
      ...templateData,
      version: templateData.version || 1,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Starts a new attempt for a given worksheet template.
   * @param userId The ID of the user.
   * @param worksheetData The core worksheet data.
   * @returns The ID of the newly created worksheet document.
   */
  static async startWorksheetAttempt(
    userId: string,
    worksheetId: string,
    worksheetTitle: string,
    templateQuestions: WorksheetQuestion[]
  ): Promise<string> {
    const attempt: Omit<WorksheetAttempt, "id"> = {
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
      startedAt:
        firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      lastActivityAt:
        firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
    };

    const docRef = await this.worksheetAttemptsCollection.add(attempt);
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
    const updateData = {
      ...updates,
      lastActivityAt: firestore.FieldValue.serverTimestamp(),
    };
    await this.worksheetAttemptsCollection.doc(attemptId).update(updateData);
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
      // First try to get from cache
      const cachedAttempts = await this.getCachedWorksheetAttempts(userId);
      if (cachedAttempts.length > 0) {
        return cachedAttempts;
      }

      // If not in cache, fetch from Firestore
      const snapshot = await this.worksheetAttemptsCollection
        .where("userId", "==", userId)
        .orderBy("startedAt", "desc")
        .limit(MAX_CACHED_ATTEMPTS_PER_USER)
        .get();

      const attempts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WorksheetAttempt[];

      // Cache the results
      await this.cacheWorksheetAttempts(userId, attempts);

      return attempts;
    } catch (error) {
      console.error("Error fetching worksheet history:", error);
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
      const doc = await this.worksheetAttemptsCollection.doc(attemptId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as WorksheetAttempt;
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
      const doc = await this.worksheetsCollection.doc(templateId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as WorksheetTemplate;
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
      await this.worksheetAttemptsCollection.doc(attemptId).delete();
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
