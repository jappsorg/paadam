import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { Link } from "expo-router";
import { WorksheetType } from "@/types/worksheet";
import { colors, spacing, radii, shadows, fontSizes, fontWeights } from "@/theme";

type WorksheetTemplate = {
  id: WorksheetType;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  lightColor: string;
};

type WorksheetCardProps = {
  worksheet: WorksheetTemplate;
};

export const WorksheetCard: React.FC<WorksheetCardProps> = ({ worksheet }) => {
  const { id, title, description, icon, accentColor, lightColor } = worksheet;

  return (
    <Link href={`/${id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        {/* Accent strip */}
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
        <View style={styles.cardContent}>
          <View style={[styles.iconCircle, { backgroundColor: lightColor }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <Text style={styles.arrow}>{"\u203A"}</Text>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    overflow: "hidden",
    flexDirection: "row",
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  accentStrip: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 28,
  },
  textContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: fontWeights.bold,
  },
});

export const worksheetTemplates: WorksheetTemplate[] = [
  {
    id: "math",
    title: "Math Practice",
    description: "Add, subtract, multiply and more!",
    icon: "\uD83D\uDD22",
    accentColor: colors.mathColor,
    lightColor: colors.coral50,
  },
  {
    id: "puzzle",
    title: "Math Puzzles",
    description: "Solve fun number puzzles. Can you crack them all?",
    icon: "\uD83E\uDDE9",
    accentColor: colors.puzzleColor,
    lightColor: colors.violet50,
  },
  {
    id: "word-problem",
    title: "Word Problems",
    description: "Use math to solve real stories!",
    icon: "\uD83D\uDCDD",
    accentColor: colors.wordProblemColor,
    lightColor: colors.teal50,
  },
  {
    id: "logic",
    title: "Brain Teasers",
    description: "Figure out tricky riddles using clues. Like a detective!",
    icon: "\uD83D\uDD75\uFE0F",
    accentColor: colors.logicColor,
    lightColor: colors.gold50,
  },
];
