import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar, Surface } from "react-native-paper";
import { StudentProfile } from "../types/adaptive-learning";
import { CharacterService } from "../services/CharacterService";

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
            color="#FFB300"
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
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    gap: 14,
  },
  avatarSection: {
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 36,
  },
  characterName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A90E2",
    textAlign: "center",
    maxWidth: 75,
  },
  statsSection: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelBadge: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4A90E2",
  },
  xpText: {
    fontSize: 13,
    color: "#F57C00",
    fontWeight: "600",
  },
  xpBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFF3E0",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 6,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3436",
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
});

export default PlayerStats;
