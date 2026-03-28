// ========================================
// STUDENT PROFILE & PROGRESS
// ========================================

export type Grade = "K" | "1" | "2" | "3" | "4" | "5" | "6";
export type TimeOfDay = "morning" | "afternoon" | "evening";
export type LearningModality = "visual" | "verbal" | "kinesthetic" | "logical";
export type DifficultyPreference = "easy" | "balanced" | "challenging";

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  grade: Grade;
  dateOfBirth?: Date;
  preferredLanguage?: string;
  createdAt: Date;
  updatedAt: Date;

  // Progress & Gamification
  xp: number;
  level: number;
  xpToNextLevel: number;
  stars?: number;
  gems?: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: Date | null;
  totalPracticeTime: number; // minutes
  totalQuestionsAttempted?: number;
  totalQuestionsCorrect?: number;

  // Character & Customization
  selectedCharacterId: string | null;
  characterBondLevel: number; // 0-100
  characterId?: string; // legacy
  characterLevel?: number; // legacy
  characterCustomization?: CharacterCustomization;
  unlockedItems?: string[];

  // Learning Profile
  skillsMastery: { [skillId: string]: SkillMastery };
  skillMastery?: { [skillId: string]: SkillMastery }; // legacy
  learningDisposition: LearningDisposition | null;

  // Life Skills - Applied Learning
  lifeSkillExposure?: {
    [domain: string]: {
      timesExposed: number;
      lastSeenAt: Date | null;
      engagementScore: number;
    };
  };
  dispositionConfidence: number; // 0-1
  learningProfile?: LearningProfile;
  preferences?: StudentPreferences;

  // Achievements
  achievements?: string[];
  badges?: Badge[];
  completedQuests?: string[];

  // Analytics
  lastActiveAt: Date;
  lastActiveDate?: Date; // legacy
  totalActiveTime?: number; // milliseconds
  averageSessionDuration?: number; // milliseconds
  preferredSessionTime?: TimeOfDay;
}

export interface SkillMastery {
  skillId: string;
  masteryLevel: number; // 0-100
  lastPracticedAt: Date;
  questionsAttempted: number;
  questionsCorrect: number;
  currentDifficulty: number; // 1-5
  consecutiveCorrect: number;
  needsReview: boolean;

  // Legacy fields (optional)
  lastPracticed?: Date;
  totalAttempts?: number;
  correctAttempts?: number;
  averageTimeSeconds?: number;
  nextReviewDate?: Date;

  // Spaced Repetition (SM-2 Algorithm) - optional
  easeFactor?: number;
  interval?: number; // days
  repetitions?: number;

  // Recent performance - optional
  recentAccuracy?: number; // 0-1
  recentSpeed?: "slow" | "average" | "fast";
  confidenceLevel?: number; // 1-5
}

export interface LearningProfile {
  learningVelocity: number; // How fast they master concepts (0-10)
  retentionRate: number; // How well they remember (0-1)
  persistenceScore: number; // Retry rate after mistakes (0-10)
  averageAccuracy: number; // Overall success rate (0-1)
  preferredDifficulty: DifficultyPreference;
  strongModalities: LearningModality[];
  peakPerformanceTime?: TimeOfDay;
  optimalSessionLength: number; // minutes

  // Behavioral patterns
  hintPreference: "rarely" | "sometimes" | "often";
  challengeSeeking: number; // 0-10, how often they choose harder problems
  explanationQuality: number; // 0-10, avg quality of explanations
  collaborationInterest: number; // 0-10, interest in social features
}

export interface StudentPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationsEnabled: boolean;
  characterChoice: string;
  themeChoice: "light" | "dark" | "auto";
  hintsEnabled: boolean;
  parentalNotifications: boolean;
  dailyGoalReminders: boolean;

  // Accessibility
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  dyslexiaFont: boolean;
  readAloud: boolean;
}

// ========================================
// SKILLS & CURRICULUM
// ========================================

export type SkillCategory =
  | "number-sense"
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions"
  | "decimals"
  | "geometry"
  | "measurement"
  | "algebra"
  | "logic"
  | "patterns"
  | "word-problems";

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  subject: string;
  gradeLevel: Grade;

  // Curriculum Structure
  prerequisites: string[]; // skill IDs that must be mastered first
  relatedSkills: string[]; // skills that complement this one
  nextSkills: string[]; // natural progression

  // Metadata
  difficultyRange: [number, number]; // min/max difficulty (1-10)
  estimatedMasteryTime: number; // typical minutes to master
  tags: string[];
  icon: string;
  color: string;

  // Content
  conceptExplanation: string;
  examples: Example[];
  commonMisconceptions: Misconception[];

  // Display
  displayOrder: number;
  isCore: boolean; // core vs enrichment
  isVisible: boolean;
}

