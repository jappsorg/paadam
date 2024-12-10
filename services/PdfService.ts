import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export interface PdfGenerationOptions {
  title: string;
  content: string;
  headerColor?: string;
  footerText?: string;
}

export class PdfService {
  private static getHtmlContent(options: PdfGenerationOptions): string {
    const {
      title,
      content,
      headerColor = "#4CAF50",
      footerText = "© paadam",
    } = options;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header {
              background-color: ${headerColor};
              color: white;
              padding: 10px;
              text-align: center;
              margin-bottom: 20px;
            }
            .content {
              line-height: 1.6;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            ${footerText}
          </div>
        </body>
      </html>
    `;
  }

  public static async generatePdf(
    options: PdfGenerationOptions
  ): Promise<string> {
    try {
      const html = this.getHtmlContent(options);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      return uri;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  public static async sharePdf(pdfUri: string): Promise<void> {
    try {
      if (Platform.OS === "ios") {
        await Sharing.shareAsync(pdfUri);
      } else {
        await Sharing.shareAsync(pdfUri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      throw new Error("Failed to share PDF");
    }
  }
}
