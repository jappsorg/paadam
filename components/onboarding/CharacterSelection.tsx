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

  const handleContinue = () => {
    if (selectedCharacter) {
      onCharacterSelected(selectedCharacter);
    }
  };

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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCharacter && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedCharacter}
        >
          <Text style={styles.continueButtonText}>
            {selectedCharacter
              ? `Let's Learn with ${CharacterService.getCharacterById(selectedCharacter)?.name}!`
              : "Choose a Companion"}
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6C757D",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  charactersContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardSelected: {
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
  },
  cardImageContainer: {
    height: 180,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  characterPlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  characterEmoji: {
    fontSize: 80,
  },
  cardContent: {
    padding: 20,
  },
  characterName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  characterDescription: {
    fontSize: 15,
    color: "#495057",
    lineHeight: 22,
    marginBottom: 16,
  },
  traitBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  traitBadge: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  traitText: {
    fontSize: 13,
    color: "#495057",
    fontWeight: "600",
  },
  selectedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: "#DEE2E6",
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
