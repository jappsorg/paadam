import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, FlatList, Alert } from "react-native";
import {
  Button,
  Text,
  Card,
  IconButton,
  Divider,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { StorageService, WorksheetAttempt } from "../services/StorageService";
import { ScreenContainer, LoadingState, EmptyState, ErrorState } from "@/components/ui";
import { colors, spacing } from "@/theme";
import { useAppTheme } from "@/theme";

export default function HistoryScreen() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const theme = useAppTheme();
  const router = useRouter();

  const [worksheetAttempts, setWorksheetAttempts] = useState<
    WorksheetAttempt[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (currentUser) {
      setLoadingHistory(true);
      setError(null);
      try {
        const history = await StorageService.getWorksheetAttemptHistory(
          currentUser.uid
        );
        setWorksheetAttempts(history);
      } catch (err) {
        console.error("Failed to fetch worksheet history. Error details:", err);
        setError(
          "Unable to load your worksheet history. Please check your connection or try again later."
        );
      } finally {
        setLoadingHistory(false);
      }
    } else {
      setWorksheetAttempts([]); // Clear history if user logs out
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) {
      // Only fetch if auth state is resolved
      fetchHistory();
    }
  }, [currentUser, authLoading, fetchHistory]);

  const handleDeleteAttempt = async (attemptId: string) => {
    if (!attemptId) return;
    Alert.alert(
      "Delete Attempt",
      "Are you sure you want to delete this worksheet attempt from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.deleteWorksheetAttempt(attemptId);
              // Refresh history
              fetchHistory();
            } catch (err) {
              console.error(
                "Failed to delete worksheet attempt. Error details:",
                err
              );
              Alert.alert(
                "Error",
                "Unable to delete worksheet attempt. Please retry or contact support if the issue persists."
              );
            }
          },
        },
      ]
    );
  };

  const handleViewOrAttemptWorksheet = (attempt: WorksheetAttempt) => {
    // Navigate to the attempt screen, passing attemptId
    if (attempt.id) {
      // We might also need to pass attempt.worksheetId (the template ID)
      // if the attempt screen needs to fetch the master template separately.
      router.push(`/attempt/${attempt.id}`);
    } else {
      Alert.alert("Error", "Attempt ID is missing, cannot open.");
    }
  };

  const navigateToProfile = () => router.push("/profile");
  const navigateToWorksheet = () => router.push("/(tabs)");

  if (authLoading || loadingHistory) {
    return (
      <ScreenContainer noScroll>
        <LoadingState message="Loading history..." />
      </ScreenContainer>
    );
  }

  if (!currentUser) {
    return (
      <ScreenContainer noScroll>
        <EmptyState
          emoji="🔒"
          title="Please log in"
          subtitle="Log in to view your saved worksheets"
          actionLabel="Go to Profile"
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
          emoji="📝"
          title="No worksheets yet"
          subtitle="Start by generating your first worksheet!"
          actionLabel="Generate a Worksheet"
          onAction={navigateToWorksheet}
        />
      </ScreenContainer>
    );
  }

  const renderWorksheetItem = ({ item }: { item: WorksheetAttempt }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.worksheetTitle || "Untitled Worksheet"}
        subtitle={`Last activity: ${
          item.lastActivityAt
            ? new Date(item.lastActivityAt.seconds * 1000).toLocaleString()
            : "N/A"
        }`}
        titleVariant="titleMedium"
      />
      <Card.Content>
        {/* We might need to fetch template details (like type/difficulty) if not denormalized */}
        {/* For now, just showing status and score from the attempt itself */}
        <Text>Status: {item.status}</Text>
        {item.score !== undefined && <Text>Score: {item.score}</Text>}
        <Text>
          Started:{" "}
          {item.startedAt
            ? new Date(item.startedAt.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button
          onPress={() => handleViewOrAttemptWorksheet(item)}
          icon="play-circle-outline"
        >
          {item.status === "in-progress" || item.status === "paused"
            ? "Resume"
            : "View/Re-attempt"}
        </Button>
        <IconButton
          icon="delete-outline"
          onPress={() => item.id && handleDeleteAttempt(item.id)}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <ScreenContainer noScroll>
      <Text variant="headlineMedium" style={styles.title}>
        Your Worksheet Attempts
      </Text>
      <FlatList
        data={worksheetAttempts}
        renderItem={renderWorksheetItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <Divider style={{ marginVertical: spacing.sm }} />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
});
