# Paadam Design System & Frontend Overhaul

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable UX design system (tokens, primitives, patterns) and refactor all screens to use it — producing a consistent, kid-friendly, delightful frontend.

**Architecture:** Extract all hardcoded colors, spacing, typography, shadows, and radii into a centralized token system (`theme/`). Build shared primitive components (inputs, buttons, cards, layouts, states) on top of those tokens. Refactor every screen and component to consume the design system instead of inline values. Add celebration animations for engagement.

**Tech Stack:** React Native, React Native Paper (MD3), react-native-reanimated (already installed), Expo Router, TypeScript

---

## File Structure

### New files (Design System)

| File | Responsibility |
|------|---------------|
| `theme/tokens/colors.ts` | All color primitives and semantic color tokens |
| `theme/tokens/spacing.ts` | Spacing scale, border radii, sizing |
| `theme/tokens/typography.ts` | Font sizes, weights, line heights, text presets |
| `theme/tokens/shadows.ts` | Shadow presets (sm, md, lg) per platform |
| `theme/tokens/index.ts` | Re-exports all tokens |
| `theme/index.ts` | Combines tokens into Paper theme + exports `useAppTheme()` hook |
| `components/ui/AppTextInput.tsx` | Shared form text input with label, error, show/hide password |
| `components/ui/PrimaryButton.tsx` | Primary action button with loading state |
| `components/ui/SecondaryButton.tsx` | Secondary/outlined button |
| `components/ui/ScreenContainer.tsx` | SafeAreaView + ScrollView + background color wrapper |
| `components/ui/EmptyState.tsx` | Character-driven empty state (icon/emoji + title + subtitle + optional CTA) |
| `components/ui/LoadingState.tsx` | Character-driven loading state |
| `components/ui/ErrorState.tsx` | Character-driven error state with retry |
| `components/ui/StickyFooter.tsx` | Absolute-positioned footer with rounded top + shadow |
| `components/ui/SectionHeader.tsx` | Emoji + title + subtitle pattern used on many screens |
| `components/ui/index.ts` | Re-exports all UI primitives |
| `components/ui/Confetti.tsx` | Confetti/celebration animation for results screen |

### Modified files

| File | Changes |
|------|---------|
| `theme.ts` | Replaced by `theme/index.ts` — old file becomes re-export shim |
| `app/_layout.tsx` | Import theme from new location |
| `app/index.tsx` | Use tokens, ScreenContainer, refactor for simplicity |
| `app/[type]/index.tsx` | Use tokens, AppTextInput, simplify config UI |
| `app/attempt/[userWorksheetId].tsx` | Use tokens, LoadingState, ErrorState, Confetti |
| `app/history.tsx` | Use tokens, EmptyState, LoadingState, ErrorState |
| `app/profile.tsx` | Use tokens, EmptyState, LoadingState |
| `components/WorksheetCard.tsx` | Use tokens for spacing/shadows |
| `components/PlayerStats.tsx` | Use tokens for all hardcoded values |
| `components/CharacterCompanion.tsx` | Use tokens for colors, spacing |
| `components/WorksheetPreview.tsx` | Use tokens |
| `components/auth/SignInScreen.tsx` | Use AppTextInput, PrimaryButton, SecondaryButton, SectionHeader, tokens |
| `components/auth/SignUpScreen.tsx` | Use AppTextInput, PrimaryButton, SecondaryButton, SectionHeader, tokens |
| `components/onboarding/OnboardingFlow.tsx` | Use tokens, LoadingState |
| `components/onboarding/ProfileSetup.tsx` | Use AppTextInput, PrimaryButton, StickyFooter, SectionHeader, tokens |
| `components/onboarding/CharacterSelection.tsx` | Use tokens, StickyFooter |
| `components/navigation/AppNavigator.tsx` | Use tokens for background/loading |

---

## Chunk 1: Design Tokens

### Task 1: Color Tokens

