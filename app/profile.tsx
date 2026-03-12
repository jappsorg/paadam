import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Text,
  Avatar,
  Card,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { currentUser, isLoading, signInWithGoogle, signOut } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Title title="Profile" titleVariant="headlineMedium" />
        <Card.Content>
          {currentUser ? (
            <View style={styles.userInfoContainer}>
              {currentUser.photoURL && (
                <Avatar.Image
                  size={80}
                  source={{ uri: currentUser.photoURL }}
                  style={styles.avatar}
                />
              )}
              <Text variant="titleLarge" style={styles.text}>
                {currentUser.displayName || "No display name"}
              </Text>
              <Text variant="bodyMedium" style={styles.text}>
                {currentUser.email}
              </Text>
              <Button
                mode="contained"
                onPress={signOut}
                style={styles.button}
                icon="logout"
              >
                Sign Out
              </Button>
            </View>
          ) : (
            <View style={styles.signInContainer}>
              <Text variant="titleMedium" style={styles.signInText}>
                Sign in to save your worksheets and track your progress.
              </Text>
              <Button
                mode="contained"
                onPress={signInWithGoogle}
                style={styles.button}
                icon="google"
                loading={isLoading} // Show loading on button if auth is in progress
                disabled={isLoading}
              >
                Sign In with Google
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  card: {
    flex: 1,
  },
  userInfoContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  text: {
    marginBottom: 8,
    textAlign: "center",
  },
  signInContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  signInText: {
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    width: "80%",
  },
});
