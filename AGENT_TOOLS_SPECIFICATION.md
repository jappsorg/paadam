# 🛠️ AI Agent Tools Specification

## Overview

The AI Learning Agent uses a set of specialized tools to accomplish its educational goals. Each tool is designed to handle a specific aspect of the learning process, from generating personalized content to analyzing student progress.

**Tool Architecture Philosophy:**

- **Single Responsibility**: Each tool does one thing well
- **Composable**: Tools can be combined to accomplish complex tasks
- **Observable**: Every tool call is logged with reasoning
- **Deterministic**: Same inputs produce consistent outputs
- **Fast**: Tools respond quickly to maintain conversational flow
- **Privacy-First**: All tools include PII sanitization before LLM calls

---

## 🎯 Core Tool Categories

```
Agent Tool Ecosystem
├── Conversational Interaction Tools (NEW - Always Available)
│   ├── Concept Explainer
│   ├── Question Answerer
│   ├── Encouragement Generator
│   └── Clarification Helper
├── Content Generation Tools
│   ├── Worksheet Generator
│   ├── Question Generator
│   └── Hint & Explanation Generator
├── Assessment Tools
│   ├── Answer Evaluator
│   ├── Work Analysis Tool
│   └── Misconception Detector
├── Progress & Analytics Tools
│   ├── Progress Analyzer
│   ├── Mastery Calculator
│   └── Readiness Assessor
├── Curriculum & Content Tools
│   ├── Content Library Query
│   ├── Prerequisite Checker
│   └── Skill Path Navigator
├── Memory & Context Tools
│   ├── Session History Query
│   ├── Student Profile Query
│   └── Conversation Memory Search
└── Communication Tools
    ├── Parent Report Generator
    ├── Achievement Checker
    └── Notification Composer
```

---

## � Conversational Interaction Tools (Always Available)

**Philosophy**: The agent is ALWAYS available during learning sessions. Kids can ask questions, request clarification, or seek encouragement at any point. These tools enable natural, helpful conversations that support learning.

### 1. Concept Explainer Tool

**Purpose**: Explain concepts, vocabulary, or mathematical ideas when student asks "what does this mean?"

**Input Schema**:

```typescript
interface ConceptExplainerInput {
  studentId: string;
  question: string; // student's question in natural language
  context: {
    currentQuestionId?: string; // if asking about current problem
    skillId: string; // current skill being practiced
    gradeLevel: string;
    personality: string; // how to explain (patient, energetic, etc.)
  };

  previousExplanations?: string[]; // if re-explaining
}
```

**Output Schema**:

```typescript
interface ConceptExplainerOutput {
  explanation: {
    text: string;
    visualAid?: VisualAid;
    example?: string;
    analogyUsed?: string; // real-world comparison
  };

  followUp: {
    checkUnderstanding: string; // "Does that make sense?"
    relatedConcepts?: string[]; // in case they're confused about related things
  };

  conversationTone: string; // actual message sent to student
}
```

**Use Cases**:

```typescript
// Student asks "What does 'altogether' mean?"
agent.call_tool('explain_concept', {
  studentId: 'maya_123',
  question: 'what does altogether mean',
  context: {
    currentQuestionId: 'q_789',
    skillId: 'addition-word-problems',
    gradeLevel: '2',
    personality: 'patient-methodical'
  }
});

// Response:
{
  explanation: {
    text: "'Altogether' means we're putting things together or combining them. When a problem says 'how many altogether,' it's asking for the total when we add things up.",
    example: "Like if you have 3 apples and I give you 2 more apples, altogether you have 5 apples!",
    analogyUsed: "Think of it like putting all your toys in one box - altogether means everything together."
  },
  followUp: {
    checkUnderstanding: "Does that help? Ready to try the problem now?"
  },
  conversationTone: "Great question! 'Altogether' means we're combining things..."
}
```

---

### 2. Question Answerer Tool

**Purpose**: Answer student's questions about problems, strategies, or approach

**Input Schema**:

```typescript
interface QuestionAnswererInput {
  studentId: string;
  studentQuestion: string;
  context: {
    currentQuestionId?: string;
    currentAnswer?: string; // what they've written so far
    timeOnQuestion: number; // seconds
    previousHints: string[];
    personality: string;
  };

  answerStyle: "hint" | "scaffold" | "direct"; // how much help to give
}
```

**Output Schema**:

```typescript
interface QuestionAnswererOutput {
  response: {
    message: string;
    helpfulness: "hint" | "partial-answer" | "full-explanation";
    encouragesThinking: boolean;
  };

  // Track what kind of help was given
  supportProvided: {
    type:
      | "strategy-suggestion"
      | "concept-review"
      | "step-guidance"
      | "validation";
    specificHelp: string;
  };

  shouldLog: {
    asHint: boolean; // count as hint used?
    asConversation: boolean; // just friendly chat
  };
}
```

**Use Cases**:

```typescript
// Student asks: "How do I start this?"
agent.call_tool('answer_question', {
  studentId: 'maya_123',
  studentQuestion: 'how do i start this',
  context: {
    currentQuestionId: 'q_456',
    timeOnQuestion: 15,
    previousHints: [],
    personality: 'supportive-growth-minded'
  },
  answerStyle: 'scaffold'
});

// Response:
{
  response: {
    message: "Good question! Let's break it down. First, what is the problem asking us to find? Read it again and tell me what you think.",
    helpfulness: 'hint',
    encouragesThinking: true
  },
  supportProvided: {
    type: 'strategy-suggestion',
    specificHelp: 'Encouraged reading comprehension first'
  }
}

// Student asks: "Is 47 right?"
agent.call_tool('answer_question', {
  studentId: 'maya_123',
  studentQuestion: 'is 47 right',
  context: {
    currentQuestionId: 'q_456',
    currentAnswer: '47',
    timeOnQuestion: 45
  },
  answerStyle: 'scaffold'
});

// Response:
{
  response: {
    message: "I can see you're working hard on this! Instead of me telling you, let's check together. Can you show me how you got 47?",
    helpfulness: 'hint',
    encouragesThinking: true
  },
  supportProvided: {
    type: 'validation',
    specificHelp: 'Encouraged showing work for self-checking'
  }
}
```

---

### 3. Encouragement Generator Tool

**Purpose**: Provide motivation, celebration, and emotional support during learning

**Input Schema**:

```typescript
interface EncouragementGeneratorInput {
  studentId: string;
  situation:
    | "struggling"
    | "success"
    | "persisting"
    | "frustrated"
    | "confident"
    | "asking-questions";
  context: {
    currentStreak?: number;
    recentAccuracy: number;
    timeInSession: number;
    personality: string;
    recentEvents: string[]; // ["got 3 correct in a row", "asked good question"]
  };
}
```

**Output Schema**:

```typescript
interface EncouragementGeneratorOutput {
  message: string;
  tone: "celebratory" | "supportive" | "motivating" | "proud";
  shouldAnimate: boolean; // trigger character animation
  animation?: string;

  psychologicalPrinciple: string; // e.g., "growth mindset", "effort praise"
}
```

**Use Cases**:

```typescript
// After student gets question wrong but tries again
agent.call_tool('generate_encouragement', {
  studentId: 'maya_123',
  situation: 'persisting',
  context: {
    recentAccuracy: 0.6,
    timeInSession: 300,
    personality: 'supportive-growth-minded',
    recentEvents: ['incorrect answer', 'retry attempt', 'asked for hint']
  }
});

// Response:
{
  message: "I love that you're not giving up! Trying again after a mistake is how we get stronger at math. You've got this! 💪",
  tone: 'motivating',
  shouldAnimate: true,
  animation: 'cheer',
  psychologicalPrinciple: 'effort-praise'
}

// When student asks a great question
agent.call_tool('generate_encouragement', {
  studentId: 'maya_123',
  situation: 'asking-questions',
  context: {
    recentAccuracy: 0.8,
    personality: 'curious-questioning',
    recentEvents: ['asked "why does this work?"']
  }
});

// Response:
{
  message: "What a smart question! Asking 'why' helps you understand math deeply, not just get the right answer. I love how curious you are! 🌟",
  tone: 'proud',
  shouldAnimate: true,
  animation: 'excited',
  psychologicalPrinciple: 'curiosity-encouragement'
}
```

---