**Files:**
- Create: `theme/tokens/colors.ts`

- [ ] **Step 1: Create color primitives**

```typescript
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
  yellow100: "#FFFDE7",
  orange400: "#FFA726",
  orange600: "#F57C00",
  orange700: "#FFB300",

  // Yellows
  yellow300: "#FFD56D",

  // Corals
  coral400: "#FF6B6B",

  // Grays (Bootstrap-inspired for consistency)
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
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit theme/tokens/colors.ts 2>&1 | head -5`
Expected: No errors (or only import-related since no index yet)

- [ ] **Step 3: Commit**

```bash
git add theme/tokens/colors.ts
git commit -m "feat: add color token system for design system"
```

---

### Task 2: Spacing Tokens

**Files:**
- Create: `theme/tokens/spacing.ts`

- [ ] **Step 1: Create spacing scale and radii**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add theme/tokens/spacing.ts
git commit -m "feat: add spacing, radii, and sizing tokens"
```

---

### Task 3: Typography Tokens

**Files:**
- Create: `theme/tokens/typography.ts`

- [ ] **Step 1: Create typography presets**

```typescript
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
  display: 32,
  hero: 48,
} as const;

export const fontWeights = {
  normal: "400" as TextStyle["fontWeight"],
  medium: "500" as TextStyle["fontWeight"],
  semibold: "600" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
  extrabold: "800" as TextStyle["fontWeight"],
};

export const lineHeights = {
  tight: 18,
  normal: 20,
  relaxed: 22,
  loose: 24,
  paragraph: 28,
  heading: 32,
} as const;

// ─── Text Presets ───
export const textPresets = {
  // Display / Hero
  hero: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.bold,
    lineHeight: 56,
  },
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.heading + 8,
  },

  // Headings
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.heading + 4,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.heading,
  },
  h3: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
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
```

- [ ] **Step 2: Commit**

```bash
git add theme/tokens/typography.ts
git commit -m "feat: add typography tokens and text presets"
```

---

### Task 4: Shadow Tokens

**Files:**
- Create: `theme/tokens/shadows.ts`

- [ ] **Step 1: Create shadow presets**

```typescript
// theme/tokens/shadows.ts
import { Platform, ViewStyle } from "react-native";

type ShadowPreset = Pick<ViewStyle, "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation">;

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

  // Top shadow for sticky footers
  topMd: createShadow(8, 0.1, 8, -2),
} as const;

export type ShadowToken = keyof typeof shadows;
```

- [ ] **Step 2: Commit**

```bash
git add theme/tokens/shadows.ts
git commit -m "feat: add shadow presets for design system"
```

---

### Task 5: Token Index & Theme Integration

**Files:**
- Create: `theme/tokens/index.ts`
- Create: `theme/index.ts`
- Modify: `theme.ts` (make it a re-export shim)

- [ ] **Step 1: Create token barrel export**

```typescript
// theme/tokens/index.ts
export { colors, type ColorToken } from "./colors";
export { spacing, radii, sizes, type SpacingToken, type RadiiToken } from "./spacing";
export {
  fontSizes,
  fontWeights,
  lineHeights,
  textPresets,
} from "./typography";
export { shadows, type ShadowToken } from "./shadows";
```

- [ ] **Step 2: Create theme/index.ts with Paper integration**

```typescript
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
  },
};

export type AppTheme = typeof theme;

/** Typed theme hook — returns our extended Paper theme */
export const useAppTheme = () => usePaperTheme<AppTheme>();

export default theme;
```

- [ ] **Step 3: Update theme.ts to re-export**

```typescript
// theme.ts — backwards-compat shim
export { default } from "./theme/index";
export { useAppTheme } from "./theme/index";
```

- [ ] **Step 4: Verify imports compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add theme/ theme.ts
git commit -m "feat: integrate design tokens with Paper theme and re-export shim"
```

---

## Chunk 2: Shared UI Primitives

