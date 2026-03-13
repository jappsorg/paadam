import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar } from "react-native-paper";
import { StudentProfile } from "../types/adaptive-learning";
import { CharacterService } from "../services/CharacterService";
import { colors, spacing, radii, sizes, fontSizes, fontWeights, shadows } from "@/theme";

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: "\u{1F989}",
  max: "\u{1F436}",
  luna: "\u{1F431}",
};

interface PlayerStatsProps {
  student: StudentProfile;
}

export function PlayerStats({ student }: PlayerStatsProps) {
  const charId = student.selectedCharacterId || "ada";
  const emoji = CHARACTER_EMOJIS[charId] || CHARACTER_EMOJIS.ada;
  const character = CharacterService.getCharacterById(charId);
  const evolution = CharacterService.getCharacterEvolution(
    charId,
    student.level
  );

  const xpProgress =
    student.xpToNextLevel > 0 ? student.xp / student.xpToNextLevel : 0;

  const totalMinutes = student.totalPracticeTime || 0;
  const practiceDisplay =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes}m`;

  const xpMotivation =
    xpProgress >= 0.75
      ? `Almost at Level ${student.level + 1}!`
      : `${student.xp} / ${student.xpToNextLevel} stars`;

  return (
    <View style={styles.container}>
      {/* Top section: avatar + level */}
      <View style={styles.topRow}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </View>
          </View>
          <Text style={styles.characterName}>
            {evolution?.name || character?.name || "Ada"}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lvl {student.level}</Text>
            </View>
            <Text style={styles.starIcon}>{"\u2B50"}</Text>
          </View>

          <View style={styles.xpContainer}>
            <ProgressBar
              progress={xpProgress}
              color={colors.xpBar}
              style={styles.xpBar}
            />
            <Text style={styles.xpText}>{xpMotivation}</Text>
          </View>
        </View>
      </View>

      {/* Bottom: metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>{"\uD83D\uDD25"}</Text>
          <Text style={styles.metricValue}>{student.currentStreak}</Text>
          <Text style={styles.metricLabel}>Streak</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardMiddle]}>
          <Text style={styles.metricEmoji}>{"\u23F1\uFE0F"}</Text>
          <Text style={styles.metricValue}>{practiceDisplay}</Text>
          <Text style={styles.metricLabel}>Practice</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>{"\uD83C\uDFC6"}</Text>
          <Text style={styles.metricValue}>{student.longestStreak}</Text>
          <Text style={styles.metricLabel}>Record</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    ...shadows.card,
  },
  topRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.xs,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.violet300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.violet50,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.avatarBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 36,
  },
  characterName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.violet500,
    textAlign: "center",
    maxWidth: 80,
  },
  statsSection: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: colors.violet500,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  levelText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.extrabold,
    color: colors.white,
  },
  starIcon: {
    fontSize: 20,
  },
  xpContainer: {
    gap: spacing.xs,
  },
  xpBar: {
    height: sizes.progressBarHeight,
    borderRadius: radii.sm,
    backgroundColor: colors.xpBarBackground,
  },
  xpText: {
    fontSize: fontSizes.sm,
    color: colors.gold600,
    fontWeight: fontWeights.semibold,
  },
  metricsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xxs,
  },
  metricCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: colors.borderLight,
    borderRightColor: colors.borderLight,
  },
  metricEmoji: {
    fontSize: 20,
  },
  metricValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    fontWeight: fontWeights.semibold,
  },
});

export default PlayerStats;
