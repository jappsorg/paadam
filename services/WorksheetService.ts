import { generateObject, CoreMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  WorksheetConfig,
  WorksheetQuestion,
  Worksheet,
} from "../types/worksheet";
import { LLM_MODELS } from "@/constants";

const openrouter = createOpenRouter({
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
});

const WorksheetQuestionFormatSchema = z.object({
  question: z.string().describe("Question"),
  answer: z.string().describe("Answer"),
  explanation: z.string().optional().describe("Explanation"),
});

type TWorksheetQuestionFormat = z.infer<typeof WorksheetQuestionFormatSchema>;

const WorksheetResponseFormatSchema = z.object({
  concept: z.string().describe("Concept for the worksheet"),
  questions: z
    .array(WorksheetQuestionFormatSchema)
    .describe("List of questions and answers"),
});

type TWorksheetResponseFormat = z.infer<typeof WorksheetResponseFormatSchema>;

export class WorksheetService {
  private static instance: WorksheetService;

  private constructor() {}

  static getInstance(): WorksheetService {
    if (!WorksheetService.instance) {
      WorksheetService.instance = new WorksheetService();
    }
    return WorksheetService.instance;
  }

  private getPromptsForWorksheetType(config: WorksheetConfig): CoreMessage[] {
    const prompts: CoreMessage[] = [];
    prompts.push({
      role: "system",
      content: `You are an expert at generating worksheets for kids K-5. CRITICAL RULES:
1. This is a TEXT-ONLY app — NO images, pictures, or visual aids. All questions must be self-contained in text.
2. Every question MUST require a CALCULATION or REASONING to solve. Never generate questions where the answer is simply stated in the question. BAD: "There are 5 monkeys. How many monkeys are there?" (answer is obvious). GOOD: "There are 3 monkeys in a tree and 2 more climb up. How many monkeys are in the tree now?" (requires addition).
3. For young grades (K-1), use simple addition/subtraction scenarios with small numbers. Always give TWO or more quantities that need to be combined, compared, or operated on.
4. INTERACTIVE CLOCK: For Time-related questions, the app has an interactive clock component where kids drag hands to set the time. When generating time questions, format the answer as "H:MM" (e.g., "3:30", "10:15"). Ask questions like "Soccer practice starts in 2 hours. It is 1:00 now. What time will practice start? Set the clock!" or "It is 4:30. What time will it be in 45 minutes?" The child will drag clock hands to answer.`,
    });
    const subjectClause = config.subject && config.subject !== "Random"
      ? ` about ${config.subject}`
      : "";
    prompts.push({
      role: "user",
      content: `Generate ${config.questionsCount || 10} ${
        config.difficulty
      } level ${config.type} questions${subjectClause} for grade ${config.grade}. ${
        config.subject && config.subject !== "Random"
          ? `ALL questions MUST be about ${config.subject}. Do not generate questions about other topics.`
          : ""
      }`,
    });
    prompts.push({
      role: "user",
      content: this.getPromptByType(config.type),
    });

    return prompts;
  }

  private getPromptByType(type: WorksheetConfig["type"]): string {
    switch (type) {
      case "math":
        return "Include basic arithmetic operations appropriate for the grade level";
      case "puzzle":
        return "Create engaging mathematical puzzles that involve pattern recognition and problem-solving";
      case "word-problem":
        return "Generate real-world math word problems";
      case "logic":
        return "Create age-appropriate logic puzzles that develop critical thinking";
      default:
        return "";
    }
  }

  private formatQuestions(
    questionResponseItems: TWorksheetQuestionFormat[]
  ): WorksheetQuestion[] {
    const questions: WorksheetQuestion[] = [];
    for (const item of questionResponseItems) {
      questions.push({
        id: Math.random().toString(36).substring(2, 9),
        question: item.question,
        answer: item.answer,
        explanation: item.explanation,
      });
    }

    return questions;
  }

  async generateWorksheet(config: WorksheetConfig): Promise<Worksheet> {
    try {
      const prompts = this.getPromptsForWorksheetType(config);

      const { object } = await generateObject<TWorksheetResponseFormat>({
        model: openrouter(LLM_MODELS.CLAUDE_HAIKU),
        schema: WorksheetResponseFormatSchema,
        messages: prompts,
      });

      // Will throw error when response is invalid
      // Use safeParse if you want to handle errors and retry
      const worksheetResponseObject =
        WorksheetResponseFormatSchema.parse(object);

      const concept = worksheetResponseObject.concept;
      const questions = this.formatQuestions(worksheetResponseObject.questions);

      const worksheet: Worksheet = {
        id: Math.random().toString(36).substr(2, 9),
        type: config.type,
        createdAt: new Date().toISOString(),
        config,
        title: concept
          ? `${concept} - ${config.subject || config.type}`
          : `${config.subject || config.type} - Grade ${config.grade}`,
        concept,
        questions,
      };

      // Save to history
      await this.saveToHistory(worksheet);

      return worksheet;
    } catch (error) {
      console.error("Error generating worksheet:", error);
      throw new Error("Failed to generate worksheet");
    }
  }

  private async saveToHistory(worksheet: Worksheet): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem("worksheetHistory");
      const history = historyJson
        ? JSON.parse(historyJson)
        : { worksheets: [] };

      history.worksheets = [worksheet, ...history.worksheets].slice(0, 50); // Keep last 50 worksheets

      await AsyncStorage.setItem("worksheetHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving worksheet to history:", error);
    }
  }
}

export default WorksheetService.getInstance();
