/**
 * Add Child Form - Parent-facing flow
 *
 * A streamlined single-screen form for parents to add another child
 * from the Parent Dashboard. Unlike the kid-facing OnboardingFlow,
 * this uses parent-appropriate language and skips character selection
 * and theme preferences (the child picks those on first use).
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Grade } from "../types/adaptive-learning";
import { useAuth } from "../context/AuthContext";
import { studentProfileService } from "../services/StudentProfileService";
import { authService } from "../services/AuthService";
import { AppTextInput, PrimaryButton, SecondaryButton } from "@/components/ui";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

interface AddChildFormProps {
  visible: boolean;
  onComplete: (studentId: string) => void;
  onCancel: () => void;
}

const GRADES: { value: Grade; label: string }[] = [
  { value: "K", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
];

export default function AddChildForm({
  visible,
  onComplete,
  onCancel,
}: AddChildFormProps) {
  const { currentUser, refreshProfile, refreshStudentProfiles } = useAuth();
  const [name, setName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const nameError = showErrors && !name.trim();
  const gradeError = showErrors && !selectedGrade;

  const resetForm = () => {
    setName("");
    setSelectedGrade(null);
    setShowErrors(false);
    setError(null);
    setIsSubmitting(false);
    setShowSuccess(false);
    setCreatedName("");
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !selectedGrade) {
      setShowErrors(true);
      return;
    }

    if (!currentUser) {
      setError("You must be signed in to add a child.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the student profile (no character -- child picks on first use)
      const studentProfile = await studentProfileService.createProfile(
        currentUser.uid,
        {
          name: name.trim(),
          grade: selectedGrade,
        },
      );

      // Link child to parent account
      await authService.addChildToParent(currentUser.uid, studentProfile.id);
      await refreshProfile();
      await refreshStudentProfiles();

      console.log(
        "[AddChildForm] Created child profile:",
        studentProfile.id,
        name.trim(),
      );

      // Show success state
      setCreatedName(name.trim());
      setShowSuccess(true);

      // Auto-close after showing success
      setTimeout(() => {
        resetForm();
        onComplete(studentProfile.id);
      }, 1500);
    } catch (err) {
      console.error("[AddChildForm] Error creating profile:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <SafeAreaView style={styles.container}>
        {showSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons
                name="check-circle"
                size={64}
                color={colors.teal400}
              />
            </View>
            <Text style={styles.successTitle}>
              {createdName}'s profile is ready!
            </Text>
            <Text style={styles.successSubtitle}>
              When {createdName} starts learning, they'll get to pick their own
              companion character.
            </Text>
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Add a Child</Text>
                <Text style={styles.subtitle}>
                  Set up a learning profile for your child
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name Input */}
              <AppTextInput
                label="Child's Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setShowErrors(false);
                }}
                placeholder="Enter your child's name"
                error={nameError ? "Please enter your child's name" : undefined}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
                editable={!isSubmitting}
              />

              {/* Grade Selection */}
              <View style={styles.gradeSection}>
                <Text style={styles.label}>Grade Level</Text>
                <View style={styles.gradeGrid}>
                  {GRADES.map((grade) => (
                    <TouchableOpacity
                      key={grade.value}
                      style={[
                        styles.gradeButton,
                        selectedGrade === grade.value &&
                          styles.gradeButtonSelected,
                        gradeError && styles.gradeButtonError,
                      ]}
                      onPress={() => {
                        setSelectedGrade(grade.value);
                        setShowErrors(false);
                      }}
                      activeOpacity={0.7}
                      disabled={isSubmitting}
                    >
                      <Text
                        style={[
                          styles.gradeButtonText,
                          selectedGrade === grade.value &&
                            styles.gradeButtonTextSelected,
                        ]}
                      >
                        {grade.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {gradeError && (
                  <Text style={styles.errorText}>
                    Please select your child's grade
                  </Text>
                )}
              </View>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={colors.teal500}
                />
                <Text style={styles.infoText}>
                  Your child will get to choose their own companion character and
                  preferences when they start using the app.
                </Text>
              </View>

              {/* Error Display */}
              {error && (
                <View style={styles.errorBanner}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={18}
                    color={colors.coral500}
                  />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <PrimaryButton
                title={isSubmitting ? "Adding..." : "Add Child"}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                variant="teal"
              />
              <SecondaryButton
                title="Cancel"
                onPress={handleCancel}
                disabled={isSubmitting}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.sand100,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  gradeSection: {
    gap: spacing.md,
  },
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  gradeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gradeButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  gradeButtonSelected: {
    backgroundColor: colors.teal50,
    borderColor: colors.teal400,
    ...shadows.tealGlow,
  },
  gradeButtonError: {
    borderColor: colors.inputBorderError,
  },
  gradeButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  gradeButtonTextSelected: {
    color: colors.teal700,
    fontWeight: fontWeights.bold,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.error,
    marginTop: -spacing.xs,
  },
  infoNote: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.teal50,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.teal400,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.teal700,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.coral50,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.coral400,
  },
  errorBannerText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.coral500,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  successIcon: {
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  successSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
});
