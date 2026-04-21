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

---

## Session 3 findings (2026-03-24): Live App Test — All 5 tabs

### Critical bugs discovered during live testing
- GRADE SELECTION BUG (P0): Grade button does not stick to the value clicked. Repeatedly clicking "3rd Grade" resulted in "1st Grade" or "5th Grade" being shown as selected. This is a functional bug that completely breaks the child's ability to self-select their grade. The worksheet that was generated came out as "Grade 5" fractions problems even though user intended 3rd Grade Multiplication.
- TOPIC MISMATCH (P0): Even when Multiplication was selected in the topic picker, the generated worksheet contained only fractions questions. The AI ignored the topic selection.
- TAB NAVIGATION RESETS STATE (bug): Clicking the Worksheet tab from the History tab caused the full app to reload to the Home screen URL (/). This is disorienting; a child would not understand what happened.
- ADVENTURE MODE STALLED VISIBLY: "Getting ready..." text appeared on the button for an extended time with no animation or progress indicator. A child would assume it's broken and keep tapping.
- WORKSHEET PREVIEW PERSISTS BELOW ADVENTURE PANEL: The previously generated worksheet preview (Grade 5 fractions) remained visible below the Adventure mode panel. This is visually confusing — the child sees two things at once.
- BLANK WHITE BOX in quiz view: Large empty white rectangle above the question text on the attempt screen. Appears to be an unfilled content area (possibly where a worksheet illustration or character should appear).

---

## Session 4 findings (2026-03-25): Sam persona — Adventure Mode full run as 3rd grader

### New bugs discovered
- ATTEMPT SCREEN RENDERED UNDER WORKSHEET PANEL (P1): When navigating from Adventure mode directly into the attempt screen without reloading the URL, the attempt view renders layered beneath the worksheet generator panel. "Next Question" does not advance the question — clicking it appears to re-render the whole layout and lock the answer input as readonly. Workaround: direct URL navigation to /attempt/[id] loads the screen cleanly. A real child would have no way to recover from this — they'd be stuck forever on Q1.
- WRONG BUDDY ON DIRECT URL LOAD: When navigating directly to /attempt/[id] without going through the home screen first, Max (dog) appears instead of Luna (cat) who is Sam's assigned buddy. Profile context is not loaded when entering via direct URL. Not a child-facing issue in normal flow but shows context dependency.
- GRADE SHOWN AS "GRADE 5" ON PROFILE: Sam's profile shows "Grade 5" in the Profile tab even though Sam is a 3rd grade student. This is either a data entry error in the test fixture or a regression from the grade selection bug. A child seeing "Grade 5" on their own profile would be confused.
- ADVENTURE GENERATION LOADING: Still no animation during "Getting ready..." — static button with spinner. Previously flagged, not fixed. Confirmed still present (~8-10 second wait with no movement).

### Bugs FIXED since session 3
- Blank white box on attempt screen: No longer present on fresh direct-URL load of attempt screen.
- Adventure mode content grade level: Generated "Animal Adventure with Luna: Multiplication Magic!" with 5 correct Grade 3 multiplication questions (3x4, 5x2, 6x3, 4x3, 2x5). Previous session produced Grade 1 addition. This is a significant improvement.
- Worksheet preview persistence: Not observed on this session when loading attempt via direct URL.

### Per-question feedback system (new feature — first full test)
- "Correct! +10 XP" banner appears immediately after clicking Check — excellent, instant, unambiguous
- Buddy (Max) message updates on every answer: "AWESOME! You crushed it!", "YES! High five! That's amazing!", "Woo-hoo! You're a superstar!" — these are the best child-appropriate messages in the app
- Star icon appears next to buddy avatar on correct answer — good visual flourish
- XP counter in top-right corner updates live: 10 → 20 → 30 → 40 → 50 — visible, motivating
- "Check" button is disabled until text is typed — good safeguard, prevents accidental blank submits
- "Next Question" label changes to "See My Results!" on final question — excellent context-aware copy
- Progress bar fills incrementally across questions — strong visual affordance
- NOTE: Luna's messages (when loaded as correct buddy) were more poetic/abstract: "Softly, gently... you'll find the answer", "You're painting a great picture here...", "Let your imagination help you..." — these are appropriate for a cat personality but lean more reflective than celebratory. Max's messages are more energetic and immediately satisfying for an 8-year-old.