### Task 6: ScreenContainer

**Files:**
- Create: `components/ui/ScreenContainer.tsx`

- [ ] **Step 1: Build ScreenContainer**

```typescript
// components/ui/ScreenContainer.tsx
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from "react-native";
import { colors } from "@/theme";

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  /** Disable scroll (e.g. for FlatList screens) */
  noScroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({
  children,
  noScroll,
  style,
  contentStyle,
  ...scrollProps
}: ScreenContainerProps) {
  if (noScroll) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/ScreenContainer.tsx
git commit -m "feat: add ScreenContainer shared layout primitive"
```

---

### Task 7: AppTextInput

**Files:**
- Create: `components/ui/AppTextInput.tsx`

- [ ] **Step 1: Build AppTextInput**

```typescript
// components/ui/AppTextInput.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

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
            <Text style={styles.toggleText}>{showPassword ? "🙈" : "👁️"}</Text>
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
    paddingRight: 60,
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
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/AppTextInput.tsx
git commit -m "feat: add AppTextInput shared form primitive"
```

---

### Task 8: PrimaryButton & SecondaryButton

**Files:**
- Create: `components/ui/PrimaryButton.tsx`
- Create: `components/ui/SecondaryButton.tsx`

- [ ] **Step 1: Build PrimaryButton**

```typescript
// components/ui/PrimaryButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, spacing, radii, textPresets, shadows } from "@/theme";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled ? styles.disabled : shadows.successGlow,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnPrimary} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.buttonPrimaryDisabled,
  },
  text: {
    ...textPresets.button,
    color: colors.textOnPrimary,
  },
  icon: {
    fontSize: 20,
  },
});
```

- [ ] **Step 2: Build SecondaryButton**

```typescript
// components/ui/SecondaryButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, spacing, radii, textPresets } from "@/theme";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function SecondaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.textSecondary} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, isDisabled && styles.textDisabled]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...textPresets.button,
    color: colors.textSecondary,
  },
  textDisabled: {
    color: colors.textDisabled,
  },
  icon: {
    fontSize: 20,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/PrimaryButton.tsx components/ui/SecondaryButton.tsx
git commit -m "feat: add PrimaryButton and SecondaryButton primitives"
```

---

### Task 9: State Components (Loading, Empty, Error)

**Files:**
- Create: `components/ui/LoadingState.tsx`
- Create: `components/ui/EmptyState.tsx`
- Create: `components/ui/ErrorState.tsx`

- [ ] **Step 1: Build LoadingState**

```typescript
// components/ui/LoadingState.tsx
import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "@/theme";

interface LoadingStateProps {
  message?: string;
  emoji?: string;
}

export function LoadingState({
  message = "Loading...",
  emoji = "🤔",
}: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emoji: {
    fontSize: 48,
  },
  message: {
    textAlign: "center",
    color: colors.textSecondary,
  },
});
```

- [ ] **Step 2: Build EmptyState**

```typescript
// components/ui/EmptyState.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "./PrimaryButton";
import { colors, spacing } from "@/theme";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji = "📭",
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: "center",
    color: colors.textPrimary,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
});
```

- [ ] **Step 3: Build ErrorState**

```typescript
// components/ui/ErrorState.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "./PrimaryButton";
import { colors, spacing } from "@/theme";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😕</Text>
      <Text variant="titleMedium" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <PrimaryButton
          title="Try Again"
          onPress={onRetry}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  message: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/LoadingState.tsx components/ui/EmptyState.tsx components/ui/ErrorState.tsx
git commit -m "feat: add LoadingState, EmptyState, ErrorState shared components"
```

---

### Task 10: StickyFooter & SectionHeader

**Files:**
- Create: `components/ui/StickyFooter.tsx`
- Create: `components/ui/SectionHeader.tsx`

- [ ] **Step 1: Build StickyFooter**

```typescript
// components/ui/StickyFooter.tsx
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
```

