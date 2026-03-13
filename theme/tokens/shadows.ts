// theme/tokens/shadows.ts
import { Platform, ViewStyle } from "react-native";

type ShadowPreset = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

const createShadow = (
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number,
  color = "#2D1B69"
): ShadowPreset =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  }) as ShadowPreset;

export const shadows = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(2, 0.06, 6, 2, "#2D1B69"),
  md: createShadow(4, 0.08, 12, 4, "#2D1B69"),
  lg: createShadow(8, 0.12, 20, 8, "#2D1B69"),
  xl: createShadow(12, 0.16, 28, 12, "#2D1B69"),

  // Colored glows for buttons and interactive elements
  coralGlow: createShadow(6, 0.25, 16, 6, "#FF6B6B"),
  tealGlow: createShadow(6, 0.25, 16, 6, "#4ECDC4"),
  violetGlow: createShadow(6, 0.25, 16, 6, "#A78BFA"),
  goldGlow: createShadow(6, 0.25, 16, 6, "#FBBF24"),
  successGlow: createShadow(6, 0.25, 16, 6, "#10B981"),

  // Card shadows — warm tinted
  card: createShadow(4, 0.08, 16, 6, "#2D1B69"),
  cardHover: createShadow(8, 0.12, 24, 10, "#2D1B69"),

  // Top shadow for sticky footers
  topMd: createShadow(8, 0.08, 12, -3, "#2D1B69"),

  // Legacy compat
  primaryGlow: createShadow(6, 0.25, 16, 6, "#FF6B6B"),
};

export type ShadowToken = keyof typeof shadows;
