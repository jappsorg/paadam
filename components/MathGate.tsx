/**
 * MathGate - Parent authentication via math problem
 *
 * Presents a dynamic math problem that adults can solve easily
 * but young kids cannot. Used to gate parent-only features.
 */

import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";

interface MathGateProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

function generateProblem(): { question: string; answer: number } {
  const ops = [
    () => {
      const a = Math.floor(Math.random() * 50) + 20;
      const b = Math.floor(Math.random() * 40) + 15;
      return { question: `${a} + ${b}`, answer: a + b };
    },
    () => {
      const a = Math.floor(Math.random() * 50) + 40;
      const b = Math.floor(Math.random() * 30) + 10;
      return { question: `${a} - ${b}`, answer: a - b };
    },
    () => {
      const a = Math.floor(Math.random() * 8) + 4;
      const b = Math.floor(Math.random() * 8) + 3;
      return { question: `${a} × ${b}`, answer: a * b };
    },
  ];
  return ops[Math.floor(Math.random() * ops.length)]();
}

export default function MathGate({ visible, onSuccess, onCancel }: MathGateProps) {
  const [answer, setAnswer] = useState("");
  const [shakeAnim] = useState(new Animated.Value(0));
  const [error, setError] = useState(false);

  const problem = useMemo(() => generateProblem(), [visible]);

  const handleSubmit = () => {
    if (parseInt(answer.trim()) === problem.answer) {
      setAnswer("");
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setAnswer("");
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: false }),
      ]).start();
    }
  };

  const handleCancel = () => {
    setAnswer("");
    setError(false);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.lockEmoji}>{"\uD83D\uDD12"}</Text>
          <Text style={styles.title}>Grown-Ups Only</Text>
          <Text style={styles.subtitle}>Solve this to continue</Text>

          <View style={styles.problemContainer}>
            <Text style={styles.problem}>{problem.question} = ?</Text>
          </View>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              setError(false);
            }}
            keyboardType="number-pad"
            placeholder="Your answer"
            placeholderTextColor={colors.textDisabled}
            autoFocus
            onSubmitEditing={handleSubmit}
          />

          {error && (
            <Text style={styles.errorText}>Not quite — try again!</Text>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !answer.trim() && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!answer.trim()}
            >
              <Text style={styles.submitText}>Enter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  lockEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  problemContainer: {
    backgroundColor: colors.violet50,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  problem: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    color: colors.violet500,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.xl,
    textAlign: "center",
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputError: {
    borderColor: colors.coral400,
  },
  errorText: {
    color: colors.coral400,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.sand100,
    alignItems: "center",
  },
  cancelText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.teal400,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
