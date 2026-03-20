# Progress Tracking & Parent Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Parent Insights tab with progress dashboard and feedback notepad, enhance student home with a skill journey map, and wire parent feedback into the adaptive learning pipeline.

**Architecture:** New `ProgressInsightsService` (singleton) aggregates data from existing services. New `insights.tsx` tab screen composes 5 sub-components. Parent notes stored in Firestore subcollection `users/{uid}/parent_notes`, read by `SignalAggregatorService` and injected into the adaptive planner's LLM prompt.

**Tech Stack:** React Native + Expo Router tabs, Firebase Firestore, existing theme tokens, existing service layer.

---

## File Structure

**New files:**
| File | Responsibility |
|------|---------------|
| `types/parent-notes.ts` | ParentNote type definition |
| `services/ProgressInsightsService.ts` | Analytics aggregation + parent notes CRUD |
| `app/insights.tsx` | Parent Insights tab screen (data fetching + layout) |
| `components/insights/WeeklySnapshot.tsx` | Trend cards (practice time, accuracy, streak, XP) |
| `components/insights/SkillHeatmap.tsx` | Skill grid with mastery color coding + expand detail |
| `components/insights/EmotionalPulse.tsx` | Mood/frustration/celebration summary card |
| `components/insights/ParentNotepad.tsx` | Feedback text input + note list |
| `components/insights/RecentActivity.tsx` | Last 5 worksheet attempts list |
| `components/home/SkillJourney.tsx` | Student-facing skill map (game-style nodes) |

**Modified files:**
| File | Change |
|------|--------|
| `app/_layout.tsx` | Add Insights tab to Tabs navigator |
| `app/index.tsx` | Import and render SkillJourney below PlayerStats |
| `types/adaptive-pipeline.ts` | Add `parentFeedback` field to StudentContext |
| `services/SignalAggregatorService.ts` | Fetch parent notes in buildStudentContext() |
| `services/AdaptivePlannerService.ts` | Include parent feedback in buildPlannerPrompt() |
| `firestore.rules` | Add parent_notes subcollection rule |

---

## Chunk 1: Data Layer (Types + Service + Firestore Rules)

### Task 1: ParentNote Type + Firestore Rule

**Files:**
- Create: `types/parent-notes.ts`
- Modify: `firestore.rules`

- [ ] **Step 1: Create ParentNote type**

```typescript
// types/parent-notes.ts
import { Timestamp } from "firebase/firestore";

export interface ParentNote {
  id?: string;
  studentId: string;
  text: string;
  createdAt: Timestamp;
  consumedByPlanner: boolean;
}
```

- [ ] **Step 2: Add Firestore rule for parent_notes**

In `firestore.rules`, inside the `match /users/{userId}` block, after the `narrative_arcs` rule, add:

```
      // Parent feedback notes
      match /parent_notes/{noteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
```

- [ ] **Step 3: Deploy updated rules**

Run: `npx firebase-tools deploy --only firestore:rules --project paadam-e5807`
Expected: `✔ Deploy complete!`

- [ ] **Step 4: Commit**

```bash
git add types/parent-notes.ts firestore.rules
git commit -m "feat: add ParentNote type and Firestore rules"
```

---

### Task 2: Add parentFeedback to StudentContext

**Files:**
- Modify: `types/adaptive-pipeline.ts`

- [ ] **Step 1: Read current StudentContext type**

Read `types/adaptive-pipeline.ts` to find the `StudentContext` interface.

- [ ] **Step 2: Add parentFeedback field**

Add to the `StudentContext` interface:

```typescript
  parentFeedback?: string[];
```

- [ ] **Step 3: Commit**

```bash
git add types/adaptive-pipeline.ts
git commit -m "feat: add parentFeedback field to StudentContext"
```

---

### Task 3: ProgressInsightsService

**Files:**
- Create: `services/ProgressInsightsService.ts`

- [ ] **Step 1: Create the service with singleton pattern**

