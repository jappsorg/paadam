import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorksheetCard, worksheetTemplates } from "../components/WorksheetCard";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Select a worksheet type
          </Text>
        </View>

        {worksheetTemplates.map((worksheet) => (
          <WorksheetCard key={worksheet.id} worksheet={worksheet} />
        ))}
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
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
  },
  historyButton: {
    marginLeft: 16,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    opacity: 0.7,
  },
});