- [ ] **Step 2: Build SectionHeader**

```typescript
// components/ui/SectionHeader.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, textPresets, sizes } from "@/theme";

interface SectionHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ emoji, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  emoji: {
    fontSize: sizes.emojiXl,
    marginBottom: spacing.lg,
  },
  title: {
    ...textPresets.display,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textPresets.body,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/StickyFooter.tsx components/ui/SectionHeader.tsx
git commit -m "feat: add StickyFooter and SectionHeader primitives"
```

---

### Task 11: Confetti Animation

**Files:**
- Create: `components/ui/Confetti.tsx`

- [ ] **Step 1: Build Confetti component using Reanimated**

```typescript
// components/ui/Confetti.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = [
  colors.primary,
  colors.success,
  colors.secondary,
  colors.coral400,
  colors.orange400,
  colors.blue400,
];

const NUM_PIECES = 30;

interface ConfettiPieceProps {
  index: number;
  trigger: boolean;
}

function ConfettiPiece({ index, trigger }: ConfettiPieceProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(SCREEN_WIDTH / 2);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;

    const targetX = Math.random() * SCREEN_WIDTH;
    const targetY = SCREEN_HEIGHT * (0.3 + Math.random() * 0.5);
    const delay = index * 40;

    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(1200, withTiming(0, { duration: 400 }))
    ));
    translateX.value = withDelay(delay, withTiming(targetX, {
      duration: 1400,
      easing: Easing.out(Easing.quad),
    }));
    translateY.value = withDelay(delay, withTiming(targetY, {
      duration: 1400,
      easing: Easing.in(Easing.quad),
    }));
    rotate.value = withDelay(delay, withTiming(360 * (1 + Math.random() * 2), {
      duration: 1400,
    }));
    scale.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(800, withTiming(0.3, { duration: 400 }))
    ));
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = 8 + Math.random() * 8;
  const isCircle = index % 3 === 0;

  return (
    <Animated.View
      style={[
        styles.piece,
        animatedStyle,
        {
          backgroundColor: color,
          width: size,
          height: isCircle ? size : size * 0.6,
          borderRadius: isCircle ? size / 2 : 2,
        },
      ]}
    />
  );
}

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: NUM_PIECES }).map((_, i) => (
        <ConfettiPiece key={i} index={i} trigger={trigger} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  piece: {
    position: "absolute",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Confetti.tsx
git commit -m "feat: add Confetti celebration animation component"
```

---

### Task 12: UI Barrel Export

**Files:**
- Create: `components/ui/index.ts`

- [ ] **Step 1: Create barrel export**

```typescript
// components/ui/index.ts
export { ScreenContainer } from "./ScreenContainer";
export { AppTextInput } from "./AppTextInput";
export { PrimaryButton } from "./PrimaryButton";
export { SecondaryButton } from "./SecondaryButton";
export { LoadingState } from "./LoadingState";
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export { StickyFooter } from "./StickyFooter";
export { SectionHeader } from "./SectionHeader";
export { Confetti } from "./Confetti";
```

