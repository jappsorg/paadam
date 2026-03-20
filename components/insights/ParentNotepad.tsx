import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, radii, fontSizes, fontWeights } from "@/theme";
import { ParentNote } from "@/types/parent-notes";

interface Props {
  notes: ParentNote[];
  onSaveNote: (text: string) => Promise<void>;
  saving: boolean;
}

export function ParentNotepad({ notes, onSaveNote, saving }: Props) {
  const [text, setText] = useState("");

  const handleSave = async () => {
    if (!text.trim()) return;
    await onSaveNote(text.trim());
    setText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Notes for the AI</Text>
      <Text style={styles.subtitle}>
        Share observations to help guide your child's learning path
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder='e.g., "Focus more on fractions" or "She loves dinosaur themes"'
          placeholderTextColor={colors.textDisabled}
          value={text}
          onChangeText={setText}
          maxLength={500}
          multiline
          numberOfLines={2}
          editable={!saving}
        />
        <TouchableOpacity
          style={[styles.saveButton, (!text.trim() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!text.trim() || saving}
        >
          <Text style={styles.saveButtonText}>{saving ? "..." : "Add"}</Text>
        </TouchableOpacity>
      </View>

      {notes.length > 0 && (
        <View style={styles.notesList}>
          {notes.map((note, i) => {
            const date = note.createdAt?.toDate?.()
              ? note.createdAt.toDate().toLocaleDateString()
              : "";
            return (
              <View key={note.id || i} style={styles.noteItem}>
                <Text style={styles.noteText}>"{note.text}"</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>{date}</Text>
                  {note.consumedByPlanner && (
                    <Text style={styles.consumedBadge}>Used by AI</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  inputRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceElevated,
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: colors.teal400,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.textOnPrimary, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  notesList: { marginTop: spacing.lg, gap: spacing.sm },
  noteItem: {
    padding: spacing.md,
    backgroundColor: colors.sand100,
    borderRadius: radii.lg,
  },
  noteText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontStyle: "italic" },
  noteFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xs },
  noteDate: { fontSize: fontSizes.xs, color: colors.textDisabled },
  consumedBadge: {
    fontSize: fontSizes.xs,
    color: colors.teal400,
    fontWeight: fontWeights.semibold,
  },
});