### 4. Clarification Helper Tool

**Purpose**: Help when student is confused about what a question is asking

**Input Schema**:

```typescript
interface ClarificationHelperInput {
  studentId: string;
  questionId: string;
  confusionType?: "vocabulary" | "what-to-find" | "numbers" | "general";
  studentStatement?: string; // "I don't understand this"

  context: {
    gradeLevel: string;
    personality: string;
    attemptsMade: number;
  };
}
```

**Output Schema**:

```typescript
interface ClarificationHelperOutput {
  clarification: {
    simplified: string; // question in simpler words
    breakdown: string[]; // step-by-step what's being asked
    focusOn: string; // "what we need to find"
  };

  interactiveCheck: {
    question: string; // "What do you think we need to find?"
    type: "reading-check" | "number-identification" | "operation-choice";
  };

  visualSupport?: VisualAid;
}
```

**Use Cases**:

```typescript
// Student says "I don't get what this is asking"
agent.call_tool('clarify_question', {
  studentId: 'maya_123',
  questionId: 'q_word_problem_123',
  confusionType: 'what-to-find',
  studentStatement: 'i dont get what this is asking',
  context: {
    gradeLevel: '2',
    personality: 'patient-methodical',
    attemptsMade: 0
  }
});

// Response:
{
  clarification: {
    simplified: "Let's read it together and find out what the question wants to know.",
    breakdown: [
      "First: Sarah has 12 apples",
      "Then: She gets 7 more apples",
      "Question: How many does she have now?"
    ],
    focusOn: "We need to find the total number of apples Sarah has after getting more."
  },
  interactiveCheck: {
    question: "So what are we trying to find - how many apples Sarah starts with, or how many she has at the end?",
    type: 'reading-check'
  },
  visualSupport: {
    type: 'diagram',
    description: 'Visual showing 12 apples, then +7 more, then ? total'
  }
}
```

---

## �📝 Content Generation Tools

### 1. Worksheet Generator Tool

**Purpose**: Generate personalized worksheets tailored to student's level, goals, and interests

**Input Schema**:

```typescript
interface WorksheetGeneratorInput {
  studentId: string;
  skillId: string;
  difficulty: number; // 1-10
  questionCount: number;

  // Personalization context
  studentContext: {
    recentPerformance: number; // 0-1 accuracy
    masteryLevel: number; // 0-100
    interests?: string[]; // ["animals", "sports", "space"]
    learningStyle: "visual" | "verbal" | "kinesthetic";
    commonMistakes?: string[]; // recent error patterns
  };

  // Worksheet preferences
  preferences: {
    includeVisuals: boolean;
    wordProblemRatio: number; // 0-1, percentage of word problems
    multipleChoiceRatio: number; // 0-1
    showWorkRequired: boolean;
    timeEstimate?: number; // minutes
  };

  // Special requirements
  focus?: "practice" | "diagnostic" | "challenge" | "review";
  avoidQuestionIds?: string[]; // recently seen questions to avoid
}
```

**Output Schema**:

```typescript
interface WorksheetGeneratorOutput {
  worksheetId: string;
  questions: Question[];
  metadata: {
    estimatedTime: number; // minutes
    difficultyDistribution: { [level: number]: number };
    skillsCovered: string[];
    xpPotential: number;
  };

  // Agent reasoning
  generationReasoning: {
    whyThisDifficulty: string;
    personalizationApplied: string[];
    focusAreas: string[];
  };
}

interface Question {
  id: string;
  skillId: string;
  type: "multiple-choice" | "numeric" | "show-work" | "explain";
  difficulty: number;
  prompt: string;
  visualAid?: VisualAid;
  correctAnswer: string | string[];
  options?: string[]; // for multiple choice
  hints: Hint[];
  explanation: string;
  xpValue: number;
  tags: string[];
}
```

**Use Cases**:

```typescript
// Example 1: Daily practice worksheet
agent.call_tool("generate_worksheet", {
  studentId: "maya_123",
  skillId: "addition-2digit",
  difficulty: 6,
  questionCount: 10,
  studentContext: {
    recentPerformance: 0.85,
    masteryLevel: 78,
    interests: ["animals", "nature"],
    learningStyle: "visual",
  },
  preferences: {
    includeVisuals: true,
    wordProblemRatio: 0.4,
    multipleChoiceRatio: 0.2,
    showWorkRequired: true,
  },
  focus: "practice",
});

// Example 2: Diagnostic assessment
agent.call_tool("generate_worksheet", {
  studentId: "alex_456",
  skillId: "fractions-basics",
  difficulty: 5,
  questionCount: 5,
  studentContext: {
    recentPerformance: 0.6,
    masteryLevel: 45,
    commonMistakes: ["denominator-confusion"],
  },
  preferences: {
    includeVisuals: true,
    wordProblemRatio: 0.2,
    multipleChoiceRatio: 0.6,
    showWorkRequired: false,
  },
  focus: "diagnostic",
});
```

**Implementation Notes**:

- Uses LLM (Claude/GPT-4) to generate questions based on context
- Maintains question bank to avoid repetition
- Validates generated questions for age-appropriateness
- Ensures mathematical correctness before returning
- Response time: ~3-5 seconds for 10 questions

---

### 2. Question Generator Tool

**Purpose**: Generate individual questions on-demand during active sessions

**Input Schema**:

```typescript
interface QuestionGeneratorInput {
  studentId: string;
  skillId: string;
  difficulty: number;
  questionType: "multiple-choice" | "numeric" | "show-work" | "explain";

  context: {
    previousQuestion?: string; // build on previous
    studentJustGotCorrect: boolean;
    hintsUsedCount: number;
    timeSpentOnLast: number; // seconds
  };

  constraints?: {
    mustIncludeVisual?: boolean;
    maxNumberValue?: number;
    useRealWorldContext?: string; // "animals", "sports", etc.
    similarTo?: string; // question ID for similar practice
    avoidConcepts?: string[];
  };
}
```

**Output Schema**:

```typescript
interface QuestionGeneratorOutput {
  question: Question;
  reasoning: {
    whyThisDifficulty: string;
    whyThisType: string;
    personalization: string;
  };
}
```

**Use Cases**:

```typescript
// During active session, student is struggling
agent.call_tool("generate_question", {
  studentId: "maya_123",
  skillId: "addition-2digit",
  difficulty: 5, // reduced from 6
  questionType: "multiple-choice", // easier format
  context: {
    studentJustGotCorrect: false,
    hintsUsedCount: 2,
    timeSpentOnLast: 120,
  },
  constraints: {
    mustIncludeVisual: true,
    useRealWorldContext: "animals",
  },
});
```

---

### 3. Hint & Explanation Generator Tool

**Purpose**: Generate contextual hints and explanations based on student's specific struggle

**Input Schema**:

```typescript
interface HintGeneratorInput {
  questionId: string;
  studentAnswer?: string; // what they attempted
  hintLevel: 1 | 2 | 3 | 4; // progressive difficulty
  studentContext: {
    masteryLevel: number;
    previousHintsUsed: string[];
    timeStuck: number; // seconds
    personality: string; // agent personality type
  };
}
```

**Output Schema**:

```typescript
interface HintGeneratorOutput {
  hint: {
    level: number;
    text: string;
    type: "encouragement" | "strategy" | "example" | "step-by-step";
    visualAid?: VisualAid;
  };
  reasoning: string;
}
```

---

## 🎯 Assessment Tools

### 4. Answer Evaluator Tool

**Purpose**: Evaluate student answers with deep understanding, not just right/wrong

**Input Schema**:

```typescript
interface AnswerEvaluatorInput {
  questionId: string;
  studentAnswer: string;
  showWorkData?: {
    type: "drawing" | "steps" | "voice";
    data: any;
  };

  context: {
    timeSpent: number; // seconds
    hintsUsed: number;
    attemptNumber: number;
  };
}
```

**Output Schema**:

