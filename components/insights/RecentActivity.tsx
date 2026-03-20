import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, fontSizes, fontWeights } from "@/theme";
import { RecentActivityItem } from "@/services/ProgressInsightsService";

interface Props {
  activities: RecentActivityItem[];
}

const statusColors: Record<string, string> = {
  completed: colors.green500,
  in_progress: colors.gold400,
  on_hold: colors.textTertiary,
};

export function RecentActivity({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.empty}>No worksheets completed yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
            <Text style={styles.meta}>{activity.topic} {"\u2022"} {activity.date.toLocaleDateString()}</Text>
          </View>
          <View style={styles.rowRight}>
            {activity.scorePercent !== null && (
              <Text style={styles.score}>{activity.scorePercent}%</Text>
            )}
            <View style={[styles.statusDot, { backgroundColor: statusColors[activity.status] || colors.textTertiary }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLeft: { flex: 1 },
  title: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  meta: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  score: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: "italic" },
});