- [ ] **Step 2: Verify all imports compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add components/ui/index.ts
git commit -m "feat: add UI primitives barrel export"
```

---

## Chunk 3: Refactor Auth & Onboarding Screens

### Task 13: Refactor SignInScreen

**Files:**
- Modify: `components/auth/SignInScreen.tsx`

- [ ] **Step 1: Refactor to use design system**

Replace all hardcoded StyleSheet values with token imports. Replace duplicated input/button code with `AppTextInput`, `PrimaryButton`, `SecondaryButton`, `SectionHeader`. Key changes:

- Import from `@/theme` and `@/components/ui`
- Replace `<View style={styles.header}>` with `<SectionHeader emoji="📚" title="Welcome Back!" subtitle="Sign in to continue learning" />`
- Replace email/password `<TextInput>` with `<AppTextInput label="Email" .../>` and `<AppTextInput label="Password" isPassword .../>`
- Replace sign-in button `<TouchableOpacity>` with `<PrimaryButton title="Sign In" loading={loading} .../>`
- Replace Google button with `<SecondaryButton icon="🔵" title="Continue with Google" .../>`
- Replace all hardcoded colors in remaining styles with token references (e.g., `colors.background`, `colors.textSecondary`, `colors.divider`)
- Remove all deleted style definitions from StyleSheet

- [ ] **Step 2: Visual test — run app and verify sign-in screen**

Run: `npx expo start --web` and navigate to sign-in
Expected: Same visual appearance, no regressions

- [ ] **Step 3: Commit**

```bash
git add components/auth/SignInScreen.tsx
git commit -m "refactor: SignInScreen uses design system tokens and shared components"
```

---

### Task 14: Refactor SignUpScreen

**Files:**
- Modify: `components/auth/SignUpScreen.tsx`

- [ ] **Step 1: Refactor to use design system**

Same pattern as SignInScreen:
- Import from `@/theme` and `@/components/ui`
- Replace header with `<SectionHeader emoji="📚" title="Create Account" subtitle="Start your child's learning journey" />`
- Replace all `<TextInput>` with `<AppTextInput .../>`
- Replace buttons with `PrimaryButton` / `SecondaryButton`
- Replace all hardcoded colors/spacing with tokens
- Remove deleted style definitions

- [ ] **Step 2: Commit**

```bash
git add components/auth/SignUpScreen.tsx
git commit -m "refactor: SignUpScreen uses design system tokens and shared components"
```

---

### Task 15: Refactor ProfileSetup

**Files:**
- Modify: `components/onboarding/ProfileSetup.tsx`

- [ ] **Step 1: Refactor to use design system**

- Import from `@/theme` and `@/components/ui`
- Replace header with `<SectionHeader emoji="🎓" title="Let's Get Started!" subtitle="Tell us a bit about yourself..." />`
- Replace name input with `<AppTextInput label="Your Name" error={nameError} .../>`
- Replace footer with `<StickyFooter><PrimaryButton title="Continue" .../></StickyFooter>`
- Replace grade button colors with `colors.selected`, `colors.selectedText`, `colors.unselected`, `colors.unselectedBorder`
- Replace all hardcoded spacing with `spacing.*` tokens
- Replace all hardcoded radii with `radii.*` tokens
- Replace all shadow definitions with `shadows.*` presets

- [ ] **Step 2: Commit**

```bash
git add components/onboarding/ProfileSetup.tsx
git commit -m "refactor: ProfileSetup uses design system tokens and shared components"
```

---

### Task 16: Refactor CharacterSelection

**Files:**
- Modify: `components/onboarding/CharacterSelection.tsx`

- [ ] **Step 1: Refactor to use design system**

- Replace all hardcoded colors with tokens (e.g., `colors.background`, `colors.surface`, `colors.selected`, `colors.textPrimary`)
- Replace all spacing values with `spacing.*` tokens
- Replace shadow definitions with `shadows.*` presets
- Replace radii values with `radii.*` tokens
- Replace font sizes with `fontSizes.*` or `textPresets.*`
- Replace footer with `<StickyFooter><PrimaryButton .../></StickyFooter>`

- [ ] **Step 2: Commit**

```bash
git add components/onboarding/CharacterSelection.tsx
git commit -m "refactor: CharacterSelection uses design system tokens"
```

---

### Task 17: Refactor OnboardingFlow

**Files:**
- Modify: `components/onboarding/OnboardingFlow.tsx`

- [ ] **Step 1: Refactor to use design system**

- Replace loading/download screen with `<LoadingState>` pattern using tokens
- Replace hardcoded progress bar colors with `colors.success`, `colors.borderLight`
- Replace all hardcoded spacing, font sizes, colors with token references
- Replace completion state styling with tokens

- [ ] **Step 2: Commit**

```bash
git add components/onboarding/OnboardingFlow.tsx
git commit -m "refactor: OnboardingFlow uses design system tokens"
```

---

### Task 17.5: Refactor AppNavigator

**Files:**
- Modify: `components/navigation/AppNavigator.tsx`

- [ ] **Step 1: Refactor to use design system**

- Replace hardcoded `#F8F9FA` background with `colors.background`
- Replace any loading state with `<LoadingState />` if applicable
- Replace hardcoded spacing/colors with token references

