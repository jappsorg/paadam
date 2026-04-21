---
name: Kindergarten Accessibility Strategy
description: Comprehensive strategy for making Paadam usable by pre-reading K students — visual questions, auto-TTS, number pad, grade-aware UI
type: project
---

Kindergarten accessibility strategy decided (2026-03-28):

**Core problem:** All 7 major text surfaces (questions, feedback, companion, navigation, mode cards, results, student switcher) are inaccessible to non-readers. TextInput answer field requires keyboard skills K students lack.

**Phase A (Must-have, 4-6 weeks):** TTS auto-read on questions/feedback/companion for K-1, NumberPad component replacing TextInput for K-1, reduce question count to 3-5, larger touch targets (56px min), icon-only buttons for K.

**Phase B (Strategic bet, 4-6 weeks):** Visual question schema using emoji-based scenes rendered natively (not image generation), K-specific LLM prompt generating structured visualScene data, VisualQuestionCard component, multiple-choice visual answers for pattern/comparison questions.

**Phase C (Polish, 2-3 weeks):** Grade-aware simplified home screen for K, character avatar in student switcher, auto-navigate from results, demo question on first launch, hide/simplify Challenge mode for K.

**Key design decisions:**
- NO separate K app/mode fork — grade-aware conditional rendering within existing components
- NO image generation (DALL-E) — emoji-based visual scenes rendered natively
- NO STT — number pad + tap-to-select covers all K answer types
- Auto-read for K-1, tap-to-read for 2-3, off for 4-5 (aligns with voice strategy)
- Visual question format uses structured data (visualScene objects) not text
- Character becomes primary interface for K (voice narrator, not text bubble)

**Competitive positioning:** Khan Academy Kids is gold standard for K voice/visual but lacks AI-generated content variety. Paadam's differentiator = AI-generated visual questions + character-voiced narration + adaptive difficulty. No competitor combines all three.

**Why:** K students (~20% of K-5 addressable market) currently cannot use the app independently. Fixing this roughly doubles the usable audience and makes the product viable for the grade band where parents most actively seek learning apps.

**How to apply:** All K-related implementation should follow Phase A->B->C ordering. Phase A items are prerequisites for any K usability. Visual question schema (Phase B) is the differentiator but requires Phase A voice to be useful. Grade-aware rendering should use `selectedStudent?.grade === 'K'` or a grade-band check, not a separate code path.
