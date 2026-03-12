/**
 * App Root Navigator
 *
 * Handles authentication state and navigation flow:
 * - Unauthenticated: Show Auth screens
 * - Authenticated but no children: Show Onboarding
 * - Authenticated with children: Show Main App
 */

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import SignInScreen from "../auth/SignInScreen";
import SignUpScreen from "../auth/SignUpScreen";
import OnboardingFlow from "../onboarding/OnboardingFlow";

type AuthScreen = "signin" | "signup";

interface AppNavigatorProps {
  children: React.ReactNode;
}

export default function AppNavigator({ children }: AppNavigatorProps) {
  const { currentUser, userProfile, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("signin");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user needs onboarding
  const needsOnboarding =
    currentUser &&
    userProfile &&
    (!userProfile.childrenIds || userProfile.childrenIds.length === 0) &&
    !hasCompletedOnboarding;

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Not authenticated - show auth screens
  if (!currentUser) {
    if (authScreen === "signup") {
      return (
        <SignUpScreen
          onSignUpSuccess={() => {
            // After signup, will auto-redirect to onboarding or main app
            // based on userProfile.childrenIds
          }}
          onNavigateToSignIn={() => setAuthScreen("signin")}
        />
      );
    }

    return (
      <SignInScreen
        onSignInSuccess={() => {
          // After signin, will auto-redirect to onboarding or main app
          // based on userProfile.childrenIds
        }}
        onNavigateToSignUp={() => setAuthScreen("signup")}
      />
    );
  }

  // Authenticated but needs onboarding
  if (needsOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(studentId: string) => {
          console.log(
            "[AppNavigator] Onboarding complete for student:",
            studentId,
          );
          setHasCompletedOnboarding(true);
        }}
      />
    );
  }

  // Authenticated and has children - show main app
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
});
