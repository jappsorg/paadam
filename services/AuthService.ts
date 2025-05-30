import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

// Configure Google Sign-In
// IMPORTANT: Replace with your actual Web Client ID from Google Cloud Console / Firebase Project settings.
// The webClientId is typically of the format 'YOUR_PROJECT_NUMBER-xxxxxxxxxxxx.apps.googleusercontent.com'.
// Using project_number as a base since oauth_client was empty in google-services.json.
GoogleSignin.configure({
  webClientId: '165060975319.apps.googleusercontent.com',
});

export const onGoogleButtonPress = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a GoogleAuthProvider credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const result = await auth().signInWithCredential(googleCredential);
    const user = result.user;

    console.log('Firebase sign-in successful:', user.uid);

    // Check if the user is new
    if (result.additionalUserInfo?.isNewUser) {
      console.log('New user, creating Firestore document...');
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('User document created in Firestore for UID:', user.uid);
    }

    return user;
  } catch (error: any) {
    if (error.code) {
      console.error('Google Sign-In Error:', error.code, error.message);
    } else {
      console.error('Google Sign-In Error:', error);
    }
    throw error; // Re-throw the error for the caller to handle
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    await GoogleSignin.signOut();
    console.log('User signed out successfully from Firebase and Google.');
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth().currentUser;
};
