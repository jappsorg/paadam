# Product Requirements Document (PRD)

## Paadam: AI-Powered Adaptive Learning Companion

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** Planning Phase  
**Owner:** Paadam Team

---

## 📋 Executive Summary

### Product Vision

Transform Paadam from a simple worksheet generator into an AI-Agent-Powered Learning Companion that provides every child with a persistent, intelligent tutor. This tutor uses specialized tools to generate personalized content, maintains continuous availability for questions and support, and partners with parents to optimize each child's learning journey.

### The Problem

Current educational apps face critical limitations:

- **Static Content**: One-size-fits-all worksheets that don't adapt to individual needs
- **No Continuity**: Students start fresh each session; apps don't remember struggles or breakthroughs
- **Limited Support**: Children get stuck and have no one to ask for help
- **Parent Disconnect**: Parents lack insight into what their child is learning and how to help
- **Motivation Gap**: Gamification often distracts from learning rather than enhancing it

### The Solution

An AI learning agent that:

- **Knows Each Child Deeply**: Maintains full memory of every interaction, learning pattern, and preference
- **Always Available**: Provides continuous conversational support - answers questions, clarifies concepts, motivates
- **Uses Intelligent Tools**: Generates personalized worksheets, assesses understanding deeply, analyzes progress
- **Partners with Parents**: Transparent reporting, collaborative goal-setting, configurable autonomy
- **Adapts in Real-Time**: Adjusts difficulty, provides scaffolding, celebrates growth

### Key Differentiators

1. **AI Agent-First Architecture**: Not a feature, but the core product
2. **Persistent Memory**: 30-day detailed history + summarized long-term memory
3. **Continuous Availability**: Agent present throughout learning, not just for evaluation
4. **Parent Partnership**: Dual-mode interface with parent-controlled configuration
5. **Multi-Child Support**: One parent account manages multiple children with independent agents
6. **Tool-Based Intelligence**: 22+ specialized tools for content generation, assessment, and analytics

---

## 🎯 Product Goals

### Primary Goals

1. **Improve Learning Outcomes**: Students demonstrate mastery (85%+ accuracy) before advancing
2. **Increase Engagement**: 80%+ of students maintain 7+ day streaks
3. **Build Confidence**: Students willingly tackle challenging problems
4. **Empower Parents**: Parents understand their child's progress and how to support learning
5. **Scale Personalization**: Every child gets individualized instruction without human tutor costs

### Success Metrics

#### Learning Outcomes

- **Mastery Rate**: % of skills reaching 85%+ mastery level
- **Retention Rate**: % of mastered skills retained after 1 month
- **Learning Velocity**: Average time to skill mastery vs baseline
- **Transfer Learning**: Ability to apply concepts to new contexts

#### Engagement

- **Daily Active Users (DAU)**: % of registered students active daily
- **Session Duration**: Average time spent (target: 15-20 min optimal sessions)
- **Streak Maintenance**: % maintaining 7+ day streaks
- **Return Rate**: % returning after 1 week, 1 month
- **Voluntary Usage**: % sessions initiated by child vs parent

#### Parent Satisfaction

- **Report Engagement**: % parents reading weekly reports
- **Configuration Usage**: % parents adjusting agent settings
- **Feedback Participation**: % parents responding to agent questions
- **Recommendation Score (NPS)**: Net Promoter Score for parent satisfaction

#### Agent Intelligence

- **Question Relevance**: % student questions answered helpfully (parent survey)
- **Difficulty Accuracy**: Student success rate 70-80% (sweet spot)
- **Advancement Precision**: % correct advancement decisions (based on subsequent performance)
- **Conversation Quality**: % positive sentiment in student-agent interactions

---

## 👥 User Personas

### Primary Persona: Maya (7-year-old, 2nd Grader)

**Background**:

- Grade 2 student, loves animals and nature
- Enjoys learning but gets frustrated when stuck
- Needs patient explanation and visual aids
- Thrives with encouragement and celebration

**Goals**:

- Understand math, not just get right answers
- Feel confident in her abilities
- Have fun while learning
- Get help when confused

**Pain Points**:

- Gets stuck and doesn't know how to ask for help
- Worksheets feel boring and repetitive
- Doesn't see her progress over time
- Sometimes rushes through without understanding

**How Paadam Helps**:

- Agent (Ada the Owl) available anytime to answer questions
- Personalized problems using animal themes
- Patient explanations with visual aids
- Celebrates effort and progress, not just correctness

---

### Secondary Persona: Sarah (Maya's Mom, Primary Caregiver)

**Background**:

- Working parent with limited time to supervise learning sessions
- Wants to support Maya's education actively
- Not confident in modern teaching methods
- Needs to manage multiple children's learning
- **Often relies on grandparents, babysitters, or other caregivers during after-school hours**
- Wants caregivers to support learning without giving them full account access or exposing private data

**Goals**:

- Understand what Maya is learning and how she's progressing
- Know when Maya needs help or intervention
- Ensure steady progress without pushing too hard
- Collaborate with educators and family caregivers effectively
- **Enable trusted caregivers to supervise learning sessions safely**
- **Protect her children's learning data and personal information**

**Pain Points**:

- Can't attend to Maya during all practice sessions
- Doesn't know if Maya is truly understanding or just guessing
- Unsure when to advance or review topics
- Lacks visibility into learning patterns
- **Worries about giving login credentials to temporary caregivers**
- **Needs babysitters to be able to help Maya without accessing other children's data**
- **Concerned about emotional memory - a "bad day" session shouldn't permanently affect Maya's learning path**

**How Paadam Helps**:

- AI-generated weekly reports with insights
- Notifications when approval needed for advancement
- Parent mode to configure agent personality and autonomy
- Suggested conversation starters for offline learning
- **Guest Mode QR codes for temporary caregivers (time-limited, child-specific access)**
- **Secondary caregiver permissions for grandparents with read-only or supervised access**
- **"Right to Forget" - delete skewed session data from bad days**
- **PII Sanitization Layer ensures zero personal data reaches AI providers**

---

### Secondary Persona: Grandma Jean (Secondary Caregiver)

