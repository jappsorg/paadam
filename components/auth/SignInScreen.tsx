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
  SectionHeader,
  AppTextInput,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import {
  colors,
  spacing,
  fontSizes,
  fontWeights,
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

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      onSignInSuccess();
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onSignInSuccess();
    } catch (error) {
      Alert.alert(
        "Google Sign In Failed",
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    Alert.alert("Reset Password", "Password reset functionality coming soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <SectionHeader
            emoji="📚"
            title="Welcome Back!"
            subtitle="Sign in to continue learning"
          />

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
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

            {/* Password Input */}
            <AppTextInput
              label="Password"
              isPassword
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              textContentType="password"
              editable={!isLoading}
            />

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <PrimaryButton
              title="Sign In"
              onPress={handleEmailSignIn}
              loading={isLoading}
              disabled={!email || !password}
              style={styles.signInButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <SecondaryButton
              icon="🔵"
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              loading={isGoogleSignInLoading}
            />

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xxl,
    paddingTop: spacing.xxxxl,
  },
  form: {
    gap: spacing.xl,
  },
  forgotPassword: {
    fontSize: fontSizes.md,
    color: colors.success,
    fontWeight: fontWeights.semibold,
    textAlign: "right",
  },
  signInButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textDisabled,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  signUpText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: fontSizes.base,
    color: colors.success,
    fontWeight: fontWeights.bold,
  },
});
