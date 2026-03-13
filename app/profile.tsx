import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { ScreenContainer, LoadingState, EmptyState } from "@/components/ui";
import { colors, spacing, radii, fontSizes, fontWeights, shadows } from "@/theme";

export default function ProfileScreen() {
  const { currentUser, isLoading, signInWithGoogle, signOut } = useAuth();

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  if (isLoading) {
    return (
      <ScreenContainer noScroll>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (!currentUser) {
    return (
      <ScreenContainer noScroll>
        <EmptyState
          emoji={"\u{1F44B}"}
          title="Welcome!"
          subtitle="Sign in to save your work and see how much you've learned!"
          actionLabel="Sign In with Google"
          onAction={handleGoogleSignIn}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            {currentUser.photoURL ? (
              <Avatar.Image
                size={96}
                source={{ uri: currentUser.photoURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(currentUser.displayName || "U")[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.displayName}>
            {currentUser.displayName || "Explorer"}
          </Text>
          <Text style={styles.email}>{currentUser.email}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.coral50 }]}>
            <Text style={styles.statEmoji}>{"\uD83C\uDFAF"}</Text>
            <Text style={styles.statLabel}>Worksheets</Text>
            <Text style={[styles.statValue, { color: colors.coral500 }]}>--</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.teal50 }]}>
            <Text style={styles.statEmoji}>{"\u2B50"}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
            <Text style={[styles.statValue, { color: colors.teal500 }]}>--</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.violet50 }]}>
            <Text style={styles.statEmoji}>{"\uD83C\uDFC6"}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
            <Text style={[styles.statValue, { color: colors.violet500 }]}>--</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>{"\uD83D\uDEAA"}  Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  avatar: {
    borderWidth: 3,
    borderColor: colors.coral400,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.coral400,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.coral300,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: fontWeights.extrabold,
    color: colors.white,
  },
  displayName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  email: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.xl,
    gap: spacing.xs,
  },
  statEmoji: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.extrabold,
  },
  signOutButton: {
    backgroundColor: colors.sand100,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  signOutText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
});
