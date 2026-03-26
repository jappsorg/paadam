import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ModeConfig } from '@/types/modes';
import { colors } from '@/theme';

interface ModeCardProps {
  mode: ModeConfig;
  characterEmoji?: string;
  characterMessage?: string;
  onPress?: () => void;
}

export function ModeCard({ mode, characterEmoji, characterMessage, onPress }: ModeCardProps) {
  const router = useRouter();
  const isHighlighted = !!characterEmoji;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/${mode.id}` as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        isHighlighted && { borderColor: mode.accentColor, borderWidth: 2 },
      ]}
    >
      {isHighlighted && characterMessage && (
        <View style={[styles.speechBubble, { backgroundColor: mode.lightColor }]}>
          <Text variant="bodySmall" style={{ color: mode.accentColor }}>
            {characterEmoji} {characterMessage}
          </Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={[styles.accentStrip, { backgroundColor: mode.accentColor }]} />

        <View style={[styles.iconCircle, { backgroundColor: mode.lightColor }]}>
          <Text style={styles.iconEmoji}>{mode.emoji}</Text>
        </View>

        <View style={styles.textContent}>
          <Text variant="titleMedium" style={[styles.title, { color: mode.accentColor }]}>
            {mode.title}
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {mode.subtitle}
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  speechBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accentStrip: {
    width: 5,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconEmoji: {
    fontSize: 28,
  },
  textContent: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