```typescript
interface AnswerEvaluatorOutput {
  isCorrect: boolean;
  partialCredit?: number; // 0-1 if partially correct

  // Deep analysis
  analysis: {
    strategyUsed?: string; // "column addition", "counting up"
    correctProcess: boolean; // right process, wrong answer?
    mistakeType?: "calculation" | "conceptual" | "reading" | "careless";
    misconceptionDetected?: string;
    strengthsObserved?: string[];
  };

  // Feedback
  feedback: {
    immediateMessage: string; // "Great job!" or "Not quite, but good try"
    explanation: string;
    encouragement: string;
    nextSteps?: string; // "Try a similar problem" or "Let's review..."
  };

  // Mastery impact
  masteryUpdate: {
    skillId: string;
    impact: number; // -10 to +10 change in mastery
    shouldReview: boolean;
  };

  reasoning: string; // Why agent assessed this way
}
```

**Use Cases**:

```typescript
// Example: Student answers word problem
agent.call_tool('evaluate_answer', {
  questionId: 'q_789',
  studentAnswer: '18',
  showWorkData: {
    type: 'steps',
    data: ['12 + 6', 'Started at 12', 'Counted up 6', '13, 14, 15, 16, 17, 18']
  },
  context: {
    timeSpent: 45,
    hintsUsed: 0,
    attemptNumber: 1
  }
});

// Response:
{
  isCorrect: true,
  analysis: {
    strategyUsed: 'counting-up',
    correctProcess: true,
    strengthsObserved: ['clear steps', 'showed work', 'correct strategy']
  },
  feedback: {
    immediateMessage: 'Excellent work! I love how you showed all your steps!',
    explanation: 'You used the counting-up strategy perfectly...',
    encouragement: 'Your work is getting neater and clearer!',
    nextSteps: 'Ready for a slightly harder one?'
  },
  masteryUpdate: {
    skillId: 'addition-2digit',
    impact: +8,
    shouldReview: false
  }
}
```

---

### 5. Work Analysis Tool

**Purpose**: Analyze "show your work" submissions to understand student's thinking process

**Input Schema**:

```typescript
interface WorkAnalysisInput {
  questionId: string;
  workData: {
    type: "drawing" | "written-steps" | "voice-explanation";
    rawData: any; // image URL, text, audio URL
  };
  correctAnswer: string;
  studentFinalAnswer?: string;
}
```

**Output Schema**:

```typescript
interface WorkAnalysisOutput {
  analysis: {
    strategyIdentified: string;
    stepsDetected: string[];
    correctProcess: boolean;
    whereErrorOccurred?: string; // which step
    conceptualUnderstanding: "strong" | "developing" | "needs-support";
  };

  feedback: {
    praise: string[]; // What they did well
    suggestions: string[]; // How to improve
    teachingMoment?: string; // Explanation of correct approach
  };

  insights: {
    strengths: string[];
    areasToReinforce: string[];
    recommendedPractice: string[]; // skill IDs
  };
}
```

**Implementation Notes**:

- Uses vision models (GPT-4V, Claude Vision) for drawing analysis
- Uses speech-to-text + NLP for voice explanations
- Text analysis uses pattern matching + LLM understanding
- Response time: ~2-4 seconds

---

### 6. Misconception Detector Tool

**Purpose**: Identify specific misconceptions from error patterns

**Input Schema**:

```typescript
interface MisconceptionDetectorInput {
  studentId: string;
  skillId: string;
  recentAttempts: {
    questionId: string;
    studentAnswer: string;
    correctAnswer: string;
    questionType: string;
  }[];

  timeWindow?: "session" | "day" | "week"; // how far back to look
}
```

**Output Schema**:

```typescript
interface MisconceptionDetectorOutput {
  misconceptionsFound: {
    id: string;
    name: string;
    description: string;
    confidence: number; // 0-1
    examples: string[]; // which questions showed this
    remediation: {
      explanation: string;
      suggestedActivities: string[];
      visualAids: VisualAid[];
    };
  }[];

  patterns: {
    systematicError: boolean;
    randomMistakes: boolean;
    conceptualGap: boolean;
  };

  recommendation: "continue" | "review" | "remediate" | "advance";
}
```

---

## 📊 Progress & Analytics Tools

### 7. Progress Analyzer Tool

**Purpose**: Analyze student progress over time and identify trends

**Input Schema**:

```typescript
interface ProgressAnalyzerInput {
  studentId: string;
  timePeriod: {
    startDate: Date;
    endDate: Date;
  };
  focusAreas?: string[]; // specific skills to analyze

  analysisType: "summary" | "detailed" | "comparative";
}
```

**Output Schema**:

```typescript
interface ProgressAnalyzerOutput {
  summary: {
    totalSessions: number;
    totalTimeMinutes: number;
    questionsAttempted: number;
    accuracyRate: number;
    streakDays: number;
  };

  skillProgress: {
    skillId: string;
    skillName: string;
    startMastery: number;
    currentMastery: number;
    change: number;
    trend: "improving" | "stable" | "declining";
    sessionsCount: number;
  }[];

  insights: {
    strongestSkills: string[];
    skillsNeedingAttention: string[];
    learningPatterns: {
      bestTimeOfDay?: string;
      optimalSessionLength?: number;
      effectiveStrategies: string[];
    };
    emotionalPatterns: {
      frustrationTriggers?: string[];
      confidenceBuilders?: string[];
    };
  };

  milestones: {
    achieved: Achievement[];
    upcoming: {
      achievementId: string;
      progress: number;
      target: number;
    }[];
  };

  predictions: {
    skillsReadyToAdvance: string[];
    skillsNeedingReview: string[];
    estimatedTimeToMastery: { [skillId: string]: number }; // days
  };
}
```

**Use Cases**:

```typescript
// Weekly progress check
agent.call_tool("analyze_progress", {
  studentId: "maya_123",
  timePeriod: {
    startDate: "2026-01-21",
    endDate: "2026-01-28",
  },
  analysisType: "summary",
});

// Used for parent reports, dashboard updates, decision-making
```

---

### 8. Mastery Calculator Tool

**Purpose**: Calculate current mastery level for a specific skill

**Input Schema**:

```typescript
interface MasteryCalculatorInput {
  studentId: string;
  skillId: string;

  // Optional: recalculate with new data
  newAttempt?: {
    correct: boolean;
    difficulty: number;
    timeSpent: number;
    hintsUsed: number;
  };
}
```

**Output Schema**:

```typescript
interface MasteryCalculatorOutput {
  masteryLevel: number; // 0-100
  confidence: number; // 0-1, how confident in this assessment

  breakdown: {
    recentAccuracy: number; // last 10 attempts
    speedScore: number; // compared to expected time
    difficultyHandled: number; // highest difficulty mastered
    retentionScore: number; // spaced repetition performance
  };

  status:
    | "needs-introduction"
    | "learning"
    | "practicing"
    | "mastered"
    | "needs-review";

  nextSteps: {
    recommendedAction: "practice" | "advance" | "review" | "challenge";
    suggestedDifficulty: number;
    practiceCount: number; // more questions needed
  };
}
```

---

### 9. Readiness Assessor Tool

**Purpose**: Determine if student is ready to advance to next skill/level

**Input Schema**:

```typescript
interface ReadinessAssessorInput {
  studentId: string;
  currentSkillId: string;
  targetSkillId: string; // skill wanting to advance to

  criteria: {
    minimumMastery: number; // default 85
    minimumAccuracy: number; // default 0.8
    minimumAttempts: number; // default 20
    checkPrerequisites: boolean;
  };
}
```

**Output Schema**:

```typescript
interface ReadinessAssessorOutput {
  isReady: boolean;
  confidence: number; // 0-1

  criteriaCheck: {
    masteryMet: boolean;
    accuracyMet: boolean;
    attemptsMet: boolean;
    prerequisitesMet: boolean;
  };

  details: {
    currentMastery: number;
    currentAccuracy: number;
    totalAttempts: number;
    prerequisiteStatus: { [skillId: string]: boolean };
  };

  recommendation: {
    decision: "advance" | "practice-more" | "review-first";
    reasoning: string;
    estimatedTimeNeeded?: number; // if not ready, days/sessions needed
    suggestedActivities?: string[];
  };

  // For parent approval workflow
  parentNotification?: {
    shouldNotify: boolean;
    message: string;
    requireApproval: boolean; // based on autonomy settings
  };
}
```

---

## 📚 Curriculum & Content Tools

### 10. Content Library Query Tool

**Purpose**: Search and retrieve questions, concepts, and learning materials

**Input Schema**:

```typescript
interface ContentLibraryQueryInput {
  queryType: "questions" | "concepts" | "examples" | "skills";

  filters: {
    skillIds?: string[];
    gradeLevel?: string;
    difficulty?: [number, number]; // range
    questionTypes?: string[];
    tags?: string[];
  };

  search?: {
    text?: string; // semantic search
    similarTo?: string; // find similar to question ID
  };

  limit?: number;
  excludeIds?: string[]; // already used
}
```

**Output Schema**:

```typescript
interface ContentLibraryQueryOutput {
  results: (Question | Concept | Skill)[];
  totalCount: number;

  metadata: {
    averageDifficulty: number;
    qualityScores: number[];
    usageStats: {
      totalUses: number;
      averageSuccess: number;
    };
  };
}
```

---

### 11. Prerequisite Checker Tool

**Purpose**: Verify if student has mastered prerequisite skills

**Input Schema**:

```typescript
interface PrerequisiteCheckerInput {
  studentId: string;
  skillId: string; // skill to check prerequisites for
  depth?: number; // how many levels deep to check (default 2)
}
```

**Output Schema**:

```typescript
interface PrerequisiteCheckerOutput {
  allPrerequisitesMet: boolean;

  prerequisiteTree: {
    skillId: string;
    skillName: string;
    required: boolean;
    mastered: boolean;
    masteryLevel: number;
    prerequisites?: PrerequisiteTree[]; // recursive
  }[];

  gaps: {
    skillId: string;
    skillName: string;
    currentMastery: number;
    requiredMastery: number;
    priority: "critical" | "important" | "helpful";
  }[];

  recommendation: {
    canProceed: boolean;
    suggestedOrder: string[]; // skills to master first
    estimatedTime: number; // hours to fill gaps
  };
}
```

---

### 12. Skill Path Navigator Tool

**Purpose**: Generate personalized learning path from current state to goal

**Input Schema**:

```typescript
interface SkillPathNavigatorInput {
  studentId: string;
  currentSkills: string[]; // where they are now
  goalSkills: string[]; // where they want to be

  preferences: {
    pace: "slow" | "normal" | "fast";
    includeEnrichment: boolean;
    focusAreas?: string[]; // parent-specified priorities
  };
}
```

**Output Schema**:

```typescript
interface SkillPathNavigatorOutput {
  path: {
    phase: number;
    phaseName: string;
    skills: string[];
    estimatedDuration: number; // sessions
    goals: string[];
  }[];

  totalEstimate: {
    sessions: number;
    weeks: number;
    questionsToComplete: number;
  };

  alternatives: {
    name: string;
    path: string[]; // alternative skill order
    reasoning: string;
  }[];

  visualization: {
    skillTree: SkillTreeNode[];
    connections: SkillConnection[];
  };
}
```

---

## 🧠 Memory & Context Tools

### 13. Session History Query Tool

**Purpose**: Retrieve historical session data for context

**Input Schema**:

```typescript
interface SessionHistoryQueryInput {
  studentId: string;

  timeRange?: {
    start: Date;
    end: Date;
  };

  filters?: {
    skillIds?: string[];
    sessionTypes?: string[];
    minAccuracy?: number;
    maxAccuracy?: number;
  };

  includeDetails: "summary" | "full";
  limit?: number;
}
```

**Output Schema**:

```typescript
interface SessionHistoryQueryOutput {
  sessions: {
    sessionId: string;
    date: Date;
    duration: number;
    skillsFocused: string[];
    questionsAttempted: number;
    accuracy: number;
    xpEarned: number;

    // If includeDetails: 'full'
    conversationLog?: Message[];
    attempts?: QuestionAttempt[];
    toolCalls?: ToolCall[];
    observations?: string[];
  }[];

  summary: {
    totalSessions: number;
    averageAccuracy: number;
    mostPracticedSkills: string[];
    trends: {
      improving: boolean;
      stable: boolean;
      needsAttention: boolean;
    };
  };
}
```

---

### 14. Student Profile Query Tool

**Purpose**: Get comprehensive student profile and current state

**Input Schema**:

```typescript
interface StudentProfileQueryInput {
  studentId: string;
  includeFields?: string[]; // if omitted, returns all
}
```

**Output Schema**:

```typescript
interface StudentProfileQueryOutput {
  profile: StudentProfile; // full profile object

  currentState: {
    activeSessions: number;
    currentStreak: number;
    lastActive: Date;
    currentLevel: number;
    xp: number;
  };

  agentConfiguration: {
    personality: string;
    autonomyLevel: string;
    communicationFrequency: string;
    difficultyPreference: string;
    focusAreas: string[];
  };

  quickStats: {
    skillsMastered: number;
    skillsInProgress: number;
    achievementsUnlocked: number;
    totalQuestionsCorrect: number;
  };
}
```

---

### 15. Conversation Memory Search Tool

**Purpose**: Search through conversation history for relevant context

**Input Schema**:

```typescript
interface ConversationMemorySearchInput {
  studentId: string;
  query: string; // natural language query

  searchScope: {
    timeRange?: "recent" | "all" | { start: Date; end: Date };
    contextType?: "conversations" | "observations" | "decisions" | "all";
  };

  limit?: number;
}
```

**Output Schema**:

```typescript
interface ConversationMemorySearchOutput {
  matches: {
    type: "conversation" | "observation" | "decision";
    date: Date;
    sessionId: string;
    excerpt: string;
    relevanceScore: number;
    context: string; // surrounding context
  }[];

  summary: string; // LLM-generated summary of findings
}
```

**Use Cases**:

```typescript
// Agent wants to reference past struggles
agent.call_tool("search_memory", {
  studentId: "maya_123",
  query: "difficulties with word problems",
  searchScope: {
    timeRange: "all",
    contextType: "observations",
  },
  limit: 5,
});

// Returns: Past instances where Maya struggled with word problems
// Agent can then say: "Remember last week when you were finding
// word problems tricky? Look how much better you're doing now!"
```

---

## 📨 Communication Tools

### 16. Parent Report Generator Tool

**Purpose**: Generate comprehensive parent reports

**Input Schema**:

```typescript
interface ParentReportGeneratorInput {
  studentId: string;
  timePeriod: {
    start: Date;
    end: Date;
  };

  reportType: "weekly" | "monthly" | "milestone" | "concern";

  includeSection: {
    summary: boolean;
    skillProgress: boolean;
    insights: boolean;
    observations: boolean;
    recommendations: boolean;
    nextWeekPlan: boolean;
    agentStatus: boolean; // pending approvals, etc.
  };

  tone: "detailed" | "concise";
}
```

**Output Schema**:

```typescript
interface ParentReportGeneratorOutput {
  report: {
    greeting: string;
    summary: string;
    sections: {
      title: string;
      content: string;
      visualizations?: any[]; // charts, graphs
    }[];

    // Pending items requiring parent action
    pendingApprovals?: {
      type: "advancement" | "difficulty-change" | "focus-shift";
      description: string;
      recommendation: string;
      urgency: "low" | "medium" | "high";
    }[];

    conversationPrompts: string[]; // suggestions for parent-child discussion

    closing: string;
    signature: string; // agent name + character
  };

  metadata: {
    wordCount: number;
    readingTime: number; // minutes
    keyHighlights: string[];
  };
}
```

---

### 17. Achievement Checker Tool

**Purpose**: Check if student has unlocked new achievements

**Input Schema**:

```typescript
interface AchievementCheckerInput {
  studentId: string;
  event: {
    type:
      | "question-correct"
      | "session-complete"
      | "streak-update"
      | "skill-mastered";
    data: any;
  };

  checkAll?: boolean; // check all achievements or just event-related
}
```

**Output Schema**:

```typescript
interface AchievementCheckerOutput {
  newAchievements: {
    achievementId: string;
    name: string;
    description: string;
    tier: string;
    rewards: {
      xp: number;
      stars: number;
      gems?: number;
      unlockables?: string[];
    };
  }[];

  progressUpdates: {
    achievementId: string;
    currentProgress: number;
    target: number;
    percentComplete: number;
  }[];

  celebration: {
    shouldCelebrate: boolean;
    celebrationLevel: "small" | "medium" | "big";
    message: string;
    animation?: string;
  };
}
```

---

### 18. Notification Composer Tool

**Purpose**: Compose notifications for students and parents

**Input Schema**:

```typescript
interface NotificationComposerInput {
  recipientType: "student" | "parent";
  notificationType:
    | "reminder"
    | "achievement"
    | "streak"
    | "approval-needed"
    | "milestone";

  context: {
    studentId: string;
    data: any; // type-specific data
  };

  personality?: string; // for student notifications
  urgency: "low" | "medium" | "high";
}
```

**Output Schema**:

```typescript
interface NotificationComposerOutput {
  notification: {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    icon?: string;
    sound?: string;
  };

  delivery: {
    channel: "in-app" | "push" | "email";
    timing: "immediate" | "batched" | "scheduled";
    expiresAt?: Date;
  };
}
```

---

## 🔄 Tool Orchestration & Workflows

### Common Tool Call Sequences

#### Continuous Conversational Session Workflow

```typescript
// Agent is ALWAYS listening and responding during session

// Student starts problem
const question = worksheet.questions[0];
agent.display(question);

// Student asks a question mid-problem
student: "What does 'in all' mean?";

const explanation = await agent.call_tool("explain_concept", {
  studentId: "maya_123",
  question: "what does in all mean",
  context: {
    currentQuestionId: question.id,
    skillId: "addition-word-problems",
    gradeLevel: "2",
    personality: profile.agentPersonality,
  },
});

agent.respond(explanation.conversationTone);

// Student seems stuck (30 seconds, no input)
const encouragement = await agent.call_tool("generate_encouragement", {
  studentId: "maya_123",
  situation: "struggling",
  context: {
    recentAccuracy: 0.7,
    timeInSession: 180,
    personality: profile.agentPersonality,
    recentEvents: ["stuck on problem for 30s"],
  },
});

agent.respond(encouragement.message);

// Student asks for help
student: "Can you help me?";

const help = await agent.call_tool("answer_question", {
  studentId: "maya_123",
  studentQuestion: "can you help me",
  context: {
    currentQuestionId: question.id,
    timeOnQuestion: 45,
    previousHints: [],
    personality: profile.agentPersonality,
  },
  answerStyle: "scaffold",
});

agent.respond(help.response.message);

// Student submits answer
const evaluation = await agent.call_tool("evaluate_answer", {
  questionId: question.id,
  studentAnswer: "19",
  context: { timeSpent: 60, hintsUsed: 1, attemptNumber: 1 },
});

agent.respond(evaluation.feedback.immediateMessage);

// Continue conversation based on result
if (evaluation.isCorrect) {
  const celebration = await agent.call_tool("generate_encouragement", {
    studentId: "maya_123",
    situation: "success",
    context: {
      recentAccuracy: 0.85,
      personality: profile.agentPersonality,
      recentEvents: ["correct answer", "asked good question earlier"],
    },
  });
  agent.respond(celebration.message);
}

// Throughout: agent logs all conversation
agent.log_conversation({
  sessionId,
  interactions: [
    { speaker: "student", text: "What does in all mean?", timestamp },
    { speaker: "agent", text: explanation.conversationTone, timestamp },
    // ... all conversation logged
  ],
});
```

#### Daily Session Workflow

```typescript
// 1. Start session - get context
const profile = await agent.call_tool("query_student_profile", {
  studentId: "maya_123",
});

// 2. Check what to work on
const readiness = await agent.call_tool("assess_readiness", {
  studentId: "maya_123",
  currentSkillId: "addition-2digit",
  targetSkillId: "addition-3digit",
});

// 3. Generate personalized worksheet
const worksheet = await agent.call_tool("generate_worksheet", {
  studentId: "maya_123",
  skillId: readiness.isReady ? "addition-3digit" : "addition-2digit",
  difficulty: profile.currentState.suggestedDifficulty,
  questionCount: 10,
  // ... personalization context
});

// 4. During questions - evaluate answers
const evaluation = await agent.call_tool("evaluate_answer", {
  questionId: "q_1",
  studentAnswer: "47",
  // ... context
});

// 5. Check for achievements
const achievements = await agent.call_tool("check_achievements", {
  studentId: "maya_123",
  event: {
    type: "session-complete",
    data: {
      /* session data */
    },
  },
});

// 6. Update progress
const progress = await agent.call_tool("analyze_progress", {
  studentId: "maya_123",
  timePeriod: {
    /* this week */
  },
});
```

#### Parent Report Workflow

```typescript
// 1. Analyze progress for period
const progress = await agent.call_tool("analyze_progress", {
  studentId: "maya_123",
  timePeriod: { start: "2026-01-21", end: "2026-01-28" },
  analysisType: "detailed",
});

// 2. Check for misconceptions
const misconceptions = await agent.call_tool("detect_misconceptions", {
  studentId: "maya_123",
  skillId: "addition-2digit",
  timeWindow: "week",
});

// 3. Assess readiness for advancement
const readiness = await agent.call_tool("assess_readiness", {
  studentId: "maya_123",
  currentSkillId: "addition-2digit",
  targetSkillId: "subtraction-regrouping",
});

// 4. Generate report
const report = await agent.call_tool("generate_parent_report", {
  studentId: "maya_123",
  timePeriod: {
    /* this week */
  },
  reportType: "weekly",
  includeSection: {
    /* all sections */
  },
  tone: "detailed",
});

// 5. Send notification if approval needed
if (readiness.parentNotification?.requireApproval) {
  await agent.call_tool("compose_notification", {
    recipientType: "parent",
    notificationType: "approval-needed",
    context: { studentId: "maya_123", data: readiness },
  });
}
```

---

## 🎛️ Tool Configuration & Settings

### Tool Access Control

```typescript
interface ToolAccessConfig {
  // Which tools agent can use autonomously
  autonomousTools: string[];

  // Tools requiring parent approval (based on autonomy setting)
  approvalRequiredTools: string[];

  // Tool usage limits (prevent abuse)
  rateLimits: {
    [toolName: string]: {
      maxPerSession: number;
      maxPerDay: number;
    };
  };
}
```

### Tool Logging & Observability

```typescript
interface ToolCallLog {
  sessionId: string;
  timestamp: Date;
  toolName: string;
  input: any;
  output: any;
  executionTime: number; // ms
  success: boolean;
  error?: string;

  agentReasoning: string; // why agent called this tool
  impact: string; // what changed as a result
}
```

---

## 🚀 Implementation Priorities

### Phase 1 (MVP) - Essential Tools

1. ✅ **Concept Explainer** (continuous availability)
2. ✅ **Question Answerer** (continuous availability)
3. ✅ **Encouragement Generator** (continuous availability)
4. ✅ Worksheet Generator
5. ✅ Answer Evaluator
6. ✅ Progress Analyzer
7. ✅ Student Profile Query
8. ✅ Parent Report Generator

### Phase 2 - Intelligence Layer

6. ✅ Mastery Calculator
7. ✅ Readiness Assessor
8. ✅ Misconception Detector
9. ✅ Session History Query
10. ✅ Achievement Checker

### Phase 3 - Advanced Features

11. ✅ Work Analysis (vision/NLP)
12. ✅ Prerequisite Checker
13. ✅ Skill Path Navigator
14. ✅ Conversation Memory Search
15. ✅ Content Library Query

### Phase 4 - Polish

16. ✅ Hint Generator
17. ✅ Question Generator (on-demand)
18. ✅ Notification Composer
19. ✅ Learning Disposition Analyzer (NEW)
20. ✅ Session Deletion Tool (Right to Forget - NEW)
21. ✅ Caregiver Brief Generator (Guest Mode - NEW)
22. ✅ Personality Swap Recommendation (NEW)
23. ✅ PII Sanitization Layer (ALL TOOLS - NEW)

---

## 🆕 NEW TOOLS - Privacy & Personalization

### 19. Learning Disposition Analyzer Tool

**Purpose**: Analyze which character personality and teaching style leads to optimal learning outcomes

**Input Schema**:

```typescript
interface LearningDispositionAnalyzerInput {
  studentId: string;
  analysisWindow: "week" | "month" | "all-time";

  includeMetrics: {
    masteryVelocity: boolean;
    engagementLevels: boolean;
    frustrationIncidents: boolean;
    voluntarySessionStarts: boolean;
  };
}
```

**Output Schema**:

```typescript
interface LearningDispositionAnalyzerOutput {
  personalityEffectiveness: {
    characterId: string;
    characterName: string;
    energyLevel: "high" | "medium" | "low";
    teachingStyle: "energetic" | "patient" | "analytical" | "playful";

    metrics: {
      averageMasteryVelocity: number; // skills per hour
      averageEngagement: number; // 0-10
      frustrationRate: number; // incidents per session
      voluntaryStartRate: number; // % of sessions child initiated
      averageSessionDuration: number; // minutes
    };

    totalSessions: number;
    confidenceLevel: number; // 0-1, based on sample size
  }[];

  currentPersonality: string;

  recommendation: {
    shouldSwitch: boolean;
    recommendedPersonality: string;
    expectedImprovement: number; // % improvement in mastery velocity
    reasoning: string;
    confidence: number; // 0-1
  } | null;

  parentNotificationDraft?: {
    subject: string;
    message: string;
    actionRequired: boolean;
  };
}
```

**Use Cases**:

```typescript
// After 10+ sessions, check if personality is optimal
const analysis = await agent.call_tool("analyze_learning_disposition", {
  studentId: "maya_123",
  analysisWindow: "all-time",
  includeMetrics: {
    masteryVelocity: true,
    engagementLevels: true,
    frustrationIncidents: true,
    voluntarySessionStarts: true,
  },
});

// If significant difference found
if (analysis.recommendation?.shouldSwitch) {
  // Notify parent with recommendation
  await agent.call_tool("compose_notification", {
    recipientType: "parent",
    notificationType: "personality-recommendation",
    context: {
      studentId: "maya_123",
      data: analysis.recommendation,
    },
  });
}
```

---

### 20. Session Deletion Tool (Right to Forget)

**Purpose**: Allow parents to delete/exclude specific sessions from the agent's learning if child was sick, frustrated, or data is skewed

**Input Schema**:

```typescript
interface SessionDeletionInput {
  sessionId: string;
  deletedBy: string; // userId of parent/caregiver

  reason:
    | "child-sick"
    | "child-frustrated"
    | "technical-issue"
    | "bad-data"
    | "other";
  reasonDetails?: string;

  deletionType: "exclude-from-learning" | "full-delete";

  preserveMetadata: boolean; // keep for audit trail
}
```

**Output Schema**:

```typescript
interface SessionDeletionOutput {
  success: boolean;
  sessionId: string;

  dataRemoved: {
    conversationLogs: boolean;
    questionAttempts: boolean;
    performanceMetrics: boolean;
    emotionalData: boolean;
  };

  dataPreserved: {
    sessionMetadata: boolean; // timestamp, duration, user who deleted
    auditLog: boolean;
  };

  impactAnalysis: {
    skillsAffected: string[]; // which skill masteries will be recalculated
    progressRecalculated: boolean;
    learningProfileUpdated: boolean;
  };

  notification: {
    message: string; // confirmation to parent
    affectedInsights: string[]; // what insights may change
  };
}
```

**Implementation Notes**:

- Session content is permanently deleted (GDPR compliance)
- Metadata preserved for audit trail (who deleted, when, why)
- Mastery calculations automatically exclude deleted sessions
- Agent does not reference deleted sessions in future conversations
- Parent dashboard shows "X sessions excluded from analysis"

**Use Cases**:

```typescript
// Parent marks session where child was frustrated
const deletion = await agent.call_tool("delete_session", {
  sessionId: "session_789",
  deletedBy: "parent_sarah_123",
  reason: "child-frustrated",
  reasonDetails: "Maya was tired after long day at school",
  deletionType: "exclude-from-learning",
  preserveMetadata: true,
});

// Agent responds
agent.notify_parent({
  message: deletion.notification.message,
  affectedInsights: deletion.impactAnalysis.skillsAffected,
});
```

---

### 21. Caregiver Brief Generator Tool (Guest Mode)

**Purpose**: Generate quick, secure briefs for temporary caregivers without exposing full parent dashboard

**Input Schema**:

```typescript
interface CaregiverBriefGeneratorInput {
  studentId: string;
  caregiverType: "grandparent" | "babysitter" | "tutor" | "family-friend";

  accessLevel: "view-only" | "supervise-session";
  expiresIn: number; // hours until access expires

  includeInBrief: {
    currentGoals: boolean;
    todaysMission: boolean;
    encouragementTips: boolean;
    whatToAvoid: boolean;
    emergencyContact: boolean;
  };
}
```

**Output Schema**:

```typescript
interface CaregiverBriefGeneratorOutput {
  brief: {
    greeting: string;
    studentName: string;

    currentGoals: string; // e.g., "Working on 2-digit addition"
    todaysMission: string; // e.g., "Complete 10 addition problems"

    encouragementTips: string[];
    // e.g., ["Maya loves animal-themed problems", "Celebrate effort, not just correct answers"]

    whatToAvoid: string[];
    // e.g., ["Don't rush her", "She gets frustrated with timed challenges"]

    sessionGuidance: string;
    // e.g., "Let her work independently, but be available if she asks questions"

    characterInfo: {
      name: string;
      personality: string;
      howToReference: string;
      // e.g., "Ada the Owl is her learning companion. You can say 'Ada thinks you're doing great!'"
    };
  };

  accessCode: {
    qrCode: string; // scannable QR code
    shortUrl: string; // e.g., paadam.app/guest/abc123
    pin?: string; // optional numeric PIN
    expiresAt: Date;
  };

  permissions: {
    canViewProgress: boolean;
    canStartSession: boolean;
    canViewFullHistory: boolean;
    canEditSettings: boolean;
  };
}
```

**Security Features**:

- QR code/link expires after specified time
- Access limited to current session + basic context
- No access to full learning history
- No access to parent settings
- Session supervised by caregiver is flagged for parent review
- Parent receives notification when caregiver uses access

**Use Cases**:

```typescript
// Parent generates guest access for grandma
const brief = await agent.call_tool('generate_caregiver_brief', {
  studentId: 'maya_123',
  caregiverType: 'grandparent',
  accessLevel: 'supervise-session',
  expiresIn: 4, // 4 hours
  includeInBrief: {
    currentGoals: true,
    todaysMission: true,
    encouragementTips: true,
    whatToAvoid: true,
    emergencyContact: true
  }
});

// Parent shares QR code
parent.share(brief.accessCode.qrCode);

// Grandma scans QR, sees brief
grandma.scan(qrCode);
grandma.sees({
  greeting: "Thanks for helping Maya learn today!",
  currentGoals: "Maya is working on adding two-digit numbers...",
  todaysMission: "Complete her daily math mission (about 10 minutes)...",
  encouragementTips: [...],
  whatToAvoid: [...]
});

// After session, parent is notified
parent.receives({
  notification: "Grandma supervised a 12-minute learning session. Maya completed 8/10 questions correctly!"
});
```

---

### 22. Personality Swap Recommendation Tool

**Purpose**: Recommend character personality changes based on learning disposition analysis

**Input Schema**:

```typescript
interface PersonalitySwapRecommendationInput {
  studentId: string;
  currentPersonality: string;
  dispositionAnalysis: LearningDispositionAnalyzerOutput;

  minimumImprovementThreshold: number; // e.g., 15% improvement required to recommend
  minimumSessionsSample: number; // e.g., 10 sessions minimum before recommending
}
```

**Output Schema**:

```typescript
interface PersonalitySwapRecommendationOutput {
  shouldRecommend: boolean;

  recommendation?: {
    fromPersonality: {
      characterId: string;
      characterName: string;
      energyLevel: string;
      teachingStyle: string;
    };

    toPersonality: {
      characterId: string;
      characterName: string;
      energyLevel: string;
      teachingStyle: string;
    };

    expectedBenefits: {
      masteryVelocityIncrease: number; // %
      engagementIncrease: number; // %
      frustrationDecrease: number; // %
    };

    reasoning: string;
    // e.g., "Maya shows 18% faster learning with Ada's calm, patient approach compared to Max's energetic style"

    confidence: number; // 0-1
    dataBasis: string;
    // e.g., "Based on 15 sessions with Ada vs 12 sessions with Max"
  };

  parentNotification: {
    subject: string;
    message: string;
    tone: "suggestion" | "strong-recommendation";
    actionButtons: {
      approve: string;
      decline: string;
      moreInfo: string;
    };
  };
}
```

**Use Cases**:

```typescript
// After learning disposition analysis
const dispositionAnalysis = await agent.call_tool(
  "analyze_learning_disposition",
  {
    studentId: "maya_123",
    analysisWindow: "all-time",
    includeMetrics: {
      /* all metrics */
    },
  },
);

// Check if should recommend swap
const recommendation = await agent.call_tool("recommend_personality_swap", {
  studentId: "maya_123",
  currentPersonality: "max-fox",
  dispositionAnalysis,
  minimumImprovementThreshold: 15,
  minimumSessionsSample: 10,
});

if (recommendation.shouldRecommend) {
  // Send to parent
  await agent.call_tool("compose_notification", {
    recipientType: "parent",
    notificationType: "personality-swap",
    context: {
      studentId: "maya_123",
      data: recommendation.parentNotification,
    },
  });

  // Wait for parent approval
  const approval = await parent.respondToRecommendation();

  if (approval.approved) {
    // Switch personality
    await agent.updatePersonality(
      "maya_123",
      recommendation.recommendation.toPersonality,
    );

    // Monitor results
    agent.log({
      event: "personality-swap",
      from: "max-fox",
      to: "ada-owl",
      reason: recommendation.recommendation.reasoning,
      expectedImprovement: recommendation.recommendation.expectedBenefits,
    });
  }
}
```

---

### 23. PII Sanitization Layer (All Tools)

**Purpose**: Strip personally identifiable information before any data is sent to external LLM providers

**Architecture**:

```typescript
class PIISanitizationLayer {
  /**
   * All tool calls pass through this layer before reaching LLM
   */
  async sanitize(
    toolInput: any,
    context: {
      studentProfile: StudentProfile;
      sessionContext: any;
    },
  ): Promise<{
    sanitizedInput: any;
    sanitizationLog: PIISanitizationLog;
  }> {
    const sanitized = { ...toolInput };
    const log: PIISanitizationLog = {
      timestamp: new Date(),
      fieldsRedacted: [],
      piiDetected: [],
    };

    // 1. Remove student name
    if (context.studentProfile.name) {
      sanitized.context = this.replaceInObject(
        sanitized.context,
        context.studentProfile.name,
        "the student",
      );
      log.fieldsRedacted.push("student_name");
      log.piiDetected.push({ type: "name", value: "[REDACTED]" });
    }

    // 2. Remove parent names
    const parentNames =
      context.studentProfile.parentGuardians?.map((p) => p.name) || [];
    parentNames.forEach((name) => {
      sanitized.context = this.replaceInObject(
        sanitized.context,
        name,
        "their parent",
      );
    });
    if (parentNames.length > 0) {
      log.fieldsRedacted.push("parent_names");
    }

    // 3. Remove location data
    const locationFields = ["city", "state", "school", "address", "zipCode"];
    locationFields.forEach((field) => {
      if (sanitized.context?.[field]) {
        sanitized.context[field] = "[LOCATION]";
        log.fieldsRedacted.push(field);
      }
    });

    // 4. Remove birthdates (keep age range)
    if (context.studentProfile.dateOfBirth) {
      const age = this.calculateAge(context.studentProfile.dateOfBirth);
      sanitized.context.studentAge = `${Math.floor(age / 2) * 2}-${Math.floor(age / 2) * 2 + 1} years old`;
      delete sanitized.context.dateOfBirth;
      log.fieldsRedacted.push("date_of_birth");
    }

    // 5. Remove email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    sanitized.context = JSON.parse(
      JSON.stringify(sanitized.context).replace(emailRegex, "[EMAIL]"),
    );

    // 6. Remove phone numbers
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    sanitized.context = JSON.parse(
      JSON.stringify(sanitized.context).replace(phoneRegex, "[PHONE]"),
    );

    // 7. Preserve educational context (safe to share)
    // ✅ Keep: grade level, skills, performance metrics, learning patterns
    // ✅ Keep: question content, answers, work shown
    // ✅ Keep: character preferences, teaching style effectiveness
    // ✅ Keep: emotional states, frustration patterns (anonymized)

    return {
      sanitizedInput: sanitized,
      sanitizationLog: log,
    };
  }

  private replaceInObject(obj: any, search: string, replace: string): any {
    const str = JSON.stringify(obj);
    const regex = new RegExp(search, "gi");
    return JSON.parse(str.replace(regex, replace));
  }

  private calculateAge(dob: Date): number {
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }
}

interface PIISanitizationLog {
  timestamp: Date;
  fieldsRedacted: string[];
  piiDetected: { type: string; value: string }[];
}
```

**Integration with All Tools**:

```typescript
// Every tool call goes through sanitization
async function callTool(toolName: string, input: any, context: any) {
  // 1. Sanitize PII
  const { sanitizedInput, sanitizationLog } = await piiSanitizer.sanitize(
    input,
    context,
  );

  // 2. Log sanitization
  await logSanitization(sanitizationLog);

  // 3. Call LLM with sanitized data
  const result = await llmProvider.call(toolName, sanitizedInput);

  // 4. Return result (already safe, no PII in response)
  return result;
}
```

**What Gets Sanitized**:

- ❌ Student name → "the student" or "they"
- ❌ Parent/caregiver names → "their parent" or "guardian"
- ❌ School name → "school"
- ❌ City, state, address → "[LOCATION]" or "their area"
- ❌ Birthdate → age range (e.g., "7-8 years old")
- ❌ Email addresses → "[EMAIL]"
- ❌ Phone numbers → "[PHONE]"

**What Gets Preserved** (Safe Educational Context):

- ✅ Grade level (e.g., "2nd grade")
- ✅ Skills and topics (e.g., "two-digit addition")
- ✅ Performance metrics (accuracy, speed, mastery)
- ✅ Learning patterns (struggles, breakthroughs)
- ✅ Question content and answers
- ✅ Emotional states (frustrated, excited, curious)
- ✅ Character preferences and effectiveness
- ✅ Teaching style recommendations

**Audit Trail**:

- Every sanitization is logged
- Parents can view what data is sent to LLM providers
- Compliance reports available for COPPA/GDPR
- Regular audits to ensure no PII leaks

---

## 🆕 NEW TOOLS - Privacy, Caregivers & Learning Disposition

### 24. Learning Disposition Analyzer Tool

**Purpose**: Analyze emotional patterns, learning behaviors, and personality effectiveness to optimize agent configuration.

**Input Schema**:

```typescript
interface LearningDispositionInput {
  studentId: string;
  sessionIds?: string[]; // analyze specific sessions, or recent N sessions
  includeExcluded: boolean; // default false - exclude sessions marked by parent
}
```

**Output Schema**:

```typescript
interface LearningDispositionOutput {
  emotionalPatterns: {
    dominantStates: Array<{
      state: "engaged" | "frustrated" | "confident" | "bored" | "excited";
      frequency: number; // percentage of sessions
      triggers?: string[]; // what causes this state
    }>;

    frustrationTriggers: string[]; // "word problems", "time pressure", "new concepts"
    confidenceMoments: string[]; // "visual aids", "familiar contexts", "step-by-step guidance"
    energyPattern: {
      morningEnergy: number; // 1-10
      afternoonEnergy: number;
      eveningEnergy: number;
      optimalTime?: string;
    };
  };

  motivationFactors: {
    effectivePraise: string[]; // "Great thinking!", "I love how you tried!"
    ineffectivePraise: string[]; // "Good job" doesn't resonate
    preferredRewards: string[]; // "stars", "character unlocks", "new challenges"
  };

  personalityEffectiveness: Array<{
    personalityId: string;
    sessionCount: number;
    masteryVelocity: number; // skills mastered per hour
    engagementScore: number; // 0-10
    recommendation: "optimal" | "effective" | "neutral" | "less-effective";
  }>;

  suggestedPersonality?: {
    personalityId: string;
    reason: string; // "Luna (Curious) shows 20% higher engagement and 15% faster mastery"
    confidenceLevel: number; // 0-100
  };
}
```

**Use Cases**:

- After 10+ sessions, generate personality effectiveness report
- Parent views "Optimize Learning" report
- Agent automatically suggests personality swap if data shows clear better fit
- Identify optimal learning time for scheduling reminders

**Performance Metrics**:

- Analyze up to 100 sessions in <3 seconds
- Generate actionable insight (at least one specific recommendation)

---