### Results screen (new/improved)
- "Amazing! 100%" with large coral/pink percentage — visually striking, age-appropriate
- "+70 XP" and "1 day streak (+1!)" reward summary — clear and motivating
- Per-question review cards with green background: "Q1 ✅ ... Your answer: 12 ... 💡 3 groups × 4 penguins = 12 penguins total" — the explanation format is excellent for learning. Grade-appropriate language.
- "Let's See How You Did" section header — friendly, age-appropriate
- "My Past Scores" and "Done" action buttons — "Done" is perfect; "My Past Scores" is slightly adult but acceptable
- Max says "You're incredible! Let's celebrate!" — great energy on the results screen

### Profile tab observations (Sam, post-adventure)
- Shows Max (dog) instead of Luna (cat) — wrong buddy displayed; Sam's buddy is Luna
- "Maya's buddy" subtitle visible under Max — data is showing wrong student's buddy (Maya's, not Sam's). This is a profile context bug: profile tab is not switching to Sam's context
- 70 / 100 XP shown with progress bar — correct, readable, motivating
- "30 more XP to level up!" — excellent explicit goal text; tells the child exactly what to aim for
- "Buddy Bond: Just getting to know each other!" — warm, age-appropriate label for bond level 1
- Achievements: 4/14 unlocked — "First Steps", "Perfect!", "Getting the Hang of It", "Skill Star" all visible with emoji icons. Locked ones show "? / ???" which is an appealing mystery/curiosity hook for kids
- Grade shows "Grade 5" — incorrect for Sam who should be Grade 3

### History tab observations
- "My Worksheets / 5 so far — nice!" — warm, encouraging
- Top entry: "Animal Adventure with Luna: Multiplication Magic! — Finished! — Score: 100% — Today" — correctly recorded, great visibility
- "Look at it ›" action — slightly more engaging than "View" but still adult-ish; could be "Play Again ›"
- Trash icon (🗑️) still visible by default on every card — accidental deletion risk for a child still present
- "Today" relative date label — major improvement over raw date from session 3
- History shows 5 entries including previous test sessions: "Math Worksheet - Grade 1", "Animal Addition Adventure (0%)", "Still working" entries — these are carryover from prior sessions but show the history is persistent and accurate

### Home screen (revised assessment 2026-03-24)
- "Welcome! 👋" header — warm, good
- "What shall we explore?" — excellent child-friendly phrasing
- "Pick an adventure below" — good framing; uses "adventure" consistently
- Card descriptions significantly improved from session 1: "Solve fun number puzzles. Can you crack them all?" is age-appropriate and engaging; "Figure out tricky riddles using clues. Like a detective!" is excellent — uses "Like a detective!" which is very child-appealing
- Door emoji (🚪) in top right corner — a child has no idea this is Sign Out. Completely unreadable as a function. This is a significant regression from having a text label. Kids will tap it out of curiosity.
- Bottom tab bar: "Home", "Worksheet", "History", "Profile", "Insights" — 5 tabs is on the edge of too many for an 8-year-old. Tab icon glyphs (non-emoji icon font characters) are illegible.

