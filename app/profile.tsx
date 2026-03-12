import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Avatar, Card } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { ScreenContainer, LoadingState, EmptyState } from "@/components/ui";
import { useAppTheme } from "@/theme";
import { colors, spacing } from "@/theme";

export default function ProfileScreen() {
  const { currentUser, isLoading, signInWithGoogle, signOut } = useAuth();
  const theme = useAppTheme();

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  if (isLoading) {
    return (
      <ScreenContainer noScroll>
        <LoadingState />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noScroll>
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
            <EmptyState
              emoji="👋"
              title="Welcome!"
              subtitle="Sign in to save your worksheets and track your progress."
              actionLabel="Sign In with Google"
              onAction={handleGoogleSignIn}
            />
          )}
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  userInfoContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatar: {
    marginBottom: spacing.lg,
  },
  text: {
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.xl,
    width: "80%",
  },
});
