// theme/index.ts
import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import { useTheme as usePaperTheme } from "react-native-paper";
import { colors } from "./tokens/colors";

export * from "./tokens";

const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.success,
    secondaryContainer: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: colors.textOnPrimary,
    onSurface: colors.textPrimary,
    outline: colors.border,
    // Compat with old theme references
    text: colors.textPrimary,
    placeholder: colors.textPlaceholder,
    disabled: colors.surfaceDisabled,
    backdrop: colors.backdrop,
    success: colors.success,
    info: colors.info,
    warning: colors.warning,
  },
};

export type AppTheme = typeof theme;

/** Typed theme hook — returns our extended Paper theme */
export const useAppTheme = () => usePaperTheme<AppTheme>();

export default theme;
