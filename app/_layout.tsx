import { Tabs } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import theme from "@/theme";
import { AuthProvider } from "../context/AuthContext"; // Added AuthProvider import

export default function AppLayout() {
  return (
    <AuthProvider>
      {" "}
      {/* Added AuthProvider */}
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="auto" />
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: theme.colors.text,
              tabBarInactiveTintColor: theme.colors.placeholder,
              tabBarLabelStyle: {
                fontSize: 12,
              },
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.backdrop,
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="home"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="[type]/index"
              initialParams={{ type: "math" }}
              options={{
                title: "Worksheet",
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="file-document"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="history"
              options={{
                // href: null, // enable history
                title: "History",
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="history"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="profile" // New Profile Tab
              options={{
                title: "Profile",
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          </Tabs>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider> // Closed AuthProvider
  );
}
