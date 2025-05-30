import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert, RefreshControl } from "react-native";
import { Text, ActivityIndicator, Button, Card, Title, Paragraph, Portal, Dialog } from "react-native-paper";
import { Link, Stack } from "expo-router";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import UserWorksheetService from "../services/UserWorksheetService";
import { StudentWorksheetAttempt, WORKSHEET_TYPE_LABELS } from "../types/worksheet";

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<StudentWorksheetAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(auth().currentUser);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setCurrentUser);
    return subscriber; // unsubscribe on unmount
  }, []);

  const loadHistory = useCallback(async () => {
    if (!currentUser) {
      setHistoryItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await UserWorksheetService.getWorksheetHistoryList(); // Default limit is 10
      setHistoryItems(items);
    } catch (err: any) {
      setError(err.message || "Failed to load worksheet history");
      console.error("Load history error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  const handleDeleteAttempt = async () => {
    if (!itemToDelete) return;
    try {
      await UserWorksheetService.deleteStudentWorksheetAttempt(itemToDelete);
      setHistoryItems((prevItems) => prevItems.filter((item) => item.id !== itemToDelete));
      setItemToDelete(null);
      setShowDeleteDialog(false);
    } catch (err: any) {
      setError(err.message || "Failed to delete attempt");
      console.error("Delete attempt error:", err);
      setItemToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const openDeleteConfirmation = (attemptId: string) => {
    setItemToDelete(attemptId);
    setShowDeleteDialog(true);
  };


  const renderItem = ({ item }: { item: StudentWorksheetAttempt }) => (
    <Card style={styles.card}>
      <Card.Title title={item.worksheetTitle} subtitle={WORKSHEET_TYPE_LABELS[item.worksheetType] || item.worksheetType} />
      <Card.Content>
        <Paragraph>Status: {item.status}</Paragraph>
        {item.status === 'completed' && item.score !== null && item.maxScore !== null && (
          <Paragraph>Score: {item.score}/{item.maxScore}</Paragraph>
        )}
        <Paragraph>Last Attempted: {new Date(item.lastAttemptedAt).toLocaleDateString()}</Paragraph>
      </Card.Content>
      <Card.Actions>
        {/* <Button onPress={() => console.log('View/Retry attempt', item.id)}>View/Retry</Button> */}
        <Button icon="delete" onPress={() => openDeleteConfirmation(item.id)}>Delete</Button>
      </Card.Actions>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" />
        <Text>Loading history...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Stack.Screen options={{ title: "Worksheet History" }} />
        <View style={styles.centerContent}>
          <Text variant="bodyLarge">Please log in to view your history.</Text>
          <Link href="/(auth)/login" asChild> {/* Assuming you have a login screen at (auth)/login */}
            <Button mode="contained" style={styles.authButton}>
              Go to Login
            </Button>
          </Link>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: "Worksheet History" }} />
        <View style={styles.centerContent}>
          <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadHistory} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Worksheet History",
          // Removed Clear All button from headerRight
        }}
      />
      <FlatList
        data={historyItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text variant="bodyLarge">No history yet.</Text>
            <Link href="/" asChild>
              <Button mode="contained" style={styles.createButton}>
                Create a Worksheet
              </Button>
            </Link>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => {setItemToDelete(null); setShowDeleteDialog(false);}}>
          <Dialog.Title>Delete Attempt</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to delete this worksheet attempt?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {setItemToDelete(null); setShowDeleteDialog(false);}}>Cancel</Button>
            <Button onPress={handleDeleteAttempt} color="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Changed from flex: 1 for FlatList contentContainerStyle
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Added padding for centered content
  },
  errorText: {
    color: "red", // Consider using theme.colors.error
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  createButton: {
    marginTop: 16,
  },
  authButton: {
    marginTop: 16,
  },
  card: {
    marginBottom: 16,
  },
  // deleteButton from old styles is now part of Card.Actions
});
