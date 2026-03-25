/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Integrates with expo-auth-session for Google OAuth
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { User } from 'firebase/auth';
import { authService, UserProfile } from '../services/AuthService';
import { studentProfileService } from '../services/StudentProfileService';
import { StudentProfile } from '../types/adaptive-learning';
import * as WebBrowser from 'expo-web-browser';
import {
  useIdTokenAuthRequest,
  makeRedirectUri,
} from 'expo-auth-session/providers/google';

// Ensure that we can complete the auth session on redirect
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  // User state
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;

  // Student profiles
  studentProfiles: StudentProfile[];
  selectedStudent: StudentProfile | null;
  setSelectedStudent: (student: StudentProfile | null) => void;
  refreshStudentProfiles: () => Promise<void>;

  // Email/Password methods
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;

  // Google OAuth
  signInWithGoogle: () => Promise<void>;
  isGoogleSignInLoading: boolean;

  // Profile management
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const selectedStudentIdRef = useRef<string | null>(null);

  // Keep ref in sync with selected student
  useEffect(() => {
    selectedStudentIdRef.current = selectedStudent?.id || null;
  }, [selectedStudent]);

  // Google OAuth configuration
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    || "165060975319-bu9pa23t4eiunvlis0dgseiccp11513g.apps.googleusercontent.com";
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    clientId: googleClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const refreshStudentProfiles = async (userId?: string) => {
    const uid = userId || currentUser?.uid;
    if (!uid) return;
    try {
      const profiles = await studentProfileService.getUserStudents(uid);
      setStudentProfiles(profiles);
      if (profiles.length > 0) {
        const currentId = selectedStudentIdRef.current;
        if (currentId) {
          // Update the currently selected student with fresh data
          const updated = profiles.find((p) => p.id === currentId);
          if (updated) setSelectedStudent(updated);
        } else {
          setSelectedStudent(profiles[0]);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Failed to load student profiles:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Load user profile
        try {
          const profile = await authService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('[AuthContext] Failed to load profile:', error);
        }
        // Load student profiles
        await refreshStudentProfiles(user.uid);
      } else {
        setUserProfile(null);
        setStudentProfiles([]);
        setSelectedStudent(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      console.error('[AuthContext] Google OAuth error:', response.error);
      setIsGoogleSignInLoading(false);
    } else if (response?.type === 'cancel') {
      setIsGoogleSignInLoading(false);
    }
  }, [response]);

  /**
   * Sign up with email and password
   */
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    try {
      const { user, profile } = await authService.signUpWithEmail(
        email,
        password,
        displayName
      );
      setCurrentUser(user);
      setUserProfile(profile);
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      throw error;
    }
  };

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const { user, profile } = await authService.signInWithEmail(email, password);
      setCurrentUser(user);
      setUserProfile(profile);
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      throw error;
    }
  };

  /**
   * Sign in with Google (trigger OAuth flow)
   */
  const signInWithGoogle = async (): Promise<void> => {
    setIsGoogleSignInLoading(true);
    try {
      await promptAsync();
      // Response will be handled by useEffect
    } catch (error) {
      console.error('[AuthContext] Google sign in error:', error);
      setIsGoogleSignInLoading(false);
      throw error;
    }
  };

  /**
   * Handle Google sign in with ID token
   */
  const handleGoogleSignIn = async (idToken: string): Promise<void> => {
    try {
      const { user, profile } = await authService.signInWithGoogle(idToken);
      setCurrentUser(user);
      setUserProfile(profile);
    } catch (error) {
      console.error('[AuthContext] Google sign in error:', error);
      throw error;
    } finally {
      setIsGoogleSignInLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
      throw error;
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('[AuthContext] Reset password error:', error);
      throw error;
    }
  };

  /**
   * Resend email verification
   */
  const resendEmailVerification = async (): Promise<void> => {
    try {
      await authService.resendEmailVerification();
    } catch (error) {
      console.error('[AuthContext] Resend verification error:', error);
      throw error;
    }
  };

  /**
   * Refresh user profile from Firestore
   */
  const refreshProfile = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      const profile = await authService.getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('[AuthContext] Refresh profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    studentProfiles,
    selectedStudent,
    setSelectedStudent,
    refreshStudentProfiles: () => refreshStudentProfiles(),
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendEmailVerification,
    isGoogleSignInLoading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
