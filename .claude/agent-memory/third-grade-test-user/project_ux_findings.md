---
name: Paadam App - UX Findings Session 1 (2026-03-12)
description: First full UX review of Paadam screens from a 3rd grader perspective, covering home, quiz, character, stats, generator, and worksheet cards
type: project
---

Initial UX review conducted 2026-03-12 covering six screens/components.

**Why:** App is a kids worksheet generator targeting elementary school children. UX needs to match cognitive and reading level of ~8-year-olds.

**How to apply:** Use these findings to prioritize future changes. Flag regressions against issues noted here.

## Critical vocabulary problems found
- "Submit Worksheet" — too formal; child would not know what "submit" means in this context
- "Grade Level" — confusing label; kids think of grades as A/B/C not K/1/2/3
- "Include Answers" toggle — ambiguous; kids may toggle this randomly thinking it reveals answers during the quiz
- "View History" button on results screen — children don't think of learning as "history"
- "Number of Questions" label — functional but dry; no engagement
- "Generate Worksheet" button — "generate" is a 3-syllable adult word; child would not self-identify this as the start button
- "XP" abbreviation — kids who haven't played RPGs won't know this means experience points
- "Mastery" in skill labels — abstract concept for 8-year-olds
- "Best Streak" stat label — OK but "best" vs "streak" distinction is subtle

## Character companion strengths
- Max (dog) messages are the most age-appropriate: "Woof!", "Woo-hoo!", "AWESOME!"
- Bounce animation on mood change is a strong positive engagement mechanic
- Emoji avatars (owl/dog/cat) are immediately recognizable and lovable
- Color-coded speech bubbles (green for correct, warm for incorrect) are intuitive

## Character companion weaknesses
- Ada (owl) messages use adult phrasing: "Brilliant work", "Outstanding job", "I'm so proud" — formal parental tone
- Luna (cat) messages have metaphor overload: "Every artist makes sketches first", "That's just a draft" — confusing for 8-year-olds
- Character name in speech bubble uses 11px font — too small for a child to notice who is speaking
- No personalization prompt shown to kids to pick their companion on first use (may exist elsewhere)

## Home screen issues
- "Select a worksheet type" is functional but not inviting — no excitement signal
- "Sign Out" button visible to child — could be tapped accidentally; this is a parent-facing control shown on a child-facing screen
- "Select Student:" label is adult UI language; kids don't think of themselves as "students" in an app context
- Streak display ("3 day streak") is good but the fire emoji context would be stronger if it was bigger

## Quiz/attempt screen issues
- "Attempt Worksheet" fallback title on card header — "attempt" is not kid vocabulary
- "Your Answer" text input label — acceptable, clear enough
- "Previous" / "Next" navigation is clear but text-only; icons alone (arrows) would communicate faster for low readers
- Error message: "Could not submit your worksheet due to a network issue. Please retry or contact support if the problem persists." — entirely adult language, completely inaccessible to an 8-year-old
- "Worksheet not found" and "Worksheet data is not available" error states — no friendly illustration or character message to soften these dead-end states
- Loading state only shows spinner + "Loading worksheet..." — no character animation during wait

## Results screen issues
- Score labels ("Amazing!", "Great job!", "Good effort!", "Keep practicing!") are well-graded and age-appropriate — this is a strength
- "Review Answers" section heading is appropriate
- "Your answer:" / "Correct answer:" labels are clear enough for a 3rd grader
- "View History" button is the weakest action label on this screen
- XP display ("+20 XP") works well for game-literate kids but may confuse others
- Level up message "Level up! Level 5!" is excellent — exciting and clear

## Worksheet generator screen issues
- This is the most adult-facing screen in the app — likely designed for parents
- "Grade Level" selector requires parent knowledge; if auto-set from profile this is less of an issue
- "Include Answers" toggle is dangerous UX — a child who encounters this screen could enable answer cheating unintentionally
- "Generate Worksheet" — the big action button needs a friendlier label for child-facing use
- Difficulty suggestion banner text: "mastered 85% of Addition" — "mastered" and percentages are above 3rd grade comprehension
- Suggestion banner action text "Tap to switch to hard" is clear but the full banner message is too complex

## WorksheetCard descriptions (vocabulary audit)
- "Practice basic math operations with customized worksheets" — "operations" and "customized" are above grade level
- "Fun mathematical puzzles to enhance problem-solving skills" — "enhance" and "mathematical" are above grade level
- "Math word problems for real-world problem solving" — "real-world" is OK but redundant phrasing
- "Brain teasers and logical reasoning problems" — "logical reasoning" is above grade level; "Brain teasers" is fine
- Card titles (Math Worksheets, Math Puzzles, Word Problems, Logic Puzzles) are all acceptable

## Positive patterns to preserve
- Emoji icons on worksheet cards are great entry points
- ProgressBar during quiz is a strong visual affordance kids understand
- Color-coded review cards (green/red border) on results are immediately interpretable
- XP + streak reward section on results is well-structured for game-style motivation
- Max character messages are consistently the most child-appropriate tone

