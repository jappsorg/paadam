import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "./PrimaryButton";
import { colors, spacing } from "@/theme";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji = "\u{1F4ED}",
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
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
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: "center",
    color: colors.textPrimary,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
});
