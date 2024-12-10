import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { Link } from "expo-router";
import { WorksheetType } from "@/types/worksheet";

type WorksheetTemplate = {
  id: WorksheetType;
  title: string;
  description: string;
  icon: string;
};

type WorksheetCardProps = {
  worksheet: WorksheetTemplate;
};

export const WorksheetCard: React.FC<WorksheetCardProps> = ({ worksheet }) => {
  const { id, title, description, icon } = worksheet;

  return (
    <Link href={`/${id}`} asChild>
      <Card style={styles.card}>
        <Card.Title
          title={title}
          left={(props) => <Text {...props}>{icon}</Text>}
        />
        <Card.Content>
          <Text variant="bodyMedium">{description}</Text>
        </Card.Content>
      </Card>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    marginBottom: 16,
    elevation: 4,
  },
});

export const worksheetTemplates: WorksheetTemplate[] = [
  {
    id: "math",
    title: "Math Worksheets",
    description: "Practice basic math operations with customized worksheets",
    icon: "🔢",
  },
  {
    id: "puzzle",
    title: "Math Puzzles",
    description: "Fun mathematical puzzles to enhance problem-solving skills",
    icon: "🧩",
  },
  {
    id: "word-problem",
    title: "Word Problems",
    description: "Math word problems for real-world problem solving",
    icon: "📝",
  },
  {
    id: "logic",
    title: "Logic Puzzles",
    description: "Brain teasers and logical reasoning problems",
    icon: "🧠",
  },
];