---

## Session 2 findings (2026-03-12): Onboarding Preferences, Theme Picker, Adventure Mode

### PreferencesSetup — parent-facing screen
- Parent framing ("What does [name] love?") is clear and intuitive for a parent; no confusion there
- "Any subjects they find tricky?" is natural parent language — good phrasing
- Subtitle "Optional — helps us personalize" uses "personalize" which is fine for a parent but would be opaque to an 8-year-old if a child ever encountered it
- "Pick up to 3 favorites" is perfectly clear for a parent
- SUBJECT_OPTIONS include "Multiplication", "Division", "Fractions", "Geometry", "Measurement" — all appropriate for a parent to recognize
- Emoji theme cards (100x100, 32px emoji, fontSize.sm label) are visually appealing; emoji size is strong
- 3-item cap on theme selection has NO visible feedback — parent doesn't know WHY the 4th card stopped responding; no "you've picked 3!" indicator or visual counter
- Button label changes between "Continue" and "Skip for now" based on selection state — clever and clear for a parent
- No visible selection count ("2 of 3 chosen") to guide the parent toward completing the step
- Screen is parent-facing but lives inside an onboarding flow that a child could be watching — no "hand this to your grown-up" framing

### ThemePickerScreen — child-facing
- "Pick Your Next Adventure!" is excellent — direct, exciting, age-appropriate, all on one line
- "{character} is ready to explore with you" is warm and creates anticipation — strong
- Card titles computed as "{theme.charAt(0).toUpperCase() + theme.slice(1)} Adventure" — e.g., "Cooking Adventure" — simple and clear for a 3rd grader
- "Tap to start!" is perfect — short, imperative, immediately actionable
- 48px emoji on card is excellent tap target anchor and emotional hook
- Only 2-3 cards shown at once — ideal; avoids choice overload
- "Adventure" word used correctly — 3 syllables but kids know this word from books/TV
- Cards are vertically stacked (gap: spacing.lg) — good for small hands, no accidental mis-taps
- Problem: cardSubtitle "Tap to start!" uses fontSizes.sm and colors.textSecondary — low contrast, likely too small for a child to notice, though the card itself is obviously tappable
- No back button or "I don't want any of these" escape hatch visible in JSX — child is stuck if none of the themes appeal

### Adventure Mode toggle (WorksheetGeneratorScreen)
- Toggle labels are "Manual" vs "Start Adventure!" — the asymmetry is jarring: one is flat adult vocabulary, the other is exciting child vocabulary. A child will obviously prefer "Start Adventure!" but won't know what "Manual" means or why it's even there
- "Beat {n} of {n}" arc progress text — "Beat" used as a noun/game term is actually pretty good for a game-literate 8-year-old; FIFA/Minecraft/Roblox kids understand "beat" in game context. However it lacks a visual label context — a child might not know "beat" means "chapter" here without surrounding copy
- Arc progress bar is rendered (height 8, primary fill) — this is a strong visual affordance; the bar is more readable than the "Beat X of Y" text
- arcProgressText uses fontSizes.xs — very small; a child will ignore this text and rely on the bar only
- "Continue Adventure!" / "Start My Adventure!" button labels are excellent — clear, exciting, age-appropriate
- "I want a different adventure!" pivot button — the phrasing is perfect for a child's voice; feels like something a kid would literally say. Excellent escape hatch copy
- PROBLEM: pivot button uses textDecorationLine: "underline" and fontSizes.sm with colors.textSecondary — it looks like a footnote, not an interactive button. A child will not identify it as tappable. It needs to look like a real button with a border or background
- narrativeIntro text rendered from adaptiveResult.worksheet.narrativeIntro — quality depends entirely on AI-generated content; no static fallback visible. If narrative is verbose or uses adult vocabulary it will be skipped by kids
- characterDialogue.greeting displayed in narrativeCharacter style — this is good placement, but font is only fontSizes.md — should be larger to feel like a character "speaking"
- Error fallback: "Adventure generation failed. Try manual mode." — "manual mode" is adult language; a child cannot act on this
- Manual mode error: "Failed to generate worksheet. Please try again." — at least this has "try again" which is actionable, but still adult phrasing

### Vocabulary red flags in these 3 screens
- "Manual" (toggle label) — not child vocabulary; kids would say "do it myself"
- "Adventure generation failed. Try manual mode." — double failure: "generation" + "manual mode"
- arcProgressText font too small (fontSizes.xs) for a child to read
- switchButtonText visually indistinguishable from fine print — child won't know to tap it

### What's working well in these screens
- ThemePickerScreen is the strongest child-facing screen in the app so far — minimal text, big emojis, clear action, theme colors on card borders
- "I want a different adventure!" is the best escape hatch copy in the app
- "Start My Adventure!" / "Continue Adventure!" button labels set the right tone
- Parent preference screen question phrasing is natural and clear for adults