```typescript
// services/ProgressInsightsService.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ParentNote } from "@/types/parent-notes";
import { studentProfileService } from "./StudentProfileService";
import { sessionService } from "./SessionService";

export interface WeeklySnapshot {
  practiceTimeMinutes: number;
  practiceTimePrevWeek: number;
  accuracy: number;
  accuracyPrevWeek: number;
  currentStreak: number;
  xpEarnedThisWeek: number;
}

export interface SkillOverviewItem {
  skillId: string;
  skillName: string;
  masteryLevel: number;
  color: "green" | "yellow" | "red" | "gray";
  questionsAttempted: number;
  questionsCorrect: number;
  recentAccuracy: number;
  lastPracticedAt: Date | null;
  needsReview: boolean;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  scorePercent: number | null;
  topic: string;
  date: Date;
  status: string;
}

export class ProgressInsightsService {
  private static instance: ProgressInsightsService;

  static getInstance(): ProgressInsightsService {
    if (!ProgressInsightsService.instance) {
      ProgressInsightsService.instance = new ProgressInsightsService();
    }
    return ProgressInsightsService.instance;
  }

  async getWeeklySnapshot(studentId: string): Promise<WeeklySnapshot> {
    const profile = await studentProfileService.getProfile(studentId);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

    // Query attempts for this week and last week
    const attemptsRef = collection(db, "worksheetAttempts");
    const thisWeekQ = query(
      attemptsRef,
      where("userId", "==", studentId),
      where("startedAt", ">=", Timestamp.fromDate(startOfWeek)),
      orderBy("startedAt", "desc"),
    );
    const prevWeekQ = query(
      attemptsRef,
      where("userId", "==", studentId),
      where("startedAt", ">=", Timestamp.fromDate(startOfPrevWeek)),
      where("startedAt", "<", Timestamp.fromDate(startOfWeek)),
      orderBy("startedAt", "desc"),
    );

    const [thisWeekSnap, prevWeekSnap] = await Promise.all([
      getDocs(thisWeekQ),
      getDocs(prevWeekQ),
    ]);

    const calcStats = (docs: any[]) => {
      let totalTime = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalXP = 0;
      docs.forEach((d) => {
        const data = d.data();
        totalTime += data.durationMinutes || 0;
        totalXP += data.xpEarned || 0;
        if (data.answers) {
          const answers = Object.values(data.answers) as any[];
          totalQuestions += answers.length;
          totalCorrect += answers.filter((a: any) => a.isCorrect).length;
        }
      });
      return {
        time: totalTime,
        accuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
        xp: totalXP,
      };
    };

    const thisWeek = calcStats(thisWeekSnap.docs);
    const prevWeek = calcStats(prevWeekSnap.docs);

    return {
      practiceTimeMinutes: thisWeek.time,
      practiceTimePrevWeek: prevWeek.time,
      accuracy: thisWeek.accuracy,
      accuracyPrevWeek: prevWeek.accuracy,
      currentStreak: profile?.currentStreak || 0,
      xpEarnedThisWeek: thisWeek.xp,
    };
  }

  async getSkillOverview(studentId: string): Promise<SkillOverviewItem[]> {
    const profile = await studentProfileService.getProfile(studentId);
    const mastery = (profile as any)?.skillMastery || {};

    return Object.entries(mastery).map(([skillId, data]: [string, any]) => {
      const level = data.masteryLevel ?? 0;
      let color: SkillOverviewItem["color"] = "gray";
      if (level >= 80) color = "green";
      else if (level >= 40) color = "yellow";
      else if (level > 0) color = "red";

      return {
        skillId,
        skillName: skillId.charAt(0).toUpperCase() + skillId.slice(1).replace(/-/g, " "),
        masteryLevel: level,
        color,
        questionsAttempted: data.questionsAttempted || 0,
        questionsCorrect: data.questionsCorrect || 0,
        recentAccuracy: data.recentAccuracy || 0,
        lastPracticedAt: data.lastPracticedAt?.toDate?.() || null,
        needsReview: data.needsReview || false,
      };
    });
  }

  async getRecentActivity(studentId: string, count: number = 5): Promise<RecentActivityItem[]> {
    const attemptsRef = collection(db, "worksheetAttempts");
    const q = query(
      attemptsRef,
      where("userId", "==", studentId),
      orderBy("startedAt", "desc"),
      limit(count),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      const answers = data.answers ? Object.values(data.answers) as any[] : [];
      const correct = answers.filter((a: any) => a.isCorrect).length;
      const total = answers.length;
      return {
        id: d.id,
        title: data.title || "Worksheet",
        scorePercent: total > 0 ? Math.round((correct / total) * 100) : null,
        topic: data.config?.subject || "Math",
        date: data.startedAt?.toDate?.() || new Date(),
        status: data.status || "in_progress",
      };
    });
  }

  async getEmotionalSummary(studentId: string) {
    return sessionService.getEmotionalMemorySummary(studentId);
  }

  // --- Parent Notes ---

  async saveParentNote(parentUserId: string, studentId: string, text: string): Promise<void> {
    const notesRef = collection(db, "users", parentUserId, "parent_notes");
    await addDoc(notesRef, {
      studentId,
      text: text.slice(0, 500),
      createdAt: Timestamp.now(),
      consumedByPlanner: false,
    });
  }

  async getParentNotes(parentUserId: string, studentId: string, count: number = 3): Promise<ParentNote[]> {
    const notesRef = collection(db, "users", parentUserId, "parent_notes");
    const q = query(
      notesRef,
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc"),
      limit(count),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ParentNote));
  }

  async getUnconsumedNotes(parentUserId: string, studentId: string): Promise<ParentNote[]> {
    const notesRef = collection(db, "users", parentUserId, "parent_notes");
    const q = query(
      notesRef,
      where("studentId", "==", studentId),
      where("consumedByPlanner", "==", false),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ParentNote));
  }

  async markNotesConsumed(parentUserId: string, noteIds: string[]): Promise<void> {
    const promises = noteIds.map((noteId) => {
      const noteRef = doc(db, "users", parentUserId, "parent_notes", noteId);
      return updateDoc(noteRef, { consumedByPlanner: true });
    });
    await Promise.all(promises);
  }
}

export const progressInsightsService = ProgressInsightsService.getInstance();
```

