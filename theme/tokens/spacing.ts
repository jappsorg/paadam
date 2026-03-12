// theme/tokens/spacing.ts

// ─── Spacing Scale (4px base) ───
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

// ─── Border Radius ───
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// ─── Sizes (common fixed dimensions) ───
export const sizes = {
  // Avatars
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 64,
  avatarXl: 140,

  // Icons
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,

  // Buttons
  buttonHeight: 52,
  buttonHeightSm: 40,

  // Inputs
  inputHeight: 52,

  // Tab bar
  tabBarHeight: 60,

  // Character emoji
  emojiSm: 16,
  emojiMd: 32,
  emojiLg: 48,
  emojiXl: 60,
  emojiXxl: 80,

  // Progress bars
  progressBarHeight: 12,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiiToken = keyof typeof radii;
