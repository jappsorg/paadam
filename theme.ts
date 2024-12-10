import { MD3LightTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4A90E2", // Friendly blue
    secondary: "#FFD56D", // Warm yellow
    tertiary: "#4CAF50", // Green
    secondaryContainer: "#FFD56D", // Light yellow
    accent: "#FF6B6B", // Soft coral
    background: "#F8F9FA", // Light gray background
    surface: "#FFFFFF", // White
    text: "#2D3436", // Dark gray text
    disabled: "#E2E8F0", // Light gray for disabled
    placeholder: "#94A3B8", // Medium gray for placeholder
    backdrop: "#F1F5F9", // Light blue-gray backdrop
    success: "#4CAF50", // Green for success states
    error: "#FF5252", // Red for error states
    info: "#64B5F6", // Light blue for info
    warning: "#FFA726", // Orange for warning
  },
};

export default theme;