export interface Example {
  question: string;
  answer: string;
  explanation: string;
  visualAid?: VisualAid;
}

export interface Misconception {
  id: string;
  description: string;
  commonError: string;
  correctConcept: string;
  remediation: string;
}

export interface SkillTree {
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  nodes: SkillTreeNode[];
  connections: SkillConnection[];
}

export interface SkillTreeNode {
  skillId: string;
  position: { x: number; y: number };
  status: "locked" | "available" | "in-progress" | "mastered";
  masteryLevel: number;
}

export interface SkillConnection {
  from: string; // skill ID
  to: string; // skill ID
  type: "prerequisite" | "related" | "next";
}

// ========================================
// QUESTIONS & CONTENT
// ========================================

export type QuestionType =
  | "multiple-choice"
  | "numeric-input"
  | "show-work"
  | "explain-thinking"
  | "find-mistake"
  | "multiple-solutions"
  | "create-problem"
  | "true-false"
  | "matching"
  | "fill-blank";

export type AnswerFormat =
  | "single-choice"
  | "multiple-choice"
  | "numeric"
  | "text"
  | "fraction"
  | "drawing";

export interface Question {
  id: string;
  skillId: string;
  type: QuestionType;
  difficulty: number; // 1-10

  // Content
  prompt: string;
  visualAid?: VisualAid;
  context?: string; // story/scenario context
  audioUrl?: string; // for read-aloud

  // Answer
  correctAnswer: string | string[]; // can have multiple correct answers
  acceptableAnswers?: string[]; // alternative valid answers
  answerFormat: AnswerFormat;
  answerUnit?: string; // "cm", "minutes", etc.

  // Multiple Choice Options
  options?: QuestionOption[];

  // Support
  hints: Hint[];
  explanation: string;
  relatedConcepts: string[];
  similarQuestions?: string[]; // for practice

  // Metadata
  estimatedTime: number; // seconds
  xpValue: number;
  tags: string[];
  createdBy: "ai" | "curriculum" | "teacher" | "community";
  createdAt: Date;
  qualityScore?: number; // 0-5 based on user ratings
  usageCount: number;
  averageSuccessRate: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  visualAid?: VisualAid;
  commonMisconception?: string; // if this wrong answer reveals specific misconception
  feedback?: string; // specific feedback for choosing this option
}

export interface Hint {
  level: number; // 1-4, progressive difficulty
  text: string;
  type: "encouragement" | "strategy" | "example" | "step-by-step" | "visual";
  visualAid?: VisualAid;
  revealsCost?: number; // stars cost to unlock (0 for free hints)
}

export interface VisualAid {
  type: "image" | "diagram" | "number-line" | "manipulative" | "chart";
  url?: string;
  data?: any; // for dynamic visualizations
  altText: string;
}

// ========================================
// LEARNING SESSIONS
// ========================================

export type SessionType =
  | "daily-mission"
  | "skill-practice"
  | "review"
  | "challenge"
  | "diagnostic"
  | "free-play"
  | "quest"
  | "mini-game";

export type SessionStatus = "active" | "paused" | "completed" | "abandoned";

export interface LearningSession {
  id: string;
  studentId: string;
  characterId: string;
  type?: SessionType;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number;
  status?: SessionStatus;

  // EMOTIONAL TRACKING (HIGHEST PRIORITY for agent memory)
  emotionalStates: EmotionalState[];
  overallMood: "positive" | "neutral" | "negative" | null;
  frustrationTriggers: Array<{
    timestamp: Date;
    trigger: string;
    intensity: number;
  }>;
  celebrationMoments: Array<{
    timestamp: Date;
    moment: string;
    intensity: number;
  }>;

  // BEHAVIORAL TRACKING
  behavioralPatterns: BehavioralPattern[];
  energyLevel: "high" | "medium" | "low" | null;
  focusQuality: "excellent" | "good" | "fair" | "poor" | null;

  // PERFORMANCE TRACKING
  questionsAttempted: QuestionAttempt[];
  skillsWorkedOn: string[];
  newSkillsIntroduced: string[];
  skillsMastered: string[];

