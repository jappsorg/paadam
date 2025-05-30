import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Worksheet, StudentWorksheetAttempt, WorksheetQuestion } from '../types/worksheet';

const WORKSHEETS_COLLECTION = 'worksheets'; // For storing generated worksheet instances
const ATTEMPTS_COLLECTION = 'studentWorksheetAttempts'; // For StudentWorksheetAttempt documents

export class UserWorksheetService {
  private getUserId(): string | null {
    return auth().currentUser?.uid || null;
  }

  private getCurrentUserEmail(): string | null {
    return auth().currentUser?.email || null;
  }


  /**
   * Saves a newly generated worksheet to Firestore.
   * This worksheet is typically a master copy that attempts can be based on.
   */
  async saveGeneratedWorksheet(worksheetData: Omit<Worksheet, 'id' | 'userId' | 'createdAt' | 'isTemplate'>): Promise<Worksheet> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated. Cannot save worksheet.');
    }

    const newWorksheet: Omit<Worksheet, 'id'> = {
      ...worksheetData,
      userId: userId,
      createdAt: new Date().toISOString(),
      isTemplate: false, // Explicitly set as not a template
    };

    try {
      const docRef = await firestore().collection(WORKSHEETS_COLLECTION).add(newWorksheet);
      return {
        ...newWorksheet,
        id: docRef.id,
      } as Worksheet;
    } catch (error) {
      console.error('Error saving generated worksheet:', error);
      throw new Error('Failed to save generated worksheet.');
    }
  }

  /**
   * Starts a new attempt for a given worksheet.
   */
  async startWorksheetAttempt(worksheet: Worksheet): Promise<StudentWorksheetAttempt> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated. Cannot start worksheet attempt.');
    }
    if (!worksheet || !worksheet.id) {
        throw new Error('Valid worksheet object with ID must be provided.');
    }

    const questionsDeepCopy: WorksheetQuestion[] = worksheet.questions.map(q => ({ ...q }));

    const newAttemptData: Omit<StudentWorksheetAttempt, 'id'> = {
      userId: userId,
      worksheetId: worksheet.id,
      worksheetTitle: worksheet.title,
      worksheetType: worksheet.type,
      originalConfig: { ...worksheet.config },
      questions: questionsDeepCopy,
      studentAnswers: [],
      score: null,
      maxScore: worksheet.questions.length,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      lastAttemptedAt: new Date().toISOString(),
      completedAt: null,
    };

    try {
      const docRef = await firestore().collection(ATTEMPTS_COLLECTION).add(newAttemptData);
      return {
        id: docRef.id,
        ...newAttemptData,
      } as StudentWorksheetAttempt;
    } catch (error) {
      console.error('Error starting worksheet attempt:', error);
      throw new Error('Failed to start worksheet attempt.');
    }
  }

  /**
   * Updates an ongoing student worksheet attempt.
   */
  async updateStudentWorksheetAttempt(
    attemptId: string,
    updates: Partial<Omit<StudentWorksheetAttempt, 'id' | 'userId' | 'worksheetId' | 'lastAttemptedAt'>>
  ): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated. Cannot update attempt.');
    }
    if (!attemptId) {
        throw new Error('Attempt ID must be provided for updates.');
    }

    const dataToUpdate = {
      ...updates,
      lastAttemptedAt: new Date().toISOString(),
    };

    try {
      await firestore().collection(ATTEMPTS_COLLECTION).doc(attemptId).update(dataToUpdate);
    } catch (error) {
      console.error('Error updating student worksheet attempt:', error);
      // Consider checking error code for 'not-found' if needed
      throw new Error('Failed to update student worksheet attempt.');
    }
  }

  /**
   * Fetches a specific worksheet attempt by its ID.
   */
  async getStudentWorksheetAttempt(attemptId: string): Promise<StudentWorksheetAttempt | null> {
    const userId = this.getUserId();
    if (!userId) {
      // Or, allow fetching public/shared attempts if applicable in future, but for now, user-specific
      console.warn('No user authenticated, cannot fetch specific attempt.');
      return null;
    }
     if (!attemptId) {
        throw new Error('Attempt ID must be provided.');
    }

    try {
      const doc = await firestore().collection(ATTEMPTS_COLLECTION).doc(attemptId).get();
      if (doc.exists) {
        const attemptData = doc.data() as Omit<StudentWorksheetAttempt, 'id'>;
        // Ensure it belongs to the current user, unless it's a shared resource (not the case here)
        if (attemptData.userId !== userId) {
            console.warn(`User ${userId} attempted to fetch attempt ${attemptId} belonging to user ${attemptData.userId}.`);
            return null; // Or throw an authorization error
        }
        return { id: doc.id, ...attemptData } as StudentWorksheetAttempt;
      }
      return null;
    } catch (error) {
      console.error('Error fetching student worksheet attempt:', error);
      throw new Error('Failed to fetch student worksheet attempt.');
    }
  }

  /**
   * Fetches a list of worksheet attempts for the current user, ordered by last attempted.
   */
  async getWorksheetHistoryList(limitCount: number = 10): Promise<StudentWorksheetAttempt[]> {
    const userId = this.getUserId();
    if (!userId) {
      return []; // No history for unauthenticated users
    }

    try {
      const snapshot = await firestore()
        .collection(ATTEMPTS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('lastAttemptedAt', 'desc')
        .limit(limitCount)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<StudentWorksheetAttempt, 'id'>),
      } as StudentWorksheetAttempt));
    } catch (error) {
      console.error('Error fetching worksheet history list:', error);
      throw new Error('Failed to fetch worksheet history list.');
    }
  }

  /**
   * Deletes a specific student worksheet attempt.
   */
  async deleteStudentWorksheetAttempt(attemptId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated. Cannot delete attempt.');
    }
    if (!attemptId) {
        throw new Error('Attempt ID must be provided for deletion.');
    }

    // Optional: Verify ownership before deleting
    // const attempt = await this.getStudentWorksheetAttempt(attemptId);
    // if (attempt && attempt.userId !== userId) {
    //   throw new Error('User is not authorized to delete this attempt.');
    // }


    try {
      await firestore().collection(ATTEMPTS_COLLECTION).doc(attemptId).delete();
    } catch (error) {
      console.error('Error deleting student worksheet attempt:', error);
      // Consider checking error code for 'not-found' if needed
      throw new Error('Failed to delete student worksheet attempt.');
    }
  }
}

export default new UserWorksheetService();
