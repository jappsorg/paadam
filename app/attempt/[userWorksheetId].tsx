import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, Alert, ScrollView, View, Animated } from "react-native";
import {
  Button,
  Text,
  Card,
  TextInput,
  ProgressBar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, usePathname } from "expo-router";
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
import { evaluateAnswer } from "../../utils/answerEvaluation";
import { AchievementService, type AchievementDefinition } from "@/services/AchievementService";
import { AchievementUnlockedModal } from "@/components/AchievementUnlockedModal";
import { LoadingState, ErrorState, Confetti } from "@/components/ui";

const CHARACTER_EMOJIS: Record<string, string> = {
  ada: "\u{1F989}",
  max: "\u{1F436}",
  luna: "\u{1F431}",
};
import { useAppTheme } from "@/theme";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";

type UserAnswerInput = {
  questionId: string;
  answer: string;
};

export default function AttemptWorksheetScreen() {
  const { userWorksheetId } = useLocalSearchParams<{
    userWorksheetId: string;
  }>();
  const { currentUser, isLoading: authLoading, selectedStudent, refreshStudentProfiles } = useAuth();
  const theme = useAppTheme();
  const router = useRouter();

  const pathname = usePathname();
  const isActiveRoute = pathname.startsWith("/attempt/");

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
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementDefinition[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
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

  // Per-question immediate feedback state
  const [feedbackState, setFeedbackState] = useState<null | "correct" | "incorrect">(null);
  const [feedbackCorrectAnswer, setFeedbackCorrectAnswer] = useState<string>("");
  const [feedbackExplanation, setFeedbackExplanation] = useState<string>("");
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  const [runningScore, setRunningScore] = useState(0);
  const [runningXP, setRunningXP] = useState(0);

  // Animation refs for XP popup
  const xpFadeAnim = useRef(new Animated.Value(0)).current;
  const xpSlideAnim = useRef(new Animated.Value(0)).current;

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

  const animateXPPopup = () => {
    xpFadeAnim.setValue(0);
    xpSlideAnim.setValue(0);
    Animated.parallel([
      Animated.timing(xpFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(xpSlideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold for a moment, then fade out
      setTimeout(() => {
        Animated.timing(xpFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 800);
    });
  };

  const handleCheckAnswer = () => {
    if (!worksheet) return;
    const currentQ = worksheet.questions[currentQuestionIndex];
    saveCurrentAnswer();

    const isCorrect =
      currentAnswer && currentQ.answer
        ? evaluateAnswer(currentAnswer, currentQ.answer)
        : false;

    // Build the processed answer data for this question
    const questionAttemptData: QuestionAttemptData = {
      questionId: currentQ.id,
      userAnswer: currentAnswer,
      isCorrect: currentQ.answer !== undefined ? isCorrect : undefined,
      attemptsCount: worksheetAttempt
        ? worksheetAttempt.questionsAttemptData.length + 1
        : 1,
      status: "answered",
    };

    // Update processedAnswers incrementally
    setProcessedAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === currentQ.id);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing] = questionAttemptData;
        return updated;
      }
      return [...prev, questionAttemptData];
    });

    // Mark this question as checked
    setCheckedQuestions((prev) => new Set(prev).add(currentQ.id));

    if (isCorrect) {
      setFeedbackState("correct");
      setFeedbackCorrectAnswer("");
      setFeedbackExplanation("");
      setCompanionMood("correct");
      setRunningScore((prev) => prev + 1);
      setRunningXP((prev) => prev + 10);
      animateXPPopup();

      // Auto-advance after 2.5s for correct answers (give kids time to enjoy feedback)
      setTimeout(() => {
        setFeedbackState(null);
        if (currentQuestionIndex < worksheet.questions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setCurrentAnswer(
            userAnswers.find(
              (a) => a.questionId === worksheet.questions[nextIndex].id
            )?.answer || ""
          );
          setCompanionMood("encouraging");
        }
      }, 2500);
    } else {
      setFeedbackState("incorrect");
      setFeedbackCorrectAnswer(currentQ.answer || "");
      setFeedbackExplanation(currentQ.explanation || "");
      setCompanionMood("incorrect");
    }
  };

  const handleDismissFeedback = () => {
    if (!worksheet) return;
    setFeedbackState(null);
    setFeedbackCorrectAnswer("");
    setFeedbackExplanation("");

    // Advance to next question if not on the last one
    if (currentQuestionIndex < worksheet.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswer(
        userAnswers.find(
          (a) => a.questionId === worksheet.questions[nextIndex].id
        )?.answer || ""
      );
      setCompanionMood("encouraging");
    }
  };

  const handleNextQuestion = () => {
    if (!worksheet || currentQuestionIndex >= worksheet.questions.length - 1)
      return;
    // If already checked, just advance
    const currentQ = worksheet.questions[currentQuestionIndex];
    if (checkedQuestions.has(currentQ.id)) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswer(
        userAnswers.find(
          (a) => a.questionId === worksheet.questions[nextIndex].id
        )?.answer || ""
      );
      setFeedbackState(null);
      setCompanionMood("encouraging");
    } else {
      // Need to check first
      handleCheckAnswer();
    }
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
    setFeedbackState(null);
    setCompanionMood("thinking");
  };

  const handleSubmitWorksheet = async () => {
    if (!worksheet || !currentUser || !userWorksheetId) return;
    saveCurrentAnswer(); // Save the very last answer

    // Check the last question if not yet checked
    const lastQ = worksheet.questions[currentQuestionIndex];
    let finalRunningScore = runningScore;
    let finalRunningXP = runningXP;
    let finalProcessedAnswers = [...processedAnswers];

    if (!checkedQuestions.has(lastQ.id)) {
      const isCorrect =
        currentAnswer && lastQ.answer
          ? evaluateAnswer(currentAnswer, lastQ.answer)
          : false;

      const questionAttemptData: QuestionAttemptData = {
        questionId: lastQ.id,
        userAnswer: currentAnswer,
        isCorrect: lastQ.answer !== undefined ? isCorrect : undefined,
        attemptsCount: worksheetAttempt
          ? worksheetAttempt.questionsAttemptData.length + 1
          : 1,
        status: "answered",
      };

      const existingIdx = finalProcessedAnswers.findIndex((a) => a.questionId === lastQ.id);
      if (existingIdx > -1) {
        finalProcessedAnswers[existingIdx] = questionAttemptData;
      } else {
        finalProcessedAnswers.push(questionAttemptData);
      }

      if (isCorrect) {
        finalRunningScore += 1;
        finalRunningXP += 10;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setFeedbackState(null);

    // Build complete processedAnswers for any questions that weren't checked
    // (e.g., skipped questions with no answer)
    const completeProcessedAnswers: QuestionAttemptData[] = worksheet.questions.map((q) => {
      const existing = finalProcessedAnswers.find((a) => a.questionId === q.id);
      if (existing) return existing;
      // Question was never checked — evaluate now
      const userAnswerObj = userAnswers.find((ua) => ua.questionId === q.id);
      const isCorrect =
        userAnswerObj?.answer && q.answer
          ? evaluateAnswer(userAnswerObj.answer, q.answer)
          : false;
      if (isCorrect) {
        finalRunningScore += 1;
      }
      return {
        questionId: q.id,
        userAnswer: userAnswerObj?.answer || "",
        isCorrect: q.answer !== undefined ? isCorrect : undefined,
        attemptsCount: worksheetAttempt
          ? worksheetAttempt.questionsAttemptData.length + 1
          : 1,
        status: "answered" as const,
      };
    });

    const score = finalRunningScore;
    const calculatedScore = (score / worksheet.questions.length) * 100;
    setFinalScore(calculatedScore);
    setProcessedAnswers(completeProcessedAnswers);

    try {
      await StorageService.updateWorksheetAttempt(userWorksheetId, {
        status: "completed",
        score: calculatedScore,
        questionsAttemptData: completeProcessedAnswers,
        completedAt: serverTimestamp() as any,
      });
      setCompanionMood(calculatedScore >= 70 ? "celebrating" : "encouraging");

      // Award XP and update streak if student profile exists
      if (selectedStudent?.id) {
        try {
          // XP: 10 per correct answer (already tracked) + bonus for high scores
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
          // Check and award achievements
          try {
            const achievementService = new AchievementService();
            const newAchievements = await achievementService.checkAndAwardAchievements(
              selectedStudent.id,
              {
                score: calculatedScore,
                worksheetType: worksheet.config?.type || "math",
                totalCompleted: 1, // First worksheet at minimum; TODO: track worksheetsCompleted on profile
                currentStreak: streakRes.currentStreak,
                currentLevel: xpRes.newLevel || selectedStudent.level || 1,
                bondLevel: selectedStudent.characterBondLevel || 0,
              }
            );
            if (newAchievements.length > 0) {
              console.log("[Attempt] Achievements unlocked:", newAchievements.map(a => a.name));
              setUnlockedAchievements(newAchievements);
              setShowAchievementModal(true);
            }
          } catch (achieveErr) {
            console.warn("[Attempt] Achievement check failed:", achieveErr);
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

  // Render nothing when this screen is not the active route.
  // On web, Expo Router tabs keep all screens mounted — this prevents the attempt
  // screen from rendering as an invisible overlay that intercepts all taps.
  if (!isActiveRoute || !userWorksheetId) {
    return null;
  }

  if (isLoading || authLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <LoadingState emoji="📝" message="Loading your worksheet..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <ErrorState message={error} onRetry={loadWorksheet} />
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
  const isCurrentChecked = currentQ ? checkedQuestions.has(currentQ.id) : false;
  const isLastQuestion = currentQuestionIndex === worksheet.questions.length - 1;

  // Results review screen
  if (showResults) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Confetti trigger={showResults && finalScore >= 70} />

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
        <AchievementUnlockedModal
          visible={showAchievementModal}
          achievements={unlockedAchievements}
          buddyEmoji={CHARACTER_EMOJIS[characterId] || "\u{1F989}"}
          onDismiss={() => setShowAchievementModal(false)}
        />
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

        {/* Running XP indicator */}
        {runningXP > 0 && (
          <View style={styles.runningXPBadge}>
            <Text style={styles.runningXPText}>{"\u2B50"} {runningXP} XP</Text>
          </View>
        )}

        <View
          style={[
            styles.quizCard,
            feedbackState === "correct" && styles.quizCardCorrectFlash,
            feedbackState === "incorrect" && styles.quizCardIncorrectFlash,
          ]}
        >
          <Text variant="headlineSmall">{worksheet.title || "Attempt Worksheet"}</Text>
          <Text variant="bodyMedium" style={styles.questionSubtitle}>
            Question {currentQuestionIndex + 1} of {worksheet.questions.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
            />
          </View>
          {currentQ && (
            <>
              <Text variant="titleLarge" style={styles.questionText}>
                {currentQ.question}
              </Text>
              <TextInput
                label="Your Answer"
                value={currentAnswer}
                onChangeText={handleAnswerChange}
                mode="outlined"
                style={styles.answerInput}
                disabled={feedbackState !== null || isCurrentChecked}
              />
            </>
          )}

          {/* Inline feedback overlay */}
          {feedbackState === "correct" && (
            <View style={styles.feedbackCorrectContainer}>
              <Text style={styles.feedbackCorrectEmoji}>{"\u2705"}</Text>
              <Text style={styles.feedbackCorrectText}>Correct!</Text>
              <Animated.View
                style={[
                  styles.xpPopup,
                  {
                    opacity: xpFadeAnim,
                    transform: [{ translateY: xpSlideAnim }],
                  },
                ]}
              >
                <Text style={styles.xpPopupText}>+10 XP</Text>
              </Animated.View>
            </View>
          )}

          {feedbackState === "incorrect" && (
            <View style={styles.feedbackIncorrectContainer}>
              <Text style={styles.feedbackIncorrectEmoji}>{"\u274C"}</Text>
              <Text style={styles.feedbackIncorrectText}>Not quite!</Text>
              {feedbackCorrectAnswer !== "" && (
                <Text style={styles.feedbackCorrectAnswer}>
                  The answer is: {feedbackCorrectAnswer}
                </Text>
              )}
              {feedbackExplanation !== "" && (
                <Text style={styles.feedbackExplanation}>
                  {"\uD83D\uDCA1"} {feedbackExplanation}
                </Text>
              )}
              <Button
                mode="contained"
                onPress={handleDismissFeedback}
                style={styles.gotItButton}
                compact
              >
                Got it!
              </Button>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || isSubmitting || feedbackState !== null}
              icon="arrow-left"
            >
              Previous
            </Button>
            {isLastQuestion ? (
              isCurrentChecked || feedbackState !== null ? (
                <Button
                  onPress={handleSubmitWorksheet}
                  disabled={isSubmitting || feedbackState !== null}
                  loading={isSubmitting}
                  mode="contained"
                  icon="check-circle"
                >
                  See My Results!
                </Button>
              ) : (
                <Button
                  onPress={handleCheckAnswer}
                  disabled={isSubmitting || !currentAnswer.trim()}
                  mode="contained"
                  icon="check"
                >
                  Check
                </Button>
              )
            ) : isCurrentChecked ? (
              <Button
                onPress={handleNextQuestion}
                disabled={isSubmitting || feedbackState !== null}
                mode="contained"
                icon="arrow-right"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onPress={handleCheckAnswer}
                disabled={isSubmitting || feedbackState !== null || !currentAnswer.trim()}
                mode="contained"
                icon="check"
              >
                Check
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    // No specific margin here, handled by scrollContent padding
  },
  quizCard: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: spacing.lg,
    elevation: 1,
  },
  quizCardCorrectFlash: {
    backgroundColor: colors.correctBackground,
    borderWidth: 2,
    borderColor: colors.correctBorder,
  },
  quizCardIncorrectFlash: {
    backgroundColor: colors.incorrectBackground,
    borderWidth: 2,
    borderColor: colors.incorrectBorder,
  },
  runningXPBadge: {
    alignSelf: "flex-end",
    backgroundColor: colors.gold100,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  runningXPText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.plum700,
  },
  feedbackCorrectContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  feedbackCorrectEmoji: {
    fontSize: fontSizes.xxl,
  },
  feedbackCorrectText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.correctText,
  },
  feedbackIncorrectContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  feedbackIncorrectEmoji: {
    fontSize: fontSizes.xxl,
  },
  feedbackIncorrectText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.incorrectText,
  },
  feedbackCorrectAnswer: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.correctText,
    textAlign: "center",
  },
  feedbackExplanation: {
    fontSize: fontSizes.md,
    color: colors.plum800,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: spacing.md,
  },
  gotItButton: {
    marginTop: spacing.sm,
  },
  xpPopup: {
    position: "absolute",
    right: spacing.md,
    top: 0,
  },
  xpPopupText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.gold500,
  },
  questionSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  progressBarContainer: {
    height: 6,
    marginVertical: spacing.md,
    borderRadius: 3,
    overflow: "hidden",
  },
  questionText: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    lineHeight: 30,
  },
  answerInput: {
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  rewardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.gold100,
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  rewardItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  rewardEmoji: {
    fontSize: fontSizes.xxl,
  },
  rewardText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.plum700,
  },
  levelUpText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.correctBorder,
  },
  scoreSummary: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  scoreTitle: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  scoreValue: {
    textAlign: "center",
    fontWeight: fontWeights.extrabold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  reviewTitle: {
    marginBottom: spacing.md,
    fontWeight: fontWeights.bold,
  },
  reviewCard: {
    marginBottom: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 4,
  },
  reviewCardCorrect: {
    borderLeftColor: colors.correctBorder,
    backgroundColor: colors.correctBackground,
  },
  reviewCardIncorrect: {
    borderLeftColor: colors.incorrectBorder,
    backgroundColor: colors.incorrectBackground,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  reviewIndex: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textTertiary,
  },
  reviewStatus: {
    fontSize: fontSizes.lg,
  },
  reviewQuestion: {
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  reviewAnswers: {
    gap: spacing.xs,
  },
  reviewAnswer: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  answerCorrect: {
    color: colors.correctText,
  },
  answerIncorrect: {
    color: colors.incorrectText,
  },
  correctAnswer: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.correctText,
  },
  explanation: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.plum800,
    lineHeight: 21,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
