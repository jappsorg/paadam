import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, spacing, radii, textPresets } from "@/theme";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function SecondaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.textSecondary} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, isDisabled && styles.textDisabled]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...textPresets.button,
    color: colors.textSecondary,
  },
  textDisabled: {
    color: colors.textDisabled,
  },
  icon: {
    fontSize: 20,
  },
});
