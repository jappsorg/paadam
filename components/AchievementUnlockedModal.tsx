/**
 * Achievement Unlocked Modal
 *
 * Celebratory modal shown when a student earns one or more achievements.
 * Shows achievements one at a time with tier-colored borders,
 * the achievement emoji, name, description, and the character buddy celebrating.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Confetti } from "@/components/ui";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";
import type { AchievementDefinition } from "@/services/AchievementService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Tier Colors ───
const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
};

const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

// ─── Character buddy celebrating emojis ───
const BUDDY_CELEBRATIONS = [
  "\u{1F389}", // party popper
  "\u{1F973}", // partying face
  "\u{1F38A}", // confetti ball
  "\u{1F60D}", // heart eyes
];

interface AchievementUnlockedModalProps {
  visible: boolean;
  achievements: AchievementDefinition[];
  buddyEmoji?: string; // the student's character emoji
  onDismiss: () => void;
}

export function AchievementUnlockedModal({
  visible,
  achievements,
  buddyEmoji = "\u{1F989}", // default owl
  onDismiss,
}: AchievementUnlockedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation values
  const scale = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const badgeRotate = useSharedValue(0);

  const achievement = achievements[currentIndex];
  const isLast = currentIndex >= achievements.length - 1;
  const tierColor = achievement ? TIER_COLORS[achievement.tier] || TIER_COLORS.bronze : TIER_COLORS.bronze;

  useEffect(() => {
    if (visible && achievement) {
      setShowConfetti(true);

      // Card entrance animation
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });

      // Emoji bounce
      emojiScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 8, stiffness: 150 }),
          withSpring(1, { damping: 10, stiffness: 120 }),
        ),
      );

      // Badge shimmer rotation
      badgeRotate.value = withDelay(
        100,
        withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
          withTiming(-3, { duration: 80 }),
          withTiming(3, { duration: 80 }),
          withTiming(0, { duration: 60 }),
        ),
      );
    } else {
      scale.value = 0;
      emojiScale.value = 0;
      badgeRotate.value = 0;
      setShowConfetti(false);
    }
  }, [visible, currentIndex]);

  // Reset index when modal opens with new achievements
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${badgeRotate.value}deg` }],
  }));

  const handleNext = () => {
    // Reset animations for transition
    scale.value = 0;
    emojiScale.value = 0;
    badgeRotate.value = 0;
    setShowConfetti(false);

    if (isLast) {
      onDismiss();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!visible || achievements.length === 0 || !achievement) {
    return null;
  }

  const celebrationEmoji =
    BUDDY_CELEBRATIONS[currentIndex % BUDDY_CELEBRATIONS.length];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Confetti trigger={showConfetti} />

        <Animated.View style={[styles.card, cardStyle]}>
          {/* Tier-colored border accent */}
          <View style={[styles.tierStripe, { backgroundColor: tierColor }]} />

          {/* Buddy celebrating */}
          <View style={styles.buddyRow}>
            <Text style={styles.buddyEmoji}>{buddyEmoji}</Text>
            <Text style={styles.celebrationEmoji}>{celebrationEmoji}</Text>
          </View>

          {/* Achievement unlocked label */}
          <Text style={styles.unlockedLabel}>Achievement Unlocked!</Text>

          {/* Achievement emoji */}
          <Animated.View style={[styles.emojiContainer, emojiStyle]}>
            <Animated.View style={badgeStyle}>
              <View
                style={[
                  styles.emojiBadge,
                  { borderColor: tierColor, shadowColor: tierColor },
                ]}
              >
                <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Achievement info */}
          <Text style={styles.achievementName}>{achievement.name}</Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.tierBadgeText}>
              {TIER_LABELS[achievement.tier] || achievement.tier}
            </Text>
          </View>

          {/* Progress indicator for multiple achievements */}
          {achievements.length > 1 && (
            <View style={styles.dotsRow}>
              {achievements.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex
                      ? { backgroundColor: tierColor }
                      : { backgroundColor: colors.sand200 },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Action button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: tierColor },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {isLast ? "Awesome!" : "Next"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    paddingTop: spacing.lg,
    alignItems: "center",
    width: Math.min(SCREEN_WIDTH - spacing.xl * 2, 360),
    overflow: "hidden",
  },
  tierStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  buddyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  buddyEmoji: {
    fontSize: 36,
  },
  celebrationEmoji: {
    fontSize: 28,
  },
  unlockedLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  emojiContainer: {
    marginBottom: spacing.lg,
  },
  emojiBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    // Shadow for glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  achievementEmoji: {
    fontSize: 48,
  },
  achievementName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  tierBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginBottom: spacing.lg,
  },
  tierBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: "100%",
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
