import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, ActivityIndicator } from "react-native";
import { Text, Button, Card, Paragraph, Title } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { onGoogleButtonPress, signOut, getCurrentUser } from "../services/AuthService"; // Assuming default export if not already
import { WorksheetCard, worksheetTemplates } from "../components/WorksheetCard";

export default function HomeScreen() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (loading) {
        setLoading(false);
      }
    });
    // Initialize user state without waiting for onAuthStateChanged if already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
    return subscriber; // unsubscribe on unmount
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await onGoogleButtonPress();
      // onAuthStateChanged will handle setting the user
    } catch (error: any) {
      console.error("SignIn Error:", error);
      setAuthError(error.message || "Failed to sign in. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOut();
      // onAuthStateChanged will handle setting the user to null
    } catch (error: any) {
      console.error("SignOut Error:", error);
      setAuthError(error.message || "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" />
        <Text style={styles.messageText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {user ? (
          <View style={styles.authContainer}>
            <Card style={styles.card}>
              <Card.Content>
                <Title>Welcome, {user.displayName || 'User'}</Title>
                <Paragraph>{user.email}</Paragraph>
                {authError && <Text style={styles.errorText}>{authError}</Text>}
                <Button mode="contained" onPress={handleSignOut} style={styles.button}>
                  Sign Out
                </Button>
              </Card.Content>
            </Card>

            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.title}>
                Select a worksheet type
              </Text>
            </View>
            {worksheetTemplates.map((worksheet) => (
              <WorksheetCard key={worksheet.id} worksheet={worksheet} />
            ))}
          </View>
        ) : (
          <View style={styles.authContainerCentered}>
            <Text variant="headlineMedium" style={styles.title}>
              Please Sign In
            </Text>
            {authError && <Text style={styles.errorText}>{authError}</Text>}
            <Button mode="contained" onPress={handleGoogleSignIn} style={styles.button} icon="google">
              Sign in with Google
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
    padding: 16,
  },
  authContainer: {
    padding: 16,
  },
  authContainerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 300, // Ensure it takes some space
  },
  card: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  messageText: {
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16, // Added padding top if user is logged in
    paddingBottom: 8,
  },
  title: {
    // flex: 1, // Removed to allow centering in logged out view
    textAlign: 'center',
    marginBottom: 10,
  },
  historyButton: { // This style was present but not used in the original code snippet for HomeScreen
    marginLeft: 16,
  },
  subtitle: { // This style was present but not used in the original code snippet for HomeScreen
    paddingHorizontal: 16,
    paddingBottom: 8,
    opacity: 0.7,
  },
});
