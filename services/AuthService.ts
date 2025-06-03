import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

// Interface for User data in Firestore
interface FirestoreUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  lastLoginAt?: FirebaseFirestoreTypes.Timestamp;
}

class AuthService {
  /**
   * Listens to authentication state changes.
   * @param callback - Function to call with the User object or null.
   * @returns Unsubscribe function.
   */
  onAuthStateChangedListener(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ) {
    return auth().onAuthStateChanged(callback);
  }

  /**
   * Gets the current authenticated user.
   * @returns The current Firebase User object or null.
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * Signs in with Google using an ID token obtained from a native Google Sign-In library.
   * @param idToken - The ID token obtained from the native Google Sign-In process.
   * @returns The Firebase User object or null if sign-in fails.
   */
  async signInWithGoogle(
    idToken: string
  ): Promise<FirebaseAuthTypes.User | null> {
    if (!idToken) {
      console.error(
        "AuthService.signInWithGoogle: An idToken was not provided. " +
          "The native Google Sign-In flow must provide this token."
      );
      return null;
    }

    try {
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);

      if (userCredential.user) {
        await this.ensureUserInFirestore(userCredential.user);
      }
      return userCredential.user;
    } catch (error: any) {
      console.error(
        "Error during Google Sign-In with Firebase credential:",
        error
      );
      return null;
    }
  }

  /**
   * Signs out the current user.
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  /**
   * Ensures the user document exists in Firestore.
   * @param user - Firebase User object.
   */
  async ensureUserInFirestore(user: FirebaseAuthTypes.User): Promise<void> {
    if (!user) return;

    const userRef = firestore().collection("users").doc(user.uid);
    try {
      const userDoc = await userRef.get();
      const userData: Partial<FirestoreUser> = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt:
          firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      };

      if (!userDoc.exists) {
        // New user, create document
        await userRef.set({
          ...userData,
          createdAt:
            firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
        });
      } else {
        // Existing user, update last login time (and potentially other fields if needed)
        await userRef.set(userData, { merge: true });
      }
    } catch (error) {
      console.error("Error ensuring user in Firestore:", error);
      // It's crucial to handle this error, perhaps by retrying or logging.
      throw error;
    }
  }
}

export default new AuthService();
