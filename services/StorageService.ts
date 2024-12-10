import AsyncStorage from "@react-native-async-storage/async-storage";
import { Worksheet, WorksheetHistory } from "../types/worksheet";

const HISTORY_STORAGE_KEY = "@worksheet_history";
const MAX_HISTORY_ITEMS = 10;

export class StorageService {
  static async getWorksheetHistory(): Promise<WorksheetHistory> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyJson) {
        return JSON.parse(historyJson) as WorksheetHistory;
      }
      return { worksheets: [] };
    } catch (error) {
      console.error("Error reading worksheet history:", error);
      return { worksheets: [] };
    }
  }

  static async addWorksheetToHistory(worksheet: Worksheet): Promise<void> {
    try {
      const history = await this.getWorksheetHistory();

      // Add new worksheet at the beginning
      history.worksheets.unshift(worksheet);

      // Limit history size
      if (history.worksheets.length > MAX_HISTORY_ITEMS) {
        history.worksheets = history.worksheets.slice(0, MAX_HISTORY_ITEMS);
      }

      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving worksheet to history:", error);
      throw new Error("Failed to save worksheet to history");
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing worksheet history:", error);
      throw new Error("Failed to clear worksheet history");
    }
  }

  static async deleteWorksheet(worksheetId: string): Promise<void> {
    try {
      const history = await this.getWorksheetHistory();
      history.worksheets = history.worksheets.filter(
        (worksheet) => worksheet.id !== worksheetId
      );
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error deleting worksheet:", error);
      throw new Error("Failed to delete worksheet");
    }
  }

  static async saveWorksheetPdf(
    worksheetId: string,
    pdfUrl: string
  ): Promise<void> {
    try {
      const history = await this.getWorksheetHistory();
      const worksheet = history.worksheets.find((w) => w.id === worksheetId);

      if (worksheet) {
        worksheet.pdfUrl = pdfUrl;
        await AsyncStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(history)
        );
      }
    } catch (error) {
      console.error("Error saving worksheet PDF:", error);
      throw new Error("Failed to save worksheet PDF");
    }
  }
}
