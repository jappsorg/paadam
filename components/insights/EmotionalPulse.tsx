import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

interface EmotionalSummary {
  recentMood: string;
  commonFrustrations: string[];
  celebrationPatterns: string[];
  energyPatterns: string;
  focusPatterns: string;
}

interface Props {
  data: EmotionalSummary | null;
}

const moodEmoji: Record<string, string> = {
  "generally positive": "\u{1F60A}",
  "neutral": "\u{1F610}",
  "needs encouragement": "\u{1F917}",
};

export function EmotionalPulse({ data }: Props) {
  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>How They're Feeling</Text>
        <View style={styles.card}>
          <Text style={styles.empty}>Not enough sessions yet to show emotional patterns.</Text>
        </View>
      </View>
    );
  }

  const emoji = moodEmoji[data.recentMood] || "\u{1F60A}";

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>How They're Feeling</Text>
      <View style={styles.card}>
        <View style={styles.moodRow}>
          <Text style={styles.moodEmoji}>{emoji}</Text>
          <Text style={styles.moodText}>{data.recentMood}</Text>
        </View>

        {data.commonFrustrations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Gets frustrated with:</Text>
            {data.commonFrustrations.map((f, i) => (
              <Text key={i} style={styles.item}>{"\u2022"} {f}</Text>
            ))}
          </View>
        )}

        {data.celebrationPatterns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Gets excited about:</Text>
            {data.celebrationPatterns.map((c, i) => (
              <Text key={i} style={styles.itemPositive}>{"\u2022"} {c}</Text>
            ))}
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Energy</Text>
            <Text style={styles.miniValue}>{data.energyPatterns}</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Focus</Text>
            <Text style={styles.miniValue}>{data.focusPatterns}</Text>
          </View>
        </View>
      </View>
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
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  moodRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  moodEmoji: { fontSize: 36 },
  moodText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  section: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textTertiary, marginBottom: spacing.xs },
  item: { fontSize: fontSizes.sm, color: colors.coral400, paddingLeft: spacing.sm },
  itemPositive: { fontSize: fontSizes.sm, color: colors.green500, paddingLeft: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  miniCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.sand100,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  miniLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, marginBottom: spacing.xs },
  miniValue: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textPrimary, textTransform: "capitalize" },
  empty: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: "italic" },
});
