import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, sizes } from "@/theme";

interface LoadingStateProps {
  message?: string;
  emoji?: string;
}

export function LoadingState({
  message = "Loading...",
  emoji = "\u{1F914}",
}: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emoji: {
    fontSize: sizes.emojiLg,
  },
  message: {
    textAlign: "center",
    color: colors.textSecondary,
  },
});
