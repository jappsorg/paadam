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
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Grade } from "../../types/adaptive-learning";

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
          <View style={styles.header}>
            <Text style={styles.emoji}>🎓</Text>
            <Text style={styles.title}>Let's Get Started!</Text>
            <Text style={styles.subtitle}>
              Tell us a bit about yourself so we can personalize your learning
              journey
            </Text>
          </View>

          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>What's your name?</Text>
              <TextInput
                style={[
                  styles.input,
                  showError && !name.trim() && styles.inputError,
                ]}
                placeholder="Enter your name"
                placeholderTextColor="#ADB5BD"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setShowError(false);
                }}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
              />
              {showError && !name.trim() && (
                <Text style={styles.errorText}>Please enter your name</Text>
              )}
            </View>

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

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    gap: 32,
  },
  inputSection: {
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    fontSize: 16,
    color: "#212529",
    borderWidth: 2,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#DC3545",
  },
  errorText: {
    fontSize: 14,
    color: "#DC3545",
    marginTop: -4,
  },
  gradeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gradeButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gradeButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
  },
  gradeButtonError: {
    borderColor: "#DC3545",
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  gradeButtonTextSelected: {
    color: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