- [ ] **Step 2: Commit**

```bash
git add components/navigation/AppNavigator.tsx
git commit -m "refactor: AppNavigator uses design system tokens"
```

---

## Chunk 4: Refactor Main App Screens

### Task 18: Refactor Home Screen

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Refactor to use design system**

- Wrap in `<ScreenContainer>` instead of manual SafeAreaView + ScrollView
- Replace all hardcoded colors with tokens:
  - Header background: `colors.background`
  - Sign-out button: `colors.borderLight` bg, `colors.textSecondary` text
  - Selected chip: `colors.selected` bg, `colors.selectedText` text
  - Unselected chip: `colors.surface` bg, `colors.unselectedBorder` border
- Replace spacing values with `spacing.*` tokens
- Replace radii with `radii.*` tokens

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "refactor: Home screen uses design system tokens and ScreenContainer"
```

---

### Task 19: Refactor PlayerStats

**Files:**
- Modify: `components/PlayerStats.tsx`

- [ ] **Step 1: Refactor to use design system**

- Replace all hardcoded colors:
  - Avatar bg: `colors.avatarBackground`
  - Character name / level badge: `colors.levelBadge`
  - XP text: `colors.streak`
  - XP bar bg: `colors.xpBarBackground`
  - XP bar fill: `colors.xpBar`
  - Metric value: `colors.textPrimary`
  - Metric label: `colors.textTertiary` (slate500)
  - Divider: `colors.divider`
  - Container bg: `colors.surface`
- Replace hardcoded dimensions with `sizes.*` (avatarLg, emojiLg)
- Replace spacing with `spacing.*` tokens
- Replace radii with `radii.*` tokens
- Replace font sizes/weights with `fontSizes.*` / `fontWeights.*`

- [ ] **Step 2: Commit**

```bash
git add components/PlayerStats.tsx
git commit -m "refactor: PlayerStats uses design system tokens"
```

---

### Task 20: Refactor CharacterCompanion

**Files:**
- Modify: `components/CharacterCompanion.tsx`

- [ ] **Step 1: Refactor to use design system**

- Replace speech bubble colors:
  - Default: `colors.speechBubbleDefault`
  - Correct: `colors.speechBubbleCorrect`
  - Incorrect: `colors.speechBubbleIncorrect`
- Replace avatar bg with `colors.avatarBackground`
- Replace text colors with `colors.textTertiary` (name), `colors.textPrimary` (message)
- Replace dimensions with `sizes.avatarMd`, `sizes.emojiMd`
- Replace spacing/radii with tokens

- [ ] **Step 2: Commit**

```bash
git add components/CharacterCompanion.tsx
git commit -m "refactor: CharacterCompanion uses design system tokens"
```

---

### Task 21: Refactor Worksheet Generator

**Files:**
- Modify: `app/[type]/index.tsx`

- [ ] **Step 1: Refactor to use design system**

- Replace error text `color: "red"` with `colors.error`
- Replace suggestion banner colors with `colors.infoLight`, `colors.primary`, `colors.blue700`
- Replace selected button border with `colors.selected`
- Replace all spacing values with `spacing.*` tokens
- Use `useAppTheme()` instead of `useTheme()`

- [ ] **Step 2: Commit**

```bash
git add "app/[type]/index.tsx"
git commit -m "refactor: Worksheet generator uses design system tokens"
```

---

### Task 22: Refactor Attempt Screen + Add Confetti

**Files:**
- Modify: `app/attempt/[userWorksheetId].tsx`

- [ ] **Step 1: Refactor to use design system tokens**

- Replace loading state with `<LoadingState emoji="📝" message="Loading your worksheet..." />`
- Replace error state with `<ErrorState message={error} onRetry={loadWorksheet} />`
- Replace all hardcoded colors:
  - Rewards bg: `colors.yellow100`
  - Score text: `colors.primary`
  - Correct card: border `colors.correctBorder`, bg `colors.correctBackground`
  - Incorrect card: border `colors.incorrectBorder`, bg `colors.incorrectBackground`
  - Correct text: `colors.correctText`
  - Incorrect text: `colors.incorrectText`
  - Explanation: `colors.textSecondary`
- Replace spacing/radii with tokens

- [ ] **Step 2: Add Confetti to results screen**

Import `Confetti` from `@/components/ui` and add at the top of the results view:

```typescript
<Confetti trigger={showResults && score >= 70} />
```

Where `showResults` is the state controlling results display and `score` is the percentage.

- [ ] **Step 3: Commit**

```bash
git add "app/attempt/[userWorksheetId].tsx"
git commit -m "refactor: Attempt screen uses design system tokens + confetti celebration"
```

---

### Task 23: Refactor History Screen

**Files:**
- Modify: `app/history.tsx`

- [ ] **Step 1: Refactor to use design system**

- Wrap in `<ScreenContainer noScroll>` (since it uses FlatList)
- Replace loading state with `<LoadingState message="Loading history..." />`
- Replace unauthenticated state with `<EmptyState emoji="🔒" title="Please log in" subtitle="Log in to view your saved worksheets" actionLabel="Go to Profile" onAction={...} />`
- Replace empty state with `<EmptyState emoji="📝" title="No worksheets yet" subtitle="Start by generating your first worksheet!" actionLabel="Generate a Worksheet" onAction={...} />`
- Replace error state with `<ErrorState message={error} onRetry={fetchHistory} />`
- Replace hardcoded colors in card styles with tokens

- [ ] **Step 2: Commit**

```bash
git add app/history.tsx
git commit -m "refactor: History screen uses design system shared state components"
```

---

### Task 24: Refactor Profile Screen

**Files:**
- Modify: `app/profile.tsx`

- [ ] **Step 1: Refactor to use design system**

- Wrap in `<ScreenContainer>`
- Replace loading state with `<LoadingState />`
- Replace unauthenticated view with `<EmptyState emoji="👋" title="Welcome!" subtitle="Sign in to save your worksheets and track your progress." actionLabel="Sign In with Google" onAction={handleGoogleSignIn} />`
- Replace hardcoded styles with token references

- [ ] **Step 2: Commit**

```bash
git add app/profile.tsx
git commit -m "refactor: Profile screen uses design system tokens and shared components"
```

---

### Task 25: Refactor WorksheetPreview & WorksheetCard

**Files:**
- Modify: `components/WorksheetPreview.tsx`
- Modify: `components/WorksheetCard.tsx`

- [ ] **Step 1: Refactor WorksheetPreview**

- Replace `color: "red"` with `colors.error`
- Replace header color `#4CAF50` with `colors.success`
- Replace spacing with tokens