**Background**:

- Retired teacher, helps with Maya's after-school care 2-3 days/week
- Tech-comfortable but not tech-native
- Wants to support learning consistently with Sarah's approach
- Doesn't need full parent account access

**Goals**:

- Help Maya with her learning sessions during after-school hours
- Follow Sarah's pedagogical preferences (patience level, difficulty settings)
- Know when to contact Sarah for questions
- See how Maya is doing without accessing sibling data

**Pain Points**:

- Doesn't want to mess up Sarah's settings
- Worried about accidentally advancing Maya incorrectly
- Wants to see progress but doesn't need full parent dashboard access
- Uncomfortable with using Sarah's login credentials

**How Paadam Helps**:

- **Secondary Caregiver Role**: Read-only access to Maya's profile only
- **Supervised Mode**: Can support sessions but can't change settings
- **Notifications**: Sarah gets alerts when Grandma Jean helps with sessions
- **Simple Interface**: Caregiver view shows only essential info (current skill, recent progress)

---

### Tertiary Persona: Brianna (Evening Babysitter, Guest User)

**Background**:

- College student who babysits Maya 1-2 evenings/week
- Comfortable with technology and apps
- Not a regular caregiver - temporary, short-term relationship
- Should NOT have ongoing access to family data

**Goals**:

- Help Maya complete her learning session during babysitting hours
- Follow Sarah's instructions for screen time and learning
- Know how to support Maya if she's stuck
- Complete the session without needing to contact Sarah

**Pain Points**:

- Doesn't want to create yet another account with personal info
- Uncomfortable with being given family login credentials
- Unsure about appropriate difficulty level for Maya
- Needs quick temporary access that automatically expires

**How Paadam Helps**:

- **Guest Mode QR Code**: Sarah generates time-limited QR code (e.g., "valid for 4 hours")
- **Zero Account Required**: Brianna scans QR code, gets instant access to Maya's learning session only
- **Auto-Expiry**: Access automatically expires after time limit
- **Session Summary**: Sarah receives recap of what Maya accomplished during guest-supervised session
- **Privacy-First**: Brianna never sees other children, reports, or family data

---

### Tertiary Persona: Ms. Johnson (2nd Grade Teacher)

**Background**:

- Teaches 25 students with varied skill levels
- Wants to differentiate instruction
- Limited time for individual student tracking
- Uses technology to supplement classroom learning

**Goals**:

- Identify students needing extra support
- Track progress across multiple students
- Assign appropriate practice work
- Involve parents in learning process

**Pain Points**:

- Can't provide individualized instruction to all students
- Hard to track each student's specific misconceptions
- Parent communication is time-consuming
- Needs data to inform instruction

**How Paadam Helps** (Future):

- Classroom dashboard showing all students' progress
- Misconception reports for targeted intervention
- Parent reports automatically generated
- Ability to assign specific skills for practice

---

## 📖 User Stories

### Student Experience

#### As a student, I want...

**Learning Session**:

- To start a practice session and immediately feel welcomed by my agent who remembers me
- To ask questions anytime I'm confused and get helpful answers
- To get problems that are challenging but not impossible
- To see visual aids and examples when I need them
- To receive encouragement when I'm struggling
- To celebrate when I succeed
- To see my progress and unlock achievements

**Getting Help**:

- To ask "what does this word mean?" and get a simple explanation
- To ask "how do I start this?" and get guidance without giving away the answer
- To say "I don't understand" and have the agent break it down
- To ask "is this right?" and be encouraged to check my own work
- To use hints when I'm stuck without feeling bad about it

**Engagement**:

- To have a character companion who learns with me
- To earn stars and XP for my effort
- To maintain streaks and see my consistency
- To unlock new character accessories and themes
- To feel proud of my achievements

### Parent Experience

#### As a parent, I want...

**Visibility**:

- To receive weekly reports on my child's progress
- To understand what skills my child is working on
- To see patterns in when my child learns best
- To know what my child finds easy vs challenging
- To get alerts when my child achieves milestones

**Control**:

- To choose the agent personality that fits my child's learning style
- To decide how much autonomy the agent has (auto-advance vs approval required)
- To set focus areas and learning goals
- To adjust difficulty preferences (conservative vs accelerated)
- To manage multiple children from one account

**Collaboration**:

- To provide feedback to the agent about my child's needs
- To be asked for approval before major changes (if configured)
- To get conversation starters for discussing learning with my child
- To receive suggested offline activities to reinforce skills
- To communicate concerns and see them addressed

**Peace of Mind**:

- To know my child is getting quality instruction
- To feel confident the agent is making good decisions
- To trust that my child is challenged appropriately
- To have data privacy and security guarantees

**Data Control**:

- To delete specific learning sessions if my child was sick, frustrated, or upset
- To ensure the agent's decisions aren't based on "bad day" data
- To reset progress if we took a long break and need to start fresh
- To know my child's personal information is never sent to external AI providers
- To manage who has access to my child's learning data (family, caregivers, teachers)

---

## 🎨 Feature Requirements

### 1. AI Learning Agent (Core System)

#### 1.1 Persistent Memory System

**Priority**: P0 (Must Have)

**Requirements**:

- Maintain full conversation logs for last 30 days
- Store summarized history for all prior sessions (weekly summaries, milestones)
- **Prioritize emotional/behavioral memory over raw question data**:
  - Learning disposition patterns (energy level, frustration triggers, confidence moments)
  - Emotional states during sessions (engaged, frustrated, bored, excited)
  - What motivates this specific child (praise style, challenge level, rewards)
  - Breakthrough moments and celebrations
- Track all question attempts with detailed metadata (time, hints used, strategy)
- Log all agent decisions with reasoning
- Record parent/caregiver communications and feedback
- Support efficient querying of historical data
- **Learning Disposition Tracking**: Monitor which personality style correlates with highest mastery velocity
- **Right to Forget**: Parents can reset/delete specific session memory if data is skewed (child was sick, frustrated, etc.)

**Acceptance Criteria**:

