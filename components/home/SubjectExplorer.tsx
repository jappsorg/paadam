import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';
import { getAgeBand } from '@/utils/ageBand';

interface SubjectCard {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  gradeBands: ('k1' | '23' | '45')[];
}

const ALL_SUBJECTS: SubjectCard[] = [
  // Math foundations
  { id: 'math', label: 'Math', emoji: '🔢', color: '#E85D4A', bgColor: '#FEE2E2', gradeBands: ['k1', '23', '45'] },
  // Life skill domains
  { id: 'money', label: 'Money', emoji: '💰', color: '#D97706', bgColor: '#FEF3C7', gradeBands: ['k1', '23', '45'] },
  { id: 'cooking', label: 'Cooking', emoji: '🍳', color: '#DC2626', bgColor: '#FEE2E2', gradeBands: ['23', '45'] },
  { id: 'time', label: 'Time', emoji: '⏰', color: '#2563EB', bgColor: '#DBEAFE', gradeBands: ['k1', '23', '45'] },
  // K-1 friendly
  { id: 'animals', label: 'Animals', emoji: '🦁', color: '#B45309', bgColor: '#FEF3C7', gradeBands: ['k1', '23'] },
  { id: 'nature', label: 'Nature', emoji: '🌿', color: '#059669', bgColor: '#D1FAE5', gradeBands: ['k1', '23', '45'] },
  // Older grades
  { id: 'nutrition', label: 'Nutrition', emoji: '🥗', color: '#10B981', bgColor: '#D1FAE5', gradeBands: ['23', '45'] },
  { id: 'shopping', label: 'Shopping', emoji: '🛒', color: '#7C3AED', bgColor: '#EDE9FE', gradeBands: ['23', '45'] },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: '#0891B2', bgColor: '#CFFAFE', gradeBands: ['k1', '23', '45'] },
  { id: 'space', label: 'Space', emoji: '🚀', color: '#4F46E5', bgColor: '#E0E7FF', gradeBands: ['23', '45'] },
  { id: 'puzzles', label: 'Puzzles', emoji: '🧩', color: '#9333EA', bgColor: '#F3E8FF', gradeBands: ['k1', '23', '45'] },
  { id: 'science', label: 'Science', emoji: '🔬', color: '#0D9488', bgColor: '#CCFBF1', gradeBands: ['45'] },
];

interface SubjectExplorerProps {
  grade: string;
  onSubjectPress?: (subjectId: string) => void;
}

export function SubjectExplorer({ grade, onSubjectPress }: SubjectExplorerProps) {
  const router = useRouter();
  const ageBand = getAgeBand(grade);

  const visibleSubjects = ALL_SUBJECTS.filter((s) => s.gradeBands.includes(ageBand));

  const handlePress = (subject: SubjectCard) => {
    if (onSubjectPress) {
      onSubjectPress(subject.id);
    } else {
      // Navigate to Explore with this subject as theme context
      router.push('/explore' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to learn?</Text>
      <Text style={styles.subtitle}>Tap a topic to start exploring</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleSubjects.map((subject) => (
          <Pressable
            key={subject.id}
            onPress={() => handlePress(subject)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: subject.bgColor, borderColor: subject.color + '40' },
              pressed && styles.cardPressed,
            ]}
          >
            <Text style={styles.cardEmoji}>{subject.emoji}</Text>
            <Text style={[styles.cardLabel, { color: subject.color }]}>
              {subject.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: 88,
    height: 88,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
