import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, textPresets, sizes } from "@/theme";

interface SectionHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ emoji, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  emoji: {
    fontSize: sizes.emojiXl,
    marginBottom: spacing.lg,
  },
  title: {
    ...textPresets.display,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textPresets.body,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
