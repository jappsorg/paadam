/**
 * Onboarding Flow
 *
 * Orchestrates the onboarding process:
 * 1. Profile Setup (name, grade)
 * 2. Character Selection
 * 3. Asset Download (character pack, grade pack)
 * 4. Welcome/Tutorial
 */

import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import ProfileSetup from "./ProfileSetup";
import CharacterSelection from "./CharacterSelection";
import { PreferencesSetup } from "@/components/onboarding/PreferencesSetup";
import { Grade } from "../../types/adaptive-learning";
import { useAuth } from "../../context/AuthContext";
import { studentProfileService } from "../../services/StudentProfileService";
import { assetDownloadManager } from "../../services/AssetDownloadManager";
import { authService } from "../../services/AuthService";
import { themeAffinityService } from "@/services/ThemeAffinityService";
import { colors, spacing, radii, fontSizes, fontWeights, sizes } from "@/theme";

type OnboardingStep = "profile" | "character" | "preferences" | "downloading" | "complete";

interface ProfileData {
  name: string;
  grade: Grade;
}

interface OnboardingFlowProps {
  onComplete: (studentId: string) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { currentUser, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  /**
   * Handle profile setup completion
   */
  const handleProfileComplete = async (data: ProfileData) => {
    setProfileData(data);
    setCurrentStep("character");
  };

  /**
   * Handle character selection completion
   */
  const handleCharacterSelected = async (characterId: string) => {
    if (!currentUser || !profileData) {
      setError("Missing user or profile data");
      return;
    }

    try {
      setCurrentStep("downloading");
      setError(null);

      // Create student profile
      const studentProfile = await studentProfileService.createProfile(
        currentUser.uid,
        {
          name: profileData.name,
          grade: profileData.grade,
        },
      );

      // Update selected character
      await studentProfileService.updateProfile(studentProfile.id, {
        selectedCharacterId: characterId,
      });

      // Add student to parent's profile
      await authService.addChildToParent(currentUser.uid, studentProfile.id);
      await refreshProfile();

      // Download character pack
      await assetDownloadManager.downloadCharacterPack(characterId, {
        priority: "high",
        required: true,
        onProgress: (progress) => {
          setDownloadProgress(progress.percent);
        },
      });

      // Download grade pack in background
      assetDownloadManager.downloadGradePack(profileData.grade, {
        priority: "medium",
        background: true,
      });

      // Move to preferences step
      setStudentId(studentProfile.id);
      setCurrentStep("preferences");
    } catch (err) {
      console.error("[OnboardingFlow] Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentStep("character"); // Go back to character selection
    }
  };

  // Render current step
  switch (currentStep) {
    case "profile":
      return <ProfileSetup onProfileComplete={handleProfileComplete} />;

    case "character":
      return (
        <CharacterSelection
          onCharacterSelected={handleCharacterSelected}
          studentName={profileData?.name}
        />
      );

    case "preferences":
      return (
        <PreferencesSetup
          studentName={profileData?.name || "your child"}
          onComplete={async (preferences) => {
            if (studentId) {
              // Seed theme affinities with neutral-positive scores
              for (const theme of preferences.favoriteThemes) {
                await themeAffinityService.updateAffinityFromSession(studentId, {
                  sessionId: "onboarding",
                  studentId,
                  theme,
                  skill: "general",
                  accuracy: 0.5,
                  engagement: 0.5,
                  emotionScore: 0.5,
                  speedScore: 0.5,
                  retryScore: 0.5,
                  timestamp: new Date(),
                });
              }
            }
            setCurrentStep("complete");
            if (studentId) onComplete(studentId);
          }}
          onSkip={() => {
            setCurrentStep("complete");
            if (studentId) onComplete(studentId);
          }}
        />
      );

    case "downloading":
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>
            Setting Up Your Learning Space...
          </Text>
          <Text style={styles.loadingSubtitle}>
            Downloading your companion and learning materials
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${downloadProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{downloadProgress}%</Text>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );

    case "complete":
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.loadingTitle}>All Set!</Text>
          <ActivityIndicator size="large" color={colors.success} />
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  loadingTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    gap: spacing.md,
  },
  progressBar: {
    width: "100%",
    height: sizes.progressBarHeight,
    backgroundColor: colors.borderLight,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: radii.sm,
  },
  progressText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.unselectedText,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.error,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  successEmoji: {
    fontSize: sizes.emojiXxl,
    marginBottom: spacing.lg,
  },
});
