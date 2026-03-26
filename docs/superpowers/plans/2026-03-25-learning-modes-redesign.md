# Learning Modes Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 4 worksheet-type cards and Worksheet tab with 3 intent-based learning modes (Practice, Explore, Challenge) on the Home screen.

**Architecture:** New `ModeCard` component replaces `WorksheetCard` on Home. Three new route screens (`practice/`, `explore/`, `challenge/`) handle each mode's flow. A `modeSuggestion` utility provides client-side character recommendations. The existing `[type]/index.tsx` is refactored into the Challenge screen. Practice gets a new `SkillPracticeList` component. Explore reuses `AdaptivePlannerService`.

**Tech Stack:** React Native / Expo Router / TypeScript / React Native Paper / Firebase Firestore

**Spec:** `docs/superpowers/specs/2026-03-25-learning-modes-redesign.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `types/modes.ts` | `WorksheetMode` type, mode config constants (colors, icons, labels) |
| `utils/ageBand.ts` | `getAgeBand(grade)` utility returning `'k1' \| '23' \| '45'` |
| `utils/modeSuggestion.ts` | `getSuggestion()` — client-side mode recommendation engine |
| `components/home/ModeCard.tsx` | Mode card with accent strip, icon, title, subtitle, character highlight |
| `components/home/AdventureBanner.tsx` | Active narrative arc continuation banner |
| `components/practice/SkillPracticeList.tsx` | Vertical skill list for Practice mode |
| `app/practice/index.tsx` | Practice mode screen |
| `app/explore/index.tsx` | Explore mode screen |
| `app/challenge/index.tsx` | Challenge mode screen (refactored from `[type]/index.tsx`) |

### Modified Files
| File | Changes |
|------|---------|
| `types/worksheet.ts` | Add `WorksheetMode` type export |
| `services/StorageService.ts` | Add optional `mode` field to `WorksheetTemplate` and `WorksheetAttempt` |
| `app/_layout.tsx` | Remove `[type]/index` tab, add `practice`, `explore`, `challenge` as `href: null` screens |
| `app/index.tsx` | Replace worksheet cards with mode cards, add adventure banner, wire tappable skill journey |
| `components/home/SkillJourney.tsx` | Add `onSkillPress` callback prop |

---

## Task 1: Types and Utilities

**Files:**
- Create: `types/modes.ts`
- Create: `utils/ageBand.ts`
- Modify: `types/worksheet.ts`

- [ ] **Step 1: Add WorksheetMode to types/worksheet.ts**

Add after the `WorksheetDifficulty` type definition (line 3):

```typescript
export type WorksheetMode = 'practice' | 'explore' | 'challenge';
```

- [ ] **Step 2: Create types/modes.ts with mode config constants**

```typescript
import { WorksheetMode } from './worksheet';

export interface ModeConfig {
  id: WorksheetMode;
  title: string;
  subtitle: string;
  icon: string;       // MaterialCommunityIcons name
  emoji: string;
  accentColor: string; // color token key
  lightColor: string;
  characterMood: 'encouraging' | 'excited' | 'thinking';
}

// Import actual color values from theme
import { colors } from '@/theme';

export const MODE_CONFIGS: Record<WorksheetMode, ModeConfig> = {
  practice: {
    id: 'practice',
    title: 'Practice',
    subtitle: 'Get stronger at what you know',
    icon: 'target',
    emoji: '🎯',
    accentColor: colors.gold500,
    lightColor: colors.gold50,
    characterMood: 'encouraging',
  },
  explore: {
    id: 'explore',
    title: 'Explore',
    subtitle: 'Discover something new!',
    icon: 'compass-outline',
    emoji: '🧭',
    accentColor: colors.teal400,
    lightColor: colors.teal50,
    characterMood: 'excited',
  },
  challenge: {
    id: 'challenge',
    title: 'Challenge',
    subtitle: 'Build your own worksheet',
    icon: 'lightning-bolt',
    emoji: '⚡',
    accentColor: colors.violet400,
    lightColor: colors.violet50,
    characterMood: 'thinking',
  },
};

export const MODE_ORDER: WorksheetMode[] = ['practice', 'explore', 'challenge'];
```

- [ ] **Step 3: Create utils/ageBand.ts**

```typescript
export type AgeBand = 'k1' | '23' | '45';

