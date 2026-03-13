import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "./PrimaryButton";
import { colors, spacing, sizes } from "@/theme";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Uh oh! Something got tangled up.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{"\u{1F615}"}</Text>
      <Text variant="titleMedium" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <PrimaryButton
          title="Try again!"
          onPress={onRetry}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: sizes.emojiLg,
  },
  message: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
});
