---
name: User Testing Round 1 Results & Fix Priorities
description: March 2026 user testing with 3 testers (5th/3rd/1st graders) - validated bugs, prioritized fixes for learning modes redesign
type: project
---

First user testing round completed (2026-03-26) for Practice/Explore/Challenge redesign. 3 testers (5th grader, 3rd grader, reluctant 1st grader).

**Validated critical bugs:**
1. Screen overlay/stacking: mode screens registered as `href: null` tab screens cause pointer interception on web. Fix: move to Stack navigation.
2. Learner switching not persisting: `setSelectedStudent` is React state only, no AsyncStorage persistence. Causes wrong student data in worksheets, profile.
3. Grade-inappropriate Explore content: compound bug from #2 (wrong student) + LLM grade constraint weakness.
4. Challenge topic mismatch: LLM ignores subject prompt. Needs stronger prompt + post-gen validation.
5. Generic history titles: WorksheetService hardcodes "Type Worksheet - Grade X" instead of using concept/subject.

**Score averages:** Home 7.3, Practice 6.3, Challenge 7.0, Navigation 5.0 (dragged down by overlay), Visual 8.7, Engagement 5.3.

**What tested well:** 3-mode framing, character speech bubbles, visual design, skill journey, achievement grid.

**Why:** Navigation (5.0) and Engagement (5.3) are the weak spots. Navigation fix is architectural (overlay bug). Engagement requires wiring up achievements/streaks/character bond -- a longer initiative.

**How to apply:** Tier 1 fixes (overlay, learner switching, grade content) must ship before next test round. Target 7.0+ average across all areas. Engagement above 7.0 requires engagement flywheel work from the codebase gaps analysis.
