import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { PdfService, PdfGenerationOptions } from "../services/PdfService";

interface WorksheetPreviewProps {
  title: string;
  content: string;
  htmlContent: string;
  onClose?: () => void;
}

export const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({
  title,
  content,
  htmlContent,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      const options: PdfGenerationOptions = {
        title,
        content: htmlContent,
        headerColor: "#4CAF50",
        footerText: `Generated on ${new Date().toLocaleDateString()}`,
      };

      const pdfUri = await PdfService.generatePdf(options);
      await PdfService.sharePdf(pdfUri);
    } catch (err) {
      setError("Failed to generate or share PDF. Please try again.");
      console.error("PDF generation/sharing error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={title} />
        <Card.Content>
          <ScrollView style={styles.contentScroll}>
            <Text>{content}</Text>
          </ScrollView>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleDownload}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Download PDF
            </Button>
            {onClose && (
              <Button
                mode="outlined"
                onPress={onClose}
                style={styles.button}
                disabled={loading}
              >
                Close Preview
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  contentScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  button: {
    marginHorizontal: 8,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 8,
  },
});