  // SESSION OUTCOMES
  xpEarned: number;
  achievementsUnlocked: string[];
  masteryVelocity: number; // skills per hour

  // AGENT MEMORY SUMMARY
  agentMemorySummary: string | null;

  // Adaptive pipeline
  theme?: string; // narrative theme for this session (set by adaptive pipeline)

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Legacy fields (optional for backward compatibility)
  duration?: number; // milliseconds
  plannedQuestions?: string[];
  currentQuestionIndex?: number;
  attempts?: QuestionAttempt[];
  questionsCorrect?: number;
  averageTimePerQuestion?: number;
  hintsUsed?: number;
  retries?: number;
  starsEarned?: number;
  engagementScore?: number; // 1-10
  frustrationEvents?: number;
  difficultyCurve?: number[]; // difficulty of each question
  accuracyCurve?: number[]; // correct/incorrect pattern

  // Context
  skillsFocused?: string[]; // skill IDs practiced
  deviceInfo?: DeviceInfo;
  timeOfDay?: TimeOfDay;
}

// Emotional and Behavioral Tracking Types
export interface EmotionalState {
  emotion:
    | "excited"
    | "happy"
    | "calm"
    | "frustrated"
    | "confused"
    | "bored"
    | "proud"
    | "joyful"
    | "anxious"
    | "curious";
  intensity: number; // 1-5
  context?: string; // what triggered this emotion
  timestamp: Date;
}

export interface BehavioralPattern {
  pattern:
    | "rushed-answers"
    | "careful-checking"
    | "help-seeking"
    | "persistent-retry"
    | "quick-give-up"
    | "distracted"
    | "focused"
    | "playful"
    | "serious";
  frequency: number; // count in this session
  context?: string;
  timestamp: Date;
}

export interface QuestionAttempt {
  id: string;
  sessionId: string;
  questionId: string;
  skillId: string;
  attemptNumber: number; // 1st attempt, 2nd attempt, etc.

  // Timing
  startTime: Date;
  submitTime: Date;
  timeSpent: number; // milliseconds
  timestamp: Date; // when the attempt was made

  // Answer
  studentAnswer: string;
  isCorrect: boolean;
  partialCredit?: number; // 0-1 for partially correct

  // Support Used
  hintsViewed: number[]; // which hint levels were viewed
  showWorkData?: ShowWorkData;
  explanation?: string; // if student explained their thinking

  // Analysis
  mistakeType?: MistakeType;
  misconceptionDetected?: string;
  strategyUsed?: string;
  confidence?: number; // 1-5 self-reported

  // Feedback received
  feedback: Feedback;
  characterResponse?: string;
}

export type MistakeType =
  | "calculation-error"
  | "conceptual-misunderstanding"
  | "reading-error"
  | "careless-mistake"
  | "missing-step"
  | "wrong-operation"
  | "unit-error";

export interface ShowWorkData {
  type: "drawing" | "steps" | "visual" | "voice";
  data: any; // canvas data, step text, audio URL, etc.
  aiAnalysis?: {
    strategyDetected: string;
    correctProcess: boolean;
    stepsIdentified: string[];
    feedback: string;
    strengthsObserved: string[];
    areasToImprove: string[];
  };
}

export interface Feedback {
  type: "correct" | "incorrect" | "partial" | "excellent";
  message: string;
  encouragement: string;
  xpAwarded: number;
  starsAwarded: number;

  // For incorrect answers
  hintForNextTry?: string;
  similarProblemSuggestion?: string;
  misconceptionAddressed?: string;

  // For correct answers
  efficiencyBonus?: number; // extra XP for fast/elegant solutions
  strategyPraise?: string;
  nextChallenge?: string;
}

// ========================================
// ACHIEVEMENTS & REWARDS
// ========================================

export type AchievementCategory =
  | "skill-mastery"
  | "streak"
  | "milestone"
  | "learning-behavior"
  | "social"
  | "special"
  | "character-bond";

export type AchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;

  // Requirements
  criteria: AchievementCriteria;
  prerequisites?: string[]; // achievement IDs

  // Rewards
  xpReward: number;
  starReward: number;
  gemReward?: number;
  unlocksItem?: string;
  characterReaction?: string;

  // Display
  icon: string;
  color: string;
  celebrationAnimation: string;
  celebrationSound?: string;

  // Metadata
  rarity: number; // 1-100, percentage of students who have this
  hidden: boolean; // surprise achievements
  repeatable: boolean;
  displayOrder: number;
}

