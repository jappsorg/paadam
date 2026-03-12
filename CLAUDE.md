# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npx expo start          # Start dev server (press i for iOS, a for Android, w for web)
npx expo run:ios        # Build and run on iOS
npx expo run:android    # Build and run on Android
npx expo start --web    # Start web dev server
npx expo lint           # Run ESLint
jest --watchAll         # Run tests in watch mode
jest path/to/test       # Run a single test file
```

## Architecture

**Paadam** is an AI-powered worksheet generator for K-5 students, built with Expo (React Native) + TypeScript + Firebase + Claude AI.

### Routing & Navigation

File-based routing via Expo Router with typed routes enabled. Tab navigation (Home, History, Profile) defined in `app/_layout.tsx`. Dynamic routes: `app/[type]/index.tsx` (worksheet generator by type), `app/attempt/[userWorksheetId].tsx` (worksheet attempt view).

### Auth Flow

`context/AuthContext.tsx` provides global auth state. Supports email/password and Google OAuth via Firebase. `components/navigation/AppNavigator.tsx` handles conditional rendering: unauthenticated → onboarding → main app.

### Service Layer

Services use singleton (`WorksheetService.getInstance()`) or static method patterns:

- **WorksheetService** — AI worksheet generation using Vercel AI SDK (`ai` package) with Claude Haiku. Uses Zod schemas for structured output validation.
- **StorageService** — Firestore CRUD for worksheets, attempts, history.
- **AuthService** — Firebase auth operations (email, Google, password reset).
- **StudentProfileService** — Student profile management and progress tracking.

### Data Models

Core types in `types/worksheet.ts`: `WorksheetType` (math/puzzle/word-problem/logic), `WorksheetGrade` (K-5), `WorksheetDifficulty` (easy/medium/hard). Adaptive learning types in `types/adaptive-learning.ts` define student profiles, skill mastery, learning sessions, character systems, and achievements.

### Key Conventions

- **Path alias:** `@/*` maps to project root (configured in `tsconfig.json`)
- **Environment variables:** All use `EXPO_PUBLIC_` prefix (see `.env.example`)
- **UI framework:** React Native Paper (Material Design 3), theme in `theme.ts`
- **Firebase config:** `firebaseConfig.ts` initializes auth, Firestore (with offline persistence), storage, functions
- **Logging:** Console logs prefixed with `[FeatureName]` for debugging
- **Constants:** App-wide constants and model enums in `constants.ts`
