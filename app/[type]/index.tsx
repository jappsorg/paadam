import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
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
  GRADE_SUBJECT_MAP,
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
      setError("Oops! Something got mixed up. Let\u2019s try again!");
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
      let profile: { worksheetsCompleted?: number; favoriteThemes?: string[]; grade?: string } | null = null;
      try {
        const profileData = await studentProfileService.getProfile(studentId);
        profile = profileData as (typeof profileData & { worksheetsCompleted?: number; favoriteThemes?: string[] }) | null;
      } catch (profileErr) {
        console.warn("[WorksheetGenerator] Could not load student profile, using defaults:", profileErr);
      }
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

      // Convert to standard worksheet format for preview
      const adaptiveQuestions = result.worksheet.questions.map((q, i) => ({
        id: `q_${i}`,
        question: q.question,
        answer: q.answer,
        explanation: q.explanation,
      }));

      // Set worksheet for preview immediately so it shows regardless of save success
      setWorksheet({
        title: result.worksheet.title,
        questions: adaptiveQuestions,
      } as any);

      // Try to start session and save to Firestore
      try {
        await sessionService.startSession(studentId, selectedStudent?.selectedCharacterId || "ada", result.plan.theme);
      } catch (sessionErr) {
        console.warn("[WorksheetGenerator] Could not start session:", sessionErr);
      }

      if (currentUser) {
        try {
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
        } catch (saveErr) {
          console.warn("[WorksheetGenerator] Could not save adventure worksheet:", saveErr);
        }
      }
    } catch (err) {
      console.error("[WorksheetGenerator] Adventure mode failed:", err);
      setError("Oops! Something went wrong. Try building your own worksheet instead!");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
        {/* Adventure Mode Toggle */}
        <View style={adventureStyles.modeToggle}>
          <Pressable
            style={[adventureStyles.modeButton, !adventureMode && adventureStyles.modeButtonActive]}
            onPress={() => { setAdventureMode(false); setError(null); }}
          >
            <Text style={[adventureStyles.modeButtonText, !adventureMode && adventureStyles.modeButtonTextActive]}>
              {"\u{1F527}"} Build My Own
            </Text>
          </Pressable>
          <Pressable
            style={[adventureStyles.modeButton, adventureMode && adventureStyles.modeButtonActive]}
            onPress={() => { setAdventureMode(true); setError(null); }}
          >
            <Text style={[adventureStyles.modeButtonText, adventureMode && adventureStyles.modeButtonTextActive]}>
              {"\u{1F680}"} Adventure!
            </Text>
          </Pressable>
        </View>

        {adventureMode ? (
          <View style={adventureStyles.adventureCard}>
            {/* Character scene */}
            <View style={adventureStyles.characterScene}>
              <View style={adventureStyles.starsRow}>
                <Text style={adventureStyles.star}>{"\u2728"}</Text>
                <Text style={[adventureStyles.star, { fontSize: 20 }]}>{"\u2B50"}</Text>
                <Text style={adventureStyles.star}>{"\u2728"}</Text>
              </View>
              <View style={adventureStyles.characterCircle}>
                <Text style={adventureStyles.characterEmoji}>
                  {CHARACTER_EMOJIS[selectedStudent?.selectedCharacterId || "ada"] || "\u{1F989}"}
                </Text>
              </View>
              <Text style={adventureStyles.adventureTitle}>
                {arcProgress ? arcProgress.title : "Ready for an Adventure?"}
              </Text>
              <Text style={adventureStyles.adventureSubtitle}>
                {arcProgress
                  ? `You're on step ${arcProgress.current} of ${arcProgress.total}!`
                  : "Your buddy will pick the perfect challenge for you!"}
              </Text>
            </View>

            {/* Arc Progress */}
            {arcProgress && (
              <View style={adventureStyles.arcProgress}>
                <View style={adventureStyles.arcProgressBar}>
                  <View style={[adventureStyles.arcProgressFill, { width: `${(arcProgress.current / arcProgress.total) * 100}%` }]} />
                </View>
                <View style={adventureStyles.arcDots}>
                  {Array.from({ length: arcProgress.total }, (_, i) => (
                    <View key={i} style={[adventureStyles.arcDot, i < arcProgress.current && adventureStyles.arcDotComplete]} />
                  ))}
                </View>
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

            {error && (
              <View style={adventureStyles.errorBubble}>
                <Text style={adventureStyles.errorEmoji}>{"\uD83D\uDE05"}</Text>
                <Text style={adventureStyles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                adventureStyles.goButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleAdventureGenerate}
              disabled={loading}
            >
              {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
              <Text style={adventureStyles.goButtonText}>
                {loading ? "Getting ready..." : arcProgress ? "Keep Going! \u{1F680}" : "Let's Go! \u{1F680}"}
              </Text>
            </Pressable>

            {/* Pivot button — visible, kid-friendly */}
            {arcProgress && (
              <Pressable
                style={({ pressed }) => [
                  adventureStyles.switchButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handlePivot}
              >
                <Text style={adventureStyles.switchButtonText}>{"\uD83D\uDD04"} I want something different!</Text>
              </Pressable>
            )}
          </View>
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
              <Text variant="titleMedium">What grade are you in?</Text>
              <View style={styles.buttonGroup}>
                {WORKSHEET_GRADE_OPTIONS.map((grade) => (
                  <Button
                    key={grade.id}
                    mode={config.grade === grade.id ? "outlined" : "text"}
                    onPress={() => updateConfig({ grade: grade.id })}
                    style={[
                      styles.buttonInGroup,
                      config.grade === grade.id
                        ? styles.buttonInGroupSelected
                        : styles.buttonInGroupUnselected,
                    ]}
                  >
                    <Text style={config.grade === grade.id ? styles.buttonTextSelected : {}}>{grade.label}</Text>
                  </Button>
                ))}
              </View>
            </View>

            {(type === "math" ||
              type === "word-problem" ||
              type === "puzzle") && (
              <View style={styles.configItem}>
                <Text variant="titleMedium">What do you want to practice?</Text>
                <View style={styles.buttonGroup}>
                  {MATH_SUBJECT_OPTIONS.filter((subject) => {
                    const gradeKey = config.grade === "K" ? "K" : config.grade.toString();
                    const allowed = GRADE_SUBJECT_MAP[gradeKey];
                    return !allowed || allowed.includes(subject.id);
                  }).map((subject) => (
                    <Button
                      key={subject.id}
                      mode={config.subject === subject.id ? "outlined" : "text"}
                      onPress={() => updateConfig({ subject: subject.id })}
                      style={[
                        styles.buttonInGroup,
                        config.subject === subject.id
                          ? styles.buttonInGroupSelected
                          : styles.buttonInGroupUnselected,
                      ]}
                    >
                      <Text style={config.subject === subject.id ? styles.buttonTextSelected : {}}>{subject.label}</Text>
                    </Button>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.configItem}>
              <Text variant="titleMedium">How tricky should it be?</Text>
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
              <Text variant="titleMedium">How many problems?</Text>
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
              <Text variant="titleMedium">Show answers on the sheet?</Text>
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
              Go! Make it! {"\u{1F389}"}
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
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: radii.xxl,
  },
  configItem: {
    marginVertical: spacing.md,
  },
  input: {
    marginTop: spacing.sm,
  },
  generateButton: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  buttonInGroup: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  buttonInGroupSelected: {
    borderWidth: 2,
    borderColor: colors.coral400,
    backgroundColor: colors.coral400 + "20",
  },
  buttonInGroupUnselected: {
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonTextSelected: {
    color: colors.coral400,
    fontWeight: fontWeights.bold as any,
  },
  error: {
    color: colors.error,
    textAlign: "center",
    marginVertical: spacing.sm,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  suggestionBanner: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.violet50,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.violet400,
  },
  suggestionText: {
    fontSize: fontSizes.md,
    color: colors.violet700,
    lineHeight: 21,
  },
  suggestionAction: {
    fontSize: fontSizes.md,
    color: colors.violet500,
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
    color: colors.coral400,
    ...textPresets.labelSmall,
  },
});

const adventureStyles = StyleSheet.create({
  modeToggle: {
    flexDirection: "row",
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
    backgroundColor: colors.sand200,
    padding: spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radii.lg,
  },
  modeButtonActive: {
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.plum900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  arcProgress: {
    backgroundColor: colors.violet50,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  arcTitle: {
    fontSize: fontSizes.base,
    fontWeight: "700",
    color: colors.violet500,
    textAlign: "center",
  },
  arcProgressBar: {
    height: 10,
    backgroundColor: colors.violet100,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  arcProgressFill: {
    height: "100%",
    backgroundColor: colors.violet400,
    borderRadius: radii.sm,
  },
  arcProgressText: {
    fontSize: fontSizes.sm,
    color: colors.violet500,
    textAlign: "center",
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  narrativeIntro: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal400,
  },
  narrativeCharacter: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.teal500,
    marginBottom: spacing.sm,
  },
  narrativeText: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  switchButton: {
    alignSelf: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.coral50,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.coral300,
  },
  switchButtonText: {
    fontSize: fontSizes.md,
    color: colors.coral500,
    fontWeight: "700",
  },
  adventureCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    shadowColor: colors.violet400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  characterScene: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  starsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  star: {
    fontSize: 16,
  },
  characterCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.violet50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.violet300,
  },
  characterEmoji: {
    fontSize: 44,
  },
  adventureTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  adventureSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  arcDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  arcDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.violet100,
  },
  arcDotComplete: {
    backgroundColor: colors.violet400,
  },
  errorBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.coral50,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  errorEmoji: {
    fontSize: 28,
  },
  errorText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.coral500,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
  },
  goButton: {
    backgroundColor: colors.teal400,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: colors.teal400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  goButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
