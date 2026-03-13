import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing, radii, textPresets, shadows } from "@/theme";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  variant?: "coral" | "teal" | "violet" | "gold";
}

const VARIANT_COLORS = {
  coral: { bg: colors.coral400, glow: shadows.coralGlow },
  teal: { bg: colors.teal400, glow: shadows.tealGlow },
  violet: { bg: colors.violet400, glow: shadows.violetGlow },
  gold: { bg: colors.gold400, glow: shadows.goldGlow },
} as const;

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
  variant = "coral",
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_COLORS[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variantStyle.bg },
        isDisabled ? styles.disabled : variantStyle.glow,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnPrimary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Compat: also export as "label" prop for onboarding usage
export function PrimaryButtonLabel({
  label,
  onPress,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <PrimaryButton
      title={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: colors.buttonPrimaryDisabled,
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    ...textPresets.button,
    color: colors.textOnPrimary,
  },
  icon: {
    fontSize: 20,
  },
});
