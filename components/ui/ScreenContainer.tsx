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
