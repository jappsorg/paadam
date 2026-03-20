import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, fontSizes, fontWeights } from "@/theme";

interface SkillNode {
  id: string;
  name: string;
  masteryLevel: number;
  state: "locked" | "in-progress" | "mastered";
}

interface Props {
  skills: Record<string, any>;
  grade?: string;
}

const gradeSkillOrder: Record<string, string[]> = {
  K: ["counting", "addition", "subtraction", "patterns", "geometry"],
  "1": ["addition", "subtraction", "patterns", "measurement", "time", "geometry"],
  "2": ["addition", "subtraction", "multiplication", "measurement", "time", "money", "geometry"],
  "3": ["addition", "subtraction", "multiplication", "division", "fractions", "measurement", "geometry"],
  "4": ["multiplication", "division", "fractions", "decimals", "geometry", "measurement", "algebra"],
  "5": ["fractions", "decimals", "multiplication", "division", "geometry", "algebra", "measurement"],
};

const skillEmojis: Record<string, string> = {
  addition: "\u2795", subtraction: "\u2796", multiplication: "\u2716\uFE0F", division: "\u2797",
  fractions: "\u{1F355}", decimals: "\u{1F522}", geometry: "\u{1F4D0}", algebra: "\u{1F524}",
  patterns: "\u{1F501}", measurement: "\u{1F4CF}", time: "\u{1F550}", money: "\u{1F4B0}", counting: "\u{1F522}",
};

function getSkillState(mastery: any): SkillNode["state"] {
  if (!mastery) return "locked";
  const level = mastery.masteryLevel ?? 0;
  if (level >= 80) return "mastered";
  if (level > 0) return "in-progress";
  return "locked";
}

const stateStyles = {
  locked: { bg: colors.sand200, border: colors.sand300, emoji: "\u{1F512}" },
  "in-progress": { bg: colors.gold100, border: colors.gold400, emoji: "" },
  mastered: { bg: colors.green500, border: colors.green500, emoji: "\u2B50" },
};

export function SkillJourney({ skills, grade }: Props) {
  const order = gradeSkillOrder[grade || "3"] || gradeSkillOrder["3"];

  const nodes: SkillNode[] = order.map((skillId) => ({
    id: skillId,
    name: skillId.charAt(0).toUpperCase() + skillId.slice(1),
    masteryLevel: skills[skillId]?.masteryLevel ?? 0,
    state: getSkillState(skills[skillId]),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Journey</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {nodes.map((node, i) => {
          const s = stateStyles[node.state];
          return (
            <React.Fragment key={node.id}>
              {i > 0 && (
                <View style={styles.connector}>
                  <View style={[
                    styles.connectorLine,
                    node.state !== "locked" && styles.connectorLineActive,
                  ]} />
                </View>
              )}
              <View style={styles.nodeWrapper}>
                <View style={[styles.node, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={styles.nodeEmoji}>
                    {node.state === "mastered" ? s.emoji : (skillEmojis[node.id] || "\u{1F4DA}")}
                  </Text>
                </View>
                <Text style={[
                  styles.nodeName,
                  node.state === "locked" && styles.nodeNameLocked,
                ]}>{node.name}</Text>
                {node.state === "in-progress" && (
                  <Text style={styles.nodeProgress}>{node.masteryLevel}%</Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  scroll: { paddingHorizontal: spacing.xl, alignItems: "center" },
  nodeWrapper: { alignItems: "center", width: 72 },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  nodeEmoji: { fontSize: 24 },
  nodeName: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  nodeNameLocked: { color: colors.textDisabled },
  nodeProgress: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.gold500,
  },
  connector: { justifyContent: "center", paddingBottom: 20 },
  connectorLine: {
    width: 20,
    height: 3,
    backgroundColor: colors.sand300,
    borderRadius: 2,
  },
  connectorLineActive: { backgroundColor: colors.gold400 },
});
