import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar, Surface } from "react-native-paper";
import { StudentProfile } from "../types/adaptive-learning";
import { CharacterService } from "../services/CharacterService";
import { colors, spacing, radii, sizes, fontSizes, fontWeights } from "@/theme";

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

  // Motivational XP label
  const xpMotivation =
    xpProgress >= 0.75
      ? `Almost at Level ${student.level + 1}!`
      : `${student.xp} / ${student.xpToNextLevel} stars`;

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.topRow}>
        {/* Character avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
          <Text style={styles.characterName}>
            {evolution?.name || character?.name || "Ada"}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          {/* Level + XP */}
          <View style={styles.levelRow}>
            <Text style={styles.levelBadge}>Level {student.level} {"\u2B50"}</Text>
          </View>
          <ProgressBar
            progress={xpProgress}
            color={colors.xpBar}
            style={styles.xpBar}
          />
          <Text style={styles.xpText}>{xpMotivation}</Text>

          {/* Streak + Practice time */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>
                {student.currentStreak}{" "}
                {student.currentStreak > 0 ? "\uD83D\uDD25" : ""}
              </Text>
              <Text style={styles.metricLabel}>Day Streak</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{practiceDisplay}</Text>
              <Text style={styles.metricLabel}>Practice Time</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>
                {student.longestStreak} {"\uD83C\uDFC6"}
              </Text>
              <Text style={styles.metricLabel}>Record</Text>
            </View>
          </View>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: "row",
    gap: spacing.md + 2,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.xs,
  },
  avatar: {
    width: sizes.avatarLg,
    height: sizes.avatarLg,
    borderRadius: sizes.avatarLg / 2,
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
    color: colors.levelBadge,
    textAlign: "center",
    maxWidth: 75,
  },
  statsSection: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs + 2,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  levelBadge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.levelBadge,
  },
  xpText: {
    fontSize: fontSizes.sm,
    color: colors.streak,
    fontWeight: fontWeights.semibold,
  },
  xpBar: {
    height: sizes.progressBarHeight,
    borderRadius: radii.xs + 2,
    backgroundColor: colors.xpBarBackground,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: spacing.xs + 2,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    fontWeight: fontWeights.semibold,
  },
  metricDivider: {
    width: 1,
    height: spacing.xxl,
    backgroundColor: colors.divider,
  },
});

export default PlayerStats;
