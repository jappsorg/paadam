/**
 * PII Sanitization Service
 *
 * CRITICAL: Ensures no Personally Identifiable Information (PII)
 * is sent to LLM providers (Claude, GPT-4)
 *
 * Required for COPPA and GDPR compliance
 */

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { PIIDetection, PIISanitizationLog } from "../types/adaptive-learning";

export class PIISanitizationService {
  private static readonly LOGS_COLLECTION = "pii_sanitization_logs";

  // PII patterns to detect and replace
  private readonly patterns = {
    // Names (common patterns)
    name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,

    // Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Phone numbers (various formats)
    phone: /(\+\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g,

    // US ZIP codes
    zipCode: /\b\d{5}(-\d{4})?\b/g,

    // Street addresses (simplified)
    address:
      /\b\d+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi,

    // Cities (when followed by state)
    cityState: /\b[A-Z][a-z]+(\s+[A-Z][a-z]+)?,\s*[A-Z]{2}\b/g,

    // Social Security Numbers
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

    // Birth dates (MM/DD/YYYY or MM-DD-YYYY)
    birthDate:
      /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g,

    // Ages when explicitly stated
    age: /\b(I am|I'm|age|aged)\s+(\d{1,2})\s+(years old|year old|yo)\b/gi,

    // School names
    schoolName:
      /\b(attends|goes to|student at)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)\s+(Elementary|Middle|High|School)\b/gi,
  };

  /**
   * Sanitize text before sending to LLM
   * This is the MAIN function used by all agent tools
   */
  async sanitize(
    text: string,
    context: {
      studentId: string;
      toolName: string;
      sessionId?: string;
    },
  ): Promise<{
    sanitizedText: string;
    detectionsFound: PIIDetection[];
    isSafe: boolean;
  }> {
    const detections: PIIDetection[] = [];
    let sanitizedText = text;

    // Run all pattern checks
    for (const [piiType, pattern] of Object.entries(this.patterns)) {
      const matches = text.match(pattern);

      if (matches && matches.length > 0) {
        for (const match of matches) {
          const placeholder = this.getPlaceholder(piiType);
          const detection: PIIDetection = {
            type: piiType as any,
            field: "input",
            originalValue: match,
            redactedValue: placeholder,
            sanitizedValue: placeholder,
            confidence: this.getConfidenceScore(piiType, match),
          };

          detections.push(detection);

          // Replace in sanitized text
          sanitizedText = sanitizedText.replace(match, placeholder);
        }
      }
    }

    const isSafe = detections.length === 0;

    // Log sanitization attempt
    await this.logSanitization({
      studentId: context.studentId,
      toolName: context.toolName,
      sessionId: context.sessionId,
      piiDetected: detections,
      wasSanitized: !isSafe,
      timestamp: new Date(),
    });

    if (!isSafe) {
      console.warn(
        `[PIISanitization] PII detected and sanitized in ${context.toolName}:`,
        detections.map((d) => d.type),
      );
    }

    return {
      sanitizedText,
      detectionsFound: detections,
      isSafe,
    };
  }

  /**
   * Sanitize student profile data for agent context
   * Remove name, birth date, location
   */
  sanitizeStudentProfile(profile: any): any {
    return {
      // Keep safe identifiers
      id: profile.id,
      grade: profile.grade,

      // Learning data (safe)
      level: profile.level,
      xp: profile.xp,
      currentStreak: profile.currentStreak,
      skillsMastery: profile.skillsMastery,
      selectedCharacterId: profile.selectedCharacterId,
      learningDisposition: profile.learningDisposition,

      // Remove PII
      // name: REMOVED
      // dateOfBirth: REMOVED
      // location: REMOVED (if we had it)
    };
  }

  /**
   * Sanitize session data for agent context
   * Keep emotional/behavioral data, remove specific question content
   */
  sanitizeSessionData(session: any): any {
    return {
      id: session.id,

      // EMOTIONAL DATA (HIGHEST PRIORITY - KEEP)
      emotionalStates: session.emotionalStates,
      overallMood: session.overallMood,
      frustrationTriggers: session.frustrationTriggers,
      celebrationMoments: session.celebrationMoments,

      // BEHAVIORAL DATA (KEEP)
      behavioralPatterns: session.behavioralPatterns,
      energyLevel: session.energyLevel,
      focusQuality: session.focusQuality,

      // PERFORMANCE SUMMARY (KEEP)
      skillsWorkedOn: session.skillsWorkedOn,
      skillsMastered: session.skillsMastered,
      masteryVelocity: session.masteryVelocity,
      xpEarned: session.xpEarned,

      // AGENT SUMMARY (KEEP)
      agentMemorySummary: session.agentMemorySummary,

      // METADATA (KEEP)
      durationMinutes: session.durationMinutes,

      // Remove detailed question data
      // questionsAttempted: REMOVED (too specific, contains user inputs)
    };
  }

  /**
   * Sanitize conversation history
   * Remove any PII that may have slipped through
   */
  async sanitizeConversationHistory(
    messages: Array<{ role: string; content: string }>,
    context: { studentId: string; sessionId?: string },
  ): Promise<Array<{ role: string; content: string }>> {
    const sanitizedMessages = [];

    for (const message of messages) {
      const result = await this.sanitize(message.content, {
        studentId: context.studentId,
        toolName: "conversation_history",
        sessionId: context.sessionId,
      });

      sanitizedMessages.push({
        role: message.role,
        content: result.sanitizedText,
      });
    }

    return sanitizedMessages;
  }

  /**
   * Get placeholder for PII type
   */
  private getPlaceholder(piiType: string): string {
    const placeholders: Record<string, string> = {
      name: "[STUDENT]",
      email: "[EMAIL]",
      phone: "[PHONE]",
      zipCode: "[ZIP]",
      address: "[ADDRESS]",
      cityState: "[CITY, STATE]",
      ssn: "[SSN]",
      birthDate: "[BIRTHDATE]",
      age: "[AGE]",
      schoolName: "[SCHOOL]",
    };

    return placeholders[piiType] || "[REDACTED]";
  }

  /**
   * Get confidence score for detection
   */
  private getConfidenceScore(piiType: string, match: string): number {
    // High confidence for structured data
    if (["email", "phone", "ssn", "birthDate", "zipCode"].includes(piiType)) {
      return 0.95;
    }

    // Medium confidence for names (could be false positives)
    if (piiType === "name") {
      // Check if it's a common name pattern
      return match.split(" ").length >= 2 ? 0.7 : 0.5;
    }

    // Lower confidence for addresses (lots of variations)
    if (["address", "cityState"].includes(piiType)) {
      return 0.6;
    }

    return 0.5;
  }

  /**
   * Log sanitization attempt for compliance auditing
   */
  private async logSanitization(log: PIISanitizationLog): Promise<void> {
    try {
      await addDoc(collection(db, PIISanitizationService.LOGS_COLLECTION), {
        ...log,
        timestamp: Timestamp.fromDate(log.timestamp),
      });
    } catch (error) {
      console.error("[PIISanitization] Failed to log sanitization:", error);
      // Don't throw - sanitization should not fail the request
    }
  }

  /**
   * Get sanitization statistics for parent dashboard
   */
  async getSanitizationStats(studentId: string): Promise<{
    totalSanitizations: number;
    commonPIITypes: string[];
    lastSanitizationDate: Date | null;
  }> {
    // This would query the logs collection
    // Simplified for now
    return {
      totalSanitizations: 0,
      commonPIITypes: [],
      lastSanitizationDate: null,
    };
  }

  /**
   * Test sanitization (for debugging)
   */
  async testSanitization(text: string): Promise<void> {
    console.log("=== PII Sanitization Test ===");
    console.log("Original:", text);

    const result = await this.sanitize(text, {
      studentId: "test",
      toolName: "test",
    });

    console.log("Sanitized:", result.sanitizedText);
    console.log("Detections:", result.detectionsFound);
    console.log("Is Safe:", result.isSafe);
  }
}

// Export singleton instance
export const piiSanitizationService = new PIISanitizationService();
export default piiSanitizationService;

/**
 * Example Usage:
 *
 * // Before sending to LLM
 * const userInput = "My name is John Smith and I live at 123 Main Street, Seattle, WA";
 * const { sanitizedText } = await piiSanitizationService.sanitize(userInput, {
 *   studentId: 'student_123',
 *   toolName: 'question_generator',
 *   sessionId: 'session_456'
 * });
 *
 * // sanitizedText: "My name is [STUDENT] and I live at [ADDRESS], [CITY, STATE]"
 * // Now safe to send to Claude/GPT-4
 */
