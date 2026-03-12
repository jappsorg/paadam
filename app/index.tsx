import React from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorksheetCard, worksheetTemplates } from "../components/WorksheetCard";
import { useAuth } from "../context/AuthContext";
import { PlayerStats } from "../components/PlayerStats";

export default function HomeScreen() {
  const {
    currentUser,
    signOut,
    studentProfiles,
    selectedStudent,
    setSelectedStudent,
  } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "No, stay!", style: "cancel" },
        {
          text: "Yes, sign out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("[HomeScreen] Sign out error:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome{selectedStudent ? `, ${selectedStudent.name}` : ""}! 👋
            </Text>
            {selectedStudent && (
              <Text variant="bodyMedium" style={styles.subtitle}>
                Level {selectedStudent.level} • {selectedStudent.currentStreak}{" "}
                day streak 🔥
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Student Selector if multiple children */}
        {studentProfiles.length > 1 && (
          <View style={styles.studentSelector}>
            <Text variant="titleMedium" style={styles.selectorTitle}>
              Select Student:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {studentProfiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={[
                    styles.studentChip,
                    selectedStudent?.id === profile.id &&
                      styles.studentChipSelected,
                  ]}
                  onPress={() => setSelectedStudent(profile)}
                >
                  <Text
                    style={[
                      styles.studentChipText,
                      selectedStudent?.id === profile.id &&
                        styles.studentChipTextSelected,
                    ]}
                  >
                    {profile.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Player Stats */}
        {selectedStudent && <PlayerStats student={selectedStudent} />}

        {/* Worksheets */}
        <View style={styles.worksheetSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            What do you want to practice?
          </Text>
          {worksheetTemplates.map((worksheet) => (
            <WorksheetCard key={worksheet.id} worksheet={worksheet} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E9ECEF",
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "600",
  },
  studentSelector: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: "#F8F9FA",
  },
  selectorTitle: {
    marginBottom: 12,
  },
  studentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#DEE2E6",
  },
  studentChipSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  studentChipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  studentChipTextSelected: {
    color: "#FFFFFF",
  },
  worksheetSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
});
