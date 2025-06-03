import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AuthService from "../services/AuthService";
import * as WebBrowser from "expo-web-browser";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";

// Ensure that we can complete the auth session on redirect for standalone apps
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  currentUser: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isGoogleSignInLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);

  const [request, response, promptAsync] = useIdTokenAuthRequest({
    clientId: "YOUR_EXPO_GO_OR_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  });

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChangedListener((user) => {
      setCurrentUser(user);
      setIsLoading(false);
      setIsGoogleSignInLoading(false); // Reset Google sign-in loading state
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        setIsGoogleSignInLoading(true); // Indicate that Firebase sign-in is in progress
        AuthService.signInWithGoogle(id_token)
          .then((user) => {
            // onAuthStateChanged will handle setting currentUser and isLoading
            if (!user) {
              // Handle case where Firebase sign-in fails after Google success
              console.error(
                "Firebase sign-in failed after Google auth success."
              );
              setIsGoogleSignInLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error signing in with Google credential:", error);
            setIsGoogleSignInLoading(false);
          });
      } else {
        console.warn("Google Sign-In success but no id_token received.");
        setIsGoogleSignInLoading(false);
      }
    } else if (response?.type === "error") {
      console.error("Google Sign-In error:", response.error);
      setIsGoogleSignInLoading(false);
    } else if (response?.type === "cancel" || response?.type === "dismiss") {
      console.log("Google Sign-In cancelled or dismissed by user.");
      setIsGoogleSignInLoading(false);
    }
  }, [response]);

  const signInWithGoogle = async (): Promise<void> => {
    if (isGoogleSignInLoading || isLoading) return; // Prevent multiple sign-in attempts

    setIsGoogleSignInLoading(true);
    try {
      await promptAsync(); // This will open the Google Sign-In prompt
      // The useEffect hook for 'response' will handle the result
    } catch (error: any) {
      // This catch block might catch errors from promptAsync itself, though most errors are in `response.error`
      console.error("Error prompting Google Sign-In:", error);
      if (error.code === "ERR_UNAVAILABLE") {
        alert(
          "Google Sign-In is not available on this device/platform. Ensure you have Google Play Services (Android) or a web browser (Web)."
        );
      }
      setIsGoogleSignInLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      // The onAuthStateChanged listener will update currentUser to null and isLoading
    } catch (error) {
      console.error("Error in AuthContext signOut:", error);
      setIsLoading(false); // Ensure loading is false on error
    }
  };

  const value = {
    currentUser,
    isLoading, // General auth loading state
    signInWithGoogle,
    signOut,
    isGoogleSignInLoading, // Specific to Google interactive sign-in process
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children immediately; loading states can be used by components */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
