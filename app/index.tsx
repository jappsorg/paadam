import React, { useState } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, Pressable, Platform } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui";
import { colors, spacing, radii, shadows, fontSizes, fontWeights } from "@/theme";
import { useAuth } from "../context/AuthContext";
import { PlayerStats } from "../components/PlayerStats";
import { SkillJourney } from "@/components/home/SkillJourney";
import { ModeCard } from "@/components/home/ModeCard";
import { MODE_CONFIGS, MODE_ORDER } from "@/types/modes";
import { getSuggestion } from "@/utils/modeSuggestion";
import MathGate from "@/components/MathGate";
import ParentDashboard from "@/components/ParentDashboard";
import AddChildForm from "@/components/AddChildForm";

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: "\u{1F989}",
  max: "\u{1F436}",
  luna: "\u{1F431}",
};

export default function HomeScreen() {
  const {
    currentUser,
    signOut,
    studentProfiles,
    selectedStudent,
    setSelectedStudent,
  } = useAuth();

  const router = useRouter();
  const [showMathGate, setShowMathGate] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  const skillsMastery = (selectedStudent as any)?.skillsMastery || (selectedStudent as any)?.skillMastery || {};

  // Estimate completed worksheets from total questions attempted
  const totalAttempted = Object.values(skillsMastery).reduce(
    (sum: number, s: any) => sum + (s.questionsAttempted || 0), 0
  );
  const estimatedWorksheets = Math.floor(totalAttempted / 5);

  const suggestion = selectedStudent
    ? getSuggestion({
        completedWorksheetCount: estimatedWorksheets,
        averageScore: 0,
        skillsMastery,
        currentStreak: selectedStudent.currentStreak || 0,
        recentAccuracy: 0,
        dispositionConfidence: (selectedStudent as any).dispositionConfidence,
        challengeSeeking: (selectedStudent as any).learningDisposition?.challengeSeeking,
      })
    : null;

  const characterEmoji = selectedStudent?.selectedCharacterId
    ? CHARACTER_EMOJIS[selectedStudent.selectedCharacterId] || "\u{1F989}"
    : "\u{1F989}";

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Leaving already? Are you sure you want to go?");
      if (confirmed) {
        try {
          await signOut();
        } catch (error) {
          console.error("[HomeScreen] Sign out error:", error);
        }
      }
    } else {
      Alert.alert(
        "Leaving already?",
        "Are you sure you want to go?",
        [
          { text: "Nope, stay!", style: "cancel" },
          {
            text: "Yep, bye!",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut();
              } catch (error) {
                console.error("[HomeScreen] Sign out error:", error);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <>
    <ScreenContainer>
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {selectedStudent ? `Hey, ${selectedStudent.name}!` : "Welcome!"} {"\u{1F44B}"}
          </Text>
          {selectedStudent && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>
                {"\uD83D\uDD25"} {selectedStudent.currentStreak} day streak
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowMathGate(true)}
          style={styles.gearButton}
        >
          <MaterialCommunityIcons name="cog" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Student Selector */}
      {studentProfiles.length > 1 && (
        <View style={styles.studentSelector}>
          <Text style={styles.selectorTitle}>Switch learner:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {studentProfiles.map((profile) => {
              const isSelected = selectedStudent?.id === profile.id;
              return (
                <Pressable
                  key={profile.id}
                  style={[
                    styles.studentChip,
                    isSelected && styles.studentChipSelected,
                  ]}
                  onPress={() => setSelectedStudent(profile)}
                >
                  <Text
                    style={[
                      styles.studentChipText,
                      isSelected && styles.studentChipTextSelected,
                    ]}
                  >
                    {profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Player Stats */}
      {selectedStudent && <PlayerStats student={selectedStudent} />}

      {/* Mode Cards */}
      <View style={styles.worksheetSection}>
        <Text style={styles.sectionTitle}>What do you feel like doing?</Text>
        <Text style={styles.sectionSubtitle}>Pick your path</Text>
        {MODE_ORDER.map((modeId) => {
          const mode = MODE_CONFIGS[modeId];
          const isSuggested = suggestion?.mode === modeId;
          return (
            <ModeCard
              key={modeId}
              mode={mode}
              characterEmoji={isSuggested ? characterEmoji : undefined}
              characterMessage={isSuggested ? suggestion?.reason : undefined}
            />
          );
        })}
      </View>

      {/* Skill Journey */}
      {selectedStudent && (
        <SkillJourney
          skills={skillsMastery}
          grade={selectedStudent.grade}
          onSkillPress={(skillId) => router.push('/practice' as any)}
        />
      )}
    </ScreenContainer>

      <MathGate
        visible={showMathGate}
        onSuccess={() => {
          setShowMathGate(false);
          setShowParentDashboard(true);
        }}
        onCancel={() => setShowMathGate(false)}
      />
      <ParentDashboard
        visible={showParentDashboard}
        onClose={() => setShowParentDashboard(false)}
        onAddChild={() => setShowAddChild(true)}
      />
      <AddChildForm
        visible={showAddChild}
        onComplete={async (studentId) => {
          console.log("[HomeScreen] Child added:", studentId);
          setShowAddChild(false);
        }}
        onCancel={() => setShowAddChild(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  streakBadge: {
    backgroundColor: colors.orange50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  streakText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.orange600,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sand100,
    justifyContent: "center",
    alignItems: "center",
  },
  studentSelector: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  selectorTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  studentChip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  studentChipSelected: {
    backgroundColor: colors.coral400,
    borderColor: colors.coral400,
    ...shadows.coralGlow,
  },
  studentChipText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  studentChipTextSelected: {
    color: colors.textOnPrimary,
  },
  worksheetSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
});
