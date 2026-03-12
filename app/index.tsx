import React from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import { ScreenContainer } from "@/components/ui";
import { colors, spacing, radii } from "@/theme";
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
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "No, stay!", style: "cancel" },
        {
          text: "Yes, sign out",
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome{selectedStudent ? `, ${selectedStudent.name}` : ""}! 👋
          </Text>
          {selectedStudent && (
            <Text variant="bodyMedium" style={styles.subtitle}>
              Level {selectedStudent.level} • {selectedStudent.currentStreak}{" "}
              day streak 🔥
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Student Selector if multiple children */}
      {studentProfiles.length > 1 && (
        <View style={styles.studentSelector}>
          <Text variant="titleMedium" style={styles.selectorTitle}>
            Select Student:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {studentProfiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.studentChip,
                  selectedStudent?.id === profile.id &&
                    styles.studentChipSelected,
                ]}
                onPress={() => setSelectedStudent(profile)}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    selectedStudent?.id === profile.id &&
                      styles.studentChipTextSelected,
                  ]}
                >
                  {profile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Player Stats */}
      {selectedStudent && <PlayerStats student={selectedStudent} />}

      {/* Worksheets */}
      <View style={styles.worksheetSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          What do you want to practice?
        </Text>
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
    alignItems: "flex-start",
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  signOutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.borderLight,
    borderRadius: radii.sm,
  },
  signOutText: {
    fontSize: 14,
    color: colors.unselectedText,
    fontWeight: "600",
  },
  studentSelector: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  selectorTitle: {
    marginBottom: spacing.md,
  },
  studentChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.unselectedBorder,
  },
  studentChipSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected,
  },
  studentChipText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.unselectedText,
  },
  studentChipTextSelected: {
    color: colors.selectedText,
  },
  worksheetSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
});
