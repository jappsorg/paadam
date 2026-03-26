import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SkillPracticeList } from '@/components/practice/SkillPracticeList';
import WorksheetService from '@/services/WorksheetService';
import { StorageService } from '@/services/StorageService';
import { colors } from '@/theme';
import { WorksheetConfig, WorksheetType } from '@/types/worksheet';

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: '🦉', max: '🐶', luna: '🐱',
};

const SKILL_TO_TYPE: Record<string, WorksheetType> = {
  addition: 'math', subtraction: 'math', multiplication: 'math', division: 'math',
  fractions: 'math', decimals: 'math', algebra: 'math',
  counting: 'math', money: 'math', time: 'math', measurement: 'math',
  patterns: 'logic', geometry: 'math',
};

const SKILL_TO_SUBJECT: Record<string, string> = {
  addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication',
  division: 'Division', fractions: 'Fractions', decimals: 'Decimals',
  geometry: 'Geometry', algebra: 'Algebra', patterns: 'Patterns',
  measurement: 'Measurement', time: 'Time', money: 'Money', counting: 'Addition',
};

export default function PracticeScreen() {
  const { selectedStudent, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when re-entering the screen
  useEffect(() => {
    if (pathname === '/practice') {
      setGenerating(false);
      setError(null);
    }
  }, [pathname]);

  if (!selectedStudent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold500} />
      </View>
    );
  }

  const characterEmoji = CHARACTER_EMOJIS[selectedStudent.selectedCharacterId || 'ada'] || '🦉';
  const skillsMastery = (selectedStudent as any).skillsMastery || (selectedStudent as any).skillMastery || {};
  const grade = selectedStudent.grade || '1';

  const generateForSkill = async (skillId: string) => {
    if (!currentUser) return;
    setGenerating(true);
    setError(null);
    try {
      const mastery = skillsMastery[skillId];
      const needsReview = mastery?.needsReview ?? false;
      const currentDiff = mastery?.currentDifficulty ?? 1;

      let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
      if (needsReview) {
        difficulty = currentDiff <= 2 ? 'easy' : currentDiff <= 4 ? 'easy' : 'medium';
      } else {
        difficulty = currentDiff <= 2 ? 'easy' : currentDiff <= 4 ? 'medium' : 'hard';
      }

      const config: WorksheetConfig = {
        type: SKILL_TO_TYPE[skillId] || 'math',
        subject: (SKILL_TO_SUBJECT[skillId] || 'Addition') as any,
        difficulty,
        grade: grade as any,
        questionsCount: 5,
        includeAnswers: true,
      };

      const worksheet = await WorksheetService.generateWorksheet(config);

      const templateId = await StorageService.createWorksheetTemplate({
        title: worksheet.title,
        config,
        questions: worksheet.questions,
        createdBy: currentUser.uid,
        mode: 'practice',
      });

      const attemptId = await StorageService.startWorksheetAttempt(
        currentUser.uid,
        templateId,
        worksheet.title,
        worksheet.questions,
      );

      router.push(`/attempt/${attemptId}` as any);
    } catch (err: any) {
      console.error('[Practice] Generation error:', err);
      setError('Something went wrong. Try again!');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickPractice = () => {
    const skills = Object.entries(skillsMastery);
    const reviewSkill = skills.find(([, s]: [string, any]) => s.needsReview);
    if (reviewSkill) {
      generateForSkill(reviewSkill[0]);
      return;
    }
    const lowest = skills.sort(
      ([, a]: [string, any], [, b]: [string, any]) =>
        (a.masteryLevel ?? 0) - (b.masteryLevel ?? 0)
    )[0];
    if (lowest) {
      generateForSkill(lowest[0]);
    } else {
      generateForSkill('addition');
    }
  };

  if (generating) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>{characterEmoji}</Text>
        <ActivityIndicator size="large" color={colors.gold500} style={{ marginTop: 16 }} />
        <Text variant="titleMedium" style={styles.loadingText}>
          Getting your practice ready...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>😅</Text>
        <Text variant="titleMedium" style={styles.errorText}>{error}</Text>
        <Text
          variant="bodyMedium"
          style={styles.retryLink}
          onPress={() => setError(null)}
        >
          Try again
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.homeLink}
          onPress={() => router.replace('/')}
        >
          Back to Home
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text
          variant="bodyMedium"
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          ← Back
        </Text>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          🎯 Practice
        </Text>
      </View>

      <SkillPracticeList
        skillsMastery={skillsMastery}
        grade={grade}
        characterEmoji={characterEmoji}
        onSkillPress={generateForSkill}
        onQuickPractice={handleQuickPractice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: colors.gold50,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  backButton: { color: colors.gold500, marginBottom: 8 },
  headerTitle: { fontWeight: '700', color: colors.gold700 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, padding: 32,
  },
  loadingEmoji: { fontSize: 48 },
  loadingText: { marginTop: 12, color: colors.textSecondary, textAlign: 'center' },
  errorText: { marginTop: 12, color: colors.coral500, textAlign: 'center' },
  retryLink: { marginTop: 16, color: colors.gold500, fontWeight: '600' },
  homeLink: { marginTop: 12, color: colors.textSecondary },
});