export function getAgeBand(grade: string): AgeBand {
  if (grade === 'K' || grade === '1') return 'k1';
  if (grade === '2' || grade === '3') return '23';
  return '45';
}
```

- [ ] **Step 4: Add mode field to StorageService interfaces**

In `services/StorageService.ts`, add to `WorksheetTemplate` interface (after `version?: number;` around line 29):

```typescript
mode?: 'practice' | 'explore' | 'challenge';
```

Add to `WorksheetAttempt` interface (after `completedAt?: Timestamp;` around line 59):

```typescript
mode?: 'practice' | 'explore' | 'challenge';
```

- [ ] **Step 5: Commit**

```bash
git add types/modes.ts types/worksheet.ts utils/ageBand.ts services/StorageService.ts
git commit -m "feat: add learning mode types, age band utility, mode field to storage"
```

---

## Task 2: Mode Suggestion Engine

**Files:**
- Create: `utils/modeSuggestion.ts`

- [ ] **Step 1: Create the suggestion engine**

```typescript
import { WorksheetMode } from '@/types/worksheet';

interface SuggestionInput {
  completedWorksheetCount: number;
  averageScore: number;           // 0-100, from recent worksheets
  skillsMastery: Record<string, { needsReview?: boolean; masteryLevel?: number }>;
  currentStreak: number;
  recentAccuracy: number;         // 0-100, last 3 worksheets
  dispositionConfidence?: number;
  challengeSeeking?: number;      // 0-10
}

export interface ModeSuggestion {
  mode: WorksheetMode;
  reason: string;          // character speech bubble text
  skillName?: string;      // specific skill to mention (Practice)
}

