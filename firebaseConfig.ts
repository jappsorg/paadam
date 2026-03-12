/**
 * Firebase Configuration
 *
 * Using Firebase Web SDK for cross-platform compatibility
 * Supports: Authentication, Firestore, Storage, Functions
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAleLSJrJIMKc4M7ZrWepvNOfQzEabR1hI",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "paadam-e5807.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "paadam-e5807",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "paadam-e5807.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "165060975319",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:165060975319:web:e84496b3b810e9edbbee92",
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PFQ5EGC93V",
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("[Firebase] Initialized successfully");
} else {
  app = getApp();
  console.log("[Firebase] Using existing app instance");
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Enable Firestore offline persistence
import { enableIndexedDbPersistence } from "firebase/firestore";

// Enable persistence (with error handling for browsers that don't support it)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn(
      "[Firestore] Multiple tabs open, persistence can only be enabled in one tab at a time.",
    );
  } else if (err.code === "unimplemented") {
    console.warn(
      "[Firestore] The current browser does not support persistence.",
    );
  }
});

export default app;