- [ ] **Step 2: Commit**

```bash
git add services/ProgressInsightsService.ts
git commit -m "feat: add ProgressInsightsService for dashboard analytics"
```

---

### Task 4: Wire Parent Feedback into Adaptive Pipeline

**Files:**
- Modify: `services/SignalAggregatorService.ts`
- Modify: `services/AdaptivePlannerService.ts`

- [ ] **Step 1: Update SignalAggregatorService.buildStudentContext()**

Read `services/SignalAggregatorService.ts`. In `buildStudentContext()`, after the existing `Promise.all` block that fetches profile/emotionalSummary/affinities/activeArc/arcHistory, add a fetch for parent notes:

```typescript
// After the existing Promise.all block, add:
import { progressInsightsService } from "./ProgressInsightsService";

// Inside buildStudentContext, after existing data fetching:
// Fetch parent feedback notes
let parentFeedback: string[] = [];
try {
  const parentUserId = profile?.userId || studentId;
  const notes = await progressInsightsService.getUnconsumedNotes(parentUserId, studentId);
  parentFeedback = notes.map((n) => n.text);
  // Mark as consumed
  if (notes.length > 0) {
    const noteIds = notes.filter((n) => n.id).map((n) => n.id!);
    await progressInsightsService.markNotesConsumed(parentUserId, noteIds);
  }
} catch (err) {
  console.warn("[SignalAggregator] Could not load parent notes:", err);
}
```

Add `parentFeedback` to the returned `StudentContext` object.

- [ ] **Step 2: Update AdaptivePlannerService.buildPlannerPrompt()**

Read `services/AdaptivePlannerService.ts`. In `buildPlannerPrompt()`, after the misconceptions section (after the `if (context.misconceptions.length > 0)` block), add:

```typescript
// Parent observations
if (context.parentFeedback && context.parentFeedback.length > 0) {
  lines.push(`\nParent observations (incorporate these into your planning):`);
  context.parentFeedback.forEach((note) => lines.push(`  - "${note}"`));
}
```

- [ ] **Step 3: Commit**

```bash
git add services/SignalAggregatorService.ts services/AdaptivePlannerService.ts
git commit -m "feat: wire parent feedback into adaptive learning pipeline"
```

---

