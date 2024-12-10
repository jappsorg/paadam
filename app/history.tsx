import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  ActivityIndicator,
  Button,
  Portal,
  Dialog,
} from "react-native-paper";
import { Link, Stack } from "expo-router";
import { StorageService } from "../services/StorageService";
import { WorksheetCard } from "../components/WorksheetCard";
import { Worksheet, WorksheetType } from "../types/worksheet";

export default function HistoryScreen() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await StorageService.getWorksheetHistory();
      setWorksheets(history.worksheets);
      setError(null);
    } catch (err) {
      setError("Failed to load worksheet history");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await StorageService.clearHistory();
      setWorksheets([]);
      setShowClearDialog(false);
    } catch (err) {
      setError("Failed to clear history");
    }
  };

  const handleDeleteWorksheet = async (worksheetId: string) => {
    try {
      await StorageService.deleteWorksheet(worksheetId);
      setWorksheets((prev) => prev.filter((w) => w.id !== worksheetId));
    } catch (err) {
      setError("Failed to delete worksheet");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Worksheet History",
          headerRight: () => (
            <Button
              onPress={() => setShowClearDialog(true)}
              disabled={worksheets.length === 0}
            >
              Clear All
            </Button>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : error ? (
          <View style={styles.centerContent}>
            <Text variant="bodyLarge" style={styles.errorText}>
              {error}
            </Text>
            <Button
              mode="contained"
              onPress={loadHistory}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        ) : worksheets.length === 0 ? (
          <View style={styles.centerContent}>
            <Text variant="bodyLarge">No worksheets generated yet</Text>
            <Link href="/" asChild>
              <Button mode="contained" style={styles.createButton}>
                Create Worksheet
              </Button>
            </Link>
          </View>
        ) : (
          worksheets.map((worksheet) => (
            <View key={worksheet.id} style={styles.worksheetContainer}>
              <WorksheetCard
                worksheet={{
                  id: worksheet.id as WorksheetType,
                  title: worksheet.title,
                  description: `Generated on ${new Date(
                    worksheet.createdAt
                  ).toLocaleDateString()}`,
                  icon:
                    worksheet.type === "math"
                      ? "🔢"
                      : worksheet.type === "puzzle"
                      ? "🧩"
                      : worksheet.type === "word-problem"
                      ? "📝"
                      : worksheet.type === "logic"
                      ? "🧠"
                      : "🧪",
                }}
              />
              <Button
                mode="outlined"
                onPress={() => handleDeleteWorksheet(worksheet.id)}
                style={styles.deleteButton}
              >
                Delete
              </Button>
            </View>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={showClearDialog}
          onDismiss={() => setShowClearDialog(false)}
        >
          <Dialog.Title>Clear History</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to clear all worksheet history?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowClearDialog(false)}>Cancel</Button>
            <Button onPress={handleClearHistory}>Clear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginTop: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  createButton: {
    marginTop: 16,
  },
  worksheetContainer: {
    marginBottom: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
});
