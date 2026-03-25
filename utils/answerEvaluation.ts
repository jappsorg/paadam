/**
 * Answer Evaluation Utility
 *
 * Compares student answers to correct answers using numeric-aware matching.
 * Handles cases like "5" matching "5 penguins", fraction equivalence, etc.
 */

/**
 * Extract the leading number from a string.
 * Handles integers, decimals, negative numbers, and fractions.
 * Examples: "5 penguins" → 5, "3/4" → 0.75, "-2.5 meters" → -2.5
 */
function extractNumber(str: string): number | null {
  const trimmed = str.trim();

  // Try fraction pattern first: "3/4", "1/2", "7/16"
  const fractionMatch = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)/);
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1]);
    const denominator = parseFloat(fractionMatch[2]);
    if (denominator !== 0) {
      return numerator / denominator;
    }
  }

  // Try mixed number: "2 1/3", "1 3/4"
  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const numerator = parseFloat(mixedMatch[2]);
    const denominator = parseFloat(mixedMatch[3]);
    if (denominator !== 0) {
      const sign = whole < 0 ? -1 : 1;
      return whole + sign * (numerator / denominator);
    }
  }

  // Try leading decimal/integer: "5", "3.14", "-2.5", "5 penguins"
  const numberMatch = trimmed.match(/^(-?\d+\.?\d*)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  return null;
}

/**
 * Normalize a string for text comparison.
 */
function normalizeText(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Evaluate whether a student's answer matches the correct answer.
 * Uses numeric comparison when possible, falls back to text comparison.
 */
export function evaluateAnswer(
  studentAnswer: string,
  correctAnswer: string
): boolean {
  if (!studentAnswer || !correctAnswer) return false;

  const normalizedStudent = normalizeText(studentAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);

  // Exact text match (after normalization)
  if (normalizedStudent === normalizedCorrect) return true;

  // Numeric comparison
  const studentNum = extractNumber(normalizedStudent);
  const correctNum = extractNumber(normalizedCorrect);

  if (studentNum !== null && correctNum !== null) {
    // Use epsilon for floating point comparison
    return Math.abs(studentNum - correctNum) < 0.0001;
  }

  return false;
}
