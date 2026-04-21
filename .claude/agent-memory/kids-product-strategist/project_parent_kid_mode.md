---
name: Parent/Kid Mode Switch Design Decision
description: Decision context for parent/kid mode switch - Option C (no student login), defaulting to kid mode, parent auth gate discussion
type: project
---

Parent/Kid mode switch design is in progress as of 2026-03-24.

Decisions made:
- Option C: No separate student login. Student uses app after parent logs in.
- App defaults to kid mode after onboarding.
- Parent mode requires authentication to access (switching back to kid mode is free).
- Khan Academy Kids math-gate approach was considered alongside password-from-Profile-tab approach.

**Why:** Single-device, shared usage model. Parent sets up, kid uses daily. Need to prevent kids from accidentally changing settings, signing out, or seeing parent-only data.

**How to apply:** All recommendations about tab structure, navigation, and mode switching should account for this shared-device paradigm. Profile tab redesign is needed -- currently shows parent info (email, sign out) which should be gated.
