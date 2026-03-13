import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CharacterService } from "@/services/CharacterService";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

const THEME_VISUALS: Record<string, { emoji: string; color: string; light: string }> = {
  cooking: { emoji: "\uD83C\uDF55", color: "#FF6B6B", light: colors.coral50 },
  dinosaurs: { emoji: "\uD83E\uDD95", color: "#4ECDC4", light: colors.teal50 },
  space: { emoji: "\uD83D\uDE80", color: "#8B5CF6", light: colors.violet50 },
  animals: { emoji: "\uD83D\uDC3E", color: "#F59E0B", light: colors.gold50 },
  sports: { emoji: "\u26BD", color: "#10B981", light: colors.green50 },
  fantasy: { emoji: "\uD83C\uDFF0", color: "#8B5CF6", light: colors.violet50 },
  art: { emoji: "\uD83C\uDFA8", color: "#EC4899", light: colors.coral50 },
  ocean: { emoji: "\uD83C\uDF0A", color: "#06B6D4", light: colors.teal50 },
  music: { emoji: "\uD83C\uDFB5", color: "#F97316", light: colors.orange50 },
};

export default function ThemePickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    choices: string;
    studentId: string;
    character: string;
  }>();

  const choices = (params.choices || "animals,space,cooking").split(",");
  const characterId = params.character || "ada";
  const characterData = CharacterService.getCharacterById(characterId);
  const characterName = characterData?.name || "Ada";

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
        <Text style={styles.subtitle}>{characterName} is ready to explore with you!</Text>

        <View style={styles.cards}>
          {choices.map((theme) => {
            const visual = THEME_VISUALS[theme] || { emoji: "\uD83C\uDF1F", color: colors.violet400, light: colors.violet50 };
            return (
              <Pressable
                key={theme}
                style={({ pressed }) => [
                  styles.card,
                  { borderColor: visual.color, backgroundColor: visual.light },
                  pressed && styles.cardPressed,
                ]}
                onPress={() => handleSelect(theme)}
              >
                <View style={[styles.emojiCircle, { backgroundColor: visual.color + "20" }]}>
                  <Text style={styles.cardEmoji}>{visual.emoji}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: visual.color }]}>
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
  container: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    textAlign: "center",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  cards: { gap: spacing.lg },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 3,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardEmoji: { fontSize: 40 },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  cardSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontWeight: fontWeights.semibold,
  },
});
