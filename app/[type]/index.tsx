import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Text,
  SegmentedButtons,
  Switch,
  useTheme,
  TextInput, // Added TextInput
  Title,
  Paragraph,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import auth from '@react-native-firebase/auth'; // Added auth
import WorksheetService from "../../services/WorksheetService"; // For generation
import UserWorksheetService from "../../services/UserWorksheetService"; // For attempts
import { WorksheetPreview } from "../../components/WorksheetPreview";
import {
  type WorksheetConfig,
  type Worksheet,
  type WorksheetDifficulty,
  type WorksheetType,
  type StudentWorksheetAttempt, // Added
  type WorksheetQuestion, // Added
  WORKSHEET_GRADE_OPTIONS,
  MATH_SUBJECT_OPTIONS,
  WORKSHEET_DIFFICULTIES,
  DEFAULT_QUESTIONS_COUNT,
  WORKSHEET_TYPE_LABELS,
} from "../../types/worksheet";
// Removed StorageService

export default function WorksheetGeneratorScreen() {
  const { type } = useLocalSearchParams<{ type: WorksheetType }>();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null); // For generated worksheet preview

  // New state variables for attempts
  const [activeAttempt, setActiveAttempt] = useState<StudentWorksheetAttempt | null>(null);
  const [studentAnswersMap, setStudentAnswersMap] = useState<{ [questionId: string]: string }>({});
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);


  const [config, setConfig] = useState<WorksheetConfig>({
    type: type || "math",
    subject: "Addition",
    grade: "K",
    difficulty: "easy",
    questionsCount: DEFAULT_QUESTIONS_COUNT,
    includeAnswers: false, // Should be false by default for attempts
  });

  const handleGenerate = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWorksheet(null); // Clear previous worksheet
      setActiveAttempt(null); // Clear previous attempt
      setStudentAnswersMap({});
      setSubmissionMessage(null);

      // Ensure includeAnswers is false when generating for an attempt
      const generationConfig = { ...config, includeAnswers: false };
      const generatedWorksheet = await WorksheetService.generateWorksheet(generationConfig);

      setWorksheet(generatedWorksheet);
      // Removed StorageService.addWorksheetToHistory(generatedWorksheet);
    } catch (err) {
      setError("Failed to generate worksheet. Please try again.");
      console.error("Worksheet generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const handleStartAttempt = async () => {
    if (!worksheet) {
      setError("No worksheet generated to start an attempt.");
      return;
    }
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setError("You must be logged in to start an attempt.");
      // Potentially navigate to login screen
      return;
    }

    setLoading(true);
    setError(null);
    setSubmissionMessage(null);
    try {
      // Optionally save the generated worksheet first if it's meant to be a persistent "master" copy
      // For now, we assume `worksheet` object is self-contained for the attempt
      // const savedWorksheet = await UserWorksheetService.saveGeneratedWorksheet(worksheet);
      // const attempt = await UserWorksheetService.startWorksheetAttempt(savedWorksheet);

      // Directly use the client-generated worksheet for the attempt
      const attempt = await UserWorksheetService.startWorksheetAttempt(worksheet);
      setActiveAttempt(attempt);
      setStudentAnswersMap({}); // Initialize empty answers
      setWorksheet(null); // Hide the preview/start button once attempt begins
    } catch (err: any) {
      setError(err.message || "Failed to start worksheet attempt.");
      console.error("Start attempt error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setStudentAnswersMap(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAnswers = async () => {
    if (!activeAttempt) {
      setError("No active attempt to submit.");
      return;
    }
    setLoading(true);
    setError(null);
    setSubmissionMessage(null);

    try {
      const studentAnswersArray = activeAttempt.questions.map(q => {
        const studentAnswer = studentAnswersMap[q.id] || "";
        let isCorrect = false;
        if (q.answer) { // Ensure question has an answer defined
          // Simple case-insensitive comparison, extend as needed
          isCorrect = studentAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
        }
        return {
          questionId: q.id,
          answer: studentAnswer,
          isCorrect: isCorrect,
        };
      });

      const score = studentAnswersArray.filter(sa => sa.isCorrect).length;
      const maxScore = activeAttempt.questions.length;

      await UserWorksheetService.updateStudentWorksheetAttempt(activeAttempt.id, {
        studentAnswers: studentAnswersArray,
        score: score,
        maxScore: maxScore,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // Update local state to show results/completion
      setActiveAttempt(prev => prev ? ({
        ...prev,
        studentAnswers: studentAnswersArray,
        score,
        maxScore,
        status: 'completed',
        completedAt: new Date().toISOString()
      }) : null);

      setSubmissionMessage(`Attempt submitted! Your score: ${score}/${maxScore}`);
      // Optionally, navigate away or clear activeAttempt after a delay
      // For now, we keep activeAttempt to display results.

    } catch (err: any) {
      setError(err.message || "Failed to submit answers.");
      console.error("Submit answers error:", err);
    } finally {
      setLoading(false);
    }
  };


  // --- Existing utility functions (formatWorksheetContent, updateConfig, etc.) ---
  // formatWorksheetContent and formatWorksheetContentAsHTML might be less relevant for active attempt UI
  // but could be used for a review screen later.

  const updateConfig = React.useCallback(
    (newConfig: Partial<WorksheetConfig>) => {
      setConfig((prevConfig) => ({ ...prevConfig, ...newConfig }));
      setWorksheet(null); // Clear worksheet preview when config changes
      setActiveAttempt(null); // Clear active attempt
      setSubmissionMessage(null);
    },
    []
  );

  useEffect(() => {
    if (type) {
      updateConfig({ type });
      setWorksheet(null);
      setActiveAttempt(null);
      setSubmissionMessage(null);
    }
  }, [type, updateConfig]);


  // --- UI Rendering Logic ---
  if (loading && !activeAttempt && !worksheet) { // Initial loading for generation
    return (
      <SafeAreaView style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" />
        <Text>Generating Worksheet...</Text>
      </SafeAreaView>
    );
  }

  // Active Attempt UI
  if (activeAttempt) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title={activeAttempt.worksheetTitle} subtitle={`Status: ${activeAttempt.status.toUpperCase()}`} />
            <Card.Content>
              {activeAttempt.status === 'completed' && submissionMessage && (
                <View style={styles.submissionMessageContainer}>
                  <Title style={styles.submissionMessageTitle}>Attempt Completed!</Title>
                  <Paragraph style={styles.submissionMessageText}>Score: {activeAttempt.score}/{activeAttempt.maxScore}</Paragraph>
                  <Button mode="outlined" onPress={() => { setActiveAttempt(null); setWorksheet(null); setSubmissionMessage(null); }} style={{marginTop: 10}}>
                    Generate New Worksheet
                  </Button>
                </View>
              )}

              {activeAttempt.status !== 'completed' && activeAttempt.questions.map((q, index) => (
                <View key={q.id} style={styles.questionContainer}>
                  <Text variant="titleMedium">{`${index + 1}. ${q.question}`}</Text>
                  {q.answer && <Text style={styles.correctAnswerDebug}> (Ans: {q.answer})</Text>}
                  <TextInput
                    label="Your Answer"
                    value={studentAnswersMap[q.id] || ""}
                    onChangeText={(text) => handleAnswerChange(q.id, text)}
                    style={styles.input}
                    disabled={activeAttempt.status === 'completed' || loading}
                  />
                </View>
              ))}
              {error && <Text style={styles.error}>{error}</Text>}
              {activeAttempt.status === 'in-progress' && (
                <Button
                  mode="contained"
                  onPress={handleSubmitAnswers}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                >
                  Submit Answers
                </Button>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Worksheet Generation Config and Preview UI
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title
            title={`Configure ${WORKSHEET_TYPE_LABELS[config.type]}`}
            titleVariant="headlineMedium"
          />
          <Card.Content>
            {/* --- Config Items (Grade, Subject, Difficulty, etc.) --- */}
            {/* This part is largely unchanged from original, ensure updateConfig clears worksheet & activeAttempt */}
            <View style={styles.configItem}>
              <Text variant="titleMedium">Grade Level</Text>
              <View style={styles.buttonGroup} key={config.grade}>
                {WORKSHEET_GRADE_OPTIONS.map((grade) => (
                  <Button
                    key={grade.id}
                    mode={config.grade === grade.id ? "outlined" : "text"}
                    onPress={() => updateConfig({ grade: grade.id })}
                    style={[ styles.buttonInGroup, config.grade === grade.id ? styles.buttonInGroupSelected : {}]}
                  >
                    <Text>{grade.label}</Text>
                  </Button>
                ))}
              </View>
            </View>

            {(config.type === "math" || config.type === "word-problem" || config.type === "puzzle") && (
              <View style={styles.configItem}>
                <Text variant="titleMedium">Subject</Text>
                <View style={styles.buttonGroup} key={config.subject}>
                  {MATH_SUBJECT_OPTIONS.map((subject) => (
                    <Button
                      key={subject.id}
                      mode={config.subject === subject.id ? "outlined" : "text"}
                      onPress={() => updateConfig({ subject: subject.id })}
                       style={[ styles.buttonInGroup, config.subject === subject.id ? styles.buttonInGroupSelected : {}]}
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
                onValueChange={(difficulty) => updateConfig({ difficulty: difficulty as WorksheetDifficulty })}
                buttons={WORKSHEET_DIFFICULTIES.map((level) => ({ value: level.id, label: level.label }))}
              />
            </View>

            <View style={styles.configItem}>
              <Text variant="titleMedium">Number of Questions</Text>
              <SegmentedButtons
                value={config.questionsCount.toString()}
                onValueChange={(value) => updateConfig({ questionsCount: parseInt(value) })}
                buttons={["5", "10", "15"].map((count) => ({ value: count, label: count.toString() }))}
              />
            </View>

            {/* Removed "Include Answers" switch as it's not relevant for student attempts directly from this screen */}

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleGenerate}
              loading={loading && !worksheet} // Show loading on generate button only when not already showing worksheet
              disabled={loading}
              style={styles.actionButton} // Changed from generateButton for consistency
            >
              Generate Worksheet
            </Button>
          </Card.Content>
        </Card>

        {worksheet && !activeAttempt && ( // Show preview only if worksheet exists and no active attempt
          <Card style={styles.card}>
            <Card.Title title="Worksheet Preview" />
            <Card.Content>
              <Text variant="bodyMedium">
                Generated: {worksheet.title} with {worksheet.questions.length} questions.
              </Text>
              <Text style={styles.previewInstructions}>
                Scroll down to see a preview of the questions. You can start this worksheet if you are logged in.
              </Text>
              {/* Simple text preview for now, WorksheetPreview component could be used if adapted */}
              {worksheet.questions.slice(0, 3).map((q, i) => ( // Preview first 3 questions
                 <Text key={q.id} style={styles.previewQuestionText}>{`${i+1}. ${q.question}`}</Text>
              ))}
              {worksheet.questions.length > 3 && <Text style={styles.previewQuestionText}>...and more.</Text>}

              {error && <Text style={styles.error}>{error}</Text>}
              <Button
                mode="elevated"
                onPress={handleStartAttempt}
                loading={loading}
                disabled={loading || !auth().currentUser}
                style={styles.actionButton}
                icon="play-circle-outline"
              >
                {auth().currentUser ? "Start This Worksheet" : "Login to Start Worksheet"}
              </Button>
               <Button
                mode="text"
                onPress={() => setWorksheet(null)}
                disabled={loading}
                style={styles.actionButton}
              >
                Close Preview
              </Button>
            </Card.Content>
          </Card>
        )}
        {submissionMessage && !activeAttempt && ( // Show message if submission happened and then attempt cleared
             <Card style={styles.card}><Card.Content><Text>{submissionMessage}</Text></Card.Content></Card>
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
  input: { // For TextInput in attempt mode
    marginTop: 8,
    backgroundColor: 'white', // Or theme specific
  },
  actionButton: { // Renamed from generateButton for broader use
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
  buttonInGroupSelected: { // Style for selected button in a group
     borderWidth: 1, // Changed from 2
     borderColor: "#007bff", // Example primary color
  },
  error: {
    color: "red", // useTheme().colors.error might be better
    textAlign: "center",
    marginVertical: 8,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  questionContainer: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0', // theme.colors.outline
    borderRadius: 8, // theme.roundness
  },
  previewInstructions: {
    marginVertical: 8,
    fontStyle: 'italic',
  },
  previewQuestionText: {
    marginTop: 4,
  },
  correctAnswerDebug: { // For debugging, remove in production
    fontSize: 10,
    color: 'gray',
  },
  submissionMessageContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#e6ffed', // Light green background
    borderRadius: 8,
  },
  submissionMessageTitle: {
    color: '#006400', // Dark green
  },
  submissionMessageText: {
     color: '#006400', // Dark green
     marginTop: 8,
  }
});
