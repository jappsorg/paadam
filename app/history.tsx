import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
  Button,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
  IconButton,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { StorageService, WorksheetAttempt } from "../services/StorageService";

export default function HistoryScreen() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const theme = useTheme();
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
        console.error("Failed to fetch history:", err);
        setError("Failed to load your worksheet history. Please try again.");
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
              console.error("Failed to delete attempt:", err);
              Alert.alert(
                "Error",
                "Failed to delete worksheet attempt. Please try again."
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

  if (authLoading || loadingHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={styles.messageText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text variant="headlineSmall" style={styles.messageText}>
            Worksheet History
          </Text>
          <Text style={styles.messageText}>
            Please log in to view your saved worksheets.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push("/profile")}
            style={{ marginTop: 20 }}
          >
            Go to Profile
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={[styles.messageText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Button onPress={fetchHistory}>Try Again</Button>
        </View>
      </SafeAreaView>
    );
  }

  if (worksheetAttempts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text variant="headlineSmall" style={styles.messageText}>
            Worksheet History
          </Text>
          <Text style={styles.messageText}>
            You haven't generated any worksheets yet.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push("/(tabs)")}
            style={{ marginTop: 20 }}
          >
            Generate a Worksheet
          </Button>
        </View>
      </SafeAreaView>
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
          icon="play-circle-outline" // Changed icon for "attempt"
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Your Worksheet Attempts
      </Text>
      <FlatList
        data={worksheetAttempts}
        renderItem={renderWorksheetItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    marginVertical: 8,
  },
});
