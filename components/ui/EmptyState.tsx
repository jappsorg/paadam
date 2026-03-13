import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "./PrimaryButton";
import { colors, spacing, radii, shadows } from "@/theme";

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
      <View style={styles.emojiCircle}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
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
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.violet50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.md,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    textAlign: "center",
    color: colors.textPrimary,
    fontWeight: "800",
  },
  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
});
