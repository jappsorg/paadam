import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Pressable } from "react-native";
import {
  Button,
  Card,
  Text,
  SegmentedButtons,
  Switch,
} from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights, textPresets, useAppTheme } from "@/theme";
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
import { adaptivePlannerService, AdaptiveWorksheet } from "@/services/AdaptivePlannerService";
import { narrativeArcService } from "@/services/NarrativeArcService";
import { discoveryQuestService } from "@/services/DiscoveryQuestService";
import { studentProfileService } from "@/services/StudentProfileService";
import { sessionService } from "@/services/SessionService";
import { LearningPlan } from "@/types/adaptive-pipeline";

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
  const hasProfile = !!selectedStudent;
  const [showAdvanced, setShowAdvanced] = useState(!hasProfile);
  const [adventureMode, setAdventureMode] = useState(false);
  const [adaptiveResult, setAdaptiveResult] = useState<{
    plan: LearningPlan;
    worksheet: AdaptiveWorksheet;
  } | null>(null);
  const [arcProgress, setArcProgress] = useState<{ current: number; total: number; title: string } | null>(null);

  const theme = useAppTheme();

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

  const studentId = selectedStudent?.id || currentUser?.uid || "";

  const handleAdventureGenerate = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if student needs discovery quest (< 3 worksheets completed)
      const profileData = await studentProfileService.getProfile(studentId);
      const profile = profileData as (typeof profileData & { worksheetsCompleted?: number; favoriteThemes?: string[] }) | null;
      const worksheetsCompleted = profile?.worksheetsCompleted ?? 0;
      const phase = discoveryQuestService.getDiscoveryPhase(worksheetsCompleted);

      let result;
      if (phase !== "complete") {
        // Discovery quest: use deterministic plan, then generate worksheet
        const plan = discoveryQuestService.generateDiscoveryPlan(
          studentId,
          profile?.grade || "1",
          selectedStudent?.selectedCharacterId || "ada",
          phase,
          profile?.favoriteThemes || ["animals"],
          null,
        );
        const worksheet = await adaptivePlannerService.generateWorksheet(plan);
        result = { plan, worksheet };
      } else {
        // Normal adaptive pipeline
        result = await adaptivePlannerService.generateAdaptiveWorksheet(studentId);
      }

      setAdaptiveResult(result);
      setArcProgress({
        current: result.plan.arcBeat.position,
        total: result.plan.arcBeat.totalBeats,
        title: result.plan.arcTitle,
      });

      // Start session with theme for signal tracking
      await sessionService.startSession(studentId, selectedStudent?.selectedCharacterId || "ada", result.plan.theme);

      // Convert adaptive worksheet to existing format and save
      if (currentUser) {
        const adaptiveQuestions = result.worksheet.questions.map((q, i) => ({
          id: `q_${i}`,
          question: q.question,
          answer: q.answer,
          explanation: q.explanation,
        }));
        const templateId = await StorageService.createWorksheetTemplate({
          title: result.worksheet.title,
          config: { ...config, subject: result.plan.subject as any, difficulty: result.plan.difficulty as any },
          questions: adaptiveQuestions,
          createdBy: currentUser.uid,
        });
        const attemptId = await StorageService.startWorksheetAttempt(
          currentUser.uid,
          templateId,
          result.worksheet.title,
          adaptiveQuestions,
        );
        router.push(`/attempt/${attemptId}`);
      }
    } catch (err) {
      console.error("[WorksheetGenerator] Adventure mode failed, falling back:", err);
      setError("Adventure generation failed. Try manual mode.");
    } finally {
      setLoading(false);
    }
  }, [studentId, currentUser, config, selectedStudent]);

  const handlePivot = React.useCallback(async () => {
    const activeArc = await narrativeArcService.getActiveArc(studentId);
    if (activeArc) {
      const pivoted = narrativeArcService.pivotArc(activeArc, "student_requested_change");
      await narrativeArcService.updateArc(studentId, pivoted);
    }
    setArcProgress(null);
    setAdaptiveResult(null);
    // Navigate to theme picker
    router.push({
      pathname: "/theme-picker" as any,
      params: { studentId, character: selectedStudent?.selectedCharacterId || "ada" },
    });
  }, [studentId, selectedStudent]);

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
    setShowAdvanced(!selectedStudent);
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
        {/* Adventure Mode Toggle */}
        <View style={adventureStyles.modeToggle}>
          <Pressable
            style={[adventureStyles.modeButton, !adventureMode && adventureStyles.modeButtonActive]}
            onPress={() => setAdventureMode(false)}
          >
            <Text style={[adventureStyles.modeButtonText, !adventureMode && adventureStyles.modeButtonTextActive]}>
              Manual
            </Text>
          </Pressable>
          <Pressable
            style={[adventureStyles.modeButton, adventureMode && adventureStyles.modeButtonActive]}
            onPress={() => setAdventureMode(true)}
          >
            <Text style={[adventureStyles.modeButtonText, adventureMode && adventureStyles.modeButtonTextActive]}>
              Start Adventure!
            </Text>
          </Pressable>
        </View>

        {adventureMode ? (
          <Card style={styles.card}>
            <Card.Content>
              {/* Arc Progress */}
              {arcProgress && (
                <View style={adventureStyles.arcProgress}>
                  <Text style={adventureStyles.arcTitle}>{arcProgress.title}</Text>
                  <View style={adventureStyles.arcProgressBar}>
                    <View style={[adventureStyles.arcProgressFill, { width: `${(arcProgress.current / arcProgress.total) * 100}%` }]} />
                  </View>
                  <Text style={adventureStyles.arcProgressText}>
                    Beat {arcProgress.current} of {arcProgress.total}
                  </Text>
                </View>
              )}

              {/* Narrative Intro */}
              {adaptiveResult && (
                <View style={adventureStyles.narrativeIntro}>
                  <Text style={adventureStyles.narrativeCharacter}>
                    {adaptiveResult.worksheet.characterDialogue.greeting}
                  </Text>
                  <Text style={adventureStyles.narrativeText}>
                    {adaptiveResult.worksheet.narrativeIntro}
                  </Text>
                </View>
              )}

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                mode="contained"
                onPress={handleAdventureGenerate}
                loading={loading}
                disabled={loading}
                style={styles.generateButton}
              >
                {arcProgress ? "Continue Adventure!" : "Start My Adventure!"}
              </Button>

              {/* Pivot button */}
              {arcProgress && (
                <Pressable
                  style={adventureStyles.switchButton}
                  onPress={handlePivot}
                >
                  <Text style={adventureStyles.switchButtonText}>I want a different adventure!</Text>
                </Pressable>
              )}
            </Card.Content>
          </Card>
        ) : (
        <Card style={styles.card}>
          <Card.Title
            title={WORKSHEET_TYPE_LABELS[type]}
            titleVariant="headlineMedium"
          />
          <Card.Content>
            {hasProfile && !showAdvanced ? (
              <View style={styles.quickStart}>
                <Text variant="bodyLarge" style={styles.quickStartText}>
                  Ready for {selectedStudent.name}! Grade {config.grade},{" "}
                  {config.difficulty} difficulty.
                </Text>
                <TouchableOpacity onPress={() => setShowAdvanced(true)}>
                  <Text style={styles.changeSettingsLink}>Change settings</Text>
                </TouchableOpacity>
              </View>
            ) : (
            <>
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
            </>
            )}

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
        )}

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
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  configItem: {
    marginVertical: spacing.md,
  },
  input: {
    marginTop: spacing.sm,
  },
  generateButton: {
    marginTop: spacing.lg,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  buttonInGroup: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  buttonInGroupSelected: {
    borderWidth: 2,
    borderColor: colors.selected,
  },
  error: {
    color: colors.error,
    textAlign: "center",
    marginVertical: spacing.sm,
  },
  suggestionBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.infoLight,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  suggestionText: {
    fontSize: fontSizes.md,
    color: colors.blue700,
    lineHeight: 21,
  },
  suggestionAction: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.bold,
    marginTop: spacing.xs,
  },
  quickStart: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  quickStartText: {
    color: colors.textSecondary,
  },
  changeSettingsLink: {
    color: colors.primary,
    ...textPresets.labelSmall,
  },
});