## Chunk 2: Parent Insights UI Components

### Task 5: WeeklySnapshot Component

**Files:**
- Create: `components/insights/WeeklySnapshot.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/insights/WeeklySnapshot.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { WeeklySnapshot as WeeklySnapshotData } from "@/services/ProgressInsightsService";

interface Props {
  data: WeeklySnapshotData;
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <Text style={styles.trendUp}>↑</Text>;
  if (current < previous) return <Text style={styles.trendDown}>↓</Text>;
  return <Text style={styles.trendFlat}>→</Text>;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function SnapshotCard({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string;
  trend?: React.ReactNode;
  color: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.cardValueRow}>
        <Text style={styles.cardValue}>{value}</Text>
        {trend}
      </View>
    </View>
  );
}

export function WeeklySnapshot({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SnapshotCard
          label="Practice Time"
          value={formatTime(data.practiceTimeMinutes)}
          trend={<TrendArrow current={data.practiceTimeMinutes} previous={data.practiceTimePrevWeek} />}
          color={colors.teal50}
        />
        <SnapshotCard
          label="Accuracy"
          value={`${Math.round(data.accuracy * 100)}%`}
          trend={<TrendArrow current={data.accuracy} previous={data.accuracyPrevWeek} />}
          color={colors.gold100}
        />
        <SnapshotCard
          label="Streak"
          value={`${data.currentStreak} days`}
          color={colors.orange50}
        />
        <SnapshotCard
          label="XP Earned"
          value={`${data.xpEarnedThisWeek}`}
          color={colors.violet100}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
  card: {
    width: 140,
    padding: spacing.lg,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  cardLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  cardValueRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  cardValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  trendUp: { fontSize: fontSizes.lg, color: colors.green500 },
  trendDown: { fontSize: fontSizes.lg, color: colors.coral400 },
  trendFlat: { fontSize: fontSizes.lg, color: colors.textTertiary },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/insights/WeeklySnapshot.tsx
git commit -m "feat: add WeeklySnapshot component for parent dashboard"
```

---

### Task 6: SkillHeatmap Component

**Files:**
- Create: `components/insights/SkillHeatmap.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/insights/SkillHeatmap.tsx
import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { SkillOverviewItem } from "@/services/ProgressInsightsService";

interface Props {
  skills: SkillOverviewItem[];
}

const colorMap = {
  green: { bg: colors.green500, text: colors.textOnPrimary },
  yellow: { bg: colors.gold400, text: colors.textPrimary },
  red: { bg: colors.coral400, text: colors.textOnPrimary },
  gray: { bg: colors.sand200, text: colors.textTertiary },
};

function SkillDetail({ skill }: { skill: SkillOverviewItem }) {
  const accuracy = skill.questionsAttempted > 0
    ? Math.round((skill.questionsCorrect / skill.questionsAttempted) * 100)
    : 0;
  const lastPracticed = skill.lastPracticedAt
    ? new Date(skill.lastPracticedAt).toLocaleDateString()
    : "Never";

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailTitle}>{skill.skillName}</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Mastery</Text>
        <Text style={styles.detailValue}>{skill.masteryLevel}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Accuracy</Text>
        <Text style={styles.detailValue}>{accuracy}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Questions</Text>
        <Text style={styles.detailValue}>{skill.questionsCorrect}/{skill.questionsAttempted}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Last Practiced</Text>
        <Text style={styles.detailValue}>{lastPracticed}</Text>
      </View>
      {skill.needsReview && (
        <Text style={styles.reviewBadge}>Needs Review</Text>
      )}
    </View>
  );
}

export function SkillHeatmap({ skills }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const selected = skills.find((s) => s.skillId === selectedSkill);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.grid}>
        {skills.map((skill) => {
          const c = colorMap[skill.color];
          const isSelected = selectedSkill === skill.skillId;
          return (
            <Pressable
              key={skill.skillId}
              style={[styles.chip, { backgroundColor: c.bg }, isSelected && styles.chipSelected]}
              onPress={() => setSelectedSkill(isSelected ? null : skill.skillId)}
            >
              <Text style={[styles.chipText, { color: c.text }]}>{skill.skillName}</Text>
              <Text style={[styles.chipLevel, { color: c.text }]}>{skill.masteryLevel}%</Text>
            </Pressable>
          );
        })}
      </View>
      {selected && <SkillDetail skill={selected} />}
      {skills.length === 0 && (
        <Text style={styles.empty}>No skills tracked yet. Start a worksheet to begin!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  chipSelected: { borderWidth: 2, borderColor: colors.plum900 },
  chipText: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  chipLevel: { fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  detailCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  detailTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  detailLabel: { fontSize: fontSizes.sm, color: colors.textTertiary },
  detailValue: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  reviewBadge: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.coral400,
    backgroundColor: colors.coral100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    alignSelf: "flex-start",
  },
  empty: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: "italic" },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/insights/SkillHeatmap.tsx
git commit -m "feat: add SkillHeatmap component for parent dashboard"
```

