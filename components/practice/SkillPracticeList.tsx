import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@/theme';

const gradeSkillOrder: Record<string, string[]> = {
  K: ['counting', 'addition', 'subtraction', 'patterns', 'geometry'],
  '1': ['addition', 'subtraction', 'patterns', 'measurement', 'time', 'geometry'],
  '2': ['addition', 'subtraction', 'multiplication', 'measurement', 'time', 'money', 'geometry'],
  '3': ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'measurement', 'geometry'],
  '4': ['multiplication', 'division', 'fractions', 'decimals', 'geometry', 'measurement', 'algebra'],
  '5': ['fractions', 'decimals', 'multiplication', 'division', 'geometry', 'algebra', 'measurement'],
};

const skillEmojis: Record<string, string> = {
  addition: '➕', subtraction: '➖', multiplication: '✖️', division: '➗',
  fractions: '🍕', decimals: '🔢', geometry: '📐', algebra: '📔',
  patterns: '🔄', measurement: '📏', time: '🕐', money: '💰', counting: '🔢',
};

interface SkillMasteryData {
  masteryLevel?: number;
  needsReview?: boolean;
  currentDifficulty?: number;
  questionsAttempted?: number;
}

interface SkillPracticeListProps {
  skillsMastery: Record<string, SkillMasteryData>;
  grade: string;
  characterEmoji: string;
  onSkillPress: (skillId: string) => void;
  onQuickPractice: () => void;
}

export function SkillPracticeList({
  skillsMastery,
  grade,
  characterEmoji,
  onSkillPress,
  onQuickPractice,
}: SkillPracticeListProps) {
  const skills = gradeSkillOrder[grade] || gradeSkillOrder['1'];
  const urgentSkill = skills.find((s) => skillsMastery[s]?.needsReview);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Pressable
        onPress={onQuickPractice}
        style={({ pressed }) => [styles.quickButton, pressed && styles.quickButtonPressed]}
      >
        <Text style={styles.quickButtonText}>⚡ Quick Practice</Text>
        <Text style={styles.quickButtonSubtext}>
          {urgentSkill
            ? `Work on ${urgentSkill}`
            : 'Strengthen your weakest skill'}
        </Text>
      </Pressable>

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Pick a skill to practice
      </Text>

      {skills.map((skillId) => {
        const mastery = skillsMastery[skillId];
        const masteryLevel = mastery?.masteryLevel ?? 0;
        const needsReview = mastery?.needsReview ?? false;
        const hasData = mastery?.questionsAttempted ? mastery.questionsAttempted > 0 : false;
        const isUrgent = skillId === urgentSkill;

        return (
          <Pressable
            key={skillId}
            onPress={() => onSkillPress(skillId)}
            style={({ pressed }) => [
              styles.skillRow,
              pressed && styles.skillRowPressed,
              isUrgent && styles.skillRowUrgent,
            ]}
          >
            <Text style={styles.skillEmoji}>{skillEmojis[skillId] || '📚'}</Text>

            <View style={styles.skillInfo}>
              <View style={styles.skillNameRow}>
                <Text variant="bodyMedium" style={styles.skillName}>
                  {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                </Text>
                {needsReview && <View style={styles.reviewDot} />}
              </View>

              <View style={styles.masteryBarBg}>
                <View
                  style={[
                    styles.masteryBarFill,
                    {
                      width: `${masteryLevel}%`,
                      backgroundColor: needsReview
                        ? colors.gold500
                        : masteryLevel >= 80
                          ? colors.green500
                          : colors.teal400,
                    },
                  ]}
                />
              </View>

              <Text variant="labelSmall" style={styles.masteryText}>
                {hasData ? `${Math.round(masteryLevel)}%` : 'Not started'}
              </Text>
            </View>

            {isUrgent && (
              <Text style={styles.characterIndicator}>{characterEmoji}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  quickButton: {
    backgroundColor: colors.gold500,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  quickButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  quickButtonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  quickButtonSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: { color: colors.textSecondary, marginBottom: 12, marginLeft: 4 },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  skillRowPressed: { opacity: 0.85 },
  skillRowUrgent: { borderWidth: 1.5, borderColor: colors.gold400 },
  skillEmoji: { fontSize: 28, marginRight: 14 },
  skillInfo: { flex: 1 },
  skillNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  skillName: { fontWeight: '600' },
  reviewDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.gold500,
    marginLeft: 8,
  },
  masteryBarBg: {
    height: 6, borderRadius: 3,
    backgroundColor: colors.sand200,
    overflow: 'hidden',
  },
  masteryBarFill: { height: '100%', borderRadius: 3 },
  masteryText: { color: colors.textSecondary, marginTop: 4 },
  characterIndicator: { fontSize: 24, marginLeft: 8 },
});
