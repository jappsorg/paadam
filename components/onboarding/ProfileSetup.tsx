/**
 * Onboarding Screen - Profile Setup
 *
 * Collects student name and grade level
 * Shows after authentication, before character selection
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Grade } from "../../types/adaptive-learning";
import { SectionHeader, AppTextInput, PrimaryButton, StickyFooter } from "@/components/ui";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

interface ProfileSetupProps {
  onProfileComplete: (data: { name: string; grade: Grade }) => void;
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

export default function ProfileSetup({ onProfileComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showError, setShowError] = useState(false);

  const nameError = showError && !name.trim();

  const handleContinue = () => {
    if (!name.trim() || !selectedGrade) {
      setShowError(true);
      return;
    }

    onProfileComplete({
      name: name.trim(),
      grade: selectedGrade,
    });
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
          <SectionHeader
            emoji="🎓"
            title="Let's Get Started!"
            subtitle="Tell us a bit about yourself..."
          />

          <View style={styles.form}>
            {/* Name Input */}
            <AppTextInput
              label="Your Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setShowError(false);
              }}
              placeholder="What's your name?"
              error={nameError ? "Please enter your name" : undefined}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />

            {/* Grade Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>What grade are you in?</Text>
              <View style={styles.gradeGrid}>
                {GRADES.map((grade) => (
                  <TouchableOpacity
                    key={grade.value}
                    style={[
                      styles.gradeButton,
                      selectedGrade === grade.value &&
                        styles.gradeButtonSelected,
                      showError && !selectedGrade && styles.gradeButtonError,
                    ]}
                    onPress={() => {
                      setSelectedGrade(grade.value);
                      setShowError(false);
                    }}
                    activeOpacity={0.7}
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
              {showError && !selectedGrade && (
                <Text style={styles.errorText}>Please select your grade</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <StickyFooter>
          <PrimaryButton title="Continue" onPress={handleContinue} />
        </StickyFooter>
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
    paddingBottom: 120,
  },
  form: {
    gap: spacing.xxxl,
  },
  inputSection: {
    gap: spacing.md,
  },
  label: {
    fontSize: fontSizes.lg,
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
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.unselectedBorder,
    ...shadows.sm,
  },
  gradeButtonSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected,
    ...shadows.successGlow,
  },
  gradeButtonError: {
    borderColor: colors.inputBorderError,
  },
  gradeButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.unselectedText,
  },
  gradeButtonTextSelected: {
    color: colors.selectedText,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.error,
    marginTop: -spacing.xs,
  },
});
