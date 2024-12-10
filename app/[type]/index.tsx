import React, { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Text,
  SegmentedButtons,
  Switch,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import WorksheetService from "../../services/WorksheetService";
import { WorksheetPreview } from "../../components/WorksheetPreview";
import {
  type WorksheetConfig,
  type Worksheet,
  type WorksheetDifficulty,
  type WorksheetType,
  WORKSHEET_GRADE_OPTIONS,
  MATH_SUBJECT_OPTIONS,
  WORKSHEET_DIFFICULTIES,
  DEFAULT_QUESTIONS_COUNT,
  WORKSHEET_TYPE_LABELS,
} from "../../types/worksheet";
import { StorageService } from "@/services/StorageService";

export default function WorksheetGeneratorScreen() {
  const { type } = useLocalSearchParams<{ type: WorksheetType }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);

  const theme = useTheme();

  const [config, setConfig] = useState<WorksheetConfig>({
    type: type || "math",
    subject: "Addition",
    grade: "K",
    difficulty: "easy",
    questionsCount: DEFAULT_QUESTIONS_COUNT,
    includeAnswers: false,
  });

  const handleGenerate = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const generatedWorksheet = await WorksheetService.generateWorksheet(
        config
      );
      setWorksheet(generatedWorksheet);
      StorageService.addWorksheetToHistory(generatedWorksheet);
    } catch (err) {
      setError("Failed to generate worksheet. Please try again.");
      console.error("Worksheet generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const formatWorksheetContent = (
    worksheet: Worksheet,
    includeAnswers?: boolean
  ): string => {
    if (!worksheet.questions) return "";
    return worksheet.questions
      .map((q, index) => {
        let content = [`${index + 1}. ${q.question}`];
        if (includeAnswers) {
          content.push(`Answer: ${q.answer}`);
          if (q.explanation) {
            content.push(`Explanation: ${q.explanation}`);
          }
        }
        return content.join("\n");
      })
      .join("\n\n");
  };

  const updateConfig = React.useCallback(
    (newConfig: Partial<WorksheetConfig>) => {
      setConfig((config) => ({ ...config, ...newConfig }));
    },
    []
  );

  const formatWorksheetContentAsHTML = (
    worksheet: Worksheet,
    includeAnswers?: boolean
  ): string => {
    if (!worksheet.questions) return "";
    return worksheet.questions
      .map((q, index) => {
        let content = [
          `<p>${index + 1}. ${q.question}</p>`,
          includeAnswers ? `<p>Answer: ${q.answer}</p>` : "",
          includeAnswers && q.explanation
            ? `<p>Explanation: ${q.explanation}</p>`
            : "",
        ];
        return content.join("\n");
      })
      .join("\n");
  };

  React.useEffect(() => {
    if (type) {
      updateConfig({ type });
      setWorksheet(null);
    }
  }, [type, updateConfig]);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={WORKSHEET_TYPE_LABELS[type]}
          titleVariant="headlineMedium"
        />
        <Card.Content>
          <View style={styles.configItem}>
            <Text variant="titleMedium">Grade Level</Text>
            <View style={styles.buttonGroup} key={config.grade}>
              {WORKSHEET_GRADE_OPTIONS.map((grade) => (
                <Button
                  key={grade.id}
                  mode={config.grade === grade.id ? "outlined" : "text"}
                  onPress={() => updateConfig({ grade: grade.id })}
                  style={[
                    styles.buttonInGroup,
                    config.grade === grade.id
                      ? styles.buttonInGroupSelected
                      : {},
                  ]}
                >
                  <Text>{grade.label}</Text>
                </Button>
              ))}
            </View>
          </View>

          {(type === "math" ||
            type === "word-problem" ||
            type === "puzzle") && (
            <View style={styles.configItem}>
              <Text variant="titleMedium">Subject</Text>
              <View style={styles.buttonGroup} key={config.subject}>
                {MATH_SUBJECT_OPTIONS.map((subject) => (
                  <Button
                    key={subject.id}
                    mode={config.subject === subject.id ? "outlined" : "text"}
                    onPress={() => updateConfig({ subject: subject.id })}
                    style={[
                      styles.buttonInGroup,
                      config.subject === subject.id
                        ? styles.buttonInGroupSelected
                        : {},
                    ]}
                  >
                    <Text>{subject.label}</Text>
                  </Button>
                ))}
              </View>
            </View>
          )}

          <View style={styles.configItem}>
            <Text variant="titleMedium">Difficulty</Text>
            <SegmentedButtons
              value={config.difficulty}
              onValueChange={(difficulty) =>
                updateConfig({ difficulty: difficulty as WorksheetDifficulty })
              }
              buttons={WORKSHEET_DIFFICULTIES.map((level) => ({
                value: level.id,
                label: level.label,
              }))}
            />
          </View>

          <View style={styles.configItem}>
            <Text variant="titleMedium">Number of Questions</Text>
            <SegmentedButtons
              value={config.questionsCount.toString()}
              onValueChange={(value) =>
                updateConfig({ questionsCount: parseInt(value) })
              }
              buttons={["5", "10", "15"].map((count) => ({
                value: count,
                label: count.toString(),
              }))}
            />
          </View>

          <View style={styles.configItem}>
            <Text variant="titleMedium">Include Answers</Text>
            <Switch
              value={config.includeAnswers}
              onValueChange={(includeAnswers) =>
                updateConfig({ includeAnswers })
              }
              style={styles.input}
              color={theme.colors.tertiary}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleGenerate}
            loading={loading}
            disabled={loading}
            style={styles.generateButton}
          >
            Generate Worksheet
          </Button>
        </Card.Content>
      </Card>

      {worksheet && (
        <WorksheetPreview
          title={worksheet.title}
          content={formatWorksheetContent(worksheet, config.includeAnswers)}
          htmlContent={formatWorksheetContentAsHTML(
            worksheet,
            config.includeAnswers
          )}
          onClose={() => setWorksheet(null)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  configItem: {
    marginVertical: 12,
  },
  input: {
    marginTop: 8,
  },
  generateButton: {
    marginTop: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  buttonInGroup: {
    marginVertical: 4,
    marginHorizontal: 4,
  },
  buttonInGroupSelected: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 8,
  },
});
