---
name: Add Child from Parent Dashboard
description: Separated parent-facing "Add Child" form from kid-facing onboarding flow -- parent collects name+grade only, child picks character on first use
type: project
---

Parent Dashboard "Add Another Child" now uses a dedicated AddChildForm component instead of re-using the kid-facing OnboardingFlow.

**Why:** The OnboardingFlow speaks to the child ("Let's Get Started!", "Pick your buddy!") which is jarring when a parent is adding a child from a parent-context dashboard. Dual-audience separation principle: parent flows speak to parents, child flows speak to children.

**How to apply:**
- AddChildForm collects only name + grade (parent-appropriate copy, single screen)
- Character selection is deferred -- child picks their companion on first use (selectedCharacterId: null)
- Theme preferences are skipped -- ThemeAffinityService learns from usage
- OnboardingFlow is still used for the first-child flow (in AppNavigator) since the kid may be present
- Future work: when a child profile has no selectedCharacterId, prompt character selection on first app open for that profile
