---
name: Character Selection Interstitial for Parent-Added Children
description: Spec for blocking full-screen character selection when selectedCharacterId is null -- triggers in AppNavigator, reuses existing CharacterSelection component
type: project
---

Design spec completed 2026-03-24 for the character selection interstitial that parent-added children see on first app use.

**Key decisions:**
- Full-screen interstitial in AppNavigator (not a modal, not inline on Home)
- Trigger: `selectedStudent?.selectedCharacterId === null`
- No skip button -- character is required for a non-degraded experience
- Reuses existing CharacterSelection component, wrapped in a thin CharacterSelectionInterstitial
- No theme preferences step -- ThemeAffinityService learns from usage
- Two files affected: create CharacterSelectionInterstitial.tsx, modify AppNavigator.tsx

**Why:** Character affects worksheet dialogue, adventure mode personality, emotional tone. A characterless experience is broken, not neutral. The selection takes <10s so blocking friction is minimal.

**How to apply:** When implementing, slot the check in AppNavigator between the needsOnboarding check and the main app render. Handle network errors with retry UI. Add isCompleting loading state to prevent double-render flicker during Firestore write + context refresh cycle.