- Agent can reference specific emotional patterns (\"I noticed you love it when we celebrate with emojis!\")
- Agent remembers student's interests and incorporates them
- Parent reports include historical trends (week-over-week, month-over-month)
- **Parent reports show personality effectiveness metrics with swap suggestions if applicable**
- Session history loads in <2 seconds
- **Parents can mark sessions as \"exclude from analysis\" or \"reset memory\" within 48 hours**
- **Reset sessions don't affect mastery calculations but are excluded from behavioral patterns**

#### 1.2 Dual-Mode Interface

**Priority**: P0 (Must Have)

**Requirements**:

- **Kid Mode**: Warm, conversational, age-appropriate interface
- **Parent Mode**: Analytical, data-rich dashboard
- Secure switching between modes (PIN/biometric)
- Clear visual distinction between modes
- Multi-child switching in parent mode
- Maintain context when switching back to kid

**Acceptance Criteria**:

- Mode switch requires authentication
- Kid cannot access parent mode
- Parent can switch between children seamlessly
- UI clearly indicates current mode

#### 1.3 Conversation Engine

**Priority**: P0 (Must Have)

**Requirements**:

- Always-available chat interface during sessions
- Natural language understanding of student questions
- Context-aware responses based on current problem
- Voice input/output option
- Text-to-speech for questions and agent responses
- Response time <3 seconds for conversational queries

**Acceptance Criteria**:

- Student can ask questions at any point
- Agent provides helpful, age-appropriate responses
- Conversation flows naturally without rigid structure
- Voice input accuracy >90% for grade-level vocabulary

---

### 2. Content Generation & Assessment

#### 2.1 Worksheet Generator

**Priority**: P0 (Must Have)

**Requirements**:

- Generate personalized worksheets based on skill, difficulty, student context
- Incorporate student interests (animals, sports, etc.)
- Adjust for learning modality (visual, verbal, kinesthetic)
- Avoid recently used questions
- Support 10-15 question worksheets
- Include visual aids where appropriate
- Generate in <5 seconds

**Acceptance Criteria**:

- No duplicate questions within 14 days
- Interest incorporation in 40%+ of word problems
- Difficulty distribution matches student's mastery level
- Parent can review worksheet content in parent mode

#### 2.2 Answer Evaluator

**Priority**: P0 (Must Have)

**Requirements**:

- Evaluate correctness with partial credit support
- Analyze strategy used (not just answer)
- Detect common misconceptions
- Identify mistake types (calculation, conceptual, careless)
- Generate immediate, encouraging feedback
- Update mastery levels in real-time
- Evaluation time <2 seconds

**Acceptance Criteria**:

- Provides specific feedback on errors ("You added correctly but forgot to regroup")
- Recognizes multiple valid solving strategies
- Partial credit awarded for correct process with calculation error
- Feedback is encouraging, not discouraging

#### 2.3 Adaptive Difficulty

**Priority**: P0 (Must Have)

**Requirements**:

- Real-time difficulty adjustment based on performance
- Target 70-80% success rate (optimal challenge zone)
- Consider speed, hints used, recent accuracy
- Prevent difficulty from changing too rapidly
- Respect parent difficulty preferences (conservative/balanced/accelerated)

**Acceptance Criteria**:

- Student success rate stays within 60-85% range
- Difficulty increases after 3+ consecutive correct answers at current level
- Difficulty decreases after 3+ consecutive incorrect answers
- Parents can override auto-adjustment in settings

---

### 3. Agent Tools (26 Tools)

#### 3.1 Conversational Tools (P0)

1. **Concept Explainer**: Explains vocabulary, concepts on-demand
2. **Question Answerer**: Helps with "how do I start?" type questions
3. **Encouragement Generator**: Motivates based on situation and personality
4. **Clarification Helper**: Breaks down confusing problems

#### 3.2 Content Tools (P0)

5. **Worksheet Generator**: Personalized worksheet creation
6. **Question Generator**: On-demand question creation mid-session
7. **Hint Generator**: Progressive hints (4 levels)

#### 3.3 Assessment Tools (P0)

8. **Answer Evaluator**: Deep answer analysis
9. **Mastery Calculator**: Skill mastery levels
10. **Misconception Detector**: Identifies systematic errors

#### 3.4 Progress Tools (P0)

11. **Progress Analyzer**: Trends, patterns, predictions
12. **Readiness Assessor**: Advancement decisions
13. **Student Profile Query**: Current state retrieval
14. **Learning Disposition Analyzer** ⭐ NEW: Analyzes emotional patterns, energy levels, frustration triggers, confidence moments during sessions
15. **Personality Effectiveness Tracker** ⭐ NEW: Monitors mastery velocity and engagement per personality; generates swap suggestions

#### 3.5 Parent Communication (P0)

16. **Parent Report Generator**: Weekly reports with insights
17. **Notification Composer**: Student & parent notifications

#### 3.6 Privacy & Access Control (P0) ⭐ NEW

18. **PII Sanitizer Tool**: Strips all personally identifiable information before LLM calls
    - Input: Raw conversation/data with child name, locations, timestamps
    - Output: Sanitized text with tokens like [STUDENT], [PARENT], relative times
    - CRITICAL: Cannot be bypassed, enforced architecturally

19. **Guest Access Generator**: Creates time-limited QR codes for temporary caregivers
    - Input: studentId, duration (1h/4h/8h/24h), guestName
    - Output: QR code data, expiration time, guest session URL
20. **Caregiver Permission Validator**: Checks if caregiver can perform action
    - Input: caregiverId, action (view/supervise/configure), studentId
    - Output: boolean permission + rationale

21. **Session Exclusion Manager** ⭐ NEW: Handles "Right to Forget" session marking
    - Input: sessionId, excludeFromAnalysis, excludeMasteryData, reason
    - Output: Updated session status, recalculated personality metrics if needed

#### 3.7 Advanced Tools (P1 - Future)

22. **Work Analysis Tool** (vision/NLP for show-your-work)
23. **Prerequisite Checker**
24. **Skill Path Navigator**
25. **Content Library Query**
26. **Session History Query**
27. **Conversation Memory Search**
28. **Achievement Checker**

**Acceptance Criteria** (All Tools):

- Input/output schemas documented
- Response time <5 seconds (except Work Analysis: <10s)
- Error handling with graceful degradation
- All tool calls logged with reasoning
- **PII Sanitizer runs before EVERY LLM-bound tool call** (automated test enforced)

---

### 4. Parent Partnership Features

#### 4.1 Agent Configuration

**Priority**: P0 (Must Have)

**Requirements**:

- **7 Personality Profiles**: Parent selects from predefined options
  - Ada the Owl (Patient & Methodical)
  - Max the Fox (Energetic & Encouraging)
  - Luna the Cat (Curious & Questioning)
  - Rocky the Pup (Supportive & Growth-Minded)
  - Zara the Dragon (Challenging & Adventurous)
  - Clover the Bunny (Gentle & Reassuring)
  - Bailey the Bear (Balanced & Friendly)

- **Autonomy Levels**: Parent chooses decision-making level
  - Full Auto: Agent advances automatically
  - Notify & Auto: Notifies but proceeds
  - Approval Required: Waits for parent OK
  - Guided: Parent approves all major decisions

- **Communication Frequency**: Daily updates, weekly summaries, or milestone-only
- **Difficulty Preference**: Conservative, balanced, or accelerated
- **Custom Focus Areas**: Parent can specify priority topics

**Acceptance Criteria**:

- Parent can change personality anytime (takes effect next session)
- Autonomy settings affect advancement, difficulty changes, topic shifts
- Configuration persists across devices
- Agent behavior clearly reflects selected personality
- **After 10+ sessions, agent provides personality effectiveness report**:
  - \"Maya's mastery velocity is 15% higher with Luna (Curious) vs Bailey (Balanced)\"
  - \"Consider trying [Personality X] - similar students show better engagement\"
  - Data-driven suggestion with parent final decision
- **Parents can A/B test personalities** (\"try this for 2 weeks\")

#### 4.2 Weekly Reports

**Priority**: P0 (Must Have)

**Requirements**:

- AI-generated personalized reports every 7 days
- Include: summary stats, skill progress, observations, challenges, wins
- Highlight pending approvals (if autonomy requires it)
- Provide conversation starters for parent-child discussion
- Suggest offline activities
- Allow parent to respond with feedback

**Acceptance Criteria**:

- Report generated automatically every Monday
- Readable in 5-7 minutes
- Includes at least 3 actionable insights
- Parent can ask follow-up questions
- Agent incorporates feedback into next week's plan

#### 4.3 Multi-Child Management

**Priority**: P0 (Must Have)

**Requirements**:

- One parent account supports unlimited children
- Each child has independent agent with full memory
- Easy switching between children in parent mode
- Separate progress tracking, reports, configurations
- Aggregate view showing all children's status
- Individual notifications per child

**Acceptance Criteria**:

- Parent can add new child in <2 minutes
- Switching between children takes <3 seconds
- Each child's data is isolated (no cross-contamination)
- Parent can view "all children" summary dashboard

---

### 5. Multi-Caregiver & Guest Access

#### 5.1 Secondary Caregivers (Grandparents, Regular Babysitters)

**Priority**: P0 (Must Have)

**Requirements**:

- **Invitation System**: Parent sends email invitation with role assignment
- **Caregiver Roles**:
  - **Read-Only Viewer**: Can see child's progress, reports, session history. Cannot change settings or approve decisions
  - **Supervised Helper**: Can supervise learning sessions, see progress. Cannot change agent configuration or approve major decisions
  - **Full Co-Parent**: Can change all settings except account deletion

- **Child-Specific Access**: Caregiver can be assigned to specific children only
  - Grandma Jean sees Maya and Liam but not baby Emma
  - After-school tutor sees Maya only

- **Activity Notifications**: Primary parent receives notifications when secondary caregiver:
  - Supervises learning session
  - Views reports
  - Changes settings (if permitted)

- **Audit Log**: All caregiver actions logged with timestamp and name

**Acceptance Criteria**:

- Primary parent can invite unlimited secondary caregivers
- Each caregiver gets their own login (no credential sharing)
- Caregiver sees only children they're assigned to
- Caregiver role limits are enforced (read-only cannot modify)
- Primary parent receives summary of caregiver activity weekly
- Caregiver invitations can be revoked instantly
- Revoked caregivers lose access within 5 minutes

#### 5.2 Guest Mode (Temporary Caregivers)

**Priority**: P0 (Must Have)

**Requirements**:

- **QR Code Generation**: Parent creates time-limited, single-child QR code
  - Valid for 1 hour, 4 hours, 8 hours, or 24 hours
  - Tied to one specific child only
  - No account creation required

- **Guest Session Flow**:
  1. Parent generates QR code in app: "Brianna is babysitting Maya tonight, 6-10pm"
  2. Parent shows QR code to babysitter
  3. Babysitter scans QR code with their phone (any camera app)
  4. Opens browser-based guest interface
  5. Can start/supervise learning session for that child
  6. QR code expires automatically at end time

- **Guest Capabilities** (Limited):
  - Start learning session for assigned child
  - View current skill being practiced
  - See agent's conversation with child
  - Cannot see: other children, reports, session history, settings
  - Cannot do: change configuration, approve decisions, view PII

- **Auto-Expiry**: Access terminates at scheduled time
- **Session Summary**: Parent receives notification when guest session ends with summary:
  - Duration of session
  - Skills practiced
  - Questions attempted
  - XP earned
  - Agent observations

- **Privacy Protection**:
  - Guest never sees child's full name (shows as "M" or "Maya F." first name only)
  - Guest never sees parent contact info
  - Guest cannot screenshot or export data (web app uses screenshot prevention when possible)

**Acceptance Criteria**:

- Parent can generate QR code in <30 seconds
- QR code scans successfully on iOS and Android
- Guest accesses session within 30 seconds of scanning
- Guest sees only assigned child
- QR code becomes invalid exactly at expiration time
- Expired QR codes show "This access code has expired" message
- Parent receives session summary within 5 minutes of session end
- Guest cannot access app after code expires even if still scanning

#### 5.3 Caregiver Handoff Scenarios

**Priority**: P1 (Nice to Have)

**Requirements**:

- **Scheduled Handoffs**: Parent can pre-schedule caregiver access
  - "Grandpa gets access every Tuesday and Thursday 3-6pm"
  - Auto-generates recurring guest codes or uses secondary caregiver role

- **Emergency Access**: Parent can remotely grant immediate access via text/notification
  - "Maya needs help now, click this link to start session"

**Acceptance Criteria**:

- Recurring schedules work for at least 8 weeks
- Emergency access activates within 1 minute of request
- Scheduled access auto-expires on schedule

---

### 6. Privacy & Data Security

#### 6.1 PII Sanitization Layer (CRITICAL)

**Priority**: P0 (Must Have - Zero Compromise)

**Requirements**:

- **Architectural Guarantee**: Every request to external LLM providers (OpenAI, Claude, etc.) MUST pass through PII sanitization layer
- **Pre-Processing Rules**:
  - Replace child's name with `[STUDENT]` token
  - Replace parent/caregiver names with `[PARENT]` or `[CAREGIVER]`
  - Strip specific locations (school names, city names, addresses)
  - Remove or pseudonymize timestamps (use relative times: "3 days ago" vs "January 15, 2026")
  - Replace identifiable interests with generic categories if necessary (keep "animals" strip "Maya's pet hamster Fluffy")

- **Sanitization Scope**:
  - All tool calls that invoke LLM
  - Conversation history sent as context
  - Parent feedback sent to agent
  - Student profile summaries

- **What NEVER Reaches LLM**:
  - Full child name
  - Parent email, phone number
  - School name or teacher name
  - Specific addresses or neighborhoods
  - Exact timestamps with date/time
  - Any PII as defined by COPPA/GDPR

- **What IS Shared (Sanitized)**:
  - Learning patterns, mastery levels
  - Emotional states and dispositions
  - Question content and answers
  - Agent observations (if PII-free)
  - Curriculum progress

**Acceptance Criteria**:

- Automated tests verify no PII in outbound LLM requests
- Manual audit of 100 sample requests confirms zero PII leakage
- PII sanitization layer cannot be bypassed (enforced at architecture level)
- Parent dashboard shows "PII Protection Active" indicator
- Privacy policy explicitly states PII never reaches external AI providers

#### 6.2 "Right to Forget" - Session Memory Management

**Priority**: P0 (Must Have)

**Requirements**:

- **Session Exclusion**: Parent can mark any session as "Exclude from Analysis" within 48 hours
  - Reasons: Child was sick, frustrated, tired, distracted, testing the app
  - Excluded sessions don't contribute to:
    - Behavioral pattern analysis
    - Emotional disposition tracking
    - Personality effectiveness calculations
- **Session Exclusion Impact**:
  - Skill mastery data retained (correct/incorrect answers still count for academic progress)
    - Exception: Parent can optionally exclude mastery data too ("child was guessing randomly")
  - Conversation logs and agent observations excluded from memory
  - Session appears in history but marked with ⚠️ "Excluded from Analysis" badge

- **Parent Controls**:
  - "Exclude this session" button on session detail page
  - Bulk exclude multiple sessions ("exclude all sessions from last week - we were on vacation")
  - Require confirmation before excluding to prevent accidental clicks

- **Memory Reset Options**:
  - **Soft Reset**: Exclude recent sessions but keep mastery data
  - **Hard Reset**: Full memory wipe - start agent relationship fresh (requires confirmation + 24hr cool-off)
  - Hard reset preserves academic mastery levels but resets emotional/behavioral memory

**Acceptance Criteria**:

- Parent can exclude any session within 48 hours (after 48hrs, option is removed to prevent gaming system)
- Excluded sessions show ⚠️ icon in session history
- Agent reports explicitly state "Based on X sessions (Y excluded by parent)"
- Personality effectiveness reports exclude sessions marked as excluded
- Hard reset requires typing "RESET MEMORY" to confirm
- After hard reset, agent greets student as if first meeting but knows current skill levels

---

### 7. Gamification & Motivation

**Priority**: P0 (Must Have)

**Requirements**:

- **XP & Levels**: Earn XP for questions, level up with rewards
- **Stars**: Daily currency for completing activities
- **Streaks**: Track consecutive days of practice
- **Achievements**: Unlock badges for milestones
  - Skill mastery achievements
  - Streak achievements (3, 7, 14, 30 days)
  - Learning behavior achievements (asking questions, showing work)
  - Milestone achievements (level 10, 100 questions, etc.)

**Acceptance Criteria**:

- XP awarded immediately after each question
- Level-up triggers celebration animation
- Streaks auto-update with freeze protection (1 per week)
- Achievement notifications are celebratory but not disruptive

---

### 8. Curriculum & Content

#### 6.1 Skills & Prerequisites

**Priority**: P0 (Must Have)

**Requirements**:

- Comprehensive skill taxonomy (K-5 math initially)
- Clear prerequisite relationships
- Skill tree visualization for students
- Mastery thresholds defined per skill (default 85%)
- Multiple difficulty levels per skill (1-10)

**Acceptance Criteria**:

- All grade-level standards mapped to skills
- No circular prerequisites
- Skill tree shows locked/unlocked/in-progress/mastered states
- Prerequisites verified before unlocking new skills

#### 6.2 Question Bank

**Priority**: P0 (Must Have)

**Requirements**:

- Minimum 50 questions per skill per difficulty level
- Multiple question types (multiple-choice, numeric, word problems, show-work)
- Visual aids for 30%+ of questions
- Age-appropriate language and contexts
- Answer keys with explanations

**Acceptance Criteria**:

- Questions reviewed for mathematical correctness
- Language appropriate for grade level
- Diverse contexts (avoid stereotypes)
- Visual aids are clear and helpful

---

## 🏗️ Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌──────────────┐           ┌──────────────────────────┐   │
│  │  Kid Mode UI │           │  Parent Mode UI          │   │
│  │  - Chat      │           │  - Dashboard             │   │
│  │  - Problems  │           │  - Reports               │   │
│  │  - Character │           │  - Settings              │   │
│  └──────┬───────┘           └───────────┬──────────────┘   │
│         │                               │                   │
│         └───────────┬───────────────────┘                   │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (TypeScript)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Agent Service                                         │ │
│  │  - Conversation management                            │ │
│  │  - Tool orchestration                                 │ │
│  │  - Context management                                 │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────┴────────────────────────────────┐ │
│  │               Tool Layer (22 Tools)                    │ │
│  │  - Content Generation  - Assessment                   │ │
│  │  - Progress Analytics  - Communication                │ │
│  └───────────────────────┬────────────────────────────────┘ │
└────────────────────────┼──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PII Sanitization Layer (CRITICAL)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Before ANY data reaches LLM provider:              │  │
│  │  - Replace child name with [STUDENT]                │  │
│  │  - Strip location data, school names                │  │
│  │  - Anonymize parent/caregiver names                 │  │
│  │  - Remove timestamps, specific dates                │  │
│  │  - Use pseudonymous IDs only                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Layer (Model-Agnostic)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LLM Provider Abstraction Layer                      │  │
│  │  - Supports: OpenAI, Claude, OpenRouter, Custom     │  │
│  │  - Unified API interface                            │  │
│  │  - Auto-failover to backup provider                 │  │
│  │  - Cost tracking per provider                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Active Providers (receives sanitized data only):   │  │
│  │  - OpenAI GPT-4/GPT-4o                              │  │
│  │  - Anthropic Claude 3.5 Sonnet/Opus                 │  │
│  │  - OpenRouter (multi-model gateway)                 │  │
│  │  - Custom fine-tuned models                         │  │
│  │                                                      │  │
│  │  Capabilities:                                       │  │
│  │  - Content generation                               │  │
│  │  - Conversation                                     │  │
│  │  - Analysis                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Firebase Backend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firestore   │  │   Storage    │  │   Functions  │     │
│  │  - Profiles  │  │  - PDFs      │  │  - Tool APIs │     │
│  │  - Sessions  │  │  - Images    │  │  - Scheduled │     │
│  │  - Memory    │  │  - Audio     │  │  - Triggers  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Architecture

#### Firestore Collections

```
/parents/{parentId}
  - email, name, createdAt, preferences
  - notificationSettings: { weekly: boolean, milestones: boolean, approvals: boolean }

/parents/{parentId}/secondaryCaregivers/{caregiverId}
  - email, name, role: 'read-only' | 'supervised' | 'co-parent'
  - childAccess: [studentId1, studentId2] // specific children this caregiver can access
  - invitedAt, acceptedAt, lastActiveAt
  - invitedBy: parentId
  - isActive: boolean

/parents/{parentId}/guestCodes/{guestCodeId}
  - qrCodeData: string (encrypted token)
  - studentId: string (single child only)
  - createdAt, expiresAt
  - guestName?: string ("Brianna - babysitter")
  - usedAt?: Date
  - sessionId?: string (if guest session was started)
  - isActive: boolean

/students/{studentId}
  - parentId, name, grade, characterId, agentConfig
  - xp, level, stars, gems, currentStreak
  - lastActiveDate, totalActiveTime
  - personalityEffectiveness: {
      [personalityId]: {
        sessionCount: number,
        averageMasteryVelocity: number, // skills mastered per hour
        averageEngagement: number, // 0-10 engagement score
        lastUsed: Date
      }
    }
  - recommendedPersonality?: string
  - personalityA_BTest?: {
      currentPersonality: string,
      testStartDate: Date,
      testEndDate: Date,
      baseline: { velocity: number, engagement: number }
    }

/students/{studentId}/skillMastery/{skillId}
  - masteryLevel, lastPracticed, totalAttempts, accuracy
  - easeFactor, interval, nextReviewDate

/students/{studentId}/sessions/{sessionId}
  - startTime, endTime, duration, type, status
  - conversationLog[], toolCalls[], observations[]
  - questionsAttempted, accuracy, xpEarned
  - emotionalState: 'engaged' | 'frustrated' | 'confident' | 'bored' | 'excited'
  - learningDisposition: {
      energyLevel: number, // 1-10
      frustrationTriggers?: string[],
      confidenceMoments?: string[],
      motivationFactors?: string[]
    }
  - personalityId: string // which personality was active during session
  - isExcludedFromAnalysis: boolean
  - excludedReason?: string ("child was sick", "frustrated day", "testing app")
  - excludeMasteryData: boolean // if true, mastery scores also excluded
  - excludedAt?: Date
  - excludedBy?: parentId
  - supervisedBy?: {
      type: 'parent' | 'secondary-caregiver' | 'guest',
      id: string,
      name: string
    }

/students/{studentId}/sessions/{sessionId}/attempts/{attemptId}
  - questionId, answer, correct, timeSpent, hintsUsed
  - mistakeType, misconception, strategyUsed

/students/{studentId}/memory/{memoryId}
  - type: 'conversation' | 'observation' | 'decision' | 'emotional'
  - date, sessionId, content, tags[]
  - priority: 'high' | 'medium' | 'low' // emotional memories are high priority
  - isExcluded: boolean // if parent excluded parent session, memory also excluded

/students/{studentId}/parentComms/{commId}
  - type: 'report' | 'notification' | 'feedback' | 'personality-suggestion'
  - date, content, parentResponse, resolved
  - caregiverActions?: {
      [caregiverId]: {
        viewedAt?: Date,
        respondedAt?: Date
      }
    }

/skills/{skillId}
  - name, description, category, gradeLevel
  - prerequisites[], relatedSkills[], difficultyRange

/questions/{questionId}
  - skillId, type, difficulty, prompt, answer
  - hints[], explanation, visualAid, tags[]

/auditLog/{logId}
  - timestamp, userId, userType: 'parent' | 'caregiver' | 'guest'
  - action, targetStudentId, details, ipAddress
```

### Technology Stack

**Frontend**:

- React Native (Expo)
- TypeScript
- React Native Paper (UI components)
- Expo Router (navigation)
- AsyncStorage (local cache)

**Backend**:

- Firebase Authentication
- Cloud Firestore (database)
- Cloud Functions (serverless APIs)
- Cloud Storage (media files)
- Firebase Analytics

**AI/ML**:

- **LLM Provider Abstraction Layer** (Model-Agnostic):
  - **Primary Providers**:
    - Anthropic Claude 3.5 Sonnet/Opus
    - OpenAI GPT-4/GPT-4o/GPT-4o-mini
    - OpenRouter (gateway to 100+ models)
  - **Future Support**: Any OpenAI-compatible API
  - **Provider Selection**: Configurable per tool type (e.g., Claude for conversation, GPT-4 for content generation)
  - **Failover Strategy**: Auto-switch to backup provider if primary fails
  - **Cost Optimization**: Route to most cost-effective provider based on task complexity

- **Supporting AI Services**:
  - Firebase ML Kit (on-device voice recognition)
  - Cloud Text-to-Speech API (multi-language, kid-friendly voices)
  - (Future) Custom fine-tuned models for specialized tasks

- **PII Sanitization Service** (Custom-built, mandatory middleware)

**Development**:

- GitHub (version control)
- GitHub Actions (CI/CD)
- EAS Build (app builds)
- Jest (testing)
- TypeScript (type safety)

---

## 📱 User Interface Specifications

### Kid Mode Screens

#### 1. Home/Dashboard

**Components**:

- Character avatar (animated, welcoming)
- Daily mission card (personalized 10-min session)
- Current streak display with fire emoji
- XP progress to next level
- Quick actions: "Continue learning", "Free practice", "Achievements"

**Interactions**:

- Tap daily mission → starts personalized session
- Tap character → character speaks encouragement
- Tap achievements → shows badges earned
- Always-visible chat icon to talk to agent

#### 2. Learning Session

**Components**:

- Top bar: Stars earned, streak, lives/hearts
- Character avatar (always visible, animated)
- Question display with visual aids
- Answer input (numeric keypad, multiple choice, or text)
- Bottom chat bar: "Ask [Character Name]" with text/voice options
- Action buttons: Hint, Show Work, Submit

**Interactions**:

- Student can ask questions anytime via chat
- Character responds with helpful guidance
- Hint button reveals progressive hints (costs stars after 1st free hint)
- Submit triggers immediate feedback with celebration/encouragement
- Agent automatically comments during long pauses

#### 3. Post-Question Feedback

**Components**:

- Result display (✓ or helpful error message)
- Character celebration or support
- XP/Stars earned animation
- Strategy praise ("I love how you showed your work!")
- Next question preview or session summary

### Parent Mode Screens

#### 1. Parent Dashboard (Multi-Child View)

**Components**:

- Child selector carousel (swipe between children)
- Per-child summary cards:
  - Last active date/time
  - Current streak
  - Skills in progress
  - Pending approvals indicator
- Quick actions per child: "View Report", "Adjust Settings", "Message Agent"

#### 2. Child Detail View

**Components**:

- Weekly performance chart (accuracy trend)
- Skill mastery overview (pie chart: mastered/in-progress/upcoming)
- Recent sessions list with key stats
- Agent status: personality, autonomy, pending decisions
- Latest weekly report (expandable)

#### 3. Agent Configuration

**Components**:

- Personality profile selector (7 options with descriptions)
- Autonomy level slider with explanations
- Communication frequency toggles
- Difficulty preference selector
- Custom focus areas (multi-select skills)
- Save/Cancel buttons

**Interactions**:

- Select personality → shows preview of how agent will talk
- Change autonomy → shows examples of what requires approval
- Save → confirmation + "changes take effect next session"

---

## 📊 Milestones & Timeline

### Phase 1: Foundation (Weeks 1-6)

**Goal**: Core AI agent with basic functionality

**Week 1-2: Infrastructure**

- Firebase project setup
- Authentication flow (parent/student)
- Database schema implementation
- Basic UI skeleton (kid mode + parent mode)

**Week 3-4: Agent Core**

- Claude API integration
- Conversation engine
- Memory/context management
- Tool framework (ability to call tools)
- Implement 4 conversational tools

**Week 5-6: Content & Assessment**

- Worksheet generator tool
- Answer evaluator tool
- Basic skill taxonomy (K-2 addition/subtraction)
- Question bank (50 questions/skill)
- Progress analyzer tool

**Deliverable**: Students can have conversations with agent, get personalized worksheets, receive feedback

---

### Phase 2: Parent Partnership (Weeks 7-10)

**Goal**: Parent mode with reporting and configuration

**Week 7-8: Parent Features**

- Parent mode UI
- Multi-child support
- Agent configuration (personality, autonomy)
- Secure mode switching

**Week 9-10: Reporting & Communication**

- Parent report generator tool
- Weekly automated reports
- Approval workflow (for autonomy settings)
- Parent feedback input
- Notification system

**Deliverable**: Parents can configure agents, receive reports, approve advancements

---

### Phase 3: Intelligence & Engagement (Weeks 11-14)

**Goal**: Adaptive learning and gamification

**Week 11-12: Adaptive Systems**

- Mastery calculator
- Readiness assessor
- Adaptive difficulty engine
- Misconception detector
- Spaced repetition algorithm

**Week 13-14: Engagement**

- XP/leveling system
- Achievement system
- Streak tracking with notifications
- Character customization
- Celebration animations

**Deliverable**: Agent makes smart advancement decisions, students stay motivated

---

### Phase 4: Expansion & Polish (Weeks 15-18)

**Goal**: Expanded curriculum and advanced features

**Week 15-16: Curriculum Expansion**

- Complete K-5 math taxonomy
- Question bank expansion (100+ per skill)
- Visual aid generation
- Prerequisite system implementation
- Skill path navigator

**Week 17-18: Advanced Tools & Polish**

- Work analysis tool (vision AI)
- Enhanced hint generation
- Voice input optimization
- Performance optimization
- Bug fixes and UX improvements

**Deliverable**: Production-ready MVP with full K-5 math curriculum

---

### Phase 5: Beta & Launch (Weeks 19-24)

**Goal**: User testing and public launch

**Week 19-20: Closed Beta**

- 20-30 family beta test
- Collect feedback
- Monitor agent conversations
- Identify issues

**Week 21-22: Iteration**

- Fix critical bugs
- Improve agent responses based on real conversations
- Optimize performance
- Content quality improvements

**Week 23-24: Launch Preparation**

- App store submissions
- Marketing materials
- Documentation
- Support infrastructure
- Public launch

**Deliverable**: Paadam available in app stores

---

## 🎯 Success Criteria & KPIs

### Launch Criteria (Must Meet Before Public Release)

- [ ] Agent response time <3s for 95% of queries
- [ ] Answer evaluation accuracy >95%
- [ ] No data loss or corruption in 1000+ test sessions
- [ ] Parent mode accessible within 2 taps
- [ ] Multi-child switching works flawlessly
- [ ] Weekly reports generate automatically and accurately
- [ ] At least 500 questions across K-2 math skills
- [ ] Agent conversations feel natural (rated 4+/5 by beta parents)
- [ ] App crash rate <1%
- [ ] Authentication/security passes penetration testing

### Post-Launch KPIs (Month 1-3)

**Engagement Metrics**:

- DAU/MAU ratio >40%
- Average session length: 15-20 minutes
- 7-day streak retention >50%
- Return rate after 1 week >60%

**Learning Metrics**:

- Average skill mastery improvement: +10 points/week
- Student success rate in 70-80% range (optimal difficulty)
- Retention after 1 month >75%
- Parent-reported confidence improvement >70%

**Parent Metrics**:

- Weekly report open rate >60%
- Parent feedback response rate >30%
- Configuration adjustment rate >40% (parents engaging with settings)
- Parent satisfaction (NPS) >50

**Agent Quality**:

- Helpful response rate >85% (parent survey)
- Advancement decision accuracy >80% (based on subsequent performance)
- Misconception detection precision >70%
- Conversation abandonment rate <10%

### 6-Month Goals

- 1,000+ active students
- 10,000+ sessions completed
- 85%+ parent satisfaction
- 90%+ students showing measurable progress
- Expansion to subtraction, multiplication topics
- Partnership with 3+ schools for classroom pilots

---

## 🚨 Dependencies & Risks

### Technical Dependencies

- **Claude API Availability**: Agent core relies on Anthropic Claude
  - **Mitigation**: Implement GPT-4 fallback, abstract LLM interface
- **Firebase Scalability**: Database must handle concurrent users
  - **Mitigation**: Load testing, proper indexing, caching strategy

- **Network Reliability**: Agent requires internet connection
  - **Mitigation**: Offline mode for practice (pre-downloaded worksheets), sync when online

### Content Dependencies

- **Curriculum Expertise**: Need accurate, age-appropriate math content
  - **Mitigation**: Partner with education consultants, teacher review

- **Question Quality**: Need large, diverse question bank
  - **Mitigation**: Use LLM to generate + human review, start with focused scope (K-2)

### Business Risks

- **User Adoption**: Parents may not trust AI tutor
  - **Mitigation**: Transparent reporting, parent control, free trial period

- **Cost Structure**: LLM API costs could be high at scale
  - **Mitigation**: Optimize prompts, cache common responses, tiered pricing

- **Competition**: Existing learning apps (Khan Academy, IXL, etc.)
  - **Mitigation**: Differentiate on personalization and parent partnership

### Regulatory Risks

- **COPPA Compliance**: Children's privacy laws
  - **Mitigation**: No PII in logs, parent consent flows, data encryption

- **Educational Standards**: Content must align with standards
  - **Mitigation**: Map to Common Core, state standards review

---

## 📋 Open Questions

### Product Questions

1. Should agent have different "moods" or always be consistently upbeat?
2. How much personality variation across the 7 character types?
3. Should siblings be able to see each other's progress?
4. What's the right price point (free tier + premium)?

### Technical Questions

1. Should we build native apps or stick with Expo managed workflow?
2. How to handle real-time conversation while minimizing API costs?
3. Should agent conversations be stored as audio or text?
4. What's the offline experience (graceful degradation)?

### Design Questions

1. How much screen real estate for character vs content?
2. Should chat be persistent panel or modal overlay?
3. What's the right balance of gamification elements?
4. How to make parent mode feel distinct but familiar?

---

## 📚 Appendices

### Appendix A: Related Documentation

- [ADAPTIVE_LEARNING_VISION.md](ADAPTIVE_LEARNING_VISION.md) - Complete product vision
- [ADAPTIVE_ARCHITECTURE.md](ADAPTIVE_ARCHITECTURE.md) - Technical architecture details
- [AGENT_TOOLS_SPECIFICATION.md](AGENT_TOOLS_SPECIFICATION.md) - All 22 agent tools specs
- [types/adaptive-learning.ts](types/adaptive-learning.ts) - TypeScript type definitions

### Appendix B: Research & Inspiration

- **Duolingo**: Engagement mechanics, streaks, bite-sized sessions
- **Khan Academy**: Mastery-based progression, exercise variety
- **Photomath**: Step-by-step explanations, visual problem-solving
- **Learning Science**: Zone of Proximal Development, spaced repetition, growth mindset

### Appendix C: Competitive Analysis

| Feature             | Paadam              | Khan Academy Kids    | IXL           | Prodigy       |
| ------------------- | ------------------- | -------------------- | ------------- | ------------- |
| AI Tutor            | ✅ Persistent agent | ❌                   | ❌            | ❌            |
| Conversational Help | ✅ Always available | ❌                   | ❌            | ❌            |
| Parent Partnership  | ✅ Reports + config | Basic reports        | Basic reports | Basic reports |
| Adaptive Difficulty | ✅ Real-time        | ✅                   | ✅            | ✅            |
| Multi-Child         | ✅ Built-in         | ❌ Separate accounts | ❌            | ❌            |
| Memory/Continuity   | ✅ Full history     | ❌                   | ❌            | ❌            |

---

## ✅ Approval & Sign-Off

**Product Owner**: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**

**Engineering Lead**: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**

**Design Lead**: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**

**Content Lead**: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**

---

**Version History**:

- v1.0 (2026-01-28): Initial PRD based on planning sessions
