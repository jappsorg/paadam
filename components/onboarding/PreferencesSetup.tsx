import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, fontSizes } from "@/theme";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const THEME_OPTIONS = [
  { id: "dinosaurs", label: "Dinosaurs", emoji: "🦕" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "cooking", label: "Cooking", emoji: "🍕" },
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "fantasy", label: "Fantasy", emoji: "🏰" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
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
      <Text style={styles.subtitle}>Pick up to 3 favorites</Text>

      <View style={styles.grid}>
        {THEME_OPTIONS.map((theme) => (
          <Pressable
            key={theme.id}
            style={[styles.themeCard, selectedThemes.includes(theme.id) && styles.themeCardSelected]}
            onPress={() => toggleTheme(theme.id)}
          >
            <Text style={styles.themeEmoji}>{theme.emoji}</Text>
            <Text style={[styles.themeLabel, selectedThemes.includes(theme.id) && styles.themeLabelSelected]}>
              {theme.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.title, { marginTop: spacing.xl }]}>
        Any subjects they find tricky?
      </Text>
      <Text style={styles.subtitle}>Optional — helps us personalize</Text>

      <View style={styles.chipContainer}>
        {SUBJECT_OPTIONS.map((subject) => (
          <Pressable
            key={subject.id}
            style={[styles.chip, selectedSubjects.includes(subject.id) && styles.chipSelected]}
            onPress={() => toggleSubject(subject.id)}
          >
            <Text style={[styles.chipText, selectedSubjects.includes(subject.id) && styles.chipTextSelected]}>
              {subject.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          label={selectedThemes.length > 0 ? "Continue" : "Skip for now"}
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
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { fontSize: fontSizes.xl, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.md },
  themeCard: {
    width: 100, height: 100, borderRadius: 16, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent",
  },
  themeCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  themeEmoji: { fontSize: 32, marginBottom: spacing.xs },
  themeLabel: { fontSize: fontSizes.sm, color: colors.text },
  themeLabelSelected: { color: colors.primary, fontWeight: "600" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline,
  },
  chipSelected: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.sm, color: colors.text },
  chipTextSelected: { color: colors.primary, fontWeight: "600" },
  buttons: { marginTop: spacing.xl, alignItems: "center" },
});