export interface AchievementCriteria {
  type: CriteriaType;
  target: number;
  current?: number;
  skillId?: string;
  timeframe?: number; // days
  additionalConditions?: any;
}

export type CriteriaType =
  | "questions-correct"
  | "skill-mastery-level"
  | "consecutive-correct"
  | "streak-days"
  | "perfect-session"
  | "help-character"
  | "create-problems"
  | "speed-solve"
  | "no-hints-used"
  | "explain-quality"
  | "challenges-completed"
  | "total-xp"
  | "level-reached";

export interface Badge {
  achievementId: string;
  unlockedAt: Date;
  progress: number; // current progress toward next tier (for tiered achievements)
  displayOnProfile: boolean;
  timesEarned: number; // for repeatable achievements
}

export interface DailyGoal {
  id: string;
  studentId: string;
  date: Date;
  goals: Goal[];
  completed: boolean;
  completionTime?: Date;
  rewardsClaimed: boolean;
}

export interface Goal {
  id: string;
  type: "questions" | "xp" | "skills" | "time" | "perfect-streak";
  target: number;
  current: number;
  completed: boolean;
  starReward: number;
}

// ========================================
// CHARACTER SYSTEM
// ========================================

export type CharacterType =
  | "owl"
  | "fox"
  | "cat"
  | "pup"
  | "dragon"
  | "bunny"
  | "bear";
export type Emotion =
  | "happy"
  | "excited"
  | "thinking"
  | "confused"
  | "encouraging"
  | "celebrating";
export type Action =
  | "idle"
  | "celebrate"
  | "think"
  | "explain"
  | "cheer"
  | "comfort";
export type TeachingStyle =
  | "patient"
  | "energetic"
  | "analytical"
  | "creative"
  | "supportive";

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  personality: CharacterPersonality;

  // Visual
  baseImage: string;
  expressionImages: { [key in Emotion]: string };
  animations: { [key in Action]: string };
  sounds?: { [key: string]: string };

  // Dialogue Templates
  greetings: string[];
  encouragements: string[];
  celebrations: string[];
  hints: { [category: string]: string[] };
  comfortPhrases: string[];
  teachingPrompts: string[];

  // Behavior
  responseTriggers: ResponseTrigger[];
  teachingStyle: TeachingStyle;

  // Unlockables
  evolutionStages: EvolutionStage[];
  accessories: CharacterAccessory[];
}

export interface CharacterPersonality {
  enthusiasm: number; // 1-10
  patience: number; // 1-10
  playfulness: number; // 1-10
  wisdom: number; // 1-10
  traits: string[]; // "curious", "energetic", "calm", "wise", "silly"
}

export interface ResponseTrigger {
  condition:
    | "correct"
    | "incorrect"
    | "struggle"
    | "streak"
    | "achievement"
    | "level-up";
  response: string;
  probability: number; // 0-1, chance of this response
}

export interface CharacterState {
  studentId: string;
  characterId: string;
  level: number;
  xp: number;
  evolutionStage: number;

  // Customization
  customization: CharacterCustomization;

  // Relationship
  bondLevel: number; // 1-100
  lastInteraction: Date;
  totalInteractions: number;
  favoriteMoments: string[]; // achievement IDs they celebrated together

  // Character's own "learning"
  helpedWithSkills: string[]; // skills student has "taught" character
  characterMastery: { [skillId: string]: number }; // character's own progress
}

export interface CharacterCustomization {
  accessories: string[]; // accessory IDs
  colors: { [part: string]: string };
  environment: string; // background/scene
  nameCustomization?: string; // custom name
}

export interface EvolutionStage {
  stage: number;
  name: string;
  requiredLevel: number;
  image: string;
  description: string;
  unlocksAccessories: string[];
}

export interface CharacterAccessory {
  id: string;
  name: string;
  type: "hat" | "glasses" | "outfit" | "background" | "prop";
  image: string;
  cost: number; // stars
  requiredLevel?: number;
  unlockCondition?: string; // achievement ID or special condition
}

// ========================================
// QUESTS & CHALLENGES
// ========================================

