import React, { useState } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, Pressable, Platform } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui";
import { colors, spacing, radii, shadows, fontSizes, fontWeights } from "@/theme";
import { WorksheetCard, worksheetTemplates } from "../components/WorksheetCard";
import { useAuth } from "../context/AuthContext";
import { PlayerStats } from "../components/PlayerStats";
import { SkillJourney } from "@/components/home/SkillJourney";
import MathGate from "@/components/MathGate";
import ParentDashboard from "@/components/ParentDashboard";
import AddChildForm from "@/components/AddChildForm";

export default function HomeScreen() {
  const {
    currentUser,
    signOut,
    studentProfiles,
    selectedStudent,
    setSelectedStudent,
  } = useAuth();

  const [showMathGate, setShowMathGate] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

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

      {/* Skill Journey */}
      {selectedStudent && (
        <SkillJourney
          skills={(selectedStudent as any).skillMastery || (selectedStudent as any).skillsMastery || {}}
          grade={selectedStudent.grade}
        />
      )}

      {/* Worksheet Section */}
      <View style={styles.worksheetSection}>
        <Text style={styles.sectionTitle}>What shall we explore?</Text>
        <Text style={styles.sectionSubtitle}>Pick an adventure below</Text>
        {worksheetTemplates.map((worksheet) => (
          <WorksheetCard key={worksheet.id} worksheet={worksheet} />
        ))}
      </View>
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
