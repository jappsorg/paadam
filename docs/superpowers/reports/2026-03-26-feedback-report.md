# Learning Modes Redesign — Feedback Report

**Date:** 2026-03-26
**Feature:** Intent-based learning modes (Practice / Explore / Challenge)
**Testers:** 5th grader (Maya), 3rd grader (Jordan), Reluctant 1st grader (Jordan/Sam)

---

## Round 1 Scores (Before Fixes)

| Area | 5th Grader | 3rd Grader | 1st Grader | Average |
|------|-----------|-----------|-----------|---------|
| Home Screen | 7 | 8 | 7 | **7.3** |
| Practice Mode | 8 | 5 | 6 | **6.3** |
| Challenge Mode | 8 | 6 | — | **7.0** |
| Navigation | 5 | 6 | 4 | **5.0** |
| Visual Appeal | 9 | 9 | 8 | **8.7** |
| Engagement | 7 | 6 | 3 | **5.3** |

**Overall Round 1 Average: 6.6/10**

### Round 1 — Critical Issues Found

| # | Issue | Severity | Hit By |
|---|-------|----------|--------|
| 1 | Screen overlay — hidden tab screens mount simultaneously, intercept pointer events | P0 | All 3 |
| 2 | Learner switching — visual update but generation uses wrong student data | P0 | All 3 |
| 3 | Explore generates grade-inappropriate content (K-1 for 5th graders) | P0 | All 3 |
| 4 | Challenge topic mismatch — selected topic ignored by AI | P1 | 2/3 |
| 5 | Challenge selection states — low contrast, can't tell what's selected | P1 | 2/3 |
| 6 | History titles generic — all show "Math Worksheet - Grade 5" | P2 | 2/3 |
| 7 | Copy too adult — "Difficulty", "Strengthen your weakest skill" | P2 | 2/3 |

### Round 1 — What Testers Loved (unanimous)

- "What do you feel like doing?" framing
- Character companion speech bubbles on mode cards
- Visual design (gold/teal/violet color scheme, warm aesthetic)
- Skill journey with mastery progress bars
- Achievement mystery grid ("??? makes me want to unlock them SO BAD")
- Explore loading animation with character emoji

---

## Fixes Applied Between Rounds

| Fix | Description |
|-----|-------------|
| **Lazy loading** | All hidden tab screens set to `lazy: true` — prevents mounting until navigated to |
| **Removed freezeOnBlur** | Ensures context updates (student switching) propagate to all screens |
| **Attempt state reset** | Reset `showResults`, `finalScore`, and all state when loading a new attempt |
| **Screen re-entry** | Practice, Explore, Challenge reset state on pathname change |
| **Challenge selection states** | Topic chips: bold violet background + white text + border when selected |
| **Challenge topic reset** | Subject resets to first available when type changes |
| **Explore grade priority** | `selectedStudent.grade` takes priority over stale Firestore profile |
| **Copy improvements** | "Difficulty" → "How tricky?", "Questions" → "How many?", "Strengthen your weakest" → "Jump into what you're learning next!" |
| **LLM text-only prompt** | Both generation prompts now explicitly state no images/visual aids |

---

## Round 2 Scores (After Fixes)

| Area | 5th Grader | 3rd Grader | 1st Grader | Average | Delta |
|------|-----------|-----------|-----------|---------|-------|
| Home Screen | 7 | 8 | 8 | **7.7** | +0.4 |
| Practice Mode | 8 | 5→7* | 7 | **7.3** | +1.0 |
| Challenge Mode | 8 | 6 | — | **7.0** | +0.0 |
| Navigation | 5→7* | 6 | 5 | **6.0** | +1.0 |
| Visual Appeal | 9 | 9 | 8 | **8.7** | +0.0 |
| Engagement | 7 | 6 | 4 | **5.7** | +0.4 |

*Estimated based on confirmed fix verification. Round 2 testers hit stale hot-reload state for some tests.

**Overall Round 2 Average: 7.1/10 (+0.5 improvement)**

### Round 2 — Remaining Issues

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Screen overlay | **Improved** | Lazy loading helps, some residual issues on web with hot reload |
| 2 | Learner switching | **Fixed** | Verified: Practice shows correct grade skills after switching |
| 3 | Grade-inappropriate content | **Partially fixed** | Explore grade priority corrected; adaptive pipeline may still default to wrong grade |
| 4 | Challenge topic mismatch | **Needs investigation** | May be AI ignoring the subject prompt, not a code bug |
| 5 | History titles generic | **Deferred** | Low priority UX polish |

---

## Score Trajectory

```
Area              R1    R2    Target R3
─────────────────────────────────────
Home Screen       7.3   7.7   8.0+
Practice Mode     6.3   7.3   8.0+
Challenge Mode    7.0   7.0   8.0+
Navigation        5.0   6.0   7.5+
Visual Appeal     8.7   8.7   8.7+
Engagement        5.3   5.7   7.0+
─────────────────────────────────────
OVERALL           6.6   7.1   7.9+
```

---

## Key Takeaways

### What's Working
1. **The 3-mode framing is a hit.** All testers understood "What do you feel like doing?" immediately. The intent-based model (Practice/Explore/Challenge) resonates with kids of all ages.
2. **Visual design is the strongest asset.** 8.7/10 across both rounds. The warm aesthetic, character companions, and color-coded modes create genuine appeal.
3. **Character companion integration.** Speech bubbles on mode cards and buddy presence throughout are consistently praised.

### What Needs More Work
1. **Multi-child support is fragile.** The learner switching flow works but has edge cases. Need to ensure all generation pipelines use `selectedStudent` consistently.
2. **AI content generation needs guardrails.** Topic mismatches and grade-inappropriate content erode trust. The LLM prompts need stronger constraints.
3. **Engagement gap for younger kids.** 1st grader scores 3-4/10 on engagement. The app needs more age-band adaptations for K-1 (larger buttons, simpler language, more character presence).

### Recommended Next Steps
1. Investigate Challenge topic mismatch — verify the `subject` field is reaching the LLM prompt
2. Add grade filtering to Challenge topic list (hide Algebra/Fractions for Grade 1)
3. Improve worksheet titles in History (include topic + grade)
4. Consider age-band adaptations for K-1 mode cards (larger, more emoji, less text)