---

### Task 7: EmotionalPulse Component

**Files:**
- Create: `components/insights/EmotionalPulse.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/insights/EmotionalPulse.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

interface EmotionalSummary {
  recentMood: string;
  commonFrustrations: string[];
  celebrationPatterns: string[];
  energyPatterns: string;
  focusPatterns: string;
}

interface Props {
  data: EmotionalSummary | null;
}

const moodEmoji: Record<string, string> = {
  "generally positive": "😊",
  "neutral": "😐",
  "needs encouragement": "🤗",
};

export function EmotionalPulse({ data }: Props) {
  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>How They're Feeling</Text>
        <View style={styles.card}>
          <Text style={styles.empty}>Not enough sessions yet to show emotional patterns.</Text>
        </View>
      </View>
    );
  }

  const emoji = moodEmoji[data.recentMood] || "😊";

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>How They're Feeling</Text>
      <View style={styles.card}>
        <View style={styles.moodRow}>
          <Text style={styles.moodEmoji}>{emoji}</Text>
          <Text style={styles.moodText}>{data.recentMood}</Text>
        </View>

        {data.commonFrustrations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Gets frustrated with:</Text>
            {data.commonFrustrations.map((f, i) => (
              <Text key={i} style={styles.item}>• {f}</Text>
            ))}
          </View>
        )}

        {data.celebrationPatterns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Gets excited about:</Text>
            {data.celebrationPatterns.map((c, i) => (
              <Text key={i} style={styles.itemPositive}>• {c}</Text>
            ))}
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Energy</Text>
            <Text style={styles.miniValue}>{data.energyPatterns}</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Focus</Text>
            <Text style={styles.miniValue}>{data.focusPatterns}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  moodRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  moodEmoji: { fontSize: 36 },
  moodText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  section: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textTertiary, marginBottom: spacing.xs },
  item: { fontSize: fontSizes.sm, color: colors.coral400, paddingLeft: spacing.sm },
  itemPositive: { fontSize: fontSizes.sm, color: colors.green500, paddingLeft: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  miniCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.sand100,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  miniLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, marginBottom: spacing.xs },
  miniValue: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textPrimary, textTransform: "capitalize" },
  empty: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: "italic" },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/insights/EmotionalPulse.tsx
git commit -m "feat: add EmotionalPulse component for parent dashboard"
```

---

### Task 8: ParentNotepad Component

