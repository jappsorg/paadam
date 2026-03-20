# Progress Tracking & Parent Dashboard Design

## Overview

Add progress visibility for both students and parents, plus a parent feedback mechanism that steers the adaptive learning pipeline. Parents observe + nudge via natural-language notes; the AI incorporates feedback into its next planning cycle.

## Components

### 1. Parent Insights Tab

New tab in tab bar ("Insights", chart icon). Visible to authenticated parent users. Contains:

**Student Selector** — Reuses existing selector pattern from home screen for multi-child families.

**Weekly Snapshot Cards** (horizontal scroll):
- Practice time: this week vs last week with trend arrow
- Accuracy: this week vs last week
- Current streak (days)
- XP earned this week

Data source: Aggregate from `worksheetAttempts` filtered by date range + `StudentProfile.currentStreak` + `StudentProfile.xp`.

**Skill Heatmap** — Grid of topic chips color-coded by mastery:
- Green (80-100%): Mastered
- Yellow (40-79%): Progressing
- Red (0-39%): Needs practice
- Gray: Not started

Tap a chip to expand detail card: recent accuracy, questions attempted, last practiced date, trend.

Data source: `StudentProfile.skillsMastery` object.

**Emotional Pulse** — Card summarizing:
- Overall recent mood (positive/neutral/needs encouragement)
- Top frustration triggers
- What's working well (celebration patterns)
- Energy/focus quality

Data source: `SessionService.getEmotionalMemorySummary()`.

**Parent Feedback Notepad** — TextInput area for natural-language observations. Shows last 3 notes with timestamps. "Add a note" button saves to Firestore.

Examples: "She struggled with word problems at homework", "He loves dinosaur themes", "Focus more on multiplication please"

Data source: New Firestore subcollection `users/{userId}/parent_notes/{noteId}`.

**Recent Activity** — Last 5 worksheet attempts: title, score %, topic, date, status badge.

Data source: `worksheetAttempts` collection filtered by userId, ordered by date.

### 2. Student Skill Journey (Home Screen Enhancement)

Enhance the existing home screen with a game-style skill map below PlayerStats:

**Skill Journey Map** — Horizontal scrollable path showing topic nodes:
- Each node = a subject (Addition, Subtraction, etc.)
- Node state: locked (gray), in-progress (pulsing yellow), mastered (green with star)
- Current node highlighted with character avatar
- Connecting path between nodes with progress fill

This replaces no existing UI — it adds below the PlayerStats component and above the worksheet type cards.

Data source: `StudentProfile.skillsMastery` + computed ordering based on grade level.

### 3. Feedback Integration into Adaptive Pipeline

Parent notes flow into the adaptive planner:

**Storage**: `users/{parentUserId}/parent_notes/{noteId}`
```
{
  noteId: string
  studentId: string
  text: string
  createdAt: Timestamp
  consumedByPlanner: boolean
}
```

**Pipeline integration**: `SignalAggregatorService.buildStudentContext()` reads the 5 most recent unconsumed notes for the student. These are appended to the `StudentContext` as `parentFeedback: string[]`. After the adaptive planner generates a plan, notes are marked `consumedByPlanner: true`.

**AdaptivePlannerService** prompt modification: The existing LLM prompt for plan generation includes a new section:
```
Parent observations (incorporate these into your planning):
- "She struggled with word problems at homework"
- "Focus more on multiplication please"
```

The planner already accepts context and generates plans via LLM — this adds a new input signal without changing the pipeline architecture.

### 4. Firestore Rules Addition

New rule for parent notes:
```
match /users/{userId}/parent_notes/{noteId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 5. New Service: ProgressInsightsService

Singleton service that computes derived analytics for the parent dashboard:

- `getWeeklySnapshot(studentId)` — aggregates attempt data for current and previous week
- `getSkillOverview(studentId)` — maps skillsMastery into display-ready format with colors/labels
- `getRecentActivity(studentId, limit)` — fetches recent worksheet attempts
- `getEmotionalSummary(studentId)` — delegates to SessionService
- `saveParentNote(parentUserId, studentId, text)` — saves note to Firestore
- `getParentNotes(parentUserId, studentId, limit)` — fetches recent notes
- `getUnconsumedNotes(studentId)` — for the adaptive planner

### 6. Tab Visibility Logic

The Insights tab appears for all authenticated users (parents). The tab is hidden for unauthenticated users (handled by existing AppNavigator conditional rendering).

If a parent has multiple children, the tab defaults to the currently selected student (from `AuthContext.selectedStudent`).

## Files to Create/Modify

**New files:**
- `app/insights.tsx` — Parent Insights screen
- `services/ProgressInsightsService.ts` — Analytics computation
- `components/insights/WeeklySnapshot.tsx` — Trend cards
- `components/insights/SkillHeatmap.tsx` — Skill grid
- `components/insights/EmotionalPulse.tsx` — Mood summary
- `components/insights/ParentNotepad.tsx` — Feedback input
- `components/insights/RecentActivity.tsx` — Activity list
- `components/home/SkillJourney.tsx` — Student skill map

**Modified files:**
- `app/_layout.tsx` — Add Insights tab
- `app/index.tsx` — Add SkillJourney component
- `services/SignalAggregatorService.ts` — Read parent notes into StudentContext
- `services/AdaptivePlannerService.ts` — Include parent feedback in LLM prompt
- `firestore.rules` — Add parent_notes rule
- `types/adaptive-learning.ts` — Add ParentNote type (if not present)

## Design Constraints

- All parent data reads are scoped to their own userId (security rules enforce this)
- Parent notes are plain text, max 500 characters, stored with timestamps
- Emotional data shown to parents is summarized (no raw session dumps)
- Student skill journey uses the same mastery data but presents it as game progression, not grades
- No direct difficulty override — parents nudge via notes, AI decides
