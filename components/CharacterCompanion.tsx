import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text, Surface } from "react-native-paper";
import { CharacterService } from "../services/CharacterService";
import { colors, spacing, radii, sizes, fontSizes, fontWeights } from "@/theme";

export type CompanionMood =
  | "idle"
  | "encouraging"
  | "correct"
  | "incorrect"
  | "celebrating"
  | "thinking";

interface CharacterCompanionProps {
  characterId: string | null;
  mood: CompanionMood;
  studentName?: string;
}

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: "\u{1F989}", // owl
  max: "\u{1F436}", // dog
  luna: "\u{1F431}", // cat
};

const CHARACTER_MESSAGES: Record<
  string,
  Record<CompanionMood, string[]>
> = {
  ada: {
    idle: [
      "Take your time, think it through!",
      "Read the question carefully...",
      "I believe in you!",
    ],
    encouraging: [
      "You can do this! One step at a time.",
      "Think about what you already know...",
      "Almost there, keep going!",
    ],
    correct: [
      "Excellent work! You nailed it!",
      "That's right! Great thinking!",
      "Wonderful! You're getting stronger!",
    ],
    incorrect: [
      "That's okay! Let's learn from this.",
      "Good try! Keep practicing.",
      "Mistakes help us grow smarter!",
    ],
    celebrating: [
      "Outstanding job! I'm so proud!",
      "You did amazing! What a star!",
      "Brilliant work today!",
    ],
    thinking: [
      "Hmm, interesting question...",
      "Let me think along with you...",
      "This is a good one to puzzle over!",
    ],
  },
  max: {
    idle: [
      "Let's go! You've got this!",
      "Woof! Ready for this one?",
      "Come on, let's solve it together!",
    ],
    encouraging: [
      "You're doing awesome! Keep it up!",
      "Go go go! You're on fire!",
      "I'm cheering for you!",
    ],
    correct: [
      "YES! High five! That's amazing!",
      "Woo-hoo! You're a superstar!",
      "AWESOME! You crushed it!",
    ],
    incorrect: [
      "No worries! Let's try again!",
      "Shake it off! You'll get the next one!",
      "It's all good! Practice makes perfect!",
    ],
    celebrating: [
      "AMAZING! You're the best!",
      "I'm doing a happy dance for you!",
      "You're incredible! Let's celebrate!",
    ],
    thinking: [
      "Ooh, this one looks fun!",
      "I'm thinking too! Ruff question!",
      "We can figure this out together!",
    ],
  },
  luna: {
    idle: [
      "Picture the answer in your mind...",
      "Let your imagination help you...",
      "You've got a creative mind, use it!",
    ],
    encouraging: [
      "I see you working hard! Keep going!",
      "You're painting a great picture here...",
      "Softly, gently... you'll find the answer.",
    ],
    correct: [
      "Beautiful! Just like a masterpiece!",
      "Purr-fect answer! Well done!",
      "That's the art of problem solving!",
    ],
    incorrect: [
      "Every artist makes sketches first...",
      "That's just a draft. Try again!",
      "Learning is a creative process!",
    ],
    celebrating: [
      "A masterpiece of a performance!",
      "You've created something wonderful today!",
      "Purr-fectly done! I'm so happy!",
    ],
    thinking: [
      "Let me sketch out some ideas...",
      "Hmm, I see patterns here...",
      "Curiosity leads to answers!",
    ],
  },
};

function getRandomMessage(characterId: string, mood: CompanionMood): string {
  const messages =
    CHARACTER_MESSAGES[characterId]?.[mood] ||
    CHARACTER_MESSAGES.ada[mood];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function CharacterCompanion({
  characterId,
  mood,
  studentName,
}: CharacterCompanionProps) {
  const [message, setMessage] = useState("");
  const [bounceAnim] = useState(new Animated.Value(1));

  const charId = characterId || "ada";
  const emoji = CHARACTER_EMOJIS[charId] || CHARACTER_EMOJIS.ada;
  const character = CharacterService.getCharacterById(charId);

  useEffect(() => {
    setMessage(getRandomMessage(charId, mood));

    // Bounce animation on mood change
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mood]);

  const moodEmoji = getMoodEmoji(mood);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.avatarContainer, { transform: [{ scale: bounceAnim }] }]}
      >
        <Text style={styles.avatar}>{emoji}</Text>
        <Text style={styles.moodIndicator}>{moodEmoji}</Text>
      </Animated.View>
      <Surface style={[styles.speechBubble, getMoodStyle(mood)]} elevation={1}>
        <Text style={styles.characterName}>{character?.name || "Ada"}</Text>
        <Text style={styles.message}>{message}</Text>
      </Surface>
    </View>
  );
}

function getMoodEmoji(mood: CompanionMood): string {
  switch (mood) {
    case "correct":
    case "celebrating":
      return "\u2B50";
    case "incorrect":
      return "\u{1F4AA}";
    case "encouraging":
      return "\u{1F4AC}";
    case "thinking":
      return "\u{1F4AD}";
    default:
      return "";
  }
}

function getMoodStyle(mood: CompanionMood) {
  switch (mood) {
    case "correct":
    case "celebrating":
      return styles.speechBubbleCorrect;
    case "incorrect":
      return styles.speechBubbleIncorrect;
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  avatarContainer: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: sizes.avatarMd / 2,
    backgroundColor: colors.avatarBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: sizes.emojiMd,
  },
  moodIndicator: {
    position: "absolute",
    bottom: -spacing.xxs,
    right: -spacing.xxs,
    fontSize: sizes.emojiSm,
  },
  speechBubble: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderTopLeftRadius: radii.xs,
    backgroundColor: colors.speechBubbleDefault,
  },
  speechBubbleCorrect: {
    backgroundColor: colors.speechBubbleCorrect,
  },
  speechBubbleIncorrect: {
    backgroundColor: colors.speechBubbleIncorrect,
  },
  characterName: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  message: {
    fontSize: fontSizes.md,
    lineHeight: 20,
    color: colors.slate700,
  },
});

export default CharacterCompanion;
