/**
 * Authentication Service
 * 
 * Handles user authentication with Firebase Auth
 * Supports email/password and Google OAuth
 * Manages user profile in Firestore
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'parent' | 'teacher' | 'admin';
  
  // Parent-specific
  childrenIds?: string[]; // student IDs
  subscriptionTier?: 'free' | 'premium' | 'family';
  subscriptionExpiresAt?: Date;
  
  // Metadata
  createdAt: Date;
  lastLoginAt: Date;
  emailVerified: boolean;
  
  // Privacy settings
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  termsAcceptedVersion: string;
}

export class AuthService {
  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<{
    user: User;
    profile: UserProfile;
  }> {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        photoURL: null,
        role: 'parent',
        childrenIds: [],
        subscriptionTier: 'free',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: false,
        dataProcessingConsent: true, // Must be true to sign up
        marketingConsent: false,
        termsAcceptedVersion: '1.0',
      };

      await this.createUserProfile(profile);

      console.log('[Auth] User signed up successfully:', user.uid);

      return { user, profile };
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Sign up error:', authError.message);
      throw this.handleAuthError(authError);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{
    user: User;
    profile: UserProfile;
  }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await this.updateLastLogin(user.uid);

      // Get user profile
      const profile = await this.getUserProfile(user.uid);

      console.log('[Auth] User signed in successfully:', user.uid);

      return { user, profile };
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Sign in error:', authError.message);
      throw this.handleAuthError(authError);
    }
  }

  /**
   * Sign in with Google (using ID token from expo-auth-session)
   */
  async signInWithGoogle(idToken: string): Promise<{
    user: User;
    profile: UserProfile;
    isNewUser: boolean;
  }> {
    try {
      // Create credential with Google ID token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user profile exists
      const existingProfile = await this.getUserProfile(user.uid);
      const isNewUser = !existingProfile;

      let profile: UserProfile;

      if (isNewUser) {
        // Create new profile
        profile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'parent',
          childrenIds: [],
          subscriptionTier: 'free',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          emailVerified: user.emailVerified,
          dataProcessingConsent: true,
          marketingConsent: false,
          termsAcceptedVersion: '1.0',
        };

        await this.createUserProfile(profile);
      } else {
        // Update last login
        await this.updateLastLogin(user.uid);
        profile = existingProfile;
      }

      console.log('[Auth] Google sign in successful:', user.uid, isNewUser ? '(new user)' : '(existing)');

      return { user, profile, isNewUser };
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Google sign in error:', authError.message);
      throw this.handleAuthError(authError);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      console.log('[Auth] User signed out');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Sign out error:', authError.message);
      throw this.handleAuthError(authError);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('[Auth] Password reset email sent to:', email);
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Password reset error:', authError.message);
      throw this.handleAuthError(authError);
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    try {
      await sendEmailVerification(user);
      console.log('[Auth] Email verification sent');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Email verification error:', authError.message);
      throw this.handleAuthError(authError);
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        subscriptionExpiresAt: data.subscriptionExpiresAt?.toDate(),
      } as UserProfile;
    } catch (error) {
      console.error('[Auth] Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: Timestamp.fromDate(profile.createdAt),
        lastLoginAt: Timestamp.fromDate(profile.lastLoginAt),
        subscriptionExpiresAt: profile.subscriptionExpiresAt
          ? Timestamp.fromDate(profile.subscriptionExpiresAt)
          : null,
      });

      console.log('[Auth] User profile created:', profile.uid);
    } catch (error) {
      console.error('[Auth] Create profile error:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[Auth] Update last login error:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      
      // Convert Date objects to Timestamps
      const updateData: any = { ...updates };
      if (updates.subscriptionExpiresAt) {
        updateData.subscriptionExpiresAt = Timestamp.fromDate(updates.subscriptionExpiresAt);
      }

      await updateDoc(docRef, updateData);
      console.log('[Auth] User profile updated:', uid);
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      throw error;
    }
  }

  /**
   * Add child to parent's profile
   */
  async addChildToParent(parentUid: string, childId: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(parentUid);
      if (!profile) {
        throw new Error('Parent profile not found');
      }

      const childrenIds = profile.childrenIds || [];
      if (!childrenIds.includes(childId)) {
        childrenIds.push(childId);
        await this.updateUserProfile(parentUid, { childrenIds });
      }

      console.log('[Auth] Child added to parent:', childId);
    } catch (error) {
      console.error('[Auth] Add child error:', error);
      throw error;
    }
  }

  /**
   * Handle Firebase Auth errors
   */
  private handleAuthError(error: AuthError): Error {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('This email is already registered. Please sign in instead.');
      
      case 'auth/invalid-email':
        return new Error('Invalid email address.');
      
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters.');
      
      case 'auth/user-not-found':
        return new Error('No account found with this email.');
      
      case 'auth/wrong-password':
        return new Error('Incorrect password.');
      
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection.');
      
      case 'auth/user-disabled':
        return new Error('This account has been disabled.');
      
      default:
        return new Error(error.message || 'An error occurred. Please try again.');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
