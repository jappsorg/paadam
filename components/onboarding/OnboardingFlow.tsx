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
import { Grade } from "../../types/adaptive-learning";
import { useAuth } from "../../context/AuthContext";
import { studentProfileService } from "../../services/StudentProfileService";
import { assetDownloadManager } from "../../services/AssetDownloadManager";
import { authService } from "../../services/AuthService";

type OnboardingStep = "profile" | "character" | "downloading" | "complete";

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

      // Complete onboarding
      setCurrentStep("complete");
      onComplete(studentProfile.id);
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
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 32,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#E9ECEF",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
  },
  errorText: {
    fontSize: 14,
    color: "#DC3545",
    marginTop: 16,
    textAlign: "center",
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
});