const adventureStyles = StyleSheet.create({
  modeToggle: { flexDirection: "row", borderRadius: radii.md, overflow: "hidden", marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  modeButton: { flex: 1, paddingVertical: spacing.sm, alignItems: "center" },
  modeButtonActive: { backgroundColor: colors.primary },
  modeButtonText: { fontSize: fontSizes.sm, color: colors.textPrimary },
  modeButtonTextActive: { color: colors.textOnPrimary, fontWeight: "700" },
  arcProgress: { backgroundColor: colors.primaryLight, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  arcTitle: { fontSize: fontSizes.md, fontWeight: "700", color: colors.primary, textAlign: "center" },
  arcProgressBar: { height: 8, backgroundColor: colors.backdrop, borderRadius: radii.xs, marginTop: spacing.sm, overflow: "hidden" },
  arcProgressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: radii.xs },
  arcProgressText: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs },
  narrativeIntro: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.primary },
  narrativeCharacter: { fontSize: fontSizes.md, fontWeight: "600", color: colors.primary, marginBottom: spacing.sm },
  narrativeText: { fontSize: fontSizes.md, color: colors.textPrimary, lineHeight: 24 },
  switchButton: { alignSelf: "center", paddingVertical: spacing.xs, marginTop: spacing.sm },
  switchButtonText: { fontSize: fontSizes.sm, color: colors.textSecondary, textDecorationLine: "underline" },
});
