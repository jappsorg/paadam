import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { ScreenContainer, LoadingState, ErrorState } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing, fontSizes, fontWeights } from "@/theme";
import { progressInsightsService, WeeklySnapshot as WeeklySnapshotData, SkillOverviewItem, RecentActivityItem } from "@/services/ProgressInsightsService";
import { WeeklySnapshot } from "@/components/insights/WeeklySnapshot";
import { SkillHeatmap } from "@/components/insights/SkillHeatmap";
import { EmotionalPulse } from "@/components/insights/EmotionalPulse";
import { ParentNotepad } from "@/components/insights/ParentNotepad";
import { RecentActivity } from "@/components/insights/RecentActivity";
import { ParentNote } from "@/types/parent-notes";

export default function InsightsScreen() {
  const { currentUser, studentProfiles, selectedStudent, setSelectedStudent, isLoading: authLoading } = useAuth();

  const [weeklyData, setWeeklyData] = useState<WeeklySnapshotData | null>(null);
  const [skills, setSkills] = useState<SkillOverviewItem[]>([]);
  const [emotional, setEmotional] = useState<any>(null);
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const studentId = selectedStudent?.id || currentUser?.uid || "";
  const parentUserId = currentUser?.uid || "";

  const fetchData = useCallback(async () => {
    if (!studentId || !parentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const [weekly, skillData, emotionalData, noteData, activityData] = await Promise.all([
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
      console.error("[Insights] Failed to load:", err);
      setError("Couldn't load insights. Let's try again!");
    } finally {
      setLoading(false);
    }
  }, [studentId, parentUserId]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleSaveNote = async (text: string) => {
    setSavingNote(true);
    try {
      await progressInsightsService.saveParentNote(parentUserId, studentId, text);
      const updatedNotes = await progressInsightsService.getParentNotes(parentUserId, studentId);
      setNotes(updatedNotes);
    } catch (err) {
      console.error("[Insights] Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ScreenContainer noScroll>
        <LoadingState message="Loading insights..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer noScroll>
        <ErrorState message={error} onRetry={fetchData} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>
        {selectedStudent && (
          <Text style={styles.studentName}>How {selectedStudent.name} is doing</Text>
        )}
      </View>

      {/* Student Selector */}
      {studentProfiles.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {studentProfiles.map((profile) => {
            const isSelected = selectedStudent?.id === profile.id;
            return (
              <Pressable
                key={profile.id}
                style={[styles.selectorChip, isSelected && styles.selectorChipSelected]}
                onPress={() => setSelectedStudent(profile)}
              >
                <Text style={[styles.selectorText, isSelected && styles.selectorTextSelected]}>
                  {profile.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Dashboard Sections */}
      {weeklyData && <WeeklySnapshot data={weeklyData} />}
      <SkillHeatmap skills={skills} />
      <EmotionalPulse data={emotional} />
      <ParentNotepad notes={notes} onSaveNote={handleSaveNote} saving={savingNote} />
      <RecentActivity activities={activities} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  studentName: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  selectorRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
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
  selectorTextSelected: { color: colors.textOnPrimary },
});
