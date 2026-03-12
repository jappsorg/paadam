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
    title: "Math Practice",
    description: "Add, subtract, multiply and more!",
    icon: "\uD83D\uDD22",
  },
  {
    id: "puzzle",
    title: "Math Puzzles",
    description: "Solve fun number puzzles. Can you crack them all?",
    icon: "\uD83E\uDDE9",
  },
  {
    id: "word-problem",
    title: "Word Problems",
    description: "Use math to solve real stories!",
    icon: "\uD83D\uDCDD",
  },
  {
    id: "logic",
    title: "Brain Teasers",
    description: "Figure out tricky riddles using clues. Like a detective!",
    icon: "\uD83D\uDD75\uFE0F",
  },
];
