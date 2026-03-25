/**
 * Firebase Configuration
 *
 * Using Firebase Web SDK for cross-platform compatibility
 * Supports: Authentication, Firestore
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from "firebase/firestore";

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

// Initialize Firestore with persistent local cache (replaces deprecated enableIndexedDbPersistence)
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
