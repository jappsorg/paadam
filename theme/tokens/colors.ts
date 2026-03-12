// theme/tokens/colors.ts

// ─── Primitives ───
const palette = {
  // Blues
  blue50: "#E3F2FD",
  blue100: "#BBDEFB",
  blue400: "#42A5F5",
  blue500: "#4A90E2",
  blue700: "#1565C0",

  // Greens
  green50: "#E8F5E9",
  green100: "#F1F8E9",
  green400: "#66BB6A",
  green500: "#4CAF50",
  green800: "#2E7D32",

  // Reds
  red400: "#FF5252",
  red500: "#DC3545",
  red800: "#C62828",

  // Oranges
  orange50: "#FFF3E0",
  orange400: "#FFA726",
  orange600: "#F57C00",
  orange700: "#FFB300",

  // Yellows
  yellow100: "#FFFDE7",
  yellow300: "#FFD56D",

  // Corals
  coral400: "#FF6B6B",

  // Grays
  gray50: "#F8F9FA",
  gray100: "#F1F5F9",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#ADB5BD",
  gray500: "#94A3B8",
  gray600: "#6C757D",
  gray700: "#495057",
  gray800: "#2D3436",
  gray900: "#212529",

  // Slates
  slate500: "#64748B",
  slate700: "#334155",
  slate800: "#37474F",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",

  // Brand
  googleBlue: "#4285F4",
} as const;

// ─── Semantic Tokens ───
export const colors = {
  ...palette,

  // Surfaces
  background: palette.gray50,
  surface: palette.white,
  surfaceDisabled: palette.gray200,
  backdrop: palette.gray100,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textOnPrimary: palette.white,
  textOnSuccess: palette.white,
  textPlaceholder: palette.gray500,
  textDisabled: palette.gray400,

  // Actions
  primary: palette.blue500,
  primaryLight: palette.blue50,
  secondary: palette.yellow300,
  success: palette.green500,
  successLight: palette.green50,
  error: palette.red500,
  errorLight: palette.orange50,
  warning: palette.orange400,
  info: palette.blue400,
  infoLight: palette.blue50,

  // Interactive
  buttonPrimary: palette.green500,
  buttonPrimaryDisabled: palette.gray300,
  buttonSecondary: palette.white,
  inputBackground: palette.white,
  inputBorder: palette.gray300,
  inputBorderError: palette.red500,
  inputBorderFocus: palette.blue500,

  // Gamification
  xpBar: palette.orange700,
  xpBarBackground: palette.orange50,
  streak: palette.orange600,
  levelBadge: palette.blue500,
  avatarBackground: palette.orange50,

  // Character companion
  speechBubbleDefault: "#F0F4FF",
  speechBubbleCorrect: palette.green50,
  speechBubbleIncorrect: palette.orange50,

  // Review
  correctBorder: palette.green500,
  correctBackground: palette.green100,
  correctText: palette.green800,
  incorrectBorder: palette.red400,
  incorrectBackground: palette.orange50,
  incorrectText: palette.red800,

  // Borders & Dividers
  border: palette.gray300,
  borderLight: palette.gray200,
  divider: palette.gray200,

  // Selection
  selected: palette.green500,
  selectedText: palette.white,
  unselected: palette.white,
  unselectedText: palette.gray700,
  unselectedBorder: palette.gray300,
} as const;

export type ColorToken = keyof typeof colors;
