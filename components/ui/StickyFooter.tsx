import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing, radii, shadows } from "@/theme";

interface StickyFooterProps {
  children: React.ReactNode;
}

export function StickyFooter({ children }: StickyFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    ...shadows.topMd,
  },
});
