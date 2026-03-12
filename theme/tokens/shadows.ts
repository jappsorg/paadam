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
  color = "#000"
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
  sm: createShadow(2, 0.05, 4, 2),
  md: createShadow(4, 0.1, 8, 4),
  lg: createShadow(8, 0.15, 12, 6),
  xl: createShadow(12, 0.2, 16, 8),

  // Colored shadows for buttons
  successGlow: createShadow(4, 0.3, 8, 4, "#4CAF50"),
  primaryGlow: createShadow(4, 0.3, 8, 4, "#4A90E2"),

  // Top shadow for sticky footers (note: Android elevation doesn't support direction)
  topMd: createShadow(8, 0.1, 8, -2),
};

export type ShadowToken = keyof typeof shadows;
