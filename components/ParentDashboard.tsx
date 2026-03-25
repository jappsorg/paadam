/**
 * Parent Dashboard - Full-screen overlay behind the math gate
 *
 * Contains all insights/progress data + account settings.
 * Reuses existing insight components.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";
import {
  progressInsightsService,
  WeeklySnapshot as WeeklySnapshotData,
  SkillOverviewItem,
  RecentActivityItem,
} from "@/services/ProgressInsightsService";
import { WeeklySnapshot } from "@/components/insights/WeeklySnapshot";
import { SkillHeatmap } from "@/components/insights/SkillHeatmap";
import { EmotionalPulse } from "@/components/insights/EmotionalPulse";
import { ParentNotepad } from "@/components/insights/ParentNotepad";
import { RecentActivity } from "@/components/insights/RecentActivity";
import { ParentNote } from "@/types/parent-notes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ParentDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export default function ParentDashboard({ visible, onClose }: ParentDashboardProps) {
  const {
    currentUser,
    userProfile,
    studentProfiles,
    selectedStudent,
    setSelectedStudent,
    signOut,
  } = useAuth();

  const [weeklyData, setWeeklyData] = useState<WeeklySnapshotData | null>(null);
  const [skills, setSkills] = useState<SkillOverviewItem[]>([]);
  const [emotional, setEmotional] = useState<any>(null);
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const studentId = selectedStudent?.id || currentUser?.uid || "";
  const parentUserId = currentUser?.uid || "";

  const fetchData = useCallback(async () => {
    if (!studentId || !parentUserId) return;
    setLoading(true);
    try {
      const [weekly, skillData, emotionalData, noteData, activityData] =
        await Promise.all([
          progressInsightsService.getWeeklySnapshot(studentId).catch(() => null),
          progressInsightsService.getSkillOverview(studentId).catch(() => []),
          progressInsightsService.getEmotionalSummary(studentId).catch(() => null),
          progressInsightsService.getParentNotes(parentUserId, studentId).catch(() => []),
          progressInsightsService.getRecentActivity(studentId).catch(() => []),
        ]);
      setWeeklyData(weekly);
      setSkills(skillData);
      setEmotional(emotionalData);
      setNotes(noteData);
      setActivities(activityData);
    } catch (err) {
      console.error("[ParentDashboard] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId, parentUserId]);

  useEffect(() => {
    if (visible) fetchData();
  }, [visible, fetchData]);

  const handleSaveNote = async (text: string) => {
    setSavingNote(true);
    try {
      await progressInsightsService.saveParentNote(parentUserId, studentId, text);
      const updatedNotes = await progressInsightsService.getParentNotes(
        parentUserId,
        studentId
      );
      setNotes(updatedNotes);
    } catch (err) {
      console.error("[ParentDashboard] Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Parent Dashboard</Text>
            <Text style={styles.subtitle}>
              {currentUser?.displayName || currentUser?.email}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Student Selector */}
          {studentProfiles.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectorRow}
            >
              {studentProfiles.map((profile) => {
                const isSelected = selectedStudent?.id === profile.id;
                return (
                  <Pressable
                    key={profile.id}
                    style={[styles.selectorChip, isSelected && styles.selectorChipSelected]}
                    onPress={() => setSelectedStudent(profile)}
                  >
                    <Text
                      style={[styles.selectorText, isSelected && styles.selectorTextSelected]}
                    >
                      {profile.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {/* Student Info */}
          {selectedStudent && (
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{selectedStudent.name}'s Progress</Text>
              <Text style={styles.studentGrade}>
                Grade {selectedStudent.grade} | Level {selectedStudent.level || 1}
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {weeklyData && <WeeklySnapshot data={weeklyData} />}
              <SkillHeatmap skills={skills} />
              <EmotionalPulse data={emotional} />
              <ParentNotepad
                notes={notes}
                onSaveNote={handleSaveNote}
                saving={savingNote}
              />
              <RecentActivity activities={activities} />
            </>
          )}

          {/* Account Section */}
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{currentUser?.email}</Text>
            </View>

            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Students</Text>
              <Text style={styles.accountValue}>
                {studentProfiles.map((p) => p.name).join(", ") || "None"}
              </Text>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  selectorRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  selectorChipSelected: {
    backgroundColor: colors.coral400,
    borderColor: colors.coral400,
  },
  selectorText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  selectorTextSelected: {
    color: colors.white,
  },
  studentInfo: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  studentName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  studentGrade: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: "center",
  },
  loadingText: {
    color: colors.textTertiary,
    fontSize: fontSizes.md,
  },
  accountSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  accountInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  accountLabel: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
  },
  accountValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  signOutButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.coral50,
    alignItems: "center",
  },
  signOutText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.coral500,
  },
});
