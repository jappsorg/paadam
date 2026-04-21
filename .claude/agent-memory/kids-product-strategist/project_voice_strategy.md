---
name: Voice Feature Strategy
description: Comprehensive voice-enabling strategy for Paadam — phased TTS/STT plan, technical approach, age-adaptive design, competitive gaps
type: project
---

Voice strategy decided (2026-03-28):

**Phase 1 (MVP, 2-3 weeks):** expo-speech TTS on questions, character voice on encouragement, sound effects (correct/incorrect/celebrate), per-character voice profiles (Ada=calm, Max=energetic, Luna=melodic), age-adaptive pacing (auto-play K-1, tap-to-play 2-3, off for 4-5), parent voice controls panel.

**Phase 2 (Personality, 2-3 weeks):** Character-specific TTS voice differentiation, personalized greetings using student name/context, bond-level-gated messages, Explore mode narration, pre-generated cloud TTS (hybrid with expo-speech) stored in existing audioUrl field.

**Phase 3 (Intelligence, 4-6 weeks):** Voice-guided hints (requires hint system first), spoken wrong-answer explanations, adaptive verbosity (reduce chatter when child is in flow), results screen narration.

**Phase 4 (Future):** STT for voice answers, conversational AI tutoring with Claude. Deferred due to COPPA voice recording requirements and poor STT accuracy for young children.

**Technical decisions:**
- expo-speech for real-time TTS (free, offline, Expo-compatible)
- expo-av for sound effects and cached audio playback
- Cloud TTS (Phase 2+) for premium question audio, pre-generated at worksheet creation time
- VoiceService singleton with priority queue, interruption rules, no overlap
- STT explicitly deferred — numeric keypad is sufficient for math answers

**Key design principles:**
- K-1 auto-play, 2-3 tap-to-play, 4-5 off by default (prevent ABCmouse over-narration problem)
- Voice pacing: K-1 ~120 WPM, 2-3 ~135 WPM, 4-5 ~145 WPM
- Character.voiceId field already exists, wire it to expo-speech voice selection
- readAloud and soundEnabled preferences already on StudentPreferences type

**Competitive gap exploited:** No competitor combines character-specific voice personalities + AI-personalized content + age-adaptive pacing. Khan Academy Kids has good TTS but same voice for all. Prodigy has great sound but doesn't read questions. SplashLearn reads questions but no character depth.

**Why:** Voice unlocks K-2 independent usage (currently requires parent to read), roughly doubling addressable market. Also serves ELL students (~13% of K-12) and dyslexic learners (~15-20%).

**How to apply:** All voice implementation should follow the phased approach. Phase 1 GREEN items first (highest ROI). Never auto-play voice for grades 4-5. Always provide visual mute control on attempt screen. COPPA-safe until Phase 4 (TTS-only = no data collection).