export type QuestType = "daily" | "weekly" | "story" | "special-event";
export type QuestStatus = "locked" | "available" | "in-progress" | "completed";

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  status: QuestStatus;

  // Story elements
  story?: string;
  characterInvolved?: string;
  chapters?: QuestChapter[];

  // Requirements
  prerequisites?: string[]; // quest IDs or skill IDs
  recommendedLevel: number;

  // Objectives
  objectives: QuestObjective[];

  // Rewards
  xpReward: number;
  starReward: number;
  gemReward?: number;
  specialReward?: string; // unique item or character unlock

  // Timing
  startDate?: Date;
  endDate?: Date;
  estimatedDuration: number; // minutes

  // Display
  icon: string;
  banner?: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
}

export interface QuestChapter {
  id: string;
  title: string;
  story: string;
  objectives: QuestObjective[];
  completed: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type:
    | "complete-questions"
    | "master-skill"
    | "perfect-streak"
    | "help-character";
  target: number;
  current: number;
  completed: boolean;
  skillId?: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 1-10

  // Content
  questions: string[]; // question IDs
  timeLimit?: number; // seconds

  // Constraints
  noHints?: boolean;
  perfectRequired?: boolean;
  speedRequired?: number; // max seconds per question

  // Rewards
  xpReward: number;
  starReward: number;
  achievementUnlock?: string;

  // Leaderboard
  enableLeaderboard: boolean;
  leaderboardScope: "global" | "classroom" | "friends";
}

// ========================================
// SOCIAL & COLLABORATIVE
// ========================================

export interface FriendChallenge {
  id: string;
  fromStudentId: string;
  toStudentId: string;
  skillId: string;
  questions: string[];
  createdAt: Date;
  expiresAt: Date;

  // Status
  status: "pending" | "accepted" | "completed" | "expired";
  fromStudentScore?: number;
  toStudentScore?: number;
  winner?: string;

  // Rewards
  xpReward: number;
  starReward: number;
}

export interface Leaderboard {
  id: string;
  type: "daily" | "weekly" | "monthly" | "all-time";
  scope: "global" | "classroom" | "friends";
  metric: "xp" | "stars" | "skills-mastered" | "streak";

  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  characterId: string;
  value: number;
  badge?: string; // special badge for top performers
}

// ========================================
// PARENT/TEACHER DASHBOARD
// ========================================

export interface ParentDashboard {
  studentId: string;

  // Overview
  currentLevel: number;
  totalXP: number;
  currentStreak: number;

  // Progress Summary
  skillsMastered: number;
  skillsInProgress: number;
  skillsToLearn: number;

  // Recent Activity
  lastActiveDate: Date;
  weeklyActivityMinutes: number;
  sessionsThisWeek: number;

  // Performance Insights
  strongSkills: SkillInsight[];
  skillsNeedingSupport: SkillInsight[];
  learningPatterns: LearningPattern[];

  // Achievements
  recentAchievements: Achievement[];
  upcomingMilestones: Milestone[];

  // Recommendations
  suggestedActivities: OfflineActivity[];
  conversationStarters: string[];
}

export interface SkillInsight {
  skillId: string;
  skillName: string;
  masteryLevel: number;
  trend: "improving" | "stable" | "declining";
  lastPracticed: Date;
  recommendation?: string;
}

export interface LearningPattern {
  pattern: string;
  description: string;
  impact: "positive" | "neutral" | "needs-attention";
  suggestion?: string;
}

export interface Milestone {
  name: string;
  progress: number;
  target: number;
  estimatedCompletion?: Date;
}

export interface OfflineActivity {
  id: string;
  name: string;
  description: string;
  skillsReinforced: string[];
  materials: string[];
  estimatedTime: number; // minutes
  ageAppropriate: Grade[];
}

// ========================================
// UTILITY TYPES
// ========================================

export interface DeviceInfo {
  platform: "ios" | "android";
  version: string;
  screenSize: string;
}

export type Currency = "stars" | "gems";

export interface Unlockable {
  id: string;
  type: "character" | "accessory" | "theme" | "mini-game";
  name: string;
  description: string;
  cost: number;
  currency: Currency;
  requiredLevel?: number;
  preview: string;
}