export function getSuggestion(input: SuggestionInput): ModeSuggestion {
  const {
    completedWorksheetCount,
    averageScore,
    skillsMastery,
    currentStreak,
    recentAccuracy,
    dispositionConfidence,
    challengeSeeking,
  } = input;

  // Tier 1: 0-2 completed worksheets
  if (completedWorksheetCount <= 2) {
    if (completedWorksheetCount >= 1 && averageScore < 70) {
      return {
        mode: 'practice',
        reason: "Let's practice what we tried last time!",
      };
    }
    return {
      mode: 'explore',
      reason: "Let's discover something fun together!",
    };
  }

  // Find skills needing review
  const reviewSkills = Object.entries(skillsMastery)
    .filter(([, s]) => s.needsReview)
    .sort((a, b) => (a[1].masteryLevel ?? 0) - (b[1].masteryLevel ?? 0));

  // Tier 3: 8+ worksheets with confident disposition data
  if (
    completedWorksheetCount >= 8 &&
    dispositionConfidence !== undefined &&
    dispositionConfidence >= 0.5 &&
    challengeSeeking !== undefined
  ) {
    if (challengeSeeking >= 7 && recentAccuracy >= 80) {
      return {
        mode: 'challenge',
        reason: "You're on fire! Ready to test yourself?",
      };
    }
  }

  // Tier 2: 3+ worksheets
  if (reviewSkills.length >= 2) {
    const skillName = reviewSkills[0][0];
    return {
      mode: 'practice',
      reason: `Your ${skillName} could use some love!`,
      skillName,
    };
  }

  if (currentStreak >= 3 && recentAccuracy >= 80) {
    return {
      mode: 'challenge',
      reason: "You're on a roll! Ready for a challenge?",
    };
  }

  return {
    mode: 'explore',
    reason: "Let's explore something new today!",
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/modeSuggestion.ts
git commit -m "feat: add client-side mode suggestion engine"
```

---

## Task 3: ModeCard Component

**Files:**
- Create: `components/home/ModeCard.tsx`

- [ ] **Step 1: Create the ModeCard component**

Follow the existing `WorksheetCard` accent-strip pattern but larger, with character highlight support.

```typescript
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ModeConfig } from '@/types/modes';
import { colors } from '@/theme';

interface ModeCardProps {
  mode: ModeConfig;
  characterEmoji?: string;       // show character avatar if this is the suggested mode
  characterMessage?: string;     // speech bubble text
  onPress?: () => void;
}

export function ModeCard({ mode, characterEmoji, characterMessage, onPress }: ModeCardProps) {
  const router = useRouter();
  const isHighlighted = !!characterEmoji;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/${mode.id}` as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        isHighlighted && { borderColor: mode.accentColor, borderWidth: 2 },
      ]}
    >
      {/* Character speech bubble */}
      {isHighlighted && characterMessage && (
        <View style={[styles.speechBubble, { backgroundColor: mode.lightColor }]}>
          <Text variant="bodySmall" style={{ color: mode.accentColor }}>
            {characterEmoji} {characterMessage}
          </Text>
        </View>
      )}

      <View style={styles.cardContent}>
        {/* Accent strip */}
        <View style={[styles.accentStrip, { backgroundColor: mode.accentColor }]} />

        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: mode.lightColor }]}>
          <Text style={styles.iconEmoji}>{mode.emoji}</Text>
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          <Text variant="titleMedium" style={[styles.title, { color: mode.accentColor }]}>
            {mode.title}
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {mode.subtitle}
          </Text>
        </View>

        {/* Arrow */}
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  speechBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accentStrip: {
    width: 5,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconEmoji: {
    fontSize: 28,
  },
  textContent: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/home/ModeCard.tsx
git commit -m "feat: add ModeCard component with character highlight"
```

---

## Task 4: AdventureBanner Component

**Files:**
- Create: `components/home/AdventureBanner.tsx`

- [ ] **Step 1: Create the AdventureBanner**

This shows when an Explore narrative arc is in progress.

```typescript
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';

interface AdventureBannerProps {
  characterEmoji: string;
  arcTitle: string;
  currentBeat: number;
  totalBeats: number;
}

export function AdventureBanner({
  characterEmoji,
  arcTitle,
  currentBeat,
  totalBeats,
}: AdventureBannerProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/explore' as any)}
      style={({ pressed }) => [styles.banner, pressed && styles.bannerPressed]}
    >
      <Text style={styles.emoji}>{characterEmoji}</Text>
      <View style={styles.textContent}>
        <Text variant="titleSmall" style={styles.title}>
          Continue your adventure!
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {arcTitle} — Chapter {currentBeat} of {totalBeats}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.teal50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.teal300,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 16,
  },
  bannerPressed: {
    opacity: 0.85,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    color: colors.teal700,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.teal500,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: colors.teal400,
    fontWeight: '700',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/home/AdventureBanner.tsx
git commit -m "feat: add AdventureBanner component for active narrative arcs"
```

---

## Task 5: SkillPracticeList Component

**Files:**
- Create: `components/practice/SkillPracticeList.tsx`

- [ ] **Step 1: Create the SkillPracticeList**

Vertical skill list for Practice mode. Reads `skillsMastery` and grade to show skills with mastery bars and `needsReview` indicators.

```typescript
import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@/theme';

// Reuse skill order and emojis from SkillJourney
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

  // Find most urgent review skill
  const urgentSkill = skills.find((s) => skillsMastery[s]?.needsReview);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Quick Practice button */}
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

      {/* Skill list */}
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
            {/* Emoji */}
            <Text style={styles.skillEmoji}>{skillEmojis[skillId] || '📚'}</Text>

            {/* Name + mastery bar */}
            <View style={styles.skillInfo}>
              <View style={styles.skillNameRow}>
                <Text variant="bodyMedium" style={styles.skillName}>
                  {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                </Text>
                {needsReview && <View style={styles.reviewDot} />}
              </View>

              {/* Mastery bar */}
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

            {/* Character indicator for urgent skill */}
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
```

- [ ] **Step 2: Commit**

```bash
git add components/practice/SkillPracticeList.tsx
git commit -m "feat: add SkillPracticeList component for Practice mode"
```

---

## Task 6: Make SkillJourney Tappable

**Files:**
- Modify: `components/home/SkillJourney.tsx`

- [ ] **Step 1: Add onSkillPress prop**

Add to the `Props` interface (around line 13):

```typescript
interface Props {
  skills: Record<string, any>;
  grade?: string;
  onSkillPress?: (skillId: string) => void;  // NEW
}
```

- [ ] **Step 2: Wrap skill nodes in Pressable**

Find the node rendering section (the `View` that renders each skill circle). Wrap it in a `Pressable` that calls `onSkillPress` when the skill is not locked:

Replace the outer `View` for each node with:

```typescript
<Pressable
  key={node.id}
  onPress={() => node.state !== 'locked' && onSkillPress?.(node.id)}
  disabled={node.state === 'locked'}
  style={({ pressed }) => [
    pressed && node.state !== 'locked' && { opacity: 0.7, transform: [{ scale: 0.95 }] },
  ]}
>
  {/* existing node content */}
</Pressable>
```

- [ ] **Step 3: Commit**

```bash
git add components/home/SkillJourney.tsx
git commit -m "feat: make SkillJourney nodes tappable with onSkillPress callback"
```

---

## Task 7: Practice Mode Screen

**Files:**
- Create: `app/practice/index.tsx`

- [ ] **Step 1: Create the Practice screen**

This screen shows the `SkillPracticeList` and handles worksheet generation when a skill is tapped.

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SkillPracticeList } from '@/components/practice/SkillPracticeList';
import WorksheetService from '@/services/WorksheetService';
import { StorageService } from '@/services/StorageService';
import { colors } from '@/theme';
import { WorksheetConfig, WorksheetType } from '@/types/worksheet';

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: '🦉', max: '🐶', luna: '🐱',
};