- [ ] **Step 2: Refactor WorksheetCard**

- Replace margin/elevation values with `spacing.*` and `shadows.*` tokens

- [ ] **Step 3: Commit**

```bash
git add components/WorksheetPreview.tsx components/WorksheetCard.tsx
git commit -m "refactor: WorksheetPreview and WorksheetCard use design system tokens"
```

---

## Chunk 5: Layout Update & Final Integration

### Task 26: Update Root Layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Update theme import**

Change `import theme from "@/theme"` to `import theme from "@/theme"` (should still work via the shim, but verify). If already importing from `"../theme"`, update to `"@/theme"` for consistency.

- [ ] **Step 2: Verify app boots**

Run: `npx expo start --web`
Expected: App loads with no import errors, all tabs render

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "refactor: root layout uses theme from design system"
```

---

### Task 27: Simplify Worksheet Config for Kids

**Files:**
- Modify: `app/[type]/index.tsx`

- [ ] **Step 1: Add quick-start mode**

When a student profile is selected and has adaptive data, collapse the configuration behind a "Change settings" expandable section. Show a simplified view:

```typescript
// At top of config card, add:
const hasProfile = !!selectedStudent;
const [showAdvanced, setShowAdvanced] = useState(!hasProfile);

// In render, wrap config options:
{hasProfile && !showAdvanced ? (
  <View style={styles.quickStart}>
    <Text variant="bodyLarge" style={styles.quickStartText}>
      Ready for {selectedStudent.name}! Grade {grade}, {difficulty} difficulty.
    </Text>
    <TouchableOpacity onPress={() => setShowAdvanced(true)}>
      <Text style={styles.changeSettingsLink}>Change settings</Text>
    </TouchableOpacity>

// Add to StyleSheet:
// quickStartText: { color: colors.textSecondary },
// changeSettingsLink: { color: colors.primary, ...textPresets.labelSmall },
  </View>
) : (
  // existing config UI
)}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[type]/index.tsx"
git commit -m "feat: add quick-start mode for returning students on worksheet generator"
```

---

### Task 28: Final TypeScript Check & Cleanup

**Files:**
- All modified files

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run linter**

Run: `npx expo lint`
Expected: No new warnings/errors

- [ ] **Step 3: Remove unused style definitions and imports**

Search all refactored files for:
- `StyleSheet.create` blocks with unused style keys (no longer referenced in JSX)
- Unused imports (e.g., old `import theme from "../theme"` patterns, React Native Paper components replaced by custom primitives)
- Verify no files still import from old `theme.ts` path directly — all should use `@/theme`

- [ ] **Step 4: Commit**

```bash
git add theme/ components/ app/
git commit -m "chore: cleanup unused styles and imports after design system migration"
```

---

## Design System Reference Guide

After completing all tasks, the design system can be used for any new screen or component:

### Quick Reference

```typescript
// Import tokens
import { colors, spacing, radii, sizes, shadows, textPresets, fontSizes, fontWeights } from "@/theme";

