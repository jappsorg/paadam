import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';

interface AdventureBannerProps {
  characterEmoji: string;
  arcTitle: string;
  currentBeat: number;
  totalBeats: number;
}

export function AdventureBanner({
  characterEmoji,
  arcTitle,
  currentBeat,
  totalBeats,
}: AdventureBannerProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/explore' as any)}
      style={({ pressed }) => [styles.banner, pressed && styles.bannerPressed]}
    >
      <Text style={styles.emoji}>{characterEmoji}</Text>
      <View style={styles.textContent}>
        <Text variant="titleSmall" style={styles.title}>
          Continue your adventure!
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {arcTitle} — Chapter {currentBeat} of {totalBeats}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.teal50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.teal300,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 16,
  },
  bannerPressed: {
    opacity: 0.85,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    color: colors.teal700,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.teal500,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: colors.teal400,
    fontWeight: '700',
  },
});
