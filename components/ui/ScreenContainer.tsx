import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
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
        {/* Decorative background circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />
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
    overflow: "hidden",
  },
  content: {
    flexGrow: 1,
  },
  // Subtle decorative background shapes
  bgCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.coral50,
    opacity: 0.4,
  },
  bgCircle2: {
    position: "absolute",
    bottom: 80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.teal50,
    opacity: 0.3,
  },
  bgCircle3: {
    position: "absolute",
    top: "40%",
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.violet50,
    opacity: 0.25,
  },
});
