import { Tabs } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import theme, { colors, fontSizes, fontWeights } from "@/theme";
import { AuthProvider } from "../context/AuthContext";
import AppNavigator from "../components/navigation/AppNavigator";

export default function AppLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="dark" />
          <AppNavigator>
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: colors.coral400,
                tabBarInactiveTintColor: colors.plum400,
                tabBarLabelStyle: {
                  fontSize: fontSizes.xs,
                  fontWeight: fontWeights.semibold,
                },
                tabBarStyle: {
                  backgroundColor: colors.surfaceElevated,
                  borderTopColor: colors.borderLight,
                  borderTopWidth: 1,
                  paddingTop: 4,
                  height: 64,
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
                name="profile"
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
              <Tabs.Screen
                name="insights"
                options={{
                  title: "Progress",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons
                      name="chart-line"
                      size={size}
                      color={color}
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="attempt/[userWorksheetId]"
                options={{
                  href: null,
                  headerShown: false,
                }}
              />
              <Tabs.Screen
                name="theme-picker/index"
                options={{
                  href: null,
                  headerShown: false,
                }}
              />
            </Tabs>
          </AppNavigator>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