### Worksheet tab — Build My Own mode (revised 2026-03-24)
- Mode toggle labels: "🔧 Build My Own" vs "🚀 Adventure!" — the emoji anchors help enormously; wrench vs rocket is intuitively "boring vs exciting" for a kid
- "What grade are you in?" — better than "Grade Level" from session 1, child-appropriate question form
- "What do you want to practice?" — good phrasing
- "How tricky should it be?" — EXCELLENT phrasing; much better than "Difficulty"
- "How many problems?" — simple and clear
- "Show answers on the sheet?" toggle — improved from "Include Answers"; still potentially confusing (child may think this shows their answers, not an answer key)
- "Go! Make it! 🎉" — EXCELLENT button label; exciting, clear, age-appropriate
- PROBLEM: Too many topic choices (13 options including Algebra, Geometry, Decimals). Algebra and Geometry are not 3rd grade topics. A child seeing "Algebra" will be confused/intimidated. The list should be filtered by grade selection.
- PROBLEM: Grade button selection is broken (see bug above). This means the entire form is unreliable.
- PROBLEM: The topic list wraps across multiple lines with no visible grouping. A child scanning this will not know where to look.

### Worksheet attempt screen (revised 2026-03-24)
- Header "Math Worksheet - Grade 5" — dry, adult label; should be something like "Your Math Challenge!"
- Character (Ada owl) present with message "Take your time, think it through!" — appropriate encouragement tone
- Progress indicator "Question 1 of 10" — clear and reassuring for a child
- Progress bar visible — good visual
- BLANK WHITE BOX: Large empty area above question text. No content. Very alarming for a child.
- Question content (fractions at Grade 5 level): "If 3/4 of a pizza is divided equally among 6 friends, what fraction of the whole pizza will each friend receive?" — This is NOT a 3rd grade multiplication question. It is a 5th grade fractions problem. The grade/topic mismatch means a 3rd grader gets material far above their level.
- "Your Answer" input label — acceptable
- Previous/Next buttons have text AND arrow icons — improvement over text-only from session 1

### Adventure mode screen (revised 2026-03-24)
- "Ready for an Adventure?" heading — EXCELLENT
- "Your buddy will pick the perfect challenge for you!" — warm, age-appropriate, builds trust in the character
- Large teal "Let's Go! 🚀" button — visually distinctive and exciting; best CTA button in the app
- Owl character with sparkle decorations (✨⭐✨) — charming and engaging
- When loading: button text changes to "Getting ready..." — this is fine text but no animation accompanies it. A child staring at a static button with no movement for 5+ seconds will assume it is broken.
- Adventure result (from snapshot): Generated "Animal Addition Adventure" — excellent theme name. Question: "Ada sees 3 rabbits hopping in the garden and 2 more rabbits join them. How many rabbits are there now?" — This is appropriate 1st grade addition, not 3rd grade content. Adventure mode may not be using the student profile grade level.
- "I want something different!" button visible in snapshot — good escape hatch but styling issue from session 2 still applies (looks like fine print, not a button)

