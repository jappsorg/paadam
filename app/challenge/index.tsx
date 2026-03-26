import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import WorksheetService from '@/services/WorksheetService';
import { StorageService } from '@/services/StorageService';
import { colors } from '@/theme';
import {
  WorksheetType, WorksheetConfig, WorksheetGrade, WorksheetDifficulty,
  WORKSHEET_TYPE_LABELS, WORKSHEET_DIFFICULTIES,
  GRADE_SUBJECT_MAP, MathSubject,
} from '@/types/worksheet';

const TYPE_CARDS: { id: WorksheetType; title: string; icon: string; color: string }[] = [
  { id: 'math', title: 'Math Practice', icon: '🔢', color: colors.coral400 },
  { id: 'puzzle', title: 'Math Puzzles', icon: '🧩', color: colors.violet400 },
  { id: 'word-problem', title: 'Word Problems', icon: '📝', color: colors.teal400 },
  { id: 'logic', title: 'Brain Teasers', icon: '🕵️', color: colors.gold500 },
];

export default function ChallengeScreen() {
  const { selectedStudent, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const defaultGrade = (selectedStudent?.grade || '1') as WorksheetGrade;

  const [step, setStep] = useState<'type' | 'config'>('type');
  const [selectedType, setSelectedType] = useState<WorksheetType>('math');
  const [grade, setGrade] = useState<WorksheetGrade>(defaultGrade);
  const [difficulty, setDifficulty] = useState<WorksheetDifficulty>('easy');
  const [subject, setSubject] = useState<MathSubject>('Addition');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to type selection when re-entering the screen
  useEffect(() => {
    if (pathname === '/challenge') {
      setStep('type');
      setError(null);
      setGenerating(false);
    }
  }, [pathname]);

  if (!selectedStudent || !currentUser) {
    router.replace('/');
    return null;
  }

  const availableSubjects = GRADE_SUBJECT_MAP[grade] || GRADE_SUBJECT_MAP['1'];

  const handleTypeSelect = (type: WorksheetType) => {
    setSelectedType(type);
    setStep('config');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const config: WorksheetConfig = {
        type: selectedType,
        subject,
        difficulty,
        grade,
        questionsCount,
        includeAnswers: true,
      };

      const worksheet = await WorksheetService.generateWorksheet(config);

      const templateId = await StorageService.createWorksheetTemplate({
        title: worksheet.title,
        config,
        questions: worksheet.questions,
        createdBy: currentUser.uid,
        mode: 'challenge',
      });

      const attemptId = await StorageService.startWorksheetAttempt(
        currentUser.uid,
        templateId,
        worksheet.title,
        worksheet.questions,
      );

      router.push(`/attempt/${attemptId}` as any);
    } catch (err: any) {
      console.error('[Challenge] Generation error:', err);
      setError('Something went wrong. Try again!');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emoji}>⚡</Text>
        <ActivityIndicator size="large" color={colors.violet400} style={{ marginTop: 16 }} />
        <Text variant="titleMedium" style={styles.loadingText}>
          Building your challenge...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emoji}>😅</Text>
        <Text variant="titleMedium" style={styles.errorText}>{error}</Text>
        <Text variant="bodyMedium" style={styles.retryLink} onPress={() => setError(null)}>
          Try again
        </Text>
        <Text variant="bodyMedium" style={styles.homeLink} onPress={() => router.replace('/')}>
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
          onPress={() => step === 'config' ? setStep('type') : router.replace('/')}
        >
          ← {step === 'config' ? 'Change type' : 'Back'}
        </Text>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          ⚡ Challenge
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'type' && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              What do you want to work on?
            </Text>
            {TYPE_CARDS.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => handleTypeSelect(card.id)}
                style={({ pressed }) => [styles.typeCard, pressed && styles.typeCardPressed]}
              >
                <View style={[styles.typeAccent, { backgroundColor: card.color }]} />
                <View style={[styles.typeIconCircle, { backgroundColor: card.color + '20' }]}>
                  <Text style={styles.typeIcon}>{card.icon}</Text>
                </View>
                <Text variant="titleMedium" style={[styles.typeTitle, { color: card.color }]}>
                  {card.title}
                </Text>
                <Text style={styles.typeArrow}>›</Text>
              </Pressable>
            ))}
          </>
        )}

        {step === 'config' && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Set up your {WORKSHEET_TYPE_LABELS[selectedType]}
            </Text>

            <Text variant="labelLarge" style={styles.fieldLabel}>Topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {availableSubjects.map((s: string) => (
                <Pressable
                  key={s}
                  onPress={() => setSubject(s as MathSubject)}
                  style={[
                    styles.chip,
                    subject === s && { backgroundColor: colors.violet400 },
                  ]}
                >
                  <Text style={[styles.chipText, subject === s && { color: '#fff' }]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text variant="labelLarge" style={styles.fieldLabel}>Difficulty</Text>
            <SegmentedButtons
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as WorksheetDifficulty)}
              buttons={WORKSHEET_DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
              style={styles.segmented}
            />

            <Text variant="labelLarge" style={styles.fieldLabel}>Questions</Text>
            <SegmentedButtons
              value={String(questionsCount)}
              onValueChange={(v) => setQuestionsCount(Number(v))}
              buttons={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '15', label: '15' },
              ]}
              style={styles.segmented}
            />

            <Pressable
              onPress={handleGenerate}
              style={({ pressed }) => [styles.generateButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.generateButtonText}>Let's Go! ⚡</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: colors.violet50,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  backButton: { color: colors.violet400, marginBottom: 8 },
  headerTitle: { fontWeight: '700', color: colors.violet700 },
  content: { padding: 20 },
  sectionTitle: { fontWeight: '700', marginBottom: 16 },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, padding: 32,
  },
  emoji: { fontSize: 48 },
  loadingText: { marginTop: 12, color: colors.textSecondary, textAlign: 'center' },
  errorText: { marginTop: 12, color: colors.coral500, textAlign: 'center' },
  retryLink: { marginTop: 16, color: colors.violet400, fontWeight: '600' },
  homeLink: { marginTop: 12, color: colors.textSecondary },
  typeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
    overflow: 'hidden',
  },
  typeCardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  typeAccent: {
    width: 5, position: 'absolute', left: 0, top: 0, bottom: 0,
  },
  typeIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  typeIcon: { fontSize: 24 },
  typeTitle: { flex: 1, marginLeft: 14, fontWeight: '600' },
  typeArrow: { fontSize: 24, color: colors.textSecondary },
  fieldLabel: { marginTop: 20, marginBottom: 8, color: colors.textSecondary },
  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: colors.sand200,
    marginRight: 8,
  },
  chipText: { fontWeight: '500', color: colors.textPrimary },
  segmented: { marginBottom: 4 },
  generateButton: {
    backgroundColor: colors.violet400,
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 28,
  },
  generateButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
