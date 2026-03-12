/**
 * Onboarding Screen - Character Selection
 *
 * First screen after authentication
 * Child selects their companion character
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CharacterService, { Character } from "../../services/CharacterService";
import { PrimaryButton, StickyFooter } from "@/components/ui";
import { colors, spacing, radii, fontSizes, fontWeights, shadows, textPresets, sizes } from "@/theme";

const { width } = Dimensions.get("window");

interface CharacterSelectionProps {
  onCharacterSelected: (characterId: string) => void;
  studentName?: string;
}

export default function CharacterSelection({
  onCharacterSelected,
  studentName = "friend",
}: CharacterSelectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );
  const characters = CharacterService.getAllCharacters();

  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const buttonTitle = selectedCharacter
    ? `Let's Learn with ${CharacterService.getCharacterById(selectedCharacter)?.name}!`
    : "Choose a Companion";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {studentName}! 👋</Text>
        <Text style={styles.title}>Choose Your Learning Companion</Text>
        <Text style={styles.subtitle}>
          Pick a friend who will learn with you every day!
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.charactersContainer}
        showsVerticalScrollIndicator={false}
      >
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacter === character.id}
            onSelect={handleSelectCharacter}
          />
        ))}
      </ScrollView>

      <StickyFooter>
        <PrimaryButton
          title={buttonTitle}
          onPress={() => selectedCharacter && onCharacterSelected(selectedCharacter)}
          disabled={!selectedCharacter}
        />
      </StickyFooter>
    </SafeAreaView>
  );
}

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (characterId: string) => void;
}

function CharacterCard({
  character,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(character.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardImageContainer}>
        {/* TODO: Replace with actual character image */}
        <View style={styles.characterPlaceholder}>
          <Text style={styles.characterEmoji}>
            {character.id === "ada"
              ? "🦉"
              : character.id === "max"
                ? "🐕"
                : "🐱"}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.characterName}>{character.name}</Text>
        <Text style={styles.characterDescription}>{character.description}</Text>

        <View style={styles.traitBadges}>
          <View style={styles.traitBadge}>
            <Text style={styles.traitText}>
              {character.traits.energyLevel === "calm"
                ? "😌 Calm"
                : character.traits.energyLevel === "moderate"
                  ? "😊 Balanced"
                  : "⚡ Energetic"}
            </Text>
          </View>
          <View style={styles.traitBadge}>
            <Text style={styles.traitText}>
              {character.traits.explanationStyle === "step-by-step"
                ? "📝 Step-by-Step"
                : character.traits.explanationStyle === "visual"
                  ? "🎨 Visual"
                  : character.traits.explanationStyle === "conversational"
                    ? "💬 Friendly"
                    : "🧠 Logical"}
            </Text>
          </View>
        </View>
      </View>

      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>✓ Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    ...shadows.sm,
  },
  greeting: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.unselectedText,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  charactersContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
    ...shadows.md,
  },
  cardSelected: {
    borderColor: colors.selected,
    shadowColor: colors.selected,
    shadowOpacity: 0.3,
  },
  cardImageContainer: {
    height: 180,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  characterPlaceholder: {
    width: sizes.avatarXl,
    height: sizes.avatarXl,
    backgroundColor: colors.surface,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  characterEmoji: {
    fontSize: sizes.emojiXxl,
  },
  cardContent: {
    padding: spacing.xl,
  },
  characterName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  characterDescription: {
    fontSize: 15,
    color: colors.unselectedText,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  traitBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  traitBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  traitText: {
    fontSize: fontSizes.sm,
    color: colors.unselectedText,
    fontWeight: fontWeights.semibold,
  },
  selectedBadge: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.selected,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  selectedBadgeText: {
    color: colors.surface,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
