import { generateObject, CoreMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  WorksheetConfig,
  WorksheetQuestion,
  Worksheet,
} from "../types/worksheet";
import { ANTHROPIC_MODELS } from "@/constants";

const anthropicProvider = createAnthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
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
      content: `You are a expert at generating worksheet for kids K-5`,
    });
    prompts.push({
      role: "user",
      content: `Generate ${config.questionsCount || 10} ${
        config.difficulty
      } level ${config.type} questions for grade ${config.grade}`,
    });
    if (config.subject) {
      prompts.push({
        role: "user",
        content: `Focus on subject: ${config.subject}`,
      });
    }
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
        model: anthropicProvider(ANTHROPIC_MODELS.CLAUDE_HAIKU),
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
        title: `${
          config.type.charAt(0).toUpperCase() + config.type.slice(1)
        } Worksheet - Grade ${config.grade}`,
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