// Import UI primitives
import {
  ScreenContainer,
  AppTextInput,
  PrimaryButton,
  SecondaryButton,
  LoadingState,
  EmptyState,
  ErrorState,
  StickyFooter,
  SectionHeader,
  Confetti,
} from "@/components/ui";

// Use typed theme hook
import { useAppTheme } from "@/theme";
const theme = useAppTheme();
```

### Token Usage Patterns

| Need | Token |
|------|-------|
| Page background | `colors.background` |
| Card background | `colors.surface` |
| Primary text | `colors.textPrimary` |
| Secondary text | `colors.textSecondary` |
| Primary action button | `<PrimaryButton>` or `colors.buttonPrimary` |
| Success feedback | `colors.success` / `colors.successLight` |
| Error feedback | `colors.error` / `colors.errorLight` |
| Standard padding | `spacing.lg` (16px) |
| Card border radius | `radii.lg` (16px) |
| Card shadow | `shadows.md` |
| Body text | `textPresets.body` |
| Heading | `textPresets.h1` / `h2` / `h3` |

### When to use `useAppTheme()` vs direct token imports

- **Direct imports** (`import { colors, spacing } from "@/theme"`): Use for static styles in `StyleSheet.create()`. This is the default and most common pattern.
- **`useAppTheme()`**: Use when you need theme values inside render functions dynamically (e.g., passing colors as props to Paper components like `<ProgressBar color={theme.colors.primary} />`), or when a future dark mode toggle needs to reactively update styles.
