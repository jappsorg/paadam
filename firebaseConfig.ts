// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAleLSJrJIMKc4M7ZrWepvNOfQzEabR1hI",
  authDomain: "paadam-e5807.firebaseapp.com",
  projectId: "paadam-e5807",
  storageBucket: "paadam-e5807.firebasestorage.app",
  messagingSenderId: "165060975319",
  appId: "1:165060975319:web:e84496b3b810e9edbbee92",
  measurementId: "G-PFQ5EGC93V",
};

// Initialize Firebase
initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

//export const auth = getAuth(app);
//export const db = getFirestore(app);
