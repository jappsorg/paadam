import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@/theme';

const DOMAINS = [
  { id: 'money', label: 'Money', emoji: '💰', color: '#F59E0B' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳', color: '#EF4444' },
  { id: 'time', label: 'Time', emoji: '⏰', color: '#3B82F6' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🥗', color: '#10B981' },
  { id: 'shopping', label: 'Shopping', emoji: '🛒', color: '#8B5CF6' },
  { id: 'environment', label: 'Nature', emoji: '🌿', color: '#059669' },
];

interface LifeSkillBadgesProps {
  exposure: Record<string, { timesExposed: number; engagementScore?: number }>;
}

export function LifeSkillBadges({ exposure }: LifeSkillBadgesProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.title}>Life Skills</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
        {DOMAINS.map((domain) => {
          const data = exposure[domain.id];
          const isUnlocked = data && data.timesExposed > 0;
          return (
            <View key={domain.id} style={[styles.badge, isUnlocked && { borderColor: domain.color }]}>
              <Text style={[styles.badgeEmoji, !isUnlocked && styles.badgeLocked]}>
                {isUnlocked ? domain.emoji : '?'}
              </Text>
              <Text style={[styles.badgeLabel, isUnlocked && { color: domain.color }]}>
                {isUnlocked ? domain.label : '???'}
              </Text>
              {isUnlocked && (
                <Text style={[styles.badgeCount, { color: domain.color }]}>
                  {data.timesExposed}x
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, paddingHorizontal: 16 },
  title: { fontWeight: '700', color: colors.textSecondary, marginBottom: 12 },
  badgeRow: { gap: 12, paddingRight: 16 },
  badge: {
    width: 72,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeLocked: { opacity: 0.3 },
  badgeLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, textAlign: 'center' },
  badgeCount: { fontSize: 10, fontWeight: '700', marginTop: 2 },
});
