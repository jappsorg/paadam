import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { SkillOverviewItem } from "@/services/ProgressInsightsService";

interface Props {
  skills: SkillOverviewItem[];
}

const colorMap = {
  green: { bg: colors.green500, text: colors.textOnPrimary },
  yellow: { bg: colors.gold400, text: colors.textPrimary },
  red: { bg: colors.coral400, text: colors.textOnPrimary },
  gray: { bg: colors.sand200, text: colors.textTertiary },
};

function SkillDetail({ skill }: { skill: SkillOverviewItem }) {
  const accuracy = skill.questionsAttempted > 0
    ? Math.round((skill.questionsCorrect / skill.questionsAttempted) * 100)
    : 0;
  const lastPracticed = skill.lastPracticedAt
    ? new Date(skill.lastPracticedAt).toLocaleDateString()
    : "Never";

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailTitle}>{skill.skillName}</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Mastery</Text>
        <Text style={styles.detailValue}>{skill.masteryLevel}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Accuracy</Text>
        <Text style={styles.detailValue}>{accuracy}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Questions</Text>
        <Text style={styles.detailValue}>{skill.questionsCorrect}/{skill.questionsAttempted}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Last Practiced</Text>
        <Text style={styles.detailValue}>{lastPracticed}</Text>
      </View>
      {skill.needsReview && (
        <Text style={styles.reviewBadge}>Needs Review</Text>
      )}
    </View>
  );
}

export function SkillHeatmap({ skills }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const selected = skills.find((s) => s.skillId === selectedSkill);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.grid}>
        {skills.map((skill) => {
          const c = colorMap[skill.color];
          const isSelected = selectedSkill === skill.skillId;
          return (
            <Pressable
              key={skill.skillId}
              style={[styles.chip, { backgroundColor: c.bg }, isSelected && styles.chipSelected]}
              onPress={() => setSelectedSkill(isSelected ? null : skill.skillId)}
            >
              <Text style={[styles.chipText, { color: c.text }]}>{skill.skillName}</Text>
              <Text style={[styles.chipLevel, { color: c.text }]}>{skill.masteryLevel}%</Text>
            </Pressable>
          );
        })}
      </View>
      {selected && <SkillDetail skill={selected} />}
      {skills.length === 0 && (
        <Text style={styles.empty}>No skills tracked yet. Start a worksheet to begin!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  chipSelected: { borderWidth: 2, borderColor: colors.plum900 },
  chipText: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  chipLevel: { fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  detailCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  detailTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  detailLabel: { fontSize: fontSizes.sm, color: colors.textTertiary },
  detailValue: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  reviewBadge: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.coral400,
    backgroundColor: colors.coral100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    alignSelf: "flex-start",
  },
  empty: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: "italic" },
});
