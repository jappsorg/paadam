// theme/tokens/typography.ts
import { TextStyle } from "react-native";

export const fontSizes = {
  xs: 12,
  sm: 13,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
  hero: 48,
} as const;

export const fontWeights = {
  normal: "400" as TextStyle["fontWeight"],
  medium: "500" as TextStyle["fontWeight"],
  semibold: "600" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
  extrabold: "800" as TextStyle["fontWeight"],
  black: "900" as TextStyle["fontWeight"],
};

export const lineHeights = {
  tight: 18,
  normal: 20,
  relaxed: 22,
  loose: 24,
  paragraph: 28,
  heading: 34,
  display: 42,
} as const;

// ─── Text Presets ───
export const textPresets = {
  // Display / Hero
  hero: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.black,
    lineHeight: 56,
    letterSpacing: -1,
  },
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.display,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.heading,
  },
  h3: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.loose,
  },

  // Body
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  bodySemibold: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.relaxed,
  },

  // Labels
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
  labelSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  labelXs: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },

  // Buttons
  button: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },

  // Caption
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
  },
} satisfies Record<string, TextStyle>;