### History tab (revised 2026-03-24)
- "My Worksheets" — good child-facing label (improvement from session 1's "Worksheet History")
- "1 so far — nice!" — friendly, encouraging subtitle. Excellent child-appropriate tone.
- Worksheet card shows: title "Math Worksheet - Grade 5", date "3/24/2026", status "Still working" in orange, action "Keep going ›" in red
- "Still working" status label — acceptable but slightly adult; "Keep going!" is better (and it is used as the action)
- "Keep going ›" link — good phrasing and action orientation
- Date display "3/24/2026" — kids do not orient to dates. A child does not know if 3/24/2026 was yesterday or last year. Replace with relative labels: "Today", "Yesterday", "3 days ago"
- Trash can icon (🗑️) — visible immediately on the card. A child may tap this accidentally. It should be hidden behind a long-press or swipe, not surfaced by default.
- Empty state potential: "1 so far — nice!" implies the empty state may be less encouraging. Need to verify what shows before first worksheet.

### Profile tab (revised 2026-03-24)
- Shows "Test Parent" name and email — this is a parent account; the profile is parent-facing
- Stats cards: "Worksheets --", "Total XP --", "Best Streak --" — dashes show no data yet, which is fine
- "Total XP" — still present; "XP" is ambiguous without explanation
- "Best Streak" — acceptable
- "Sign Out" button with door emoji — this is appropriate on the Profile tab (parent-facing); less appropriate on the Home screen header
- Profile is almost entirely empty for a fresh account. A child who navigates here sees nothing personal. No avatar customization, no character shown, no progress visualization.
- No student profile visible — the logged-in account is the parent. The child-facing experience does not seem to have a separate child profile screen.

### Insights tab (revised 2026-03-24)
- "Insights" — this is entirely a parent-facing screen; a child would not understand any of it
- "This Week" section: "Practice Time 0m", "Accuracy 0%", "Streak 0 days", "XP Earned 0" — all zeroes since no worksheet completed
- "Skills" section: "No skills tracked yet. Start a worksheet to begin!" — clear enough for a parent
- "How They're Feeling" with neutral emoji 😐 and "Energy: Varies / Focus: Varies" — this section is genuinely confusing even for a parent. How was "neutral" determined? What does "Varies" mean?
- "Your Notes for the AI" — this is explicitly parent-facing (uses "your child"). A child who lands here sees an empty text box and "Share observations to help guide your child's learning path" — they have no idea what this means
- "Recent Activity" shows two entries both labeled "Worksheet / Math • 3/24/2026" — no differentiation between the two, no status, no score
- This tab should either be hidden from child navigation or have a clear mode switch ("Parent View / Kid View")
- The tab label "Insights" is too abstract for a child; even parents may not immediately know what this tab contains

---

## Session 5 findings (2026-03-25): Sam persona Round 2 — Adventure Mode re-test after bug fixes

### Critical bugs that persist (NOT fixed from Round 1/Session 4)
- LAYERED ATTEMPT SCREEN OVERLAY (P0, REGRESSION CONFIRMED): The attempt screen for the most-recently-opened in-progress worksheet renders as a full-screen overlay on top of ALL other screens including History, Profile, and tab bar. This makes every tap land on the invisible overlaid attempt rather than the visible screen. The overlay completely blocks: History card taps, "Keep going ›" links, Profile tab, and even the bottom tab bar navigation. The only escape is navigating directly to a fresh URL (home or profile) where the overlay doesn't load. A real child is completely stuck — they cannot navigate away from any screen while an in-progress attempt exists.
- ATTEMPT URL REDIRECT BUG (P0, NEW): When navigating directly to /attempt/[id], the app silently redirects to a DIFFERENT attempt ID (the most recently created in-progress attempt for the user). The URL in the address bar updates and the wrong worksheet loads. This means direct URL navigation to a specific attempt is broken — the app ignores the ID in the URL. A child coming back to a specific adventure cannot reach it.
- PROFILE SHOWS WRONG BUDDY AND WRONG STUDENT DATA (P1, UNCHANGED): Profile tab loaded without Sam context shows Max (Maya's buddy) with label "Maya's buddy" and Grade 5. Sam's correct data (Luna, Grade 3) is not shown. The profile tab does not respond to the learner switcher — it always shows the first/default student's data on direct load.
- ADVENTURE GENERATION LOADING STATE (P2, UNCHANGED): "Getting ready..." button with spinner remains static for ~8 seconds. Still no animation on the character, no loading message changes, no progress indication. Confirmed still present in Round 2.

### Context loss bug (NEW)
- When "Let's Go!" is tapped in Adventure mode, Sam's context (Luna, Grade 3) is used to GENERATE the worksheet correctly (Grade 3 multiplication confirmed in Firestore), but AFTER generation the home screen header silently switches back to "Hey, Maya!" and the worksheet form shows "Ready for Maya! Grade 5". The student context is lost mid-flow. A child who switched to Sam and started an adventure would see "Maya" re-appear — very confusing.

### What IS working correctly in Round 2
- Adventure screen entry: "Ready for an Adventure?" with correct Luna (cat) emoji showing when Sam is selected — the buddy context is applied at this stage
- Worksheet content: "Animal Adventure with Luna: Multiplication Magic!" generated with correct Grade 3 multiplication questions (Firestore confirmed: grade "3", subject "multiplication", 5 questions with single-digit multiplication)
- XP badge visible in top-right of attempt screen (seen in overlay screenshot: "10 XP" appearing after answering Q1 via indirect interaction)
- Max buddy messages remain excellent child-appropriate copy: "I'm cheering for you!", "Come on, let's solve it together!"
- History tab correctly lists "Animal Adventure with Luna: Multiplication Magic!" as a "Still working" entry with "Keep going ›" — the data is saved correctly, the navigation to it is broken
- "My Worksheets / 9 so far — nice!" — friendly counter
- "Today" date labels on all history entries — relative dates confirmed working

### Scores for Round 2 (Sam, 8-year-old persona)
- The adventure worksheet itself (Grade 3 multiplication, animal theme) is GOOD content once you can reach it
- The navigation layer to reach and complete it is BROKEN
- Profile tab data is WRONG (Maya's data, not Sam's)
- A real child in this session would be completely blocked after tapping "Let's Go!" — they would land on the wrong attempt (Grade 5 fractions), be unable to navigate away, and eventually give up

### What improved since session 3/4
- Adventure entry screen still clean and well-designed (Luna shown correctly on selection)
- "Animal Adventure with Luna: Multiplication Magic!" content confirmed Grade 3 appropriate
- History tab shows adventure worksheet with correct title and "Still working" status
- "Today" relative dates confirmed on all history entries
- Blank white box on attempt screen: confirmed absent on direct clean load

### What regressed or remained broken since session 3/4
- Layered rendering bug has WORSENED: now affects not just the worksheet tab but every screen including tab bar clicks, making full app navigation impossible while any in-progress attempt exists
- URL-based attempt navigation broken: /attempt/[id] always redirects to a different attempt
- Profile context not following learner switcher: shows Maya's data regardless of selected learner

### What improved since session 3
- Home screen card descriptions are significantly more child-friendly
- "Go! Make it! 🎉" button is a major improvement over "Generate Worksheet"
- "How tricky should it be?" is much better than "Difficulty"
- "My Worksheets / 1 so far — nice!" is an improvement on the History tab
- Adventure mode entry screen ("Ready for an Adventure?" + owl + sparkles + teal button) is the most polished screen in the app
- "Let's Go! 🚀" is excellent CTA copy

### What regressed or remained problematic since session 1
- Grade selection is now broken (functional bug, not just UX)
- Topic/grade mismatch in generated content (both modes produce wrong content)
- Door emoji (🚪) for Sign Out is worse than a text label — icon is not recognizable
- Tab icon glyphs are still unreadable (non-emoji icon font)
- "Insights" tab remains entirely adult-facing with no child-friendly version
- Blank white box on quiz screen is a new regression
- Adventure mode loading state has no animation/feedback
- Worksheet preview persists below Adventure mode panel (visual clutter)

---

## Session 6 findings (2026-03-26): Redesigned home — 3 mode cards (Practice / Explore / Challenge)

### Overview of redesign
- Home screen now uses 3 mode cards instead of worksheet type cards: Practice (gold), Explore (teal), Challenge (violet)
- "What do you feel like doing? / Pick your path" replaces old "Select a worksheet type"
- Tab bar reduced from 5 tabs to 3 tabs: Home, History, Profile (Insights and Worksheet tabs removed)
- Gear icon (⚙️) replaces door emoji (🚪) for Settings — improvement, but still not labeled
- "Your Journey" skill path added to home screen below the mode cards
- Mode cards get personalized buddy hints: "🦉 Let's practice what we tried last time!" (Practice), "🐶 Let's explore something new today!" (Explore)
- Practice mode has its own dedicated /practice route with Quick Practice button + skill list
- Explore mode navigates to /explore and auto-generates an adventure worksheet (new loading state)
- Challenge mode navigates to /challenge with step-by-step builder (type → topic → difficulty → count)

### What improved significantly since sessions 1–5
- HOME SCREEN: "What do you feel like doing?" is EXCELLENT — direct question, age-appropriate, conversational
- HOME SCREEN: 3 mode cards with clear color coding (gold/teal/violet) are immediately parseable
- HOME SCREEN: Buddy context hints on cards ("Let's practice what we tried last time!") are warm and child-facing
- HOME SCREEN: "Pick your path" subtitle is simple and clear
- HOME SCREEN: "Your Journey" skill path with emoji icons is visually engaging — pizza for Fractions is charming
- TAB BAR: Down from 5 tabs to 3 — major improvement, less cognitive load for an 8-year-old
- EXPLORE LOADING: New loading state shows buddy emoji + teal spinner + "Preparing your adventure... Finding something new for you!" — a significant improvement over the static "Getting ready..." button from sessions 4–5
- CHALLENGE BUILDER: Type picker (4 cards: Math Practice, Math Puzzles, Word Problems, Brain Teasers) is clean and easy
- CHALLENGE BUILDER: "Set up your Math Worksheets" + Topic/Difficulty/Questions layout is much cleaner than the old form
- CHALLENGE BUILDER: Topic is now pill-shaped chip buttons — very tappable, visually clear selection state
- CHALLENGE BUILDER: Difficulty and Questions now use segmented button groups (Easy/Medium/Hard, 5/10/15) — extremely clear
- CHALLENGE BUILDER: "Let's Go! ⚡" button is prominent purple and exciting — good CTA
- PRACTICE SCREEN: "Quick Practice" button (gold banner) is an excellent one-tap shortcut
- PRACTICE SCREEN: Skill list with colored progress bars (green for 100%, teal for partial, empty for not started) is instantly readable
- PRACTICE SCREEN: "Not started" label under unpracticed skills is clean and informative
- PROFILE: Now shows buddy prominently at top with level bar — much more engaging than old text-based stats
- PROFILE: "40 more XP to level up!" explicit goal text is excellent — tells the child exactly what to do
- PROFILE: Achievement grid with mystery "? / ???" for locked items creates good curiosity hook
- PROFILE: Colored stat cards (red for streak, teal for XP, purple for record) are visually appealing
- HISTORY: Now working cleanly via tab navigation — no need to navigate away
- HISTORY: "10 so far — nice!" subtitle is warm and encouraging

### Bugs FIXED since sessions 4–5 (P0/P1)
- TAB NAVIGATION: History tab now loads correctly from any screen without resetting to home — this was a P0 previously. Confirmed working in session 6.
- INSIGHTS TAB: Removed from tab bar entirely — no longer confusing children with adult analytics
- WORKSHEET TAB: Removed from tab bar — replaced by Challenge mode card on home
- ADVENTURE LOADING STATE: Now shows animated spinner + buddy emoji + text — no longer a static frozen button (though still no bouncing character animation)
- CHALLENGE LOADING STATE: "Building your challenge... ⚡" with spinner appears during generation — fast and informative

### Bugs PERSISTING from previous sessions
- OVERLAY BUG (P0, UNCHANGED): The primary panel (Practice/Explore/Challenge) still renders as a full-screen fixed overlay on top of the home screen when navigated via the mode cards. The home screen behind it intercepts pointer events, making any click on the panel fail with "subtree intercepts pointer events" error. Confirmed in session 6 for Practice and Challenge panels. The URL correctly changes to /practice or /challenge but the home layer underneath blocks all interactions. Workaround: navigate directly to the URL via window.location.href (not the mode card tap) to get a clean load.
- WRONG LEARNER ON DIRECT URL LOAD (P1, UNCHANGED): Navigating directly to /practice or /challenge resets to Maya (default learner), not the selected learner. Jordan's skills show correctly when navigating via the mode card (before the overlay blocks interaction), but on direct URL load it shows Maya's skills. Root cause: learner context is not persisted to URL or localStorage.
- TOPIC MISMATCH IN GENERATED CONTENT (P0, UNCHANGED): Challenge mode "Let's Go!" generates wrong content. Tested: selected Multiplication + Medium + 5 questions. Generated content: "Math Worksheet - Grade 5" with fractions question "What is 3/4 + 1/4?" — completely wrong topic AND wrong grade. Same topic/grade mismatch confirmed for all 6 sessions.
- EXPLORE MODE GENERATES WRONG GRADE (P1, UNCHANGED): Explore generated "Animal Adventure Addition" with Grade 1 addition ("2 giraffes + 3 more"). Jordan is a 3rd grader. The AI ignores the student profile grade for both Adventure/Explore mode and Challenge mode.
- QUICK PRACTICE ROUTES TO OLD WORKSHEET (P1): Tapping "Quick Practice" in Practice mode navigated to an old "Math Worksheet - Grade 5" attempt (algebra content: "If x + 7 = 15") rather than generating a new worksheet appropriate for the child. It appears to be reopening an existing in-progress attempt rather than generating fresh practice content.
- PROFILE SHOWS WRONG STUDENT (P1, UNCHANGED): Profile tab shows Maya's buddy (Max) and "Maya's buddy" subtitle and Grade 5, even when navigated to via tab click on a clean load. Jordan's data (Ada owl, Grade 3) is not shown. Student context is not followed into the profile tab.
- DIFFICULTY SELECTION NOT VISUALLY DISTINCT (UX): In the Challenge builder, after clicking Medium, the snapshot shows Easy as [active] and Medium as unselected. The visual selection state may be unreliable or the aria-active attribute is not updating properly.
- OVERLAY BUG CAUSES CHECK BUTTON ISSUE: When the attempt screen loads as an overlay on top of home, the Check button is aria-disabled even though text has been typed into the answer box. Force-clicking it via JS dismisses the overlay and returns to home rather than checking the answer.

### New UX observations specific to the redesign

#### Home screen mode cards — Jordan's assessment
- "Practice / Get stronger at what you know" — strong: understands the word "practice", "stronger" creates a growth framing
- "Explore / Discover something new!" — excellent: exclamation point creates excitement; "discover" is a familiar word
- "Challenge / Build your own worksheet" — mixed: "Challenge" is clear but "Build your own worksheet" uses "worksheet" which is a school word not a kid word
- Buddy hint banners on cards are charming and personalized — they create a sense that the buddy is talking directly to the child
- The gold/teal/violet color scheme with left accent borders is distinctive and pretty — easily distinguishable at a glance
- "Pick your path" subtitle is slightly adult but acceptable — most 8-year-olds know "path" from video games

#### Practice screen — Jordan's assessment
- "Quick Practice / Strengthen your weakest skill" — "strengthen" is 3 syllables but kids know it from sports/PE; "weakest skill" is clear
- The big orange gold-colored "Quick Practice" banner stands out well — a child would tap it first
- Skill bars: Addition 100% (full green bar) is immediately interpretable — a child understands "all the way full = good"
- "Not started" in gray/purple text under unpracticed skills — clear and non-threatening, not shaming
- The math operator icons (+, -, x, ÷) next to skill names are excellent visual anchors for early readers

#### Explore loading screen — Jordan's assessment
- Owl emoji + spinning teal circle + "Preparing your adventure... / Finding something new for you!" is warm and builds anticipation
- The loading takes ~10–12 seconds on average — this is at the edge of what an 8-year-old will wait without getting distracted. No animation on the owl itself during loading (static emoji).
- There is no cancel/back button visible during loading — a child who changes their mind is stuck until generation completes

#### Challenge type picker — Jordan's assessment
- "What do you want to work on?" is great — direct and friendly
- 4 cards with emojis (🔢 🧩 📝 🕵️) and labels (Math Practice, Math Puzzles, Word Problems, Brain Teasers) are all child-recognizable
- "Math Practice" is redundant with the mode name but still clear
- "Brain Teasers" is the most exciting-sounding option — kids know this from TV shows
- "Word Problems" is school vocabulary but most 3rd graders know what word problems are
- "← Change type" back link at top after selecting a type — functional but small; a child might miss it vs. tapping browser back

#### Challenge builder form — Jordan's assessment
- "Set up your Math Worksheets" — "Set up" is clear; "Math Worksheets" uses the school word but it's in context
- Topic chips are horizontally scrollable — the row cuts off after "Time" and "Money" and "Random" are not visible until scrolling. A child may not know to scroll right.
- Algebra and Geometry appear in the topic list — these are not 3rd grade topics and could intimidate or confuse a 3rd grader. The list is not filtered by grade.
- Difficulty segmented buttons (Easy/Medium/Hard) are clean but the selected state styling is subtle — white background vs. cream background difference is very low contrast. A child may not know which is selected.
- Questions (5/10/15) same issue — selected state contrast is low
- "Let's Go! ⚡" button is vibrant purple and large — excellent; this is the most visually prominent element on the page

#### History tab — Jordan's assessment
- "My Worksheets / 10 so far — nice!" — warm, encouraging; the counter is fun ("10 so far — nice!" has good energy)
- "Still working" in orange — visible but not urgent-feeling; a child won't feel bad about it
- "Keep going ›" as action — perfect phrasing, encouraging
- "Look at it ›" for finished items — acceptable but less exciting than "See how I did ›"
- Trash icon 🗑️ visible on every card by default — accidental deletion risk. Still present from session 1 — not fixed.
- Many entries have duplicate titles "Math Worksheet - Grade 5" — a child looking for a specific past session cannot tell them apart. Need unique identifiers (topic + date combo or custom names).
- "Today" / "Yesterday" relative dates — confirmed working; this is good

#### Profile tab — Jordan's assessment
- Buddy display at top (large circle avatar + name + "Learning Buddy") is warm and prominent
- "Maya's buddy" subtitle visible under Max — this is wrong data for the current session which navigated as Jordan. Bug persists.
- "Level 1 / 60 / 100 XP" with progress bar — "XP" is still unexplained but in context of "level" most game-literate kids understand
- "40 more XP to level up!" — excellent explicit goal text
- "Buddy Bond" with tiny red progress bar + "Just getting to know each other!" — charming copy; the progress bar is very short (almost empty) which visually communicates early stage appropriately
- "Grade / Grade 5" — shows wrong grade (Maya's Grade 5 vs. Jordan's Grade 3). Context bug persists.
- Achievements grid (3/14 with emoji icons for unlocked, "? / ???" for locked) — the mystery boxes are a strong engagement mechanic. Kids love unlocking things.
- Achievement names visible: "First Steps" (star), "Getting the Hang of It" (muscle), "Skill Star" (star) — all child-appropriate labels

### Vocabulary that still needs improvement (session 6)
- "Build your own worksheet" in Challenge card description — "worksheet" is a school word, less fun than "your own quest" or "your own challenge"
- "Strengthen your weakest skill" in Quick Practice — "weakest" has a slightly negative connotation; could be "the one you want to work on most"
- "Set up your Math Worksheets" in Challenge builder header — "set up" and "worksheets" both slightly dry
- "← Change type" back link label — a child doesn't think of modes as "types"
- "Topic" section label in Challenge builder — functional but dry; could be "What kind of math?"
- "Difficulty" section label in Challenge builder — still adult word; the old "How tricky should it be?" was better
- "Questions" section label in Challenge builder — fine but "How many?" would feel more conversational

### What's working best in the redesign (preserve these)
- 3-mode home screen structure is a major improvement over the old worksheet type card grid
- Buddy hint banners on mode cards are the most child-friendly new addition
- "Your Journey" skill path on home is visually engaging with the connected circle nodes
- "Quick Practice" big orange banner in Practice mode is a great one-tap starting point
- Skill bars with math operator icons are immediately readable
- Explore loading state (buddy + spinner + warm text) is much better than old static button
- Challenge type picker with 4 clean cards is the clearest worksheet-starting flow in the app's history
- Challenge builder segmented buttons for difficulty and question count are much better than the old dropdowns
- "Let's Go! ⚡" is the best big action button in the app
- History and Profile now reachable via clean tab navigation without URL resets
- Achievement mystery boxes ("? / ???") are an engaging, child-friendly mechanic
