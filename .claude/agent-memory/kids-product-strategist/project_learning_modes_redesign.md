---
name: Learning Modes Redesign - Complete Design Decisions
description: All 10 design questions answered for Practice/Explore/Challenge mode restructure - naming, tabs, unlock, suggestions, visual identity, UX flows, age banding
type: project
---

Complete design decisions made (2026-03-25) for restructuring app around intent-based learning modes:

**Naming:** Practice / Explore / Challenge (functional labels) with character-driven subtitles per grade band.

**Tab bar:** 3 tabs (Home, History, Profile). Worksheet tab dropped -- absorbed into Challenge mode on Home.

**Progressive unlock:** None. All 3 modes visible day one. Character nudge toward Explore for first session, not a gate.

**Smart suggestions:** Day-1 = hardcoded "suggest Explore" rule. Sessions 2-3 = simple if/else on skillsMastery/needsReview. Sessions 5+ = use learningProfile data. No AI for suggestions (save budget for worksheet generation).

**Worksheet type cards:** Removed from Home. Live only inside Challenge mode as configuration options. Home shows 3 mode cards instead of 4 type cards.

**Skill Journey:** Stays on Home as motivational anchor. Skill nodes become tappable, linking to Practice mode pre-filtered to that skill. Expanded version shown inside Practice mode with pulsing needsReview indicators. Not shown inside Explore or Challenge.

**Mode persistence:** No session-level mode state. Child always returns to Home mode picker after completing a worksheet. Exception: Explore shows "Continue your adventure" if mid-narrative-arc.

**Visual identity:**
- Practice: gold400/gold50, target icon, character mood "encouraging"
- Explore: teal400/teal50, compass icon, character mood "excited"
- Challenge: violet400/violet50, lightning-bolt icon, character mood "thinking"
- Cards use existing WorksheetCard accent-strip layout pattern

**Age banding (grade-aware rendering, not separate UIs):**
- K-1: bigger touch targets, character voice carries meaning, Challenge de-emphasized, simplified Skill Journey
- 2-3: default design, semi-assisted Challenge config
- 4-5: less directive character, full Challenge config, richer stats, more mature subtitles

**Why:** Current navigation (pick worksheet type then configure) is friction-heavy and doesn't match learning intent. Research supports intent-setting for ages 7+ and character-driven framing for K-1.

**How to apply:** All home screen, navigation, and mode-related implementation should follow these decisions. Mode cards replace worksheet type cards on Home. Challenge screen is the existing [type]/index.tsx with pre-filled config. Explore screen is the existing Adventure pipeline. Practice screen is new (skill picker + auto-generate).
