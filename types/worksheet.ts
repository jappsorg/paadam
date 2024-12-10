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
  questions: WorksheetQuestion[];
  pdfUrl?: string;
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
