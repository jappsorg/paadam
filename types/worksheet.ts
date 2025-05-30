export type WorksheetType = "math" | "puzzle" | "word-problem" | "logic";

export type WorksheetDifficulty = "easy" | "medium" | "hard";

export type WorksheetGrade = "K" | "1" | "2" | "3" | "4" | "5";

export type MathSubject =
  | "Addition"
  | "Subtraction"
  | "Multiplication"
  | "Division"
  | "Fractions"
  | "Decimals"
  | "Geometry"
  | "Algebra"
  | "Patterns"
  | "Measurement"
  | "Time"
  | "Money"
  | "Random";

export interface WorksheetOption<T> {
  id: T;
  label: string;
}

export interface WorksheetConfig {
  type: WorksheetType;
  subject: MathSubject;
  difficulty: WorksheetDifficulty;
  grade: WorksheetGrade;
  questionsCount: number;
  includeAnswers: boolean;
}

export interface WorksheetQuestion {
  id: string;
  question: string;
  answer?: string;
  explanation?: string;
}

export interface Worksheet {
  id: string;
  type: WorksheetType;
  createdAt: string;
  config: WorksheetConfig;
  title: string;
  concept?: string;
  questions: WorksheetQuestion[];
  pdfUrl?: string;
  userId: string | null; // UID of the user who generated/saved this, null for generic templates not tied to a user instance
  isTemplate?: boolean; // If true, this is a generic template. If false/undefined, it's a generated instance.
}

export interface StudentWorksheetAttempt {
  id: string; // Unique ID for this attempt
  userId: string; // Firebase User UID
  worksheetId: string; // ID of the base Worksheet document this attempt is for
  worksheetTitle: string;
  worksheetType: WorksheetType;
  originalConfig: WorksheetConfig; // Configuration used for this attempt
  questions: WorksheetQuestion[]; // The actual questions for this attempt (copied from the Worksheet)
  studentAnswers: Array<{
    questionId: string; // Corresponds to WorksheetQuestion.id
    answer: string | string[]; // Student's answer
    isCorrect?: boolean; // Optional: to store if the answer was marked correct
  }>;
  score: number | null; // e.g., number of correct answers, or percentage
  maxScore: number | null; // Maximum possible score for this attempt
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: string; // ISO date string, optional
  completedAt?: string | null; // ISO date string, optional
  lastAttemptedAt: string; // ISO date string
}

export interface WorksheetHistory {
  worksheets: Worksheet[];
}

export const WORKSHEET_TYPE_LABELS: Record<WorksheetType, string> = {
  math: "Math Worksheets",
  puzzle: "Math Puzzles",
  "word-problem": "Word Problems",
  logic: "Logic Puzzles",
};

export const DEFAULT_QUESTIONS_COUNT = 10;

export const WORKSHEET_TYPE_DESCRIPTIONS: Record<WorksheetType, string> = {
  math: "Basic arithmetic operations and number skills",
  puzzle: "Fun mathematical puzzles and brain teasers",
  "word-problem": "Real-world math application problems",
  logic: "Critical thinking and reasoning puzzles",
};

export const WORKSHEET_GRADE_OPTIONS: WorksheetOption<WorksheetGrade>[] = [
  { id: "K", label: "Kindergarten" },
  { id: "1", label: "1st Grade" },
  { id: "2", label: "2nd Grade" },
  { id: "3", label: "3rd Grade" },
  { id: "4", label: "4th Grade" },
  { id: "5", label: "5th Grade" },
];

export const WORKSHEET_DIFFICULTIES: WorksheetOption<WorksheetDifficulty>[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

export const MATH_SUBJECT_OPTIONS: WorksheetOption<MathSubject>[] = [
  { id: "Addition", label: "Addition" },
  { id: "Subtraction", label: "Subtraction" },
  { id: "Multiplication", label: "Multiplication" },
  { id: "Division", label: "Division" },
  { id: "Fractions", label: "Fractions" },
  { id: "Decimals", label: "Decimals" },
  { id: "Geometry", label: "Geometry" },
  { id: "Algebra", label: "Algebra" },
  { id: "Patterns", label: "Patterns" },
  { id: "Measurement", label: "Measurement" },
  { id: "Time", label: "Time" },
  { id: "Money", label: "Money" },
  { id: "Random", label: "Random" },
];