// Map skill IDs to worksheet types
const SKILL_TO_TYPE: Record<string, WorksheetType> = {
  addition: 'math', subtraction: 'math', multiplication: 'math', division: 'math',
  fractions: 'math', decimals: 'math', algebra: 'math',
  counting: 'math', money: 'math', time: 'math', measurement: 'math',
  patterns: 'logic', geometry: 'math',
};

// Map skill IDs to MathSubject
const SKILL_TO_SUBJECT: Record<string, string> = {
  addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication',
  division: 'Division', fractions: 'Fractions', decimals: 'Decimals',
  geometry: 'Geometry', algebra: 'Algebra', patterns: 'Patterns',
  measurement: 'Measurement', time: 'Time', money: 'Money', counting: 'Addition',
};

export default function PracticeScreen() {
  const { selectedStudent } = useAuth();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedStudent) {
    router.replace('/');
    return null;
  }

  const characterEmoji = CHARACTER_EMOJIS[selectedStudent.selectedCharacterId || 'ada'] || '🦉';
  const skillsMastery = (selectedStudent as any).skillsMastery || (selectedStudent as any).skillMastery || {};
  const grade = selectedStudent.grade || '1';

  const generateForSkill = async (skillId: string) => {
    setGenerating(true);
    setError(null);
    try {
      const mastery = skillsMastery[skillId];
      const needsReview = mastery?.needsReview ?? false;

      // Determine difficulty: drop 1 level if needsReview
      let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
      const currentDiff = mastery?.currentDifficulty ?? 1;
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
        createdBy: selectedStudent.userId,
        mode: 'practice',
      });

      const attemptId = await StorageService.startWorksheetAttempt(
        selectedStudent.userId,
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
    // Find most urgent review skill or lowest mastery
    const skills = Object.entries(skillsMastery);
    const reviewSkill = skills.find(([, s]: [string, any]) => s.needsReview);
    if (reviewSkill) {
      generateForSkill(reviewSkill[0]);
      return;
    }
    // Lowest mastery
    const lowest = skills.sort(
      ([, a]: [string, any], [, b]: [string, any]) =>
        (a.masteryLevel ?? 0) - (b.masteryLevel ?? 0)
    )[0];
    if (lowest) {
      generateForSkill(lowest[0]);
    } else {
      // No data — generate diagnostic
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
```

- [ ] **Step 2: Commit**

```bash
git add app/practice/index.tsx
git commit -m "feat: add Practice mode screen with skill-based generation"
```

---

## Task 8: Explore Mode Screen

**Files:**
- Create: `app/explore/index.tsx`

- [ ] **Step 1: Create the Explore screen**

Reuses the existing Adventure mode logic from `[type]/index.tsx` — auto-generates a worksheet without configuration.

```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
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
  const { selectedStudent } = useAuth();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  const characterEmoji = CHARACTER_EMOJIS[selectedStudent?.selectedCharacterId || 'ada'] || '🦉';

  useEffect(() => {
    if (selectedStudent && !autoStarted) {
      setAutoStarted(true);
      handleGenerate();
    }
  }, [selectedStudent]);

  if (!selectedStudent) {
    router.replace('/');
    return null;
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
          profile?.grade || selectedStudent.grade || '1',
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
        createdBy: selectedStudent.userId,
        mode: 'explore',
      });

      const attemptId = await StorageService.startWorksheetAttempt(
        selectedStudent.userId,
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
```

- [ ] **Step 2: Commit**

```bash
git add app/explore/index.tsx
git commit -m "feat: add Explore mode screen with auto-generation"
```

---

## Task 9: Challenge Mode Screen

**Files:**
- Create: `app/challenge/index.tsx`

- [ ] **Step 1: Create the Challenge screen**

This is a refactored version of the "Build My Own" flow from `app/[type]/index.tsx`. Starts with type selection (4 worksheet cards), then shows the configuration form.

```typescript
import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import WorksheetService from '@/services/WorksheetService';
import { StorageService } from '@/services/StorageService';
import { colors } from '@/theme';
import {
  WorksheetType, WorksheetConfig, WorksheetGrade, WorksheetDifficulty,
  WORKSHEET_TYPE_LABELS, WORKSHEET_GRADE_OPTIONS, WORKSHEET_DIFFICULTIES,
  GRADE_SUBJECT_MAP, MathSubject,
} from '@/types/worksheet';

const TYPE_CARDS: { id: WorksheetType; title: string; icon: string; color: string }[] = [
  { id: 'math', title: 'Math Practice', icon: '🔢', color: colors.coral400 },
  { id: 'puzzle', title: 'Math Puzzles', icon: '🧩', color: colors.violet400 },
  { id: 'word-problem', title: 'Word Problems', icon: '📝', color: colors.teal400 },
  { id: 'logic', title: 'Brain Teasers', icon: '🕵️', color: colors.gold500 },
];

export default function ChallengeScreen() {
  const { selectedStudent } = useAuth();
  const router = useRouter();

  const defaultGrade = (selectedStudent?.grade || '1') as WorksheetGrade;

  const [step, setStep] = useState<'type' | 'config'>('type');
  const [selectedType, setSelectedType] = useState<WorksheetType>('math');
  const [grade, setGrade] = useState<WorksheetGrade>(defaultGrade);
  const [difficulty, setDifficulty] = useState<WorksheetDifficulty>('easy');
  const [subject, setSubject] = useState<MathSubject>('Addition');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedStudent) {
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
        createdBy: selectedStudent.userId,
        mode: 'challenge',
      });

      const attemptId = await StorageService.startWorksheetAttempt(
        selectedStudent.userId,
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

            {/* Subject */}
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

            {/* Difficulty */}
            <Text variant="labelLarge" style={styles.fieldLabel}>Difficulty</Text>
            <SegmentedButtons
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as WorksheetDifficulty)}
              buttons={WORKSHEET_DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
              style={styles.segmented}
            />

            {/* Question count */}
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

            {/* Generate */}
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
```

- [ ] **Step 2: Commit**

```bash
git add app/challenge/index.tsx
git commit -m "feat: add Challenge mode screen with step-by-step builder"
```

---

## Task 10: Update Layout — Tab Bar and Route Registration

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Remove the Worksheet tab and add new hidden screens**

In `app/_layout.tsx`, make these changes:

1. Remove the `[type]/index` tab screen (lines 48-62) entirely.

2. Add three new hidden screens for the modes:

```typescript
<Tabs.Screen
  name="practice/index"
  options={{
    href: null,
    headerShown: false,
  }}
/>
<Tabs.Screen
  name="explore/index"
  options={{
    href: null,
    headerShown: false,
  }}
/>
<Tabs.Screen
  name="challenge/index"
  options={{
    href: null,
    headerShown: false,
  }}
/>
```

3. Keep the existing `[type]/index` screen but hide it (`href: null`) so the route still works for any legacy navigation:

```typescript
<Tabs.Screen
  name="[type]/index"
  options={{
    href: null,
    headerShown: false,
  }}
/>
```

The visible tabs should now be: Home (index), History, Profile.

- [ ] **Step 2: Verify the app compiles**

Run: `npx expo start --web` and check the console for routing errors. Confirm 3 tabs are visible.

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: 3-tab layout — drop Worksheet tab, register mode screens"
```

---

## Task 11: Rewire Home Screen

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Replace worksheet cards with mode cards**

In `app/index.tsx`:

1. Remove the `worksheetTemplates` import from `WorksheetCard.tsx`.
2. Add imports:

```typescript
import { ModeCard } from '@/components/home/ModeCard';
import { AdventureBanner } from '@/components/home/AdventureBanner';
import { MODE_CONFIGS, MODE_ORDER } from '@/types/modes';
import { getSuggestion } from '@/utils/modeSuggestion';
```

3. Inside the component, compute the suggestion. Use `totalQuestionsAttempted` from the student profile as a proxy for worksheet count (divide by 5 since worksheets are typically 5 questions):

```typescript
const skillsMastery = (selectedStudent as any)?.skillsMastery || (selectedStudent as any)?.skillMastery || {};

// Estimate completed worksheets from total questions attempted
const totalAttempted = Object.values(skillsMastery).reduce(
  (sum: number, s: any) => sum + (s.questionsAttempted || 0), 0
);
const estimatedWorksheets = Math.floor(totalAttempted / 5);

const suggestion = selectedStudent
  ? getSuggestion({
      completedWorksheetCount: estimatedWorksheets,
      averageScore: 0,
      skillsMastery,
      currentStreak: selectedStudent.currentStreak || 0,
      recentAccuracy: 0,
      dispositionConfidence: (selectedStudent as any).dispositionConfidence,
      challengeSeeking: (selectedStudent as any).learningDisposition?.challengeSeeking,
    })
  : null;

const characterEmoji = selectedStudent?.selectedCharacterId
  ? { ada: '🦉', max: '🐶', luna: '🐱' }[selectedStudent.selectedCharacterId] || '🦉'
  : '🦉';
```

4. Replace the worksheet cards section (the `worksheetTemplates.map(...)` block) with:

```typescript
{/* Mode Cards */}
<Text variant="titleMedium" style={styles.sectionTitle}>
  What do you feel like doing?
</Text>

{MODE_ORDER.map((modeId) => {
  const mode = MODE_CONFIGS[modeId];
  const isSuggested = suggestion?.mode === modeId;
  return (
    <ModeCard
      key={modeId}
      mode={mode}
      characterEmoji={isSuggested ? characterEmoji : undefined}
      characterMessage={isSuggested ? suggestion?.reason : undefined}
    />
  );
})}
```

5. Add `onSkillPress` to the SkillJourney:

```typescript
<SkillJourney
  skills={skillsMastery}
  grade={selectedStudent.grade}
  onSkillPress={(skillId) => router.push('/practice' as any)}
/>
```

- [ ] **Step 2: Clean up old section title text**

Remove or update the old "What shall we explore?" and "Pick an adventure below" text to use the new "What do you feel like doing?" heading.

- [ ] **Step 3: Test the home screen**

Run: `npx expo start --web`, navigate to Home. Confirm:
- 3 mode cards (Practice, Explore, Challenge) render
- Character speech bubble appears on the suggested mode
- Tapping each card navigates to the correct screen
- Skill Journey renders below

- [ ] **Step 4: Commit**

```bash
git add app/index.tsx
git commit -m "feat: rewire home screen with mode cards and smart suggestions"
```

---

## Task 12: Integration Testing and Polish

**Files:**
- All new and modified files

- [ ] **Step 1: Test Practice mode end-to-end**

1. Navigate to Home → tap Practice card
2. Verify skill list loads with correct skills for the student's grade
3. Tap a skill → verify worksheet generates and attempt screen opens
4. Complete the attempt → verify return to Home

- [ ] **Step 2: Test Explore mode end-to-end**

1. Navigate to Home → tap Explore card
2. Verify auto-generation starts (loading screen with character)
3. Verify worksheet generates and attempt screen opens
4. Complete the attempt → verify return to Home

- [ ] **Step 3: Test Challenge mode end-to-end**

1. Navigate to Home → tap Challenge card
2. Verify type selection screen shows 4 cards
3. Pick a type → verify config screen loads with topic/difficulty/count
4. Generate → verify attempt screen opens
5. Complete the attempt → verify return to Home

- [ ] **Step 4: Test edge cases**

- New user with no skillsMastery → Practice should generate a diagnostic-style worksheet
- Test all three modes for error handling (disconnect network, verify error screen shows)
- Verify History tab still shows all attempts from all modes
- Verify Profile tab is unchanged

- [ ] **Step 5: Final commit (if any polish changes were made)**

```bash
git add app/ components/ utils/ types/ services/
git commit -m "fix: polish learning modes integration"
```
