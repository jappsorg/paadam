import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, spacing, fontSizes } from "@/theme";

const THEME_VISUALS: Record<string, { emoji: string; color: string }> = {
  cooking: { emoji: "🍕", color: "#FF6B6B" },
  dinosaurs: { emoji: "🦕", color: "#4ECDC4" },
  space: { emoji: "🚀", color: "#6366F1" },
  animals: { emoji: "🐾", color: "#F59E0B" },
  sports: { emoji: "⚽", color: "#10B981" },
  fantasy: { emoji: "🏰", color: "#8B5CF6" },
  art: { emoji: "🎨", color: "#EC4899" },
  ocean: { emoji: "🌊", color: "#06B6D4" },
  music: { emoji: "🎵", color: "#F97316" },
};

export default function ThemePickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    choices: string; // comma-separated theme IDs
    studentId: string;
    character: string;
  }>();

  const choices = (params.choices || "animals,space,cooking").split(",");
  const character = params.character || "Ada";

  const handleSelect = (theme: string) => {
    router.push({
      pathname: "/[type]",
      params: {
        type: "math",
        adventureMode: "true",
        selectedTheme: theme,
        studentId: params.studentId,
      },
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Pick Your Next Adventure!</Text>
        <Text style={styles.subtitle}>{character} is ready to explore with you</Text>

        <View style={styles.cards}>
          {choices.map((theme) => {
            const visual = THEME_VISUALS[theme] || { emoji: "🌟", color: "#6366F1" };
            return (
              <Pressable
                key={theme}
                style={[styles.card, { borderColor: visual.color }]}
                onPress={() => handleSelect(theme)}
              >
                <Text style={styles.cardEmoji}>{visual.emoji}</Text>
                <Text style={styles.cardTitle}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)} Adventure
                </Text>
                <Text style={styles.cardSubtitle}>Tap to start!</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  title: { fontSize: fontSizes.xxl, fontWeight: "800", textAlign: "center", color: colors.text },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  cards: { gap: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: spacing.xl,
    alignItems: "center", borderWidth: 3, elevation: 2,
  },
  cardEmoji: { fontSize: 48, marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSizes.lg, fontWeight: "700", color: colors.text },
  cardSubtitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
});
