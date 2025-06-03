import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import {
  Button,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
  TextInput,
  ProgressBar,
  Dialog,
  Portal,
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
import { WorksheetQuestion } from "../../types/worksheet"; // Assuming WorksheetQuestion is here
import { serverTimestamp } from "@react-native-firebase/firestore";

type UserAnswerInput = {
  questionId: string;
  answer: string;
};

export default function AttemptWorksheetScreen() {
  const { userWorksheetId } = useLocalSearchParams<{
    userWorksheetId: string;
  }>();
  const { currentUser, isLoading: authLoading } = useAuth();
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
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const loadWorksheet = useCallback(async () => {
    if (!userWorksheetId) {
      setError("Worksheet ID is missing.");
      setIsLoading(false);
      return;
    }
    if (!currentUser) {
      setError("Please log in to attempt worksheets.");
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
          setShowResultsDialog(true); // If already completed, show results
        } else {
          // Find first unanswered question or start from 0
          let startIndex = initialAnswers.findIndex((ans) => !ans.answer);
          setCurrentQuestionIndex(startIndex !== -1 ? startIndex : 0);
          setCurrentAnswer(
            initialAnswers[startIndex !== -1 ? startIndex : 0]?.answer || ""
          );
        }
      } else {
        setError("Worksheet not found.");
      }
    } catch (err) {
      console.error("Failed to load worksheet:", err);
      setError("Failed to load the worksheet. Please try again.");
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
  };

  const handlePreviousQuestion = () => {
    if (!worksheet || currentQuestionIndex <= 0) return; // Add null check for worksheet
    saveCurrentAnswer();
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setCurrentAnswer(
      userAnswers.find(
        (a) => a.questionId === worksheet.questions[prevIndex].id
      )?.answer || ""
    );
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
          answer: userAnswerObj?.answer || "",
          isCorrect: q.answer !== undefined ? isCorrect : undefined, // Only mark if correct answer exists
          attemptsCount: worksheetAttempt
            ? worksheetAttempt.questionsAttemptData.length + 1
            : 1,
          status: "answered",
        };
      }
    );

    const calculatedScore = (score / worksheet.questions.length) * 100;
    setFinalScore(calculatedScore);

    try {
      await StorageService.updateWorksheetAttempt(userWorksheetId, {
        status: "completed",
        score: calculatedScore,
        questionsAttemptData: processedUserAnswers,
        completedAt: serverTimestamp() as any, // Cast to any
      });
      setShowResultsDialog(true);
    } catch (err) {
      console.error("Failed to submit worksheet:", err);
      setError("Failed to submit your answers. Please try again.");
      Alert.alert(
        "Error",
        "Could not submit your worksheet. Please check your connection and try again."
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
        <Text>Worksheet data is not available.</Text>
      </SafeAreaView>
    );
  }

  const currentQ: WorksheetQuestion | undefined =
    worksheet.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / worksheet.questions.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                // Add more props like keyboardType if needed based on question type
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
                Submit Worksheet
              </Button>
            )}
          </Card.Actions>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog
          visible={showResultsDialog}
          onDismiss={() => {
            setShowResultsDialog(false);
            router.back();
          }}
        >
          <Dialog.Title>Worksheet Results</Dialog.Title>
          <Dialog.Content>
            <Text
              variant="headlineMedium"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
              Your Score: {finalScore.toFixed(0)}%
            </Text>
            <Text>You have completed the worksheet "{worksheet.title}".</Text>
            {/* TODO: Optionally show a more detailed breakdown of answers here */}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowResultsDialog(false);
                router.replace("/history");
              }}
            >
              View History
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowResultsDialog(false);
                router.back();
              }}
            >
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
});
