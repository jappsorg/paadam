import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { adaptivePlannerService } from '@/services/AdaptivePlannerService';
import { StorageService } from '@/services/StorageService';
import { discoveryQuestService } from '@/services/DiscoveryQuestService';
import { studentProfileService } from '@/services/StudentProfileService';
import { sessionService } from '@/services/SessionService';
import { colors } from '@/theme';

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: '🦉', max: '🐶', luna: '🐱',
};

export default function ExploreScreen() {
  const { selectedStudent, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasGenerated = useRef(false);

  const characterEmoji = CHARACTER_EMOJIS[selectedStudent?.selectedCharacterId || 'ada'] || '🦉';

  // Auto-start generation when screen becomes active
  useEffect(() => {
    const isActive = pathname === '/explore';
    if (isActive && selectedStudent && currentUser && !hasGenerated.current && !generating) {
      hasGenerated.current = true;
      handleGenerate();
    }
    // Reset when navigating away so next visit triggers generation
    if (!isActive) {
      hasGenerated.current = false;
      setError(null);
    }
  }, [pathname, selectedStudent, currentUser]);

  if (!selectedStudent || !currentUser) {
    if (pathname !== '/explore') return null;
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.teal400} />
      </View>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const studentId = selectedStudent.id;

      // Check if student needs discovery quest (< 3 worksheets completed)
      let profile: any = null;
      try {
        profile = await studentProfileService.getProfile(studentId);
      } catch (profileErr) {
        console.warn('[Explore] Could not load profile:', profileErr);
      }
      const worksheetsCompleted = profile?.worksheetsCompleted ?? 0;
      const phase = discoveryQuestService.getDiscoveryPhase(worksheetsCompleted);

      let result;
      if (phase !== 'complete') {
        // Discovery quest: deterministic plan, then generate worksheet
        const plan = discoveryQuestService.generateDiscoveryPlan(
          studentId,
          selectedStudent.grade || profile?.grade || '1',
          selectedStudent.selectedCharacterId || 'ada',
          phase,
          profile?.favoriteThemes || ['animals'],
          null,
        );
        const worksheet = await adaptivePlannerService.generateWorksheet(plan);
        result = { plan, worksheet };
      } else {
        // Normal adaptive pipeline
        result = await adaptivePlannerService.generateAdaptiveWorksheet(studentId);
      }

      // Convert to standard format
      const adaptiveQuestions = result.worksheet.questions.map((q: any, i: number) => ({
        id: `q_${i}`,
        question: q.question,
        answer: q.answer,
        explanation: q.explanation,
      }));

      // Start session
      try {
        await sessionService.startSession(studentId, selectedStudent.selectedCharacterId || 'ada', result.plan.theme);
      } catch (sessionErr) {
        console.warn('[Explore] Could not start session:', sessionErr);
      }

      // Save to Firestore and navigate to attempt
      const config = {
        type: 'math' as const,
        subject: result.plan.subject as any,
        difficulty: result.plan.difficulty as any,
        grade: (selectedStudent.grade || '1') as any,
        questionsCount: adaptiveQuestions.length,
        includeAnswers: true,
      };

      const templateId = await StorageService.createWorksheetTemplate({
        title: result.worksheet.title,
        config,
        questions: adaptiveQuestions,
        createdBy: currentUser.uid,
        mode: 'explore',
      });

      const attemptId = await StorageService.startWorksheetAttempt(
        currentUser.uid,
        templateId,
        result.worksheet.title,
        adaptiveQuestions,
      );

      router.push(`/attempt/${attemptId}` as any);
    } catch (err: any) {
      console.error('[Explore] Generation error:', err);
      setError('Oops! Something went wrong. Let\'s try again!');
    } finally {
      setGenerating(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>😅</Text>
        <Text variant="titleMedium" style={styles.errorText}>{error}</Text>
        <Text
          variant="bodyMedium"
          style={styles.retryLink}
          onPress={handleGenerate}
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
    <View style={styles.container}>
      <Text style={styles.emoji}>{characterEmoji}</Text>
      <ActivityIndicator size="large" color={colors.teal400} style={{ marginTop: 16 }} />
      <Text variant="titleMedium" style={styles.loadingText}>
        Preparing your adventure...
      </Text>
      <Text variant="bodySmall" style={styles.loadingSubtext}>
        Finding something new for you!
      </Text>
      <Text
        variant="bodyMedium"
        style={styles.homeLink}
        onPress={() => { hasGenerated.current = false; router.replace('/'); }}
      >
        ← Back to Home
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, padding: 32,
  },
  emoji: { fontSize: 56 },
  loadingText: { marginTop: 16, color: colors.teal700, textAlign: 'center', fontWeight: '600' },
  loadingSubtext: { marginTop: 8, color: colors.textSecondary, textAlign: 'center' },
  errorText: { marginTop: 16, color: colors.coral500, textAlign: 'center' },
  retryLink: { marginTop: 20, color: colors.teal500, fontWeight: '600' },
  homeLink: { marginTop: 12, color: colors.textSecondary },
});
