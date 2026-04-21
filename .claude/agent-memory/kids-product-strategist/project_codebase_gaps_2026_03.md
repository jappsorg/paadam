---
name: Codebase gap analysis - March 2026
description: Key gaps identified in Paadam codebase after thorough review - feedback loop, achievements, XP bug
type: project
---

Critical gaps found in codebase review (2026-03-24):

1. **No per-question feedback**: All questions answered first, then graded in batch on submit. Kids get zero feedback between questions. CharacterCompanion mood only changes on navigate (encouraging/thinking), never on correctness mid-worksheet.

2. **Achievements/badges completely unwired**: `achievements?: string[]` and `badges?: Badge[]` exist on StudentProfile but are never populated anywhere. Full Achievement/Badge/AchievementCriteria types are defined. SessionService has `achievementsUnlocked` field but it's always set to `[]`. No AchievementService exists.

3. **XP leveling has a bug**: `awardXP()` compares `newXP >= profile.xpToNextLevel` in a while loop but never subtracts XP consumed — it'll loop infinitely if XP exceeds threshold, or never properly reset. The level goes up but XP bar doesn't reset to show progress within the new level.

4. **Character bond level never increases**: `updateCharacterBond()` exists in StudentProfileService but is never called from any flow.

5. **No daily goals/missions**: DailyGoal type defined but no service or UI implements it.

6. **No hints during worksheet**: Hint types are defined, worksheet questions don't include hints, and the attempt UI has no hint button.

**Why:** These are the top architectural gaps limiting engagement and retention.

**How to apply:** Prioritize fixing the feedback loop (gap #1) as it's the single biggest UX problem. Then wire up achievements (gap #2) as an engagement multiplier. Fix the XP bug (gap #3) as a quick prerequisite.
