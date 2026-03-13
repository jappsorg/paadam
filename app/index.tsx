import React from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { ScreenContainer } from "@/components/ui";
import { colors, spacing, radii, shadows, fontSizes, fontWeights } from "@/theme";
import { WorksheetCard, worksheetTemplates } from "../components/WorksheetCard";
import { useAuth } from "../context/AuthContext";
import { PlayerStats } from "../components/PlayerStats";

export default function HomeScreen() {
  const {
    currentUser,
    signOut,
    studentProfiles,
    selectedStudent,
    setSelectedStudent,
  } = useAuth();

  const handleSignOut = () => {
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
  };

  return (
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
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>{"\u{1F6AA}"}</Text>
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

      {/* Worksheet Section */}
      <View style={styles.worksheetSection}>
        <Text style={styles.sectionTitle}>What shall we explore?</Text>
        <Text style={styles.sectionSubtitle}>Pick an adventure below</Text>
        {worksheetTemplates.map((worksheet) => (
          <WorksheetCard key={worksheet.id} worksheet={worksheet} />
        ))}
      </View>
    </ScreenContainer>
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
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sand100,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutText: {
    fontSize: 20,
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
