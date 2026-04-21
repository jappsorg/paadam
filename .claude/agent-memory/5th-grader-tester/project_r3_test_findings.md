---
name: Round 3 test findings
description: Maya (Grade 5) Round 3 testing results — critical navigation bug found, several fixes verified
type: project
---

Round 3 testing on 2026-03-26 found a critical regression: `router.replace('/')` guards in practice/challenge screens fire when auth context momentarily returns null during re-renders, kicking users out of in-progress worksheets.

**Why:** The `if (!selectedStudent) { router.replace('/'); }` pattern in tab screens is too aggressive. During React re-render cycles (tab switches, child screen mounts), the context briefly returns null, triggering a hard redirect. This destroys the child attempt screen and loses student progress.

**How to apply:** When reviewing fixes to the overlay/navigation system, verify that the practice and challenge screens handle null auth state gracefully (loading state or early return without redirect) rather than hard-navigating to Home. The fix locations are:
- `app/challenge/index.tsx` lines 47-49
- `app/practice/index.tsx` lines 45-48

Additional issues found in R3:
- Challenge builder topic mismatch: selected Fractions but got Addition
- Segmented button selected states still low contrast vs topic chips
- Answer field pre-fills with previous question's value on auto-advance
- Student context resets to default on direct URL navigation

Fixes verified as working:
- Topic chip bold selected state (violet bg + white text)
- "How tricky?" / "How many?" kid-friendly labels
- "Jump into what you're learning next!" text
- Lazy loading partially works (fresh loads are clean)