### 25. Personality Effectiveness Tracker Tool

**Purpose**: Real-time tracking of how each personality configuration impacts learning outcomes.

**Input Schema**:

```typescript
interface PersonalityTrackingInput {
  studentId: string;
  sessionId: string;
  personalityId: string;
  sessionMetrics: {
    masteryProgress: number; // skills advanced this session
    engagementScore: number; // 0-10, based on questions asked, time on task
    frustratedMoments: number;
    celebrationMoments: number;
    hintsUsed: number;
    accuracy: number;
  };
}
```

**Output Schema**:

```typescript
interface PersonalityTrackingOutput {
  updated: boolean;
  currentVelocity: number; // running average mastery velocity for this personality
  comparison?: {
    currentPersonality: string;
    alternativePersonality: string;
    velocityDifference: number; // percentage difference
    suggestTrial: boolean;
  };
}
```

**Use Cases**:

- Update after every learning session
- Track personality A/B test performance
- Parent starts A/B test: "Try Max (Energetic) for 2 weeks" - tool tracks results
- Auto-generate "personality report card" after 10 sessions

---

### 26. Guest Access Generator Tool

**Purpose**: Generate secure, time-limited QR codes for temporary caregivers.

**Input Schema**:

```typescript
interface GuestAccessInput {
  parentId: string;
  studentId: string; // single child only
  duration: 1 | 4 | 8 | 24; // hours
  guestName?: string; // optional: "Brianna - babysitter"
  notes?: string; // optional: "Maya's evening practice session"
}
```

**Output Schema**:

```typescript
interface GuestAccessOutput {
  guestCodeId: string;
  qrCodeData: string; // URL with encrypted token
  qrCodeImage: string; // Base64 PNG for display
  expiresAt: Date;
  guestSessionURL: string; // shareable link

  instructions: {
    forParent: string; // "Show this QR code to Brianna. It expires at 10:00 PM."
    forGuest: string; // "Scan to start Maya's learning session"
  };
}
```

**Use Cases**:

- Parent about to leave child with babysitter
- Grandparent coming over for afternoon - parent generates code in advance
- After-school program needs supervised access for 2 hours

**Security Requirements**:

- QR code contains JWT with: studentId, expiresAt, scope (guest-session-only)
- Cannot be reused after expiration
- Guest session is browser-based (no app install required)
- Auto-terminates at expiration even if session is active

**Performance Metrics**:

- Generate QR code in <2 seconds
- QR code scans successfully on all devices
- Guest session loads in <5 seconds

---

### 27. Caregiver Permission Validator Tool

**Purpose**: Check if a secondary caregiver has permission to perform an action.

**Input Schema**:

```typescript
interface PermissionCheckInput {
  caregiverId: string;
  studentId: string;
  action:
    | "view-progress"
    | "view-reports"
    | "supervise-session"
    | "change-settings"
    | "approve-advancement"
    | "exclude-session"
    | "generate-guest-code";
}
```

**Output Schema**:

```typescript
interface PermissionCheckOutput {
  allowed: boolean;
  caregiverRole: "read-only" | "supervised" | "co-parent";
  reason: string; // "Grandma Jean has read-only access to Maya only"

  alternatives?: string; // if not allowed: "Contact primary parent to change settings"
}
```

**Use Cases**:

- Before showing UI elements (hide "Change Personality" if caregiver is read-only)
- Before executing caregiver action (validate permission server-side)
- Show helpful messages: "Only primary parents can change agent settings"

---

### 28. Session Exclusion Manager Tool (Right to Forget)

**Purpose**: Mark sessions as excluded from behavioral analysis while preserving academic mastery data.

**Input Schema**:

```typescript
interface SessionExclusionInput {
  parentId: string; // must be primary parent
  sessionId: string;
  excludeFromAnalysis: boolean; // true = exclude
  excludeMasteryData: boolean; // true = also exclude academic performance
  reason?: string; // "child was sick", "frustrated day", "testing app"
}
```

**Output Schema**:

```typescript
interface SessionExclusionOutput {
  success: boolean;
  sessionId: string;
  isExcluded: boolean;
  excludedAt: Date;

  impact: {
    memoriesAffected: number; // conversation logs excluded
    behavioralPatternsRecalculated: boolean;
    personalityMetricsUpdated: boolean;
    masteryLevelsChanged: boolean; // only if excludeMasteryData = true
  };

  updatedReports: {
    sessionCountChanged: boolean; // "Based on 45 sessions (3 excluded)"
    dispositionAnalysisChanged: boolean;
    personalityRecommendationChanged: boolean;
  };
}
```

**Use Cases**:

- Parent reviews yesterday's session: "Maya was tired and frustrated, exclude this"
- After vacation: "Exclude all sessions from last week, we were traveling"
- Child was testing the app: "Exclude this session, she was just clicking randomly"

**Business Rules**:

- Only primary parent can exclude sessions
- Can only exclude sessions within 48 hours (prevents gaming the system)
- Exclusion is reversible (can un-exclude later)
- Excluded sessions appear in history with ⚠️ "Excluded from Analysis" badge
- Agent reports explicitly state excluded session count

**Performance Metrics**:

- Mark session excluded in <1 second
- Recalculate personality metrics in <5 seconds
- Update parent dashboard in <3 seconds

---

### 29. Multi-Provider LLM Router Tool (Model-Agnostic AI)

**Purpose**: Abstract LLM provider selection - route tool calls to OpenAI, Claude, OpenRouter, or custom models.

**Input Schema**:

```typescript
interface LLMRouterInput {
  toolName: string; // which agent tool needs LLM
  sanitizedInput: any; // already PII-sanitized data
  preferredProvider?: "openai" | "claude" | "openrouter" | "custom";
  taskComplexity: "simple" | "medium" | "complex"; // affects provider routing
  maxCost?: number; // cents - for cost optimization
}
```

**Output Schema**:

```typescript
interface LLMRouterOutput {
  result: any; // LLM response (format depends on tool)

  metadata: {
    providerUsed: string; // "openai-gpt4o", "claude-sonnet-3.5", etc.
    modelVersion: string;
    tokensUsed: number;
    cost: number; // cents
    latency: number; // milliseconds
    fallbackUsed: boolean; // true if primary provider failed
  };
}
```

**Routing Strategy**:

1. **Conversation Tools** → Claude (better conversational flow)
2. **Content Generation** → GPT-4 (structured output)
3. **Simple Tasks** → GPT-4o-mini (cost optimization)
4. **Complex Analysis** → Claude Opus or GPT-4 (based on availability)
5. **Fallback Chain**: Primary → Backup → OpenRouter

**Use Cases**:

- Automatic routing: Agent doesn't care which provider, just needs result
- Cost optimization: Route simple tasks to cheaper models
- Failover: If Claude is down, auto-switch to GPT-4
- A/B testing: Compare Claude vs GPT-4 for parent report quality
- Future-proofing: Add new providers without changing agent code

**Configuration**:

```typescript
interface ProviderConfig {
  providers: Array<{
    name: string;
    apiKey: string;
    models: string[];
    costPerToken: number;
    priority: number; // 1 = highest
    maxRequestsPerMinute: number;
  }>;

  routingRules: Array<{
    toolPattern: string; // regex: ".*Generator", "Concept.*"
    preferredProvider: string;
    fallbackProviders: string[];
  }>;
}
```

**Performance Metrics**:

- Add <50ms overhead for routing decision
- Provider failover in <2 seconds
- Track cost per tool type for optimization

**Security**:

- API keys stored in Firebase environment variables
- Different keys per environment (dev/staging/production)
- Rate limiting per provider
- Cost monitoring with alerts

---

## 💡 Best Practices for Tool Usage

1. **Always Log Reasoning**: Every tool call includes why the agent chose to use it
2. **Fail Gracefully**: If a tool fails, agent has fallback strategies
3. **Validate Inputs**: Type checking and validation before tool calls
4. **Cache When Possible**: Student profiles, skill data cached to reduce latency
5. **Compose Tools**: Use multiple tools together for complex decisions
6. **Monitor Performance**: Track tool response times and success rates
7. **Privacy First**: No PII in logs, encrypted data in transit

---

**Next Steps**:

- API specifications for each tool
- Database schemas to support tool data
- Tool testing framework
- Performance benchmarks