**Files:**
- Create: `components/insights/ParentNotepad.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/insights/ParentNotepad.tsx
import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { ParentNote } from "@/types/parent-notes";

interface Props {
  notes: ParentNote[];
  onSaveNote: (text: string) => Promise<void>;
  saving: boolean;
}

export function ParentNotepad({ notes, onSaveNote, saving }: Props) {
  const [text, setText] = useState("");

  const handleSave = async () => {
    if (!text.trim()) return;
    await onSaveNote(text.trim());
    setText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Notes for the AI</Text>
      <Text style={styles.subtitle}>
        Share observations to help guide your child's learning path
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder='e.g., "Focus more on fractions" or "She loves dinosaur themes"'
          placeholderTextColor={colors.textDisabled}
          value={text}
          onChangeText={setText}
          maxLength={500}
          multiline
          numberOfLines={2}
          editable={!saving}
        />
        <TouchableOpacity
          style={[styles.saveButton, (!text.trim() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!text.trim() || saving}
        >
          <Text style={styles.saveButtonText}>{saving ? "..." : "Add"}</Text>
        </TouchableOpacity>
      </View>

      {notes.length > 0 && (
        <View style={styles.notesList}>
          {notes.map((note, i) => {
            const date = note.createdAt?.toDate?.()
              ? note.createdAt.toDate().toLocaleDateString()
              : "";
            return (
              <View key={note.id || i} style={styles.noteItem}>
                <Text style={styles.noteText}>"{note.text}"</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>{date}</Text>
                  {note.consumedByPlanner && (
                    <Text style={styles.consumedBadge}>Used by AI</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  inputRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceElevated,
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: colors.teal400,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.textOnPrimary, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  notesList: { marginTop: spacing.lg, gap: spacing.sm },
  noteItem: {
    padding: spacing.md,
    backgroundColor: colors.sand100,
    borderRadius: radii.lg,
  },
  noteText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontStyle: "italic" },
  noteFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xs },
  noteDate: { fontSize: fontSizes.xs, color: colors.textDisabled },
  consumedBadge: {
    fontSize: fontSizes.xs,
    color: colors.teal400,
    fontWeight: fontWeights.semibold,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/insights/ParentNotepad.tsx
git commit -m "feat: add ParentNotepad component for parent feedback"
```

---

### Task 9: RecentActivity Component

**Files:**
- Create: `components/insights/RecentActivity.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/insights/RecentActivity.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";
import { RecentActivityItem } from "@/services/ProgressInsightsService";

interface Props {
  activities: RecentActivityItem[];
}

const statusColors: Record<string, string> = {
  completed: colors.green500,
  in_progress: colors.gold400,
  on_hold: colors.textTertiary,
};

export function RecentActivity({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.empty}>No worksheets completed yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
            <Text style={styles.meta}>{activity.topic} • {activity.date.toLocaleDateString()}</Text>
          </View>
          <View style={styles.rowRight}>
            {activity.scorePercent !== null && (
              <Text style={styles.score}>{activity.scorePercent}%</Text>
            )}
            <View style={[styles.statusDot, { backgroundColor: statusColors[activity.status] || colors.textTertiary }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLeft: { flex: 1 },
  title: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  meta: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  score: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: "italic" },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/insights/RecentActivity.tsx
git commit -m "feat: add RecentActivity component for parent dashboard"
```

---

## Chunk 3: Insights Screen + Tab Integration

### Task 10: Parent Insights Screen

**Files:**
- Create: `app/insights.tsx`

- [ ] **Step 1: Create the screen**

