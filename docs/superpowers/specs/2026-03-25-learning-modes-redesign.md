# Learning Modes Redesign — Intent-Based Home Screen

**Date:** 2026-03-25
**Status:** Approved

## Summary

Restructure the app from "pick a worksheet type" to "pick what you want to do." Replace the 4 worksheet type cards on Home and the separate Worksheet tab with 3 intent-based learning modes: **Practice**, **Explore**, **Challenge**.

## Motivation

The current flow asks kids to pick a worksheet type (Math, Puzzles, Word Problems, Brain Teasers) — a developer's content taxonomy, not a child's mental model. Kids think in terms of intent: "I want to get better at fractions," "give me something fun," or "I want a hard test." The modes capture this.

## Design Decisions

### Modes

| Mode | Purpose | Color | Icon | Character Mood |
|---|---|---|---|---|
| **Practice** | Revise/strengthen known skills | Gold/amber | Target (bullseye) | Encouraging |
| **Explore** | Discover something new (AI-adaptive) | Teal | Compass | Excited |
| **Challenge** | Test yourself (Build Your Own) | Violet | Lightning bolt | Thinking |

### Navigation Changes

- **Tab bar:** 3 tabs — Home, History, Profile. Drop the Worksheet tab.
- **Worksheet type cards:** Removed from Home. Live inside Challenge mode only.
- **`[type]/index.tsx`:** Becomes a hidden stack screen (`href: null` in layout), navigated from Challenge card. Not a tab destination.
- **`app/practice/index.tsx` and `app/explore/index.tsx`:** New hidden stack screens (`href: null`), navigated from Home mode cards.
- **`app/insights.tsx`:** Remains as-is (already `href: null`), accessible from Profile/parent dashboard.
- **`app/theme-picker/index.tsx`:** Remains as-is for now. Not used by Explore (auto-picks themes), but not removed.

### Home Screen Layout (New)

1. Hero header (greeting, streak badge, settings gear) — unchanged
2. Student selector (if multiple children) — unchanged
3. Player stats card (character, XP, level) — unchanged
4. **Active adventure banner** (conditional) — if Explore narrative arc is in progress, show a teal banner above mode cards: "[Character] Continue your adventure! Chapter X of Y" with a tap action navigating to Explore with the active arc. Dismissible.
5. **Mode cards** — 3 large cards replacing the 4 worksheet type cards
   - Each card: accent color strip, icon circle, title, subtitle, arrow
   - The recommended mode card gets a character avatar pinned to its corner with a speech bubble (e.g., "I'd love to explore something new!")
   - Other cards render without the character — clean but tappable
6. Skill Journey (compact, motivational) — stays below mode cards
   - Skill nodes become tappable → shortcut to Practice with that skill pre-selected

