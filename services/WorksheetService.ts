import { Anthropic } from "@anthropic-ai/sdk";
import {
  WorksheetConfig,
  WorksheetQuestion,
  Worksheet,
} from "../types/worksheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Joi from "joi";

const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

enum LLMOoutputType {
  JSON = "json",
  HTML = "html",
}

interface WorksheetQuestionFormat {
  question: string;
  answer?: string;
  explanation?: string;
}

interface WorksheetResponseFormat {
  concept: string;
  questions: WorksheetQuestionFormat[];
}

const WorksheetResponseFormatSchema = Joi.object<WorksheetResponseFormat>({
  concept: Joi.string().required().description("Concept for the worksheet"),
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required().description("Question"),
        answer: Joi.string().optional().description("Answer"),
        explanation: Joi.string().optional().description("Explanation"),
      })
    )
    .required(),
});

export class WorksheetService {
  private static instance: WorksheetService;

  private constructor() {}

  static getInstance(): WorksheetService {
    if (!WorksheetService.instance) {
      WorksheetService.instance = new WorksheetService();
    }
    return WorksheetService.instance;
  }

  private getPromptForWorksheetType(config: WorksheetConfig): string {
    const prompts = [];
    prompts.push(`You are a expert at generating worksheet for kids K-5`);
    prompts.push(
      `Generate ${config.questionsCount || 10} ${config.difficulty} level ${
        config.type
      } questions for grade ${config.grade}`
    );
    if (config.subject) {
      prompts.push(`Focus on subject: ${config.subject}`);
    }
    prompts.push(this.getPromptByType(config.type));
    prompts.push(`Output must be a JSON code without any additional text. Make sure to escape strings. Sample output:
    ------------------------------------------------
    {
      concept: "Addition",
      questions: [
      {
        "question": "What is 2 + 2?",
        "answer": "4",
        "explanation": "2 + 2 = 4"
        },
      ]
    }
    ------------------------------------------------`);
    return prompts.join(".\n");
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

  private parseResponse(response: string): WorksheetQuestion[] {
    const jsonResponseArray = JSON.parse(response);
    const { error, value: worksheetResponseObj } =
      WorksheetResponseFormatSchema.validate(jsonResponseArray);
    if (error) {
      throw new Error("Invalid response format");
    }

    const questions: WorksheetQuestion[] = [];
    for (const item of worksheetResponseObj.questions) {
      questions.push({
        id: Math.random().toString(36).substr(2, 9),
        question: item.question,
        answer: item.answer,
        explanation: item.explanation,
      });
    }

    return questions;
  }

  async generateWorksheet(config: WorksheetConfig): Promise<Worksheet> {
    try {
      const prompt = this.getPromptForWorksheetType(config);

      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const workSheetContent =
        completion.content[0].type === "text" ? completion.content[0].text : "";

      const questions = this.parseResponse(workSheetContent);

      const worksheet: Worksheet = {
        id: Math.random().toString(36).substr(2, 9),
        type: config.type,
        createdAt: new Date().toISOString(),
        config,
        title: `${
          config.type.charAt(0).toUpperCase() + config.type.slice(1)
        } Worksheet - Grade ${config.grade}`,
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