export interface Notification {
  id: string;
  studentId: string;
  type:
    | "achievement"
    | "streak"
    | "review-reminder"
    | "friend-challenge"
    | "level-up";
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface SessionStartResponse {
  session: LearningSession;
  firstQuestion: Question;
  dailyGoalProgress: DailyGoal;
}

export interface AnswerSubmitResponse {
  feedback: Feedback;
  nextQuestion?: Question;
  achievementsUnlocked: Achievement[];
  levelUp?: LevelUpResult;
  sessionComplete: boolean;
}

export interface LevelUpResult {
  newLevel: number;
  xpToNextLevel: number;
  rewards: {
    stars: number;
    gems?: number;
    unlockedItems: Unlockable[];
  };
  characterEvolution?: EvolutionStage;
}

// ========================================
// LEARNING DISPOSITION & PERSONALITY
// ========================================

export interface LearningDisposition {
  studentId: string;
  personalityEffectiveness: PersonalityEffectiveness[];
  recommendedPersonality: string;
  recommendationConfidence: number; // 0-1
  confidence: number; // 0-1 (alias for recommendationConfidence)
  primaryStyle?: TeachingStyle; // primary teaching style preference
  lastPersonalitySwitch?: Date;
  parentNotifiedOfRecommendation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalityEffectiveness {
  characterId: string;
  characterName: string;
  energyLevel: "high" | "medium" | "low";
  teachingStyle: TeachingStyle;

  // Metrics when using this personality
  averageMasteryVelocity: number; // skills mastered per hour
  averageEngagement: number; // 0-10
  frustrationIncidents: number;
  voluntarySessionStarts: number;
  averageSessionDuration: number; // minutes

  // Time periods
  totalSessionsWithPersonality: number;
  sessionsCompleted: number; // alias for totalSessionsWithPersonality
  lastUsed: Date;
}

// ========================================
// GUEST MODE / CAREGIVER ACCESS
// ========================================

export type CaregiverType =
  | "grandparent"
  | "babysitter"
  | "tutor"
  | "family-friend"
  | "other";
export type AccessLevel =
  | "view-only"
  | "basic-interaction"
  | "supervise-session";

export interface GuestAccess {
  id: string;
  studentId: string;
  caregiverType: CaregiverType;
  caregiverName?: string;

  accessCode: string;
  qrCode: string;
  shortUrl: string;
  token: string; // access token
  qrCodeData?: string; // QR code data string
  pin?: string;

  accessLevel: AccessLevel;
  permissions: GuestPermissions;

  createdBy: string; // parent userId
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  usageCount: number;

  revoked: boolean;
  revokedAt?: Date;
  revokedBy?: string;
}

export interface GuestPermissions {
  canViewProgress: boolean;
  canStartSession: boolean;
  canViewFullHistory: boolean;
  canEditSettings: boolean;
}

export interface CaregiverBrief {
  studentName: string;
  characterName: string; // the selected character's name
  currentGoals: string;
  todaysMission: string;
  encouragementTips: string[];
  whatToAvoid: string[];
  sessionGuidance: string;
  characterInfo: {
    name: string;
    personality: string;
    howToReference: string;
  };
}

// ========================================
// RIGHT TO FORGET / DATA DELETION
// ========================================

export type DeletionReason =
  | "child-sick"
  | "child-frustrated"
  | "technical-issue"
  | "bad-data"
  | "other";

export type DeletionType = "exclude-from-learning" | "full-delete";

export interface DeletedSession {
  sessionId: string;
  studentId: string;

  deletedBy: string; // userId of parent/caregiver
  deletedAt: Date;

  reason: DeletionReason;
  reasonDetails?: string;
  deletionType: DeletionType;

  // Metadata preserved for audit
  metadata: {
    originalDate: Date;
    duration: number;
    skillsWorkedOn: string[];
    questionCount: number;
  };

  // What was removed
  dataRemoved: {
    conversationLogs: boolean;
    questionAttempts: boolean;
    performanceMetrics: boolean;
    emotionalData: boolean;
  };
}

// ========================================
// PII SANITIZATION
// ========================================

export interface PIISanitizationLog {
  id: string;
  timestamp: Date;
  toolName: string;
  sessionId?: string;
  studentId?: string; // student whose data was sanitized

  fieldsRedacted: string[];
  piiDetected: PIIDetection[];