**No student state:** If `selectedStudent` is null (shouldn't happen post-onboarding), show onboarding flow. The mode cards are never rendered without a student.

### Mode Picker UX

- All 3 modes visible from day one. No progressive unlocking.
- Character nudges toward Explore for first-time users (character avatar + speech bubble on the Explore card).
- The nudge is recalculated each time Home loads. Not persisted, not dismissible (it's just a visual highlight, not a modal).

### Practice with No Skill Data

If a user taps Practice but `Object.keys(skillsMastery).length === 0` (new user OR old user with empty mastery):

1. Show a friendly screen: character says "Let's see what you already know!"
2. Auto-generate a single worksheet using `WorksheetService.generateWorksheet()` with:
   - Type: `math` (most foundational)
   - Grade: from student profile
   - Difficulty: `easy`
   - Topics: grade-appropriate mix (K: counting/shapes, 1: addition/subtraction, 2-3: multiplication/fractions, 4-5: fractions/decimals)
   - Count: 5 questions
3. On completion, results are processed normally — the attempt handler already updates `skillsMastery` via `StudentProfileService`
4. Child returns to Home. Practice card now works normally with seeded data.

This is NOT a separate "diagnostic" feature — it uses the existing worksheet generation and scoring pipeline. The only new thing is the framing ("Let's see what you know!") and the auto-generation of settings.

### Smart Suggestions (Client-Side Rules)

A "session" = a completed worksheet. Count via `totalQuestionsAttempted > 0` worksheets in history.

**Tier 1 (0-2 completed worksheets):** Suggest Explore. If 1+ worksheet completed and average score < 70%, suggest Practice instead.

**Tier 2 (3-8 completed worksheets):** Read `skillsMastery`:
- 2+ skills `needsReview` → suggest Practice, name the skill
- No review needed + no new skill in last 3 sessions → suggest Explore
- 3+ day streak + >80% recent accuracy → suggest Challenge

**Tier 3 (8+ completed worksheets):** Add `learningProfile` signals (challengeSeeking, persistenceScore, retentionRate). Still rule-based. Fall back to Tier 2 if `dispositionConfidence < 0.5` or if learningProfile fields are null.

### Inside Each Mode

#### Practice
1. Tap gold Practice card → Practice screen loads
2. **Skill list (new component `SkillPracticeList`):** Vertical scrollable list of skills for the student's grade. Each row shows:
   - Skill emoji + name
   - Mastery bar (percentage fill)
   - Pulsing amber dot if `needsReview: true`
   - Character avatar next to the most urgent review skill with speech bubble
3. **Quick Practice button** at top: auto-selects most urgent `needsReview` skill (or lowest mastery skill if none need review)
4. Tap skill or Quick Practice → auto-generate worksheet:
   - Type: inferred from skill (fractions → math, patterns → logic)
   - Difficulty: from `SkillMastery.currentDifficulty`, drop 1 level if `needsReview`
   - Count: 5 questions
5. Standard attempt screen → Results showing mastery change (e.g., "Fractions: 65% → 72%")
6. Back to Home

#### Explore
1. Tap teal Explore card → **no configuration screen**
2. System auto-picks (reuses `AdaptivePlannerService` logic):
   - Skill not practiced in 7+ days, or never-tried category
   - Any worksheet type (varies for freshness)
   - Easy or medium difficulty
   - 5 questions
   - Narrative theme passed to AI (e.g., "Luna's Space Mission")
3. Loading screen says "Preparing your adventure..." with curious character
4. If generation fails → friendly error screen with character (😅), "Try again" button, and "Back to Home" link. Same pattern as existing Adventure mode error handling.
5. Attempt with narrative framing, character in excited mood
6. Results emphasize "Look what you learned!" + new skill discovered
7. **Back to Home** as primary action. If narrative arc is active (multi-beat arc), also show "Continue the Story" button → navigates directly to Explore auto-generation for next arc beat
8. On Home, the active adventure banner (see Home Screen Layout item 4) persists until the arc completes or the child starts a different mode

#### Challenge
1. Tap violet Challenge card → Challenge screen (refactored `[type]/index.tsx`)
2. Step-by-step builder, pre-filled from student profile:
   - Step 1: Pick type (4 cards: Math, Puzzles, Word Problems, Logic) — reuses existing `WorksheetCard` component
   - Step 2: Pick topic (filtered by type + grade)
   - Step 3: Pick difficulty (Easy/Medium/Hard)
   - Step 4: Pick count (5/10/15)
3. Generate → Attempt → Results with score emphasis + personal bests
4. If generation fails → same error handling as Explore
5. Back to Home

### Mode Persistence

No session-level persistence. Child returns to Home after every worksheet. The active adventure banner on Home (for Explore narrative arcs) provides continuity without locking the child into a mode.

### Age Band Adaptations

Use `getAgeBand(grade: string): 'k1' | '23' | '45'` utility (new file: `utils/ageBand.ts`).

| Aspect | K-1 (ages 5-7) | 2-3 (ages 7-9) | 4-5 (ages 9-11) |
|---|---|---|---|
| Mode cards | Large, emoji-focused, character speech bubbles | Standard with text subtitles | Compact, info-dense |
| Character role | IS the interface | Helpful companion | Advisor/peer |
| Challenge | De-emphasized (smaller card, fewer options) | Equal weight | Flagship (top card) |
| Skill list (Practice) | 3-4 skills, emoji + simple labels | Full list, text labels | Full + mastery %, detailed stats |
| Feedback | Stars, no percentages | "4 out of 5 correct" | Data-rich (%, time, trends) |
| Challenge config | 2 types (Math, Puzzles), Easy/Medium only, 5 questions | All types, all difficulties | All types, all difficulties |

### Data Model Changes

**`WorksheetTemplate` (in StorageService):** Add optional `mode?: 'practice' | 'explore' | 'challenge'` field. Set at creation time when generating a worksheet through any mode.

**`WorksheetAttempt` (in StorageService):** Add optional `mode?: 'practice' | 'explore' | 'challenge'` field. Copied from the template when starting an attempt.

**`types/worksheet.ts`:** Add `WorksheetMode = 'practice' | 'explore' | 'challenge'` type export.

**Existing records migration:** No Firestore migration needed. The `mode` field is optional. Existing records without it are treated as `mode: undefined` (pre-modes era). History tab renders them normally. Analytics can filter by `mode` where present.

**Narrative arc tracking:** Uses existing `NarrativeArcService` and its Firestore collection. No new fields needed — the service already tracks `currentBeat`, arc state, etc. The "active adventure banner" on Home reads arc state from the existing service.

**`skillsMastery`, `learningProfile`, `StudentProfile`:** No changes needed. All fields referenced by Smart Suggestions already exist. `dispositionConfidence` may be 0 for many users — Tier 3 falls back to Tier 2 in that case.

### Files Affected

**Modified:**
- `app/_layout.tsx` — Remove Worksheet tab, register practice/explore as hidden screens (`href: null`)
- `app/index.tsx` — Replace worksheet type cards with mode cards, add active adventure banner, make skill journey nodes tappable
- `app/[type]/index.tsx` — Refactor as Challenge mode entry point. Remove Adventure toggle. Pre-fill from profile.
- `components/home/SkillJourney.tsx` — Add `onSkillPress` callback prop for tappable nodes
- `types/worksheet.ts` — Add `WorksheetMode` type
- `services/StorageService.ts` — Add optional `mode` field to `WorksheetTemplate` and `WorksheetAttempt` interfaces

**New:**
- `app/practice/index.tsx` — Practice mode screen (skill list + auto-generate)
- `app/explore/index.tsx` — Explore mode screen (auto-generate + loading + error)
- `components/home/ModeCard.tsx` — Mode card component (accent strip, icon, title, subtitle, character highlight)
- `components/practice/SkillPracticeList.tsx` — Vertical skill list for Practice mode
- `components/home/AdventureBanner.tsx` — Active narrative arc continuation banner
- `utils/modeSuggestion.ts` — Smart suggestion engine (getSuggestion function)
- `utils/ageBand.ts` — `getAgeBand(grade)` utility

**Reused as-is:**
- `components/WorksheetCard.tsx` — Used inside Challenge mode for type selection (Step 1)
- `app/attempt/[userWorksheetId].tsx` — Unchanged, all modes navigate here for attempts
- `app/history.tsx` — Unchanged, renders all attempts regardless of mode
- `app/profile.tsx` — Unchanged

### Error Handling

All three mode screens handle errors consistently:
- Worksheet generation failure → friendly character screen (😅) with "Try again" + "Back to Home"
- Network offline → Firestore offline cache serves existing data. Generation requires network — show "You're offline" message with character
- Pattern matches existing Adventure mode error handling in `[type]/index.tsx`

### Out of Scope

- Boss Level difficulty / timed challenges (future enhancement for grades 4-5)
- Leaderboards, social features
- Parent-facing mode analytics (future)
- Theme picker redesign (Explore auto-picks themes; existing theme picker remains for manual use)
- Character evolution changes
- Testing strategy (covered in implementation plan)
