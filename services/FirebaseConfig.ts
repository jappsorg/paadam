import firebase from '@react-native-firebase/app';

// No explicit initialization with config object is needed here for most cases,
// as @react-native-firebase relies on the native configuration files.
// This file can be used to export the firebase instance or specific services.

if (!firebase.apps.length) {
  console.log('Firebase App has not been initialized yet');
} else {
  console.log('Firebase App initialized successfully');
}

export default firebase;
