import { WorksheetMode } from './worksheet';
import { colors } from '@/theme';

export interface ModeConfig {
  id: WorksheetMode;
  title: string;
  subtitle: string;
  icon: string;
  emoji: string;
  accentColor: string;
  lightColor: string;
  characterMood: 'encouraging' | 'excited' | 'thinking';
}

export const MODE_CONFIGS: Record<WorksheetMode, ModeConfig> = {
  practice: {
    id: 'practice',
    title: 'Practice',
    subtitle: 'Get stronger at what you know',
    icon: 'target',
    emoji: '🎯',
    accentColor: colors.gold500,
    lightColor: colors.gold50,
    characterMood: 'encouraging',
  },
  explore: {
    id: 'explore',
    title: 'Explore',
    subtitle: 'Discover something new!',
    icon: 'compass-outline',
    emoji: '🧭',
    accentColor: colors.teal400,
    lightColor: colors.teal50,
    characterMood: 'excited',
  },
  challenge: {
    id: 'challenge',
    title: 'Challenge',
    subtitle: 'Build your own worksheet',
    icon: 'lightning-bolt',
    emoji: '⚡',
    accentColor: colors.violet400,
    lightColor: colors.violet50,
    characterMood: 'thinking',
  },
};

export const MODE_ORDER: WorksheetMode[] = ['practice', 'explore', 'challenge'];
