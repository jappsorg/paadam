import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, FlatList, Alert, View, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { StorageService, WorksheetAttempt } from "../services/StorageService";
import { ScreenContainer, LoadingState, EmptyState, ErrorState } from "@/components/ui";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

export default function HistoryScreen() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [worksheetAttempts, setWorksheetAttempts] = useState<WorksheetAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (currentUser) {
      setLoadingHistory(true);
      setError(null);
      try {
        const history = await StorageService.getWorksheetAttemptHistory(currentUser.uid);
        setWorksheetAttempts(history);
      } catch (err) {
        console.error("Failed to fetch worksheet history:", err);
        setError("Hmm, we couldn\u2019t load your worksheets. Let\u2019s try again!");
      } finally {
        setLoadingHistory(false);
      }
    } else {
      setWorksheetAttempts([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) fetchHistory();
  }, [currentUser, authLoading, fetchHistory]);

  const handleDeleteAttempt = async (attemptId: string) => {
    if (!attemptId) return;
    Alert.alert("Remove this?", "It'll be gone from your list.", [
      { text: "Nope, keep it!", style: "cancel" },
      {
        text: "Yes, remove it",
        style: "destructive",
        onPress: async () => {
          try {
            await StorageService.deleteWorksheetAttempt(attemptId);
            fetchHistory();
          } catch (err) {
            console.error("Failed to delete:", err);
            Alert.alert("Error", "Couldn't delete. Please try again.");
          }
        },
      },
    ]);
  };

  const handleViewOrAttemptWorksheet = (attempt: WorksheetAttempt) => {
    if (attempt.id) {
      router.push(`/attempt/${attempt.id}`);
    }
  };

  const navigateToProfile = () => router.push("/profile");
  const navigateToWorksheet = () => router.push("/(tabs)");

  if (authLoading || loadingHistory) {
    return (
      <ScreenContainer noScroll>
        <LoadingState message="Getting your stuff..." />
      </ScreenContainer>
    );
  }

  if (!currentUser) {
    return (
      <ScreenContainer noScroll>
        <EmptyState
          emoji={"\uD83D\uDD12"}
          title="You're not signed in!"
          subtitle="Sign in to see your worksheets"
          actionLabel="Sign In"
          onAction={navigateToProfile}
        />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer noScroll>
        <ErrorState message={error} onRetry={fetchHistory} />
      </ScreenContainer>
    );
  }

  if (worksheetAttempts.length === 0) {
    return (
      <ScreenContainer noScroll>
        <EmptyState
          emoji={"\uD83D\uDCDD"}
          title="Nothing here yet!"
          subtitle="Try making your first worksheet — it's fun!"
          actionLabel="Let's make one!"
          onAction={navigateToWorksheet}
        />
      </ScreenContainer>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return { bg: colors.green50, text: colors.green700, label: "Finished!" };
      case "in-progress": return { bg: colors.gold50, text: colors.gold700, label: "Still working" };
      case "paused": return { bg: colors.orange50, text: colors.orange600, label: "On hold" };
      default: return { bg: colors.sand100, text: colors.textTertiary, label: status };
    }
  };

  const renderWorksheetItem = ({ item }: { item: WorksheetAttempt }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleViewOrAttemptWorksheet(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.worksheetTitle || "Untitled Worksheet"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          {item.score !== undefined && (
            <Text style={styles.scoreText}>
              Score: <Text style={styles.scoreValue}>{item.score}%</Text>
            </Text>
          )}
          <Text style={styles.dateText}>
            {item.lastActivityAt
              ? new Date(item.lastActivityAt.seconds * 1000).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <Text style={styles.actionText}>
            {item.status === "in-progress" || item.status === "paused"
              ? "Keep going \u203A"
              : "Look at it \u203A"}
          </Text>
          <Pressable
            onPress={() => item.id && handleDeleteAttempt(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>{"\uD83D\uDDD1\uFE0F"}</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer noScroll>
      <View style={styles.header}>
        <Text style={styles.title}>My Worksheets</Text>
        <Text style={styles.subtitle}>{worksheetAttempts.length} so far — nice!</Text>
      </View>
      <FlatList
        data={worksheetAttempts}
        renderItem={renderWorksheetItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  scoreText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontWeight: fontWeights.bold,
    color: colors.teal500,
  },
  dateText: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  actionText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.coral400,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteText: {
    fontSize: 18,
  },
});
