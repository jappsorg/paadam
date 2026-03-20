/**
 * Sign In Screen
 *
 * Email/password and Google OAuth sign in
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import {
  AppTextInput,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import {
  colors,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  shadows,
} from "@/theme";

interface SignInScreenProps {
  onSignInSuccess: () => void;
  onNavigateToSignUp: () => void;
}

export default function SignInScreen({
  onSignInSuccess,
  onNavigateToSignUp,
}: SignInScreenProps) {
  const { signInWithEmail, signInWithGoogle, isGoogleSignInLoading } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const friendlyAuthError = (message: string): string => {
    if (message.includes("auth/invalid-credential")) return "Hmm, that email or password doesn't look right. Try again!";
    if (message.includes("auth/user-not-found")) return "We couldn't find an account with that email.";
    if (message.includes("auth/wrong-password")) return "That password doesn't match. Try again!";
    if (message.includes("auth/too-many-requests")) return "Too many tries! Please wait a moment and try again.";
    if (message.includes("auth/network-request-failed")) return "Looks like you're offline. Check your connection!";
    return message;
  };

  const showError = (title: string, message: string) => {
    const friendly = friendlyAuthError(message);
    if (Platform.OS === "web") {
      setError(friendly);
    } else {
      Alert.alert(title, friendly);
    }
  };

  const handleEmailSignIn = async () => {
    setError(null);
    if (!email.trim() || !password) {
      showError("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      onSignInSuccess();
    } catch (err) {
      showError(
        "Sign In Failed",
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onSignInSuccess();
    } catch (err) {
      showError(
        "Google Sign In Failed",
        err instanceof Error ? err.message : "An error occurred",
      );
    }
  };

  const handleForgotPassword = () => {
    showError("Reset Password", "Password reset functionality coming soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative shapes */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>{"\uD83D\uDCDA"}</Text>
            </View>
            <Text style={styles.appName}>Paadam</Text>
            <Text style={styles.tagline}>Learning is an adventure</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back!</Text>

            <View style={styles.form}>
              <AppTextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!isLoading}
              />

              <AppTextInput
                label="Password"
                isPassword
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                textContentType="password"
                editable={!isLoading}
              />

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <PrimaryButton
                title="Sign In"
                onPress={handleEmailSignIn}
                loading={isLoading}
                disabled={!email || !password}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <SecondaryButton
                icon={"\uD83D\uDD35"}
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                loading={isGoogleSignInLoading}
              />
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>New here? </Text>
            <TouchableOpacity onPress={onNavigateToSignUp}>
              <Text style={styles.signUpLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  // Background shapes
  bgCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.coral100,
    opacity: 0.5,
  },
  bgCircle2: {
    position: "absolute",
    bottom: 40,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.teal50,
    opacity: 0.4,
  },
  bgCircle3: {
    position: "absolute",
    top: "45%",
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gold100,
    opacity: 0.4,
  },
  // Hero
  heroSection: {
    alignItems: "center",
    paddingTop: spacing.xxxxl + 10,
    paddingBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.coral400,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.coralGlow,
  },
  logoEmoji: {
    fontSize: 44,
  },
  appName: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.black,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSizes.base,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  // Form
  formCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  formTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  forgotPassword: {
    fontSize: fontSizes.md,
    color: colors.coral400,
    fontWeight: fontWeights.semibold,
    textAlign: "right",
  },
  errorContainer: {
    backgroundColor: colors.coral100,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  errorText: {
    color: colors.coral400,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    color: colors.textDisabled,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  signUpText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: fontSizes.base,
    color: colors.coral400,
    fontWeight: fontWeights.bold,
  },
});
