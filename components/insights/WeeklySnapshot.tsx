import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { WeeklySnapshot as WeeklySnapshotData } from "@/services/ProgressInsightsService";

interface Props {
  data: WeeklySnapshotData;
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <Text style={styles.trendUp}>↑</Text>;
  if (current < previous) return <Text style={styles.trendDown}>↓</Text>;
  return <Text style={styles.trendFlat}>→</Text>;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function SnapshotCard({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string;
  trend?: React.ReactNode;
  color: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.cardValueRow}>
        <Text style={styles.cardValue}>{value}</Text>
        {trend}
      </View>
    </View>
  );
}

export function WeeklySnapshot({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SnapshotCard
          label="Practice Time"
          value={formatTime(data.practiceTimeMinutes)}
          trend={<TrendArrow current={data.practiceTimeMinutes} previous={data.practiceTimePrevWeek} />}
          color={colors.teal50}
        />
        <SnapshotCard
          label="Accuracy"
          value={`${Math.round(data.accuracy * 100)}%`}
          trend={<TrendArrow current={data.accuracy} previous={data.accuracyPrevWeek} />}
          color={colors.gold100}
        />
        <SnapshotCard
          label="Streak"
          value={`${data.currentStreak} days`}
          color={colors.orange50}
        />
        <SnapshotCard
          label="XP Earned"
          value={`${data.xpEarnedThisWeek}`}
          color={colors.violet100}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
  card: {
    width: 140,
    padding: spacing.lg,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  cardLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  cardValueRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  cardValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  trendUp: { fontSize: fontSizes.lg, color: colors.green500 },
  trendDown: { fontSize: fontSizes.lg, color: colors.coral400 },
  trendFlat: { fontSize: fontSizes.lg, color: colors.textTertiary },
});