  sanitizedSuccessfully: boolean;
  errors?: string[];
}

export interface PIIDetection {
  type:
    | "name"
    | "email"
    | "phone"
    | "address"
    | "birthdate"
    | "location"
    | "school";
  field: string;
  originalValue: string; // the original PII value
  redactedValue: string; // placeholder used
  sanitizedValue: string; // the sanitized replacement text
  confidence: number; // 0-1
}

// ========================================
// MULTI-CAREGIVER & GUEST ACCESS
// ========================================

export type CaregiverRole = "read-only" | "supervised" | "co-parent";
export type CaregiverType = "secondary" | "guest" | "teacher";

export interface SecondaryCaregiver {
  id: string;
  parentId: string; // primary parent who invited them
  email: string;
  name: string;
  role: CaregiverRole;

  // Child-specific access
  childAccess: string[]; // array of studentIds they can access

  invitedAt: Date;
  invitedBy: string; // parentId
  acceptedAt?: Date;
  lastActiveAt?: Date;
  isActive: boolean;

  // Permissions
  canViewReports: boolean;
  canSuperviseSession: boolean;
  canChangeSettings: boolean;
  canApproveDecisions: boolean;
  canExcludeSessions: boolean;
  canGenerateGuestCodes: boolean;
}

export interface GuestAccess {
  id: string;
  parentId: string;
  studentId: string; // single child only

  qrCodeData: string; // encrypted JWT token
  qrCodeImage?: string; // Base64 PNG
  guestSessionURL: string; // shareable link

  guestName?: string; // "Brianna - babysitter"
  notes?: string; // "Maya's evening practice"

  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;

  sessionId?: string; // set when guest starts session
  isActive: boolean;

  // Auto-generated summary sent to parent
  sessionSummary?: GuestSessionSummary;
}

export interface GuestSessionSummary {
  guestCodeId: string;
  studentId: string;

  startTime: Date;
  endTime: Date;
  duration: number; // minutes

  skillsPracticed: string[];
  questionsAttempted: number;
  accuracy: number;
  xpEarned: number;

  agentObservations?: string[];
  emotionalState?: EmotionalState;

  generatedAt: Date;
  sentToParent: boolean;
}

export interface CaregiverBrief {
  studentFirstName: string; // "Maya" (no last name for privacy)
  currentSkill: string;
  currentLevel: number;

  recentProgress: {
    sessionsThisWeek: number;
    currentStreak: number;
    skillsMastered: number;
  };

  agentPersonality: string; // "Ada the Owl (Patient)"

  // What caregiver can do
  permissions: {
    canStartSession: boolean;
    canViewProgress: boolean;
    canChangeSettings: boolean;
  };

  // Instructions for caregiver
  sessionGuidance?: string; // "Maya works best in quiet environment, loves animal-themed problems"
}

// ========================================
// PERSONALITY EFFECTIVENESS & DISPOSITION
// ========================================

export interface PersonalityEffectiveness {
  personalityId: string;
  personalityName: string;

  sessionCount: number;
  totalMinutes: number;

  masteryVelocity: number; // skills mastered per hour
  engagementScore: number; // 0-10 average
  frustrationFrequency: number; // frustration moments per hour
  celebrationFrequency: number; // celebration moments per hour

  accuracy: number; // 0-1
  hintsUsedPerQuestion: number;

  lastUsed: Date;
  recommendation: "optimal" | "effective" | "neutral" | "less-effective";
}

export interface PersonalitySwapRecommendation {
  currentPersonality: string;
  currentEffectiveness: PersonalityEffectiveness;

  suggestedPersonality: string;
  suggestedEffectiveness: PersonalityEffectiveness | null; // null if never tried

  reason: string; // "Luna (Curious) shows 20% higher engagement"
  confidenceLevel: number; // 0-100

  estimatedImprovement: {
    masteryVelocity: number; // percentage increase
    engagement: number; // percentage increase
  };

  basedOnSessionCount: number;
  generatedAt: Date;
}

export interface LearningDispositionPattern {
  dominantStates: Array<{
    state: EmotionalState;
    frequency: number; // 0-1 percentage
    triggers?: string[];
  }>;

  frustrationTriggers: string[]; // "word problems", "time pressure"
  confidenceMoments: string[]; // "visual aids", "step-by-step"

  energyPattern: {
    morningEnergy: number; // 1-10
    afternoonEnergy: number;
    eveningEnergy: number;
    optimalTime?: TimeOfDay;
  };

  motivationFactors: {
    effectivePraise: string[]; // "Great thinking!"
    ineffectivePraise: string[]; // "Good job"
    preferredRewards: string[]; // "stars", "challenges"
  };

  analyzedSessions: number;
  lastAnalyzed: Date;
  excludedSessions: number; // sessions parent marked to exclude
}

export interface PersonalityABTest {
  studentId: string;

