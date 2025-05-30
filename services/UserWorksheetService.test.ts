import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import UserWorksheetServiceInstance from './UserWorksheetService'; // Default instance
import { Worksheet, StudentWorksheetAttempt } from '../types/worksheet';

// Mock Firebase modules
jest.mock('@react-native-firebase/auth', () => {
  const mockAuthModule = jest.fn(() => ({
    // currentUser will be set in tests
  }));
  // @ts-ignore
  mockAuthModule.currentUser = null; // Static property for direct access if any
  return mockAuthModule;
});

const mockFirestoreCollection = {
  add: jest.fn(),
  doc: jest.fn().mockReturnThis(),
  set: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

const mockFirestoreInstance = {
  collection: jest.fn(() => mockFirestoreCollection),
  // Add any other methods used by the service directly on firestore()
};

jest.mock('@react-native-firebase/firestore', () => jest.fn(() => mockFirestoreInstance));


describe('UserWorksheetService', () => {
  const mockFirebaseAuth = auth as jest.MockedFunction<typeof auth>;

  const mockUser = { uid: 'testUserId', email: 'user@example.com' };
  const mockWorksheet: Worksheet = {
    id: 'worksheet1',
    type: 'math',
    createdAt: new Date().toISOString(),
    config: { type: 'math', subject: 'Addition', difficulty: 'easy', grade: '1', questionsCount: 5, includeAnswers: false },
    title: 'Basic Addition',
    questions: [{ id: 'q1', question: '1+1', answer: '2' }],
    userId: 'testUserId',
    isTemplate: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to user being logged in for most tests
    // @ts-ignore
    mockFirebaseAuth.currentUser = mockUser;
    const mockAuthInstance = mockFirebaseAuth();
    // @ts-ignore
    mockAuthInstance.currentUser = mockUser;

    // Reset all collection level mocks
    mockFirestoreCollection.add.mockReset();
    mockFirestoreCollection.doc.mockReturnThis(); // re-chain
    mockFirestoreCollection.set.mockReset();
    mockFirestoreCollection.update.mockReset();
    mockFirestoreCollection.get.mockReset();
    mockFirestoreCollection.delete.mockReset();
    mockFirestoreCollection.where.mockReturnThis(); // re-chain
    mockFirestoreCollection.orderBy.mockReturnThis(); // re-chain
    mockFirestoreCollection.limit.mockReturnThis(); // re-chain

    // Reset the top-level collection mock
    mockFirestoreInstance.collection.mockClear().mockReturnValue(mockFirestoreCollection);

  });

  describe('saveGeneratedWorksheet', () => {
    it('should save a worksheet with user ID and timestamp', async () => {
      const worksheetData = { ...mockWorksheet };
      // @ts-ignore
      delete worksheetData.id; delete worksheetData.userId; delete worksheetData.createdAt;

      mockFirestoreCollection.add.mockResolvedValueOnce({ id: 'newWorksheetId' });

      const result = await UserWorksheetServiceInstance.saveGeneratedWorksheet(worksheetData);

      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('worksheets');
      expect(mockFirestoreCollection.add).toHaveBeenCalledWith(expect.objectContaining({
        ...worksheetData,
        userId: mockUser.uid,
        isTemplate: false,
        createdAt: expect.any(String),
      }));
      expect(result.id).toBe('newWorksheetId');
      expect(result.userId).toBe(mockUser.uid);
    });

    it('should throw error if user is not authenticated', async () => {
      // @ts-ignore
      mockFirebaseAuth.currentUser = null;
      const mockAuthInstance = mockFirebaseAuth();
      // @ts-ignore
      mockAuthInstance.currentUser = null;

      // @ts-ignore
      await expect(UserWorksheetServiceInstance.saveGeneratedWorksheet({})).rejects.toThrow('User not authenticated');
    });
  });

  describe('startWorksheetAttempt', () => {
    it('should create and save a new student worksheet attempt', async () => {
      mockFirestoreCollection.add.mockResolvedValueOnce({ id: 'newAttemptId' });

      const attempt = await UserWorksheetServiceInstance.startWorksheetAttempt(mockWorksheet);

      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('studentWorksheetAttempts');
      expect(mockFirestoreCollection.add).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockUser.uid,
        worksheetId: mockWorksheet.id,
        worksheetTitle: mockWorksheet.title,
        status: 'in-progress',
        score: null,
        maxScore: mockWorksheet.questions.length,
        studentAnswers: [],
        questions: mockWorksheet.questions, // Ensure questions are copied
        startedAt: expect.any(String),
        lastAttemptedAt: expect.any(String),
      }));
      expect(attempt.id).toBe('newAttemptId');
    });
     it('should throw error if user not authenticated', async () => {
      // @ts-ignore
      mockFirebaseAuth.currentUser = null;
      const mockAuthInstance = mockFirebaseAuth();
       // @ts-ignore
      mockAuthInstance.currentUser = null;
      await expect(UserWorksheetServiceInstance.startWorksheetAttempt(mockWorksheet)).rejects.toThrow('User not authenticated');
    });
  });

  describe('updateStudentWorksheetAttempt', () => {
    it('should update an existing attempt with new data and timestamp', async () => {
      const attemptId = 'attempt1';
      const updates = { score: 5, status: 'completed' as 'completed' };
      mockFirestoreCollection.update.mockResolvedValueOnce(undefined);

      await UserWorksheetServiceInstance.updateStudentWorksheetAttempt(attemptId, updates);

      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('studentWorksheetAttempts');
      expect(mockFirestoreCollection.doc).toHaveBeenCalledWith(attemptId);
      expect(mockFirestoreCollection.update).toHaveBeenCalledWith(expect.objectContaining({
        ...updates,
        lastAttemptedAt: expect.any(String),
      }));
    });
     it('should throw error if user not authenticated', async () => {
      // @ts-ignore
      mockFirebaseAuth.currentUser = null;
      const mockAuthInstance = mockFirebaseAuth();
       // @ts-ignore
      mockAuthInstance.currentUser = null;
      await expect(UserWorksheetServiceInstance.updateStudentWorksheetAttempt('id', {})).rejects.toThrow('User not authenticated');
    });
  });

  describe('getStudentWorksheetAttempt', () => {
    it('should retrieve a specific attempt if it belongs to the user', async () => {
      const attemptId = 'attempt1';
      const mockAttemptData = { userId: mockUser.uid, worksheetTitle: 'Test Attempt' };
      mockFirestoreCollection.get.mockResolvedValueOnce({ exists: true, data: () => mockAttemptData });

      const result = await UserWorksheetServiceInstance.getStudentWorksheetAttempt(attemptId);

      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('studentWorksheetAttempts');
      expect(mockFirestoreCollection.doc).toHaveBeenCalledWith(attemptId);
      expect(mockFirestoreCollection.get).toHaveBeenCalled();
      expect(result).toEqual({ id: attemptId, ...mockAttemptData });
    });

    it('should return null if attempt does not exist', async () => {
      mockFirestoreCollection.get.mockResolvedValueOnce({ exists: false });
      const result = await UserWorksheetServiceInstance.getStudentWorksheetAttempt('attempt1');
      expect(result).toBeNull();
    });

    it('should return null if attempt does not belong to the user', async () => {
      const attemptId = 'attempt1';
      const mockAttemptData = { userId: 'anotherUserId', worksheetTitle: 'Test Attempt' };
      mockFirestoreCollection.get.mockResolvedValueOnce({ exists: true, data: () => mockAttemptData });

      const result = await UserWorksheetServiceInstance.getStudentWorksheetAttempt(attemptId);
      expect(result).toBeNull();
    });

    it('should return null if user not authenticated', async () => {
      // @ts-ignore
      mockFirebaseAuth.currentUser = null;
      const mockAuthInstance = mockFirebaseAuth();
       // @ts-ignore
      mockAuthInstance.currentUser = null;
      const result = await UserWorksheetServiceInstance.getStudentWorksheetAttempt('attempt1');
      expect(result).toBeNull(); // Or throw, depending on implementation. Current implementation returns null.
    });
  });

  describe('getWorksheetHistoryList', () => {
    it('should retrieve a list of attempts for the current user', async () => {
      const mockDocs = [
        { id: 'hist1', data: () => ({ userId: mockUser.uid, title: 'History 1' }) },
        { id: 'hist2', data: () => ({ userId: mockUser.uid, title: 'History 2' }) },
      ];
      mockFirestoreCollection.get.mockResolvedValueOnce({ empty: false, docs: mockDocs });

      const results = await UserWorksheetServiceInstance.getWorksheetHistoryList(5);

      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('studentWorksheetAttempts');
      expect(mockFirestoreCollection.where).toHaveBeenCalledWith('userId', '==', mockUser.uid);
      expect(mockFirestoreCollection.orderBy).toHaveBeenCalledWith('lastAttemptedAt', 'desc');
      expect(mockFirestoreCollection.limit).toHaveBeenCalledWith(5);
      expect(results.length).toBe(2);
      // @ts-ignore
      expect(results[0].title).toBe('History 1');
    });

    it('should return empty array if user not authenticated', async () => {
      // @ts-ignore
      mockFirebaseAuth.currentUser = null;
       const mockAuthInstance = mockFirebaseAuth();
       // @ts-ignore
      mockAuthInstance.currentUser = null;
      const results = await UserWorksheetServiceInstance.getWorksheetHistoryList();
      expect(results).toEqual([]);
    });
  });

  describe('deleteStudentWorksheetAttempt', () => {
    it('should delete a specific attempt', async () => {
      const attemptId = 'attemptToDelete';
      mockFirestoreCollection.delete.mockResolvedValueOnce(undefined);

      await UserWorksheetServiceInstance.deleteStudentWorksheetAttempt(attemptId);

      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('studentWorksheetAttempts');
      expect(mockFirestoreCollection.doc).toHaveBeenCalledWith(attemptId);
      expect(mockFirestoreCollection.delete).toHaveBeenCalled();
    });
    it('should throw error if user not authenticated', async () => {
      // @ts-ignore
      mockFirebaseAuth.currentUser = null;
      const mockAuthInstance = mockFirebaseAuth();
       // @ts-ignore
      mockAuthInstance.currentUser = null;
      await expect(UserWorksheetServiceInstance.deleteStudentWorksheetAttempt('id')).rejects.toThrow('User not authenticated');
    });
  });
});
