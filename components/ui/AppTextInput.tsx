import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { colors, spacing, radii, fontSizes, fontWeights, sizes } from "@/theme";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function AppTextInput({
  label,
  error,
  isPassword,
  style,
  ...props
}: AppTextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : undefined,
            isPassword ? styles.passwordInput : undefined,
            style,
          ]}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={isPassword ? "none" : props.autoCapitalize}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Text style={styles.toggleText}>
              {showPassword ? "\u{1F648}" : "\u{1F441}\uFE0F"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  inputRow: {
    position: "relative",
  },
  input: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputError: {
    borderColor: colors.inputBorderError,
  },
  passwordInput: {
    paddingRight: sizes.inputHeight + spacing.sm,
  },
  toggle: {
    position: "absolute",
    right: spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  toggleText: {
    fontSize: fontSizes.xl,
  },
  error: {
    fontSize: fontSizes.md,
    color: colors.error,
    marginTop: -spacing.xs,
  },
});
