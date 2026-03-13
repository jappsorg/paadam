// theme/tokens/colors.ts

// ─── Primitives ───
const palette = {
  // Corals (Primary)
  coral50: "#FFF0EE",
  coral100: "#FFE0DB",
  coral300: "#FF9A8B",
  coral400: "#FF6B6B",
  coral500: "#F75555",
  coral700: "#D93B3B",

  // Teals (Accent)
  teal50: "#E0FAF6",
  teal100: "#B3F1E8",
  teal300: "#5FE0C8",
  teal400: "#4ECDC4",
  teal500: "#38B2AC",
  teal700: "#2C9A8F",

  // Golds (Secondary/Reward)
  gold50: "#FFFBEB",
  gold100: "#FEF3C7",
  gold300: "#FCD34D",
  gold400: "#FBBF24",
  gold500: "#F59E0B",
  gold600: "#D97706",
  gold700: "#B45309",

  // Violets (Accent 2)
  violet50: "#F3EEFF",
  violet100: "#E9DFFE",
  violet300: "#C4B5FD",
  violet400: "#A78BFA",
  violet500: "#8B5CF6",
  violet700: "#6D28D9",

  // Greens (Success)
  green50: "#ECFDF5",
  green100: "#D1FAE5",
  green400: "#34D399",
  green500: "#10B981",
  green700: "#047857",

  // Reds (Error — distinct from coral primary)
  red50: "#FEF2F2",
  red400: "#F87171",
  red500: "#EF4444",
  red700: "#B91C1C",

  // Blues (Info)
  blue50: "#EFF6FF",
  blue400: "#60A5FA",
  blue500: "#3B82F6",

  // Oranges (Warning/Energy)
  orange50: "#FFF7ED",
  orange400: "#FB923C",
  orange500: "#F97316",
  orange600: "#EA580C",

  // Warm Neutrals
  cream: "#FFF8F0",
  creamDark: "#FFF1E3",
  warmWhite: "#FFFDF9",
  sand100: "#F5EFE6",
  sand200: "#EBE3D6",
  sand300: "#DDD4C5",

  // Plum Text Scale
  plum900: "#1E0A3C",
  plum800: "#2D1B69",
  plum700: "#3D2B7A",
  plum600: "#5B4A8A",
  plum500: "#7B6B9E",
  plum400: "#9E92B5",
  plum300: "#BFB6CE",
  plum200: "#DDD8E8",
  plum100: "#EEEBF4",

  // Pure
  white: "#FFFFFF",
  black: "#000000",

  // Brand
  googleBlue: "#4285F4",
} as const;

// ─── Semantic Tokens ───
export const colors = {
  ...palette,

  // Surfaces
  background: palette.cream,
  surface: palette.warmWhite,
  surfaceElevated: palette.white,
  surfaceDisabled: palette.sand200,
  backdrop: palette.sand100,

  // Text
  text: palette.plum900,
  textPrimary: palette.plum900,
  textSecondary: palette.plum600,
  textTertiary: palette.plum500,
  textOnPrimary: palette.white,
  textOnSuccess: palette.white,
  textPlaceholder: palette.plum400,
  textDisabled: palette.plum300,

  // Actions
  primary: palette.coral400,
  primaryDark: palette.coral500,
  primaryLight: palette.coral50,
  primaryContainer: palette.coral100,
  secondary: palette.gold400,
  secondaryLight: palette.gold50,
  accent: palette.teal400,
  accentLight: palette.teal50,
  success: palette.green500,
  successLight: palette.green50,
  error: palette.red500,
  errorLight: palette.red50,
  warning: palette.orange500,
  warningLight: palette.orange50,
  info: palette.blue500,
  infoLight: palette.blue50,

  // Interactive
  buttonPrimary: palette.coral400,
  buttonPrimaryPressed: palette.coral500,
  buttonPrimaryDisabled: palette.plum200,
  buttonSecondary: palette.white,
  buttonAccent: palette.teal400,
  inputBackground: palette.white,
  inputBorder: palette.sand300,
  inputBorderError: palette.red500,
  inputBorderFocus: palette.violet400,

  // Gamification
  xpBar: palette.gold500,
  xpBarBackground: palette.gold100,
  streak: palette.orange500,
  streakGlow: palette.orange400,
  levelBadge: palette.violet500,
  avatarBackground: palette.violet50,

  // Character companion
  speechBubbleDefault: palette.violet50,
  speechBubbleCorrect: palette.green50,
  speechBubbleIncorrect: palette.orange50,

  // Review
  correctBorder: palette.green500,
  correctBackground: palette.green100,
  correctText: palette.green700,
  incorrectBorder: palette.red400,
  incorrectBackground: palette.orange50,
  incorrectText: palette.red700,

  // Borders & Dividers
  border: palette.sand300,
  borderLight: palette.sand200,
  divider: palette.sand200,
  outline: palette.sand300,

  // Selection
  selected: palette.coral400,
  selectedLight: palette.coral100,
  selectedText: palette.white,
  unselected: palette.warmWhite,
  unselectedText: palette.plum700,
  unselectedBorder: palette.sand300,

  // Worksheet Category Colors
  mathColor: palette.coral400,
  puzzleColor: palette.violet400,
  wordProblemColor: palette.teal400,
  logicColor: palette.gold500,

  // Adventure/Theme Colors
  adventurePrimary: palette.violet500,
  adventureLight: palette.violet50,
} as const;

export type ColorToken = keyof typeof colors;
