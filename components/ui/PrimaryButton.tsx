import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
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
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled ? styles.disabled : shadows.successGlow,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnPrimary} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.buttonPrimaryDisabled,
  },
  text: {
    ...textPresets.button,
    color: colors.textOnPrimary,
  },
  icon: {
    fontSize: 20,
  },
});
