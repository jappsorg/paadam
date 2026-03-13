// theme/tokens/spacing.ts

// ─── Spacing Scale (4px base, slightly more generous) ───
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

// ─── Border Radius (rounder, more playful) ───
export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 50,
  full: 9999,
} as const;

// ─── Sizes (common fixed dimensions) ───
export const sizes = {
  // Avatars
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 68,
  avatarXl: 140,

  // Icons
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,

  // Buttons
  buttonHeight: 56,
  buttonHeightSm: 44,

  // Inputs
  inputHeight: 56,

  // Tab bar
  tabBarHeight: 64,

  // Character emoji
  emojiSm: 16,
  emojiMd: 32,
  emojiLg: 48,
  emojiXl: 60,
  emojiXxl: 80,

  // Progress bars
  progressBarHeight: 14,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiiToken = keyof typeof radii;