```typescript
// app/insights.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { ScreenContainer, LoadingState, ErrorState } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing, fontSizes, fontWeights } from "@/theme";
import { progressInsightsService, WeeklySnapshot as WeeklySnapshotData, SkillOverviewItem, RecentActivityItem } from "@/services/ProgressInsightsService";
import { WeeklySnapshot } from "@/components/insights/WeeklySnapshot";
import { SkillHeatmap } from "@/components/insights/SkillHeatmap";
import { EmotionalPulse } from "@/components/insights/EmotionalPulse";
import { ParentNotepad } from "@/components/insights/ParentNotepad";
import { RecentActivity } from "@/components/insights/RecentActivity";
import { ParentNote } from "@/types/parent-notes";

export default function InsightsScreen() {
  const { currentUser, studentProfiles, selectedStudent, setSelectedStudent, isLoading: authLoading } = useAuth();

  const [weeklyData, setWeeklyData] = useState<WeeklySnapshotData | null>(null);
  const [skills, setSkills] = useState<SkillOverviewItem[]>([]);
  const [emotional, setEmotional] = useState<any>(null);
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const studentId = selectedStudent?.id || currentUser?.uid || "";
  const parentUserId = currentUser?.uid || "";

  const fetchData = useCallback(async () => {
    if (!studentId || !parentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const [weekly, skillData, emotionalData, noteData, activityData] = await Promise.all([
        progressInsightsService.getWeeklySnapshot(studentId).catch(() => null),
        progressInsightsService.getSkillOverview(studentId).catch(() => []),
        progressInsightsService.getEmotionalSummary(studentId).catch(() => null),
        progressInsightsService.getParentNotes(parentUserId, studentId).catch(() => []),
        progressInsightsService.getRecentActivity(studentId).catch(() => []),
      ]);
      setWeeklyData(weekly);
      setSkills(skillData);
      setEmotional(emotionalData);
      setNotes(noteData);
      setActivities(activityData);
    } catch (err) {
      console.error("[Insights] Failed to load:", err);
      setError("Couldn't load insights. Let's try again!");
    } finally {
      setLoading(false);
    }
  }, [studentId, parentUserId]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleSaveNote = async (text: string) => {
    setSavingNote(true);
    try {
      await progressInsightsService.saveParentNote(parentUserId, studentId, text);
      const updatedNotes = await progressInsightsService.getParentNotes(parentUserId, studentId);
      setNotes(updatedNotes);
    } catch (err) {
      console.error("[Insights] Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ScreenContainer noScroll>
        <LoadingState message="Loading insights..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer noScroll>
        <ErrorState message={error} onRetry={fetchData} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        {selectedStudent && (
          <Text style={styles.studentName}>{selectedStudent.name}'s Progress</Text>
        )}
      </View>

      {/* Student Selector */}
      {studentProfiles.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {studentProfiles.map((profile) => {
            const isSelected = selectedStudent?.id === profile.id;
            return (
              <Pressable
                key={profile.id}
                style={[styles.selectorChip, isSelected && styles.selectorChipSelected]}
                onPress={() => setSelectedStudent(profile)}
              >
                <Text style={[styles.selectorText, isSelected && styles.selectorTextSelected]}>
                  {profile.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Dashboard Sections */}
      {weeklyData && <WeeklySnapshot data={weeklyData} />}
      <SkillHeatmap skills={skills} />
      <EmotionalPulse data={emotional} />
      <ParentNotepad notes={notes} onSaveNote={handleSaveNote} saving={savingNote} />
      <RecentActivity activities={activities} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  studentName: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  selectorRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  selectorChipSelected: {
    backgroundColor: colors.coral400,
    borderColor: colors.coral400,
  },
  selectorText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  selectorTextSelected: { color: colors.textOnPrimary },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/insights.tsx
git commit -m "feat: add Parent Insights screen"
```

---

### Task 11: Add Insights Tab to Layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Add Insights tab screen to Tabs**

In `app/_layout.tsx`, add a new `Tabs.Screen` after the Profile tab and before the hidden screens:

```typescript
              <Tabs.Screen
                name="insights"
                options={{
                  title: "Insights",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons
                      name="chart-line"
                      size={size}
                      color={color}
                    />
                  ),
                }}
              />
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: add Insights tab to navigation"
```

---

## Chunk 4: Student Skill Journey

### Task 12: SkillJourney Component

