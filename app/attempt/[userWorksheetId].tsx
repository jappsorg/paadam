import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Alert, ScrollView, View } from "react-native";
import {
  Button,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
  TextInput,
  ProgressBar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import {
  StorageService,
  WorksheetTemplate,
  WorksheetAttempt,
  QuestionAttemptData,
} from "../../services/StorageService";
import { WorksheetQuestion } from "../../types/worksheet";
import { serverTimestamp } from "firebase/firestore";
import CharacterCompanion, {
  CompanionMood,
} from "../../components/CharacterCompanion";
import { studentProfileService } from "../../services/StudentProfileService";

type UserAnswerInput = {
  questionId: string;
  answer: string;
};

export default function AttemptWorksheetScreen() {
  const { userWorksheetId } = useLocalSearchParams<{
    userWorksheetId: string;
  }>();
  const { currentUser, isLoading: authLoading, selectedStudent, refreshStudentProfiles } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const [worksheetAttempt, setWorksheetAttempt] =
    useState<WorksheetAttempt | null>(null);
  const [worksheet, setWorksheet] = useState<WorksheetTemplate | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswerInput[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [processedAnswers, setProcessedAnswers] = useState<QuestionAttemptData[]>([]);
  const [companionMood, setCompanionMood] = useState<CompanionMood>("idle");
  const [xpResult, setXpResult] = useState<{
    xpAwarded: number;
    leveledUp: boolean;
    newLevel?: number;
  } | null>(null);
  const [streakResult, setStreakResult] = useState<{
    currentStreak: number;
    streakIncreased: boolean;
  } | null>(null);

  const characterId = selectedStudent?.selectedCharacterId || "ada";

  const loadWorksheet = useCallback(async () => {
    if (!userWorksheetId) {
      setError("Hmm, we can't find this worksheet. Let's go back and try again!");
      setIsLoading(false);
      return;
    }
    if (!currentUser) {
      setError("You need to sign in first!");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedWorksheetAttempt =
        await StorageService.getWorksheetAttemptById(userWorksheetId);
      if (fetchedWorksheetAttempt) {
        setWorksheetAttempt(fetchedWorksheetAttempt);
        const worksheet = await StorageService.getWorksheetTemplateById(
          fetchedWorksheetAttempt.worksheetId
        );
        setWorksheet(worksheet);
        // Initialize userAnswers based on fetched worksheet's questions
        const initialAnswers = fetchedWorksheetAttempt.questionsAttemptData.map(
          (q) => ({
            questionId: q.questionId,
            answer: q.userAnswer || "", // Use userAnswer if available, otherwise empty
          })
        );
        setUserAnswers(initialAnswers);
        if (
          fetchedWorksheetAttempt.status === "completed" &&
          fetchedWorksheetAttempt.score !== undefined
        ) {
          setFinalScore(fetchedWorksheetAttempt.score);
          setShowResults(true); // If already completed, show results
        } else {
          // Find first unanswered question or start from 0
          let startIndex = initialAnswers.findIndex((ans) => !ans.answer);
          setCurrentQuestionIndex(startIndex !== -1 ? startIndex : 0);
          setCurrentAnswer(
            initialAnswers[startIndex !== -1 ? startIndex : 0]?.answer || ""
          );
        }
      } else {
        setError("We couldn't find this worksheet. Try picking a new one!");
      }
    } catch (err) {
      console.error("Failed to load worksheet. Error details:", err);
      setError("Oops! Something went wrong loading this worksheet. Let's try again!");
    } finally {
      setIsLoading(false);
    }
  }, [userWorksheetId, currentUser]);

  useEffect(() => {
    if (!authLoading) {
      loadWorksheet();
    }
  }, [userWorksheetId, authLoading, loadWorksheet]);

  const handleAnswerChange = (text: string) => {
    setCurrentAnswer(text);
  };

  const saveCurrentAnswer = () => {
    if (!worksheet) return;
    const questionId = worksheet.questions[currentQuestionIndex].id;
    const updatedAnswers = [...userAnswers];
    const answerIndex = updatedAnswers.findIndex(
      (a) => a.questionId === questionId
    );

    if (answerIndex > -1) {
      updatedAnswers[answerIndex] = { questionId, answer: currentAnswer };
    } else {
      updatedAnswers.push({ questionId, answer: currentAnswer });
    }
    setUserAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (!worksheet || currentQuestionIndex >= worksheet.questions.length - 1)
      return;
    saveCurrentAnswer();
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setCurrentAnswer(
      userAnswers.find(
        (a) => a.questionId === worksheet.questions[nextIndex].id
      )?.answer || ""
    );
    setCompanionMood("encouraging");
  };

  const handlePreviousQuestion = () => {
    if (!worksheet || currentQuestionIndex <= 0) return;
    saveCurrentAnswer();
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setCurrentAnswer(
      userAnswers.find(
        (a) => a.questionId === worksheet.questions[prevIndex].id
      )?.answer || ""
    );
    setCompanionMood("thinking");
  };

  const handleSubmitWorksheet = async () => {
    if (!worksheet || !currentUser || !userWorksheetId) return;
    saveCurrentAnswer(); // Save the very last answer

    setIsSubmitting(true);
    setError(null);

    let score = 0;
    const processedUserAnswers: QuestionAttemptData[] = worksheet.questions.map(
      (q) => {
        const userAnswerObj = userAnswers.find((ua) => ua.questionId === q.id);
        const isCorrect =
          userAnswerObj?.answer.trim().toLowerCase() ===
          q.answer?.trim().toLowerCase();
        if (isCorrect) {
          score++;
        }
        return {
          questionId: q.id,
          userAnswer: userAnswerObj?.answer || "",
          isCorrect: q.answer !== undefined ? isCorrect : undefined,
          attemptsCount: worksheetAttempt
            ? worksheetAttempt.questionsAttemptData.length + 1
            : 1,
          status: "answered",
        };
      }
    );

    const calculatedScore = (score / worksheet.questions.length) * 100;
    setFinalScore(calculatedScore);
    setProcessedAnswers(processedUserAnswers);

    try {
      await StorageService.updateWorksheetAttempt(userWorksheetId, {
        status: "completed",
        score: calculatedScore,
        questionsAttemptData: processedUserAnswers,
        completedAt: serverTimestamp() as any,
      });
      setCompanionMood(calculatedScore >= 70 ? "celebrating" : "encouraging");

      // Award XP and update streak if student profile exists
      if (selectedStudent?.id) {
        try {
          // XP: 10 per correct answer + bonus for high scores
          const baseXP = score * 10;
          const bonusXP = calculatedScore >= 90 ? 20 : calculatedScore >= 70 ? 10 : 0;
          const totalXP = baseXP + bonusXP;

          const xpRes = await studentProfileService.awardXP(selectedStudent.id, totalXP);
          setXpResult(xpRes);

          const streakRes = await studentProfileService.updateStreak(selectedStudent.id);
          setStreakResult(streakRes);

          // Update skill mastery for the worksheet subject
          if (worksheet.config?.subject) {
            const skillId = worksheet.config.subject.toLowerCase();
            const profile = await studentProfileService.getProfile(selectedStudent.id);
            const currentMastery = profile?.skillsMastery[skillId];
            const questionsAttempted = (currentMastery?.questionsAttempted || 0) + worksheet.questions.length;
            const questionsCorrect = (currentMastery?.questionsCorrect || 0) + score;
            const masteryLevel = Math.round((questionsCorrect / questionsAttempted) * 100);

            await studentProfileService.updateSkillMastery(selectedStudent.id, skillId, {
              questionsAttempted,
              questionsCorrect,
              masteryLevel,
              currentDifficulty: worksheet.config.difficulty === "easy" ? 1 : worksheet.config.difficulty === "medium" ? 3 : 5,
            });
          }
          // Refresh context so home screen shows updated stats
          await refreshStudentProfiles();
        } catch (profileErr) {
          console.error("[Attempt] Failed to update student progress:", profileErr);
        }
      }

      setShowResults(true);
    } catch (err) {
      console.error("Failed to submit worksheet. Error details:", err);
      setError("Oops! Something went wrong. Let's try again!");
      Alert.alert(
        "Oops!",
        "Something went wrong saving your answers. Tap OK and try again!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading worksheet...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
        <Button onPress={loadWorksheet}>Try Again</Button>
      </SafeAreaView>
    );
  }

  if (!worksheet) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Hmm, this worksheet isn't ready yet. Try going back!</Text>
      </SafeAreaView>
    );
  }

  const currentQ: WorksheetQuestion | undefined =
    worksheet.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / worksheet.questions.length;

  // Results review screen
  if (showResults) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CharacterCompanion
            characterId={characterId}
            mood={finalScore >= 70 ? "celebrating" : "encouraging"}
            studentName={selectedStudent?.name}
          />

          {/* Score summary */}
          <View style={styles.scoreSummary}>
            <Text variant="headlineMedium" style={styles.scoreTitle}>
              {finalScore >= 90
                ? "Amazing!"
                : finalScore >= 70
                ? "Great job!"
                : finalScore >= 50
                ? "Good effort!"
                : "Keep practicing!"}
            </Text>
            <Text variant="displayMedium" style={styles.scoreValue}>
              {finalScore.toFixed(0)}%
            </Text>

            {/* XP and Streak */}
            {(xpResult || streakResult) && (
              <View style={styles.rewardsContainer}>
                {xpResult && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardEmoji}>{"\u2B50"}</Text>
                    <Text style={styles.rewardText}>+{xpResult.xpAwarded} XP</Text>
                    {xpResult.leveledUp && (
                      <Text style={styles.levelUpText}>
                        Level up! Level {xpResult.newLevel}!
                      </Text>
                    )}
                  </View>
                )}
                {streakResult && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardEmoji}>{"\uD83D\uDD25"}</Text>
                    <Text style={styles.rewardText}>
                      {streakResult.currentStreak} day streak
                      {streakResult.streakIncreased ? " (+1!)" : ""}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Per-question review */}
          <Text variant="titleMedium" style={styles.reviewTitle}>
            Let's See How You Did
          </Text>
          {worksheet.questions.map((q, index) => {
            const attemptData = processedAnswers.find(
              (a) => a.questionId === q.id
            );
            const isCorrect = attemptData?.isCorrect;
            return (
              <Card
                key={q.id}
                style={[
                  styles.reviewCard,
                  isCorrect
                    ? styles.reviewCardCorrect
                    : styles.reviewCardIncorrect,
                ]}
              >
                <Card.Content>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewIndex}>Q{index + 1}</Text>
                    <Text style={styles.reviewStatus}>
                      {isCorrect ? "\u2705" : "\u274C"}
                    </Text>
                  </View>
                  <Text variant="bodyLarge" style={styles.reviewQuestion}>
                    {q.question}
                  </Text>
                  <View style={styles.reviewAnswers}>
                    <Text
                      style={[
                        styles.reviewAnswer,
                        isCorrect
                          ? styles.answerCorrect
                          : styles.answerIncorrect,
                      ]}
                    >
                      Your answer: {attemptData?.userAnswer || "(no answer)"}
                    </Text>
                    {!isCorrect && q.answer && (
                      <Text style={styles.correctAnswer}>
                        Correct answer: {q.answer}
                      </Text>
                    )}
                  </View>
                  {q.explanation && (
                    <Text style={styles.explanation}>
                      {"\uD83D\uDCA1"} {q.explanation}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}

          {/* Action buttons */}
          <View style={styles.resultActions}>
            <Button
              mode="outlined"
              onPress={() => router.replace("/history")}
              icon="history"
            >
              My Past Scores
            </Button>
            <Button
              mode="contained"
              onPress={() => router.back()}
              icon="home"
            >
              Done
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz screen
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CharacterCompanion
          characterId={characterId}
          mood={companionMood}
          studentName={selectedStudent?.name}
        />
        <Card style={styles.card}>
          <Card.Title
            title={worksheet.title || "Attempt Worksheet"}
            subtitle={`Question ${currentQuestionIndex + 1} of ${
              worksheet.questions.length
            }`}
            titleVariant="headlineSmall"
          />
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          {currentQ && (
            <Card.Content style={styles.questionContent}>
              <Text variant="titleLarge" style={styles.questionText}>
                {currentQ.question}
              </Text>
              <TextInput
                label="Your Answer"
                value={currentAnswer}
                onChangeText={handleAnswerChange}
                mode="outlined"
                style={styles.answerInput}
              />
            </Card.Content>
          )}
          <Card.Actions style={styles.actions}>
            <Button
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              icon="arrow-left"
            >
              Previous
            </Button>
            {currentQuestionIndex < worksheet.questions.length - 1 ? (
              <Button
                onPress={handleNextQuestion}
                disabled={isSubmitting}
                mode="contained"
                icon="arrow-right"
              >
                Next
              </Button>
            ) : (
              <Button
                onPress={handleSubmitWorksheet}
                disabled={isSubmitting}
                loading={isSubmitting}
                mode="contained"
                icon="check-circle"
              >
                Check My Answers!
              </Button>
            )}
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    // No specific margin here, handled by scrollContent padding
  },
  progressBar: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  questionContent: {
    paddingVertical: 20,
  },
  questionText: {
    marginBottom: 20,
    lineHeight: 30, // Adjust for better readability
  },
  answerInput: {
    marginTop: 10,
  },
  actions: {
    justifyContent: "space-between",
    padding: 16,
  },
  rewardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 12,
    backgroundColor: "#FFFDE7",
    borderRadius: 12,
    marginTop: 4,
  },
  rewardItem: {
    alignItems: "center",
    gap: 4,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  levelUpText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4CAF50",
  },
  scoreSummary: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  scoreTitle: {
    textAlign: "center",
    marginBottom: 4,
  },
  scoreValue: {
    textAlign: "center",
    fontWeight: "800",
    color: "#4A90E2",
    marginBottom: 8,
  },
  reviewTitle: {
    marginBottom: 12,
    fontWeight: "700",
  },
  reviewCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  reviewCardCorrect: {
    borderLeftColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  reviewCardIncorrect: {
    borderLeftColor: "#FF5252",
    backgroundColor: "#FFF3E0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewIndex: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  reviewStatus: {
    fontSize: 18,
  },
  reviewQuestion: {
    marginBottom: 10,
    lineHeight: 24,
  },
  reviewAnswers: {
    gap: 4,
  },
  reviewAnswer: {
    fontSize: 14,
    fontWeight: "600",
  },
  answerCorrect: {
    color: "#2E7D32",
  },
  answerIncorrect: {
    color: "#C62828",
  },
  correctAnswer: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  explanation: {
    marginTop: 8,
    fontSize: 14,
    color: "#37474F",
    lineHeight: 21,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 20,
  },
});
