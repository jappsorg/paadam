import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { onGoogleButtonPress, signOut, getCurrentUser } from './AuthService'; // Adjust path as necessary

// Mock Firebase and Google Sign-In modules
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = jest.fn(() => ({
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
    // currentUser will be updated by tests
  }));
  // @ts-ignore
  mockAuth.GoogleAuthProvider = {
    credential: jest.fn(),
  };
  return mockAuth;
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    // Add other status codes if your service handles them
  },
}));

jest.mock('@react-native-firebase/firestore', () => {
  const mockFirestoreInstance = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
  };
  return jest.fn(() => mockFirestoreInstance);
});


describe('AuthService', () => {
  // Typed mocks for cleaner access
  const mockFirebaseAuth = auth as jest.MockedFunction<typeof auth>;
  const mockFirestoreInstance = firestore() as jest.Mocked<ReturnType<typeof firestore>>;
  const mockGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    mockFirebaseAuth.currentUser = null; // Default to no user logged in
  });

  describe('onGoogleButtonPress', () => {
    it('should sign in a new user and create a Firestore document', async () => {
      const mockUser = { uid: 'testUid', email: 'test@example.com', displayName: 'Test User' };
      const mockIdToken = 'mockIdToken';
      // @ts-ignore
      mockGoogleSignin.signIn.mockResolvedValueOnce({ idToken: mockIdToken });
      // @ts-ignore
      mockFirebaseAuth.GoogleAuthProvider.credential.mockReturnValueOnce({}); // Mock credential object
      // @ts-ignore
      mockFirebaseAuth().signInWithCredential.mockResolvedValueOnce({
        user: mockUser,
        additionalUserInfo: { isNewUser: true },
      });
      mockFirestoreInstance.set.mockResolvedValueOnce(undefined);

      const user = await onGoogleButtonPress();

      expect(mockGoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(mockGoogleSignin.signIn).toHaveBeenCalled();
      // @ts-ignore
      expect(mockFirebaseAuth.GoogleAuthProvider.credential).toHaveBeenCalledWith(mockIdToken);
      expect(mockFirebaseAuth().signInWithCredential).toHaveBeenCalled();
      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('users');
      expect(mockFirestoreInstance.doc).toHaveBeenCalledWith(mockUser.uid);
      expect(mockFirestoreInstance.set).toHaveBeenCalledWith({
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: expect.any(Object), // firestore.FieldValue.serverTimestamp() is an object
      });
      expect(user).toEqual(mockUser);
    });

    it('should sign in an existing user without creating a Firestore document', async () => {
      const mockUser = { uid: 'testUid', email: 'test@example.com', displayName: 'Test User' };
      const mockIdToken = 'mockIdToken';
      // @ts-ignore
      mockGoogleSignin.signIn.mockResolvedValueOnce({ idToken: mockIdToken });
      // @ts-ignore
      mockFirebaseAuth.GoogleAuthProvider.credential.mockReturnValueOnce({});
      // @ts-ignore
      mockFirebaseAuth().signInWithCredential.mockResolvedValueOnce({
        user: mockUser,
        additionalUserInfo: { isNewUser: false },
      });

      const user = await onGoogleButtonPress();

      expect(mockFirestoreInstance.set).not.toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it('should handle Google Sign-In failure', async () => {
      const signInError = new Error('Google Sign-In failed');
      // @ts-ignore
      signInError.code = statusCodes.SIGN_IN_CANCELLED;
      mockGoogleSignin.signIn.mockRejectedValueOnce(signInError);

      await expect(onGoogleButtonPress()).rejects.toThrow('Google Sign-In failed');
      expect(mockFirebaseAuth().signInWithCredential).not.toHaveBeenCalled();
    });

    it('should handle Firebase credential sign-in failure', async () => {
      const mockIdToken = 'mockIdToken';
      // @ts-ignore
      mockGoogleSignin.signIn.mockResolvedValueOnce({ idToken: mockIdToken });
      // @ts-ignore
      mockFirebaseAuth.GoogleAuthProvider.credential.mockReturnValueOnce({});
      mockFirebaseAuth().signInWithCredential.mockRejectedValueOnce(new Error('Firebase sign-in failed'));

      await expect(onGoogleButtonPress()).rejects.toThrow('Firebase sign-in failed');
      expect(mockFirestoreInstance.set).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should call Firebase and Google signOut methods', async () => {
      mockFirebaseAuth().signOut.mockResolvedValueOnce(undefined);
      mockGoogleSignin.signOut.mockResolvedValueOnce(undefined);

      await signOut();

      expect(mockFirebaseAuth().signOut).toHaveBeenCalled();
      expect(mockGoogleSignin.signOut).toHaveBeenCalled();
    });

     it('should handle error during Firebase signOut', async () => {
      mockFirebaseAuth().signOut.mockRejectedValueOnce(new Error('Firebase signout failed'));
      // Google Signout might still be called or not depending on implementation,
      // assuming it attempts both. If it stops on first error, adjust test.
      mockGoogleSignin.signOut.mockResolvedValueOnce(undefined);

      await expect(signOut()).rejects.toThrow('Firebase signout failed');
      expect(mockGoogleSignin.signOut).toHaveBeenCalled(); // Or not, depending on desired behavior
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current Firebase user', () => {
      const mockUser = { uid: 'testUser123' };
      // @ts-ignore
      mockFirebaseAuth.currentUser = mockUser; // Set the current user on the direct import

      // Need to mock the auth() instance's currentUser too
      const mockAuthInstance = mockFirebaseAuth();
      // @ts-ignore
      mockAuthInstance.currentUser = mockUser;


      const user = getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null if no user is logged in', () => {
       // @ts-ignore
      mockFirebaseAuth.currentUser = null;
      const mockAuthInstance = mockFirebaseAuth();
      // @ts-ignore
      mockAuthInstance.currentUser = null;

      const user = getCurrentUser();
      expect(user).toBeNull();
    });
  });
});
