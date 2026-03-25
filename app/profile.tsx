/**
 * Profile Tab - Kid's Trophy Room
 *
 * Shows the student's character buddy, level, XP, streak,
 * and achievements. This is the kid's personal space.
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { ScreenContainer, LoadingState, EmptyState } from "@/components/ui";
import { CharacterService } from "@/services/CharacterService";
import { AchievementService } from "@/services/AchievementService";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: "\u{1F989}",
  max: "\u{1F436}",
  luna: "\u{1F431}",
};

export default function ProfileScreen() {
  const { currentUser, selectedStudent, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ScreenContainer noScroll>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (!currentUser || !selectedStudent) {
    return (
      <ScreenContainer noScroll>
        <EmptyState
          emoji={"\u{1F44B}"}
          title="Welcome!"
          subtitle="Complete onboarding to set up your profile!"
        />
      </ScreenContainer>
    );
  }

  const charId = selectedStudent.selectedCharacterId || "ada";
  const character = CharacterService.getCharacterById(charId);
  const charEmoji = CHARACTER_EMOJIS[charId] || CHARACTER_EMOJIS.ada;
  const evolution = CharacterService.getCharacterEvolution(charId, selectedStudent.level || 1);

  const xp = selectedStudent.xp || 0;
  const xpToNext = selectedStudent.xpToNextLevel || 100;
  const xpProgress = xpToNext > 0 ? xp / xpToNext : 0;

  // Compute lifetime XP (current progress + all XP consumed by previous levels)
  const lifetimeXP = useMemo(() => {
    let total = xp;
    for (let lvl = 1; lvl < (selectedStudent.level || 1); lvl++) {
      total += Math.floor(100 * Math.pow(1.5, lvl - 1));
    }
    return total;
  }, [selectedStudent.level, xp]);

  // Achievement data
  const allAchievements = useMemo(() => AchievementService.getAllDefinitions(), []);
  const earnedIds = useMemo(
    () => new Set(selectedStudent.achievements || []),
    [selectedStudent.achievements],
  );
  const earnedCount = earnedIds.size;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        {/* Character Hero */}
        <View style={styles.heroSection}>
          <View style={styles.characterCircle}>
            <Text style={styles.characterEmoji}>{charEmoji}</Text>
          </View>
          <Text style={styles.characterName}>
            {character?.name || "Ada"}
          </Text>
          <Text style={styles.evolutionTitle}>
            {evolution?.title || "Learning Buddy"}
          </Text>
          <Text style={styles.studentName}>
            {selectedStudent.name}'s buddy
          </Text>
        </View>

        {/* Level & XP */}
        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelBadge}>Level {selectedStudent.level || 1}</Text>
            <Text style={styles.xpText}>{xp} / {xpToNext} XP</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <ProgressBar
              progress={xpProgress}
              color={colors.teal400}
              style={styles.xpBar}
            />
          </View>
          {xpToNext - xp > 0 && (
            <Text style={styles.xpHint}>
              {xpToNext - xp} more XP to level up!
            </Text>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.coral50 }]}>
            <Text style={styles.statEmoji}>{"\uD83D\uDD25"}</Text>
            <Text style={[styles.statValue, { color: colors.coral500 }]}>
              {selectedStudent.currentStreak || 0}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.teal50 }]}>
            <Text style={styles.statEmoji}>{"\u2B50"}</Text>
            <Text style={[styles.statValue, { color: colors.teal500 }]}>
              {lifetimeXP}
            </Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.violet50 }]}>
            <Text style={styles.statEmoji}>{"\uD83C\uDFC6"}</Text>
            <Text style={[styles.statValue, { color: colors.violet500 }]}>
              {selectedStudent.longestStreak || 0}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Buddy Bond */}
        <View style={styles.bondSection}>
          <Text style={styles.bondTitle}>Buddy Bond</Text>
          <View style={styles.bondBar}>
            <View
              style={[
                styles.bondFill,
                { width: `${Math.min((selectedStudent.characterBondLevel || 0), 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.bondLabel}>
            {(selectedStudent.characterBondLevel || 0) < 20
              ? "Just getting to know each other!"
              : (selectedStudent.characterBondLevel || 0) < 50
              ? "Becoming friends!"
              : (selectedStudent.characterBondLevel || 0) < 80
              ? "Great partners!"
              : "Best buddies forever!"}
          </Text>
        </View>

        {/* Grade Info */}
        <View style={styles.gradeSection}>
          <Text style={styles.gradeLabel}>Grade</Text>
          <Text style={styles.gradeValue}>
            {selectedStudent.grade === "K" ? "Kindergarten" : `Grade ${selectedStudent.grade}`}
          </Text>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            <Text style={styles.achievementsCount}>
              {earnedCount} / {allAchievements.length}
            </Text>
          </View>
          <View style={styles.achievementsGrid}>
            {allAchievements.map((achievement) => {
              const isEarned = earnedIds.has(achievement.id);
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementBadge,
                    isEarned
                      ? styles.achievementEarned
                      : styles.achievementLocked,
                  ]}
                >
                  <Text style={styles.achievementBadgeEmoji}>
                    {isEarned ? achievement.emoji : "?"}
                  </Text>
                  <Text
                    style={[
                      styles.achievementBadgeName,
                      !isEarned && styles.achievementBadgeNameLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {isEarned ? achievement.name : "???"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  characterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.violet50,
    borderWidth: 4,
    borderColor: colors.violet100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  characterEmoji: {
    fontSize: 56,
  },
  characterName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  evolutionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.violet500,
    marginTop: spacing.xxs,
  },
  studentName: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  levelSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  levelBadge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.teal500,
  },
  xpText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
  },
  xpBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: colors.sand100,
  },
  xpBar: {
    height: 10,
    borderRadius: 5,
  },
  xpHint: {
    fontSize: fontSizes.xs,
    color: colors.teal400,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.xl,
    gap: spacing.xxs,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
  },
  bondSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  bondTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  bondBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sand100,
    overflow: "hidden",
  },
  bondFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.coral400,
  },
  bondLabel: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  gradeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  gradeLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
  },
  gradeValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  achievementsSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  achievementsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  achievementsCount: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  achievementBadge: {
    width: "30%",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.lg,
  },
  achievementEarned: {
    backgroundColor: colors.gold50,
  },
  achievementLocked: {
    backgroundColor: colors.sand100,
    opacity: 0.6,
  },
  achievementBadgeEmoji: {
    fontSize: 28,
    marginBottom: spacing.xxs,
  },
  achievementBadgeName: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  achievementBadgeNameLocked: {
    color: colors.textTertiary,
  },
});
