import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity } from "react-native";
import {
  Button,
  Card,
  Text,
  SegmentedButtons,
  Switch,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { StorageService } from "../../services/StorageService";
import { useAuth } from "../../context/AuthContext";
import { CharacterService } from "../../services/CharacterService";

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: "\u{1F989}",
  max: "\u{1F436}",
  luna: "\u{1F431}",
};

export default function WorksheetGeneratorScreen() {
  const { type } = useLocalSearchParams<{ type: WorksheetType }>();
  const { currentUser, selectedStudent } = useAuth();
  const router = useRouter();

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

      if (currentUser && generatedWorksheet) {
        try {
          // Step 1: Create the WorksheetTemplate from the generated worksheet
          const templateId = await StorageService.createWorksheetTemplate({
            title: generatedWorksheet.title,
            config: config, // The configuration used to generate this
            questions: generatedWorksheet.questions,
            createdBy: currentUser.uid, // Associate template with the user who generated it
            // version: 1 // Optional: manage versions if templates can be edited
          });

          // Step 2: Start a new attempt and navigate to it
          const attemptId = await StorageService.startWorksheetAttempt(
            currentUser.uid,
            templateId,
            generatedWorksheet.title,
            generatedWorksheet.questions
          );
          console.log(
            `Worksheet template created (ID: ${templateId}) and attempt started for user.`
          );
          router.push(`/attempt/${attemptId}`);
        } catch (saveError) {
          console.error(
            "Failed to create template or start worksheet attempt:",
            saveError
          );
          // setError("Worksheet generated, but failed to save to your account for an attempt.");
        }
      } else if (generatedWorksheet) {
        // For non-logged-in users, interactive attempt saving is not directly supported here.
        // Or, prompt them to log in to save.
        console.log("User not logged in. Worksheet not saved to an account.");
      }
    } catch (err) {
      setError("Failed to generate worksheet. Please try again.");
      console.error("Worksheet generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [config, currentUser]);

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

  // Auto-set grade from student profile
  useEffect(() => {
    if (selectedStudent?.grade) {
      updateConfig({ grade: selectedStudent.grade as any });
    }
  }, [selectedStudent]);

  React.useEffect(() => {
    if (type) {
      updateConfig({ type });
      setWorksheet(null);
    }
  }, [type, updateConfig]);

  // Adaptive difficulty suggestion based on skill mastery
  const difficultySuggestion = useMemo(() => {
    if (!selectedStudent?.skillsMastery) return null;

    const skillId = config.subject.toLowerCase();
    const mastery = selectedStudent.skillsMastery[skillId];
    if (!mastery || mastery.questionsAttempted < 5) return null;

    const level = mastery.masteryLevel;
    let suggested: WorksheetDifficulty | null = null;
    let message = "";

    const charId = selectedStudent.selectedCharacterId || "ada";
    const character = CharacterService.getCharacterById(charId);
    const charName = character?.name || "Ada";
    const charEmoji = CHARACTER_EMOJIS[charId] || CHARACTER_EMOJIS.ada;

    if (level >= 85 && config.difficulty !== "hard") {
      suggested = "hard";
      message = `${charEmoji} Wow! You're really good at ${config.subject}! ${charName} thinks you're ready for Hard!`;
    } else if (level >= 60 && config.difficulty === "easy") {
      suggested = "medium";
      message = `${charEmoji} You're doing great at ${config.subject}! ${charName} thinks you should try Medium!`;
    } else if (level < 40 && config.difficulty !== "easy") {
      suggested = "easy";
      message = `${charEmoji} ${charName} says let's practice on Easy first. You'll get stronger!`;
    }

    if (!suggested) return null;
    return { suggested, message };
  }, [config.subject, config.difficulty, selectedStudent]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title
            title={WORKSHEET_TYPE_LABELS[type]}
            titleVariant="headlineMedium"
          />
          <Card.Content>
            <View style={styles.configItem}>
              <Text variant="titleMedium">My Grade</Text>
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
                  updateConfig({
                    difficulty: difficulty as WorksheetDifficulty,
                  })
                }
                buttons={WORKSHEET_DIFFICULTIES.map((level) => ({
                  value: level.id,
                  label: level.label,
                }))}
              />
              {difficultySuggestion && (
                <TouchableOpacity
                  style={styles.suggestionBanner}
                  onPress={() =>
                    updateConfig({ difficulty: difficultySuggestion.suggested })
                  }
                >
                  <Text style={styles.suggestionText}>
                    {difficultySuggestion.message}
                  </Text>
                  <Text style={styles.suggestionAction}>
                    Tap to switch to {difficultySuggestion.suggested}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.configItem}>
              <Text variant="titleMedium">How many questions?</Text>
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
              Make My Worksheet!
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
    </SafeAreaView>
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
  suggestionBanner: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#4A90E2",
  },
  suggestionText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 21,
  },
  suggestionAction: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "700",
    marginTop: 4,
  },
});