  personalityA: string;
  personalityB: string;

  startDate: Date;
  endDate: Date;
  plannedDuration: number; // days

  baselineMetrics: {
    masteryVelocity: number;
    engagement: number;
  };

  currentMetrics: {
    personalityA: PersonalityEffectiveness;
    personalityB: PersonalityEffectiveness;
  };

  winner?: string; // set at end of test
  recommendation?: string;

  isActive: boolean;
}

// ========================================
// MODEL-AGNOSTIC AI LAYER
// ========================================

export type LLMProvider = "openai" | "claude" | "openrouter" | "custom";
export type LLMPriority = "low" | "medium" | "high";

export interface LLMRequest {
  prompt: string;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];

  // Metadata
  toolName: string; // "WorksheetGenerator", "ConceptExplainer"
  priority: LLMPriority;
  metadata?: Record<string, any>;
}

export interface LLMResponse {
  text: string;
  finishReason: "stop" | "length" | "content_filter";

  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  metadata: {
    provider: LLMProvider;
    model: string;
    latencyMs: number;
    cost: number; // cents
  };
}

export interface LLMUsageLog {
  id: string;
  timestamp: Date;

  provider: LLMProvider;
  model: string;

  toolName: string;
  priority: LLMPriority;

  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };

  cost: number; // cents
  latencyMs: number;

  success: boolean;
  error?: string;
  fallbackUsed: boolean;

  studentId?: string;
  sessionId?: string;
}

export interface RoutingRule {
  toolPattern?: string; // regex: ".*Generator"
  priority?: LLMPriority;
  provider: LLMProvider;
  reason?: string;
}

export interface RoutingConfig {
  rules: RoutingRule[];
  fallbackChain: LLMProvider[];

  costLimits?: {
    dailyMax: number; // cents
    perRequestMax: number; // cents
  };

  rateLimits?: {
    [provider: string]: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };
}

export interface ProviderStatus {
  name: LLMProvider;
  isAvailable: boolean;
  latency: number; // ms
  rateLimitRemaining: number;
  dailyCostSoFar: number; // cents
  lastError?: string;
  lastErrorAt?: Date;
}

// ========================================
// SESSION EXCLUSION (RIGHT TO FORGET)
// ========================================

export interface SessionExclusionRequest {
  sessionId: string;
  parentId: string;

  excludeFromAnalysis: boolean;
  excludeMasteryData: boolean;

  reason?: string;
  reasonDetails?: string;
}

export interface SessionExclusionResult {
  success: boolean;
  sessionId: string;
  isExcluded: boolean;
  excludedAt: Date;

  impact: {
    memoriesAffected: number;
    behavioralPatternsRecalculated: boolean;
    personalityMetricsUpdated: boolean;
    masteryLevelsChanged: boolean;
  };

  updatedReports: {
    sessionCountChanged: boolean;
    dispositionAnalysisChanged: boolean;
    personalityRecommendationChanged: boolean;
  };
}

// ========================================
// UPDATED SESSION WITH NEW FIELDS
// ========================================

export interface ExtendedSession extends Session {
  // Emotional & Disposition Data
  emotionalState?: EmotionalState;
  learningDisposition?: {
    energyLevel: number; // 1-10
    frustrationTriggers?: string[];
    confidenceMoments?: string[];
    motivationFactors?: string[];
  };

  // Personality Tracking
  personalityId: string;

  // Exclusion (Right to Forget)
  isExcludedFromAnalysis: boolean;
  excludeMasteryData: boolean;
  excludedReason?: string;
  excludedAt?: Date;
  excludedBy?: string; // parentId

  // Caregiver Tracking
  supervisedBy?: {
    type: "parent" | "secondary-caregiver" | "guest";
    id: string;
    name: string;
  };
}

// ========================================
// AUDIT LOG
// ========================================

export type AuditAction =
  | "view-progress"
  | "view-reports"
  | "supervise-session"
  | "change-settings"
  | "approve-advancement"
  | "exclude-session"
  | "generate-guest-code"
  | "revoke-caregiver"
  | "add-caregiver";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;

  userId: string;
  userType: "parent" | "secondary-caregiver" | "guest";
  userName: string;

  action: AuditAction;
  targetStudentId: string;

  details: Record<string, any>;
  ipAddress?: string;

  success: boolean;
  error?: string;
}
