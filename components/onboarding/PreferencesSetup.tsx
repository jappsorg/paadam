import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const THEME_OPTIONS = [
  { id: "dinosaurs", label: "Dinosaurs", emoji: "\uD83E\uDD95" },
  { id: "space", label: "Space", emoji: "\uD83D\uDE80" },
  { id: "cooking", label: "Cooking", emoji: "\uD83C\uDF55" },
  { id: "animals", label: "Animals", emoji: "\uD83D\uDC3E" },
  { id: "sports", label: "Sports", emoji: "\u26BD" },
  { id: "fantasy", label: "Fantasy", emoji: "\uD83C\uDFF0" },
  { id: "art", label: "Art", emoji: "\uD83C\uDFA8" },
  { id: "music", label: "Music", emoji: "\uD83C\uDFB5" },
  { id: "ocean", label: "Ocean", emoji: "\uD83C\uDF0A" },
];

const SUBJECT_OPTIONS = [
  { id: "addition", label: "Addition" },
  { id: "subtraction", label: "Subtraction" },
  { id: "multiplication", label: "Multiplication" },
  { id: "division", label: "Division" },
  { id: "fractions", label: "Fractions" },
  { id: "geometry", label: "Geometry" },
  { id: "measurement", label: "Measurement" },
  { id: "time", label: "Time" },
  { id: "money", label: "Money" },
];

interface PreferencesSetupProps {
  studentName: string;
  onComplete: (preferences: {
    favoriteThemes: string[];
    trickySubjects: string[];
  }) => void;
  onSkip: () => void;
}

export function PreferencesSetup({ studentName, onComplete, onSkip }: PreferencesSetupProps) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleTheme = (id: string) => {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What does {studentName} love?</Text>
      <Text style={styles.subtitle}>
        {selectedThemes.length === 0
          ? "Pick up to 3 favorites"
          : selectedThemes.length < 3
            ? `${selectedThemes.length} of 3 picked \u2014 keep going!`
            : "\uD83C\uDF89 3 of 3 picked \u2014 looks great!"}
      </Text>

      <View style={styles.grid}>
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedThemes.includes(theme.id);
          return (
            <Pressable
              key={theme.id}
              style={[styles.themeCard, isSelected && styles.themeCardSelected]}
              onPress={() => toggleTheme(theme.id)}
            >
              <Text style={styles.themeEmoji}>{theme.emoji}</Text>
              <Text style={[styles.themeLabel, isSelected && styles.themeLabelSelected]}>
                {theme.label}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>{"\u2713"}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.title, { marginTop: spacing.xxl }]}>
        Any subjects they find tricky?
      </Text>
      <Text style={styles.subtitle}>Optional \u2014 helps us personalize</Text>

      <View style={styles.chipContainer}>
        {SUBJECT_OPTIONS.map((subject) => {
          const isSelected = selectedSubjects.includes(subject.id);
          return (
            <Pressable
              key={subject.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleSubject(subject.id)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {subject.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          title={selectedThemes.length > 0 ? "Continue" : "Skip for now"}
          variant={selectedThemes.length > 0 ? "teal" : "coral"}
          onPress={() => {
            if (selectedThemes.length > 0) {
              onComplete({ favoriteThemes: selectedThemes, trickySubjects: selectedSubjects });
            } else {
              onSkip();
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
  },
  themeCard: {
    width: 100,
    height: 100,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...shadows.sm,
  },
  themeCardSelected: {
    borderColor: colors.teal400,
    backgroundColor: colors.teal50,
    ...shadows.tealGlow,
  },
  themeEmoji: { fontSize: 32, marginBottom: spacing.xs },
  themeLabel: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
  },
  themeLabelSelected: {
    color: colors.teal700,
    fontWeight: fontWeights.bold,
  },
  checkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.teal400,
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeights.bold,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  chipSelected: {
    backgroundColor: colors.coral50,
    borderColor: colors.coral400,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.semibold,
  },
  chipTextSelected: {
    color: colors.coral500,
    fontWeight: fontWeights.bold,
  },
  buttons: { marginTop: spacing.xxl, alignItems: "center" },
});