**Files:**
- Create: `components/home/SkillJourney.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/home/SkillJourney.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";

interface SkillNode {
  id: string;
  name: string;
  masteryLevel: number;
  state: "locked" | "in-progress" | "mastered";
}

interface Props {
  skills: Record<string, any>;
  grade?: string;
}

const gradeSkillOrder: Record<string, string[]> = {
  K: ["counting", "addition", "subtraction", "patterns", "geometry"],
  "1": ["addition", "subtraction", "patterns", "measurement", "time", "geometry"],
  "2": ["addition", "subtraction", "multiplication", "measurement", "time", "money", "geometry"],
  "3": ["addition", "subtraction", "multiplication", "division", "fractions", "measurement", "geometry"],
  "4": ["multiplication", "division", "fractions", "decimals", "geometry", "measurement", "algebra"],
  "5": ["fractions", "decimals", "multiplication", "division", "geometry", "algebra", "measurement"],
};

const skillEmojis: Record<string, string> = {
  addition: "➕", subtraction: "➖", multiplication: "✖️", division: "➗",
  fractions: "🍕", decimals: "🔢", geometry: "📐", algebra: "🔤",
  patterns: "🔁", measurement: "📏", time: "🕐", money: "💰", counting: "🔢",
};

function getSkillState(mastery: any): SkillNode["state"] {
  if (!mastery) return "locked";
  const level = mastery.masteryLevel ?? 0;
  if (level >= 80) return "mastered";
  if (level > 0) return "in-progress";
  return "locked";
}

const stateStyles = {
  locked: { bg: colors.sand200, border: colors.sand300, emoji: "🔒" },
  "in-progress": { bg: colors.gold100, border: colors.gold400, emoji: "" },
  mastered: { bg: colors.green500, border: colors.green500, emoji: "⭐" },
};

export function SkillJourney({ skills, grade }: Props) {
  const order = gradeSkillOrder[grade || "3"] || gradeSkillOrder["3"];

  const nodes: SkillNode[] = order.map((skillId) => ({
    id: skillId,
    name: skillId.charAt(0).toUpperCase() + skillId.slice(1),
    masteryLevel: skills[skillId]?.masteryLevel ?? 0,
    state: getSkillState(skills[skillId]),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Journey</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {nodes.map((node, i) => {
          const s = stateStyles[node.state];
          return (
            <React.Fragment key={node.id}>
              {i > 0 && (
                <View style={styles.connector}>
                  <View style={[
                    styles.connectorLine,
                    node.state !== "locked" && styles.connectorLineActive,
                  ]} />
                </View>
              )}
              <View style={styles.nodeWrapper}>
                <View style={[styles.node, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={styles.nodeEmoji}>
                    {node.state === "mastered" ? s.emoji : (skillEmojis[node.id] || "📚")}
                  </Text>
                </View>
                <Text style={[
                  styles.nodeName,
                  node.state === "locked" && styles.nodeNameLocked,
                ]}>{node.name}</Text>
                {node.state === "in-progress" && (
                  <Text style={styles.nodeProgress}>{node.masteryLevel}%</Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  scroll: { paddingHorizontal: spacing.xl, alignItems: "center" },
  nodeWrapper: { alignItems: "center", width: 72 },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  nodeEmoji: { fontSize: 24 },
  nodeName: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  nodeNameLocked: { color: colors.textDisabled },
  nodeProgress: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.gold500,
  },
  connector: { justifyContent: "center", paddingBottom: 20 },
  connectorLine: {
    width: 20,
    height: 3,
    backgroundColor: colors.sand300,
    borderRadius: 2,
  },
  connectorLineActive: { backgroundColor: colors.gold400 },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/home/SkillJourney.tsx
git commit -m "feat: add SkillJourney component for student home"
```

---

### Task 13: Add SkillJourney to Home Screen

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Import and render SkillJourney**

In `app/index.tsx`:

1. Add import at top:
```typescript
import { SkillJourney } from "@/components/home/SkillJourney";
```

2. After the `{selectedStudent && <PlayerStats student={selectedStudent} />}` line, add:
```typescript
      {/* Skill Journey */}
      {selectedStudent && (
        <SkillJourney
          skills={(selectedStudent as any).skillMastery || (selectedStudent as any).skillsMastery || {}}
          grade={selectedStudent.grade}
        />
      )}
```

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "feat: add SkillJourney to home screen"
```

---

## Chunk 5: Integration Test

### Task 14: Manual Integration Verification

- [ ] **Step 1: Start the app**

Run: `npx expo start --web`

- [ ] **Step 2: Verify Insights tab appears**

Navigate to the app. Confirm the tab bar shows 5 tabs: Home, Worksheet, History, Profile, Insights.

- [ ] **Step 3: Test Insights screen**

Click the Insights tab. Verify:
- Header shows "Insights"
- Weekly Snapshot cards render (may show 0 values if no data)
- Skill Heatmap shows "No skills tracked yet" or existing skills
- Emotional Pulse shows placeholder or data
- Parent Notepad shows text input
- Recent Activity shows list or empty state

- [ ] **Step 4: Test parent note submission**

Type a note in the notepad (e.g., "Focus more on multiplication"). Click "Add". Verify:
- Note appears in the list below with timestamp
- No console errors

- [ ] **Step 5: Test SkillJourney on home**

Navigate to Home tab. Verify:
- "Your Journey" section appears below PlayerStats
- Skill nodes show as locked/in-progress/mastered based on data
- Horizontal scroll works

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete progress tracking and parent dashboard"
```
