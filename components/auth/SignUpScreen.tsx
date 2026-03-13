/**
 * Sign Up Screen
 *
 * Parent account creation with email/password and Google OAuth
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

interface SignUpScreenProps {
  onSignUpSuccess: () => void;
  onNavigateToSignIn: () => void;
}

export default function SignUpScreen({
  onSignUpSuccess,
  onNavigateToSignIn,
}: SignUpScreenProps) {
  const { signUpWithEmail, signInWithGoogle, isGoogleSignInLoading } =
    useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = (): string | null => {
    if (!displayName.trim()) return "Please enter your name";
    if (!email.trim()) return "Please enter your email";
    if (!email.includes("@")) return "Please enter a valid email address";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!agreedToTerms) return "Please agree to the Terms of Service and Privacy Policy";
    return null;
  };

  const handleEmailSignUp = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
      Alert.alert(
        "Email Verification Sent",
        "Please check your email to verify your account. You can start using the app now!",
        [{ text: "OK", onPress: onSignUpSuccess }],
      );
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!agreedToTerms) {
      Alert.alert("Terms Required", "Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    try {
      await signInWithGoogle();
      onSignUpSuccess();
    } catch (error) {
      Alert.alert(
        "Google Sign Up Failed",
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>{"\uD83C\uDF1F"}</Text>
            </View>
            <Text style={styles.heroTitle}>Join the Adventure</Text>
            <Text style={styles.heroSubtitle}>Create your family's learning space</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.form}>
              <AppTextInput
                label="Your Name"
                placeholder="Enter your full name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                editable={!isLoading}
              />

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
                placeholder="At least 6 characters"
                isPassword
                value={password}
                onChangeText={setPassword}
                textContentType="newPassword"
                editable={!isLoading}
              />

              <AppTextInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                isPassword
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textContentType="newPassword"
                editable={!isLoading}
              />

              {/* Terms */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreedToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreedToTerms && <Text style={styles.checkmark}>{"\u2713"}</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the <Text style={styles.link}>Terms of Service</Text>{" "}
                  and <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              <PrimaryButton
                title="Create Account"
                onPress={handleEmailSignUp}
                loading={isLoading}
                disabled={!agreedToTerms}
                variant="teal"
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <SecondaryButton
                icon={"\uD83D\uDD35"}
                title="Continue with Google"
                onPress={handleGoogleSignUp}
                loading={isGoogleSignInLoading}
              />
            </View>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
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
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  bgCircle1: {
    position: "absolute",
    top: -60,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.teal50,
    opacity: 0.5,
  },
  bgCircle2: {
    position: "absolute",
    bottom: 60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.violet50,
    opacity: 0.4,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.teal400,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.tealGlow,
  },
  logoEmoji: { fontSize: 40 },
  heroTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  form: { gap: spacing.lg },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.xs,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.teal400,
    borderColor: colors.teal400,
  },
  checkmark: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: colors.teal500,
    fontWeight: fontWeights.semibold,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  dividerText: {
    color: colors.textDisabled,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  signInText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: fontSizes.base,
    color: colors.teal500,
    fontWeight: fontWeights.bold,
  },
});
