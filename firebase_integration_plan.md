# Firebase Integration Plan for "paadam" App

**Project Goal:** Integrate Firebase into the "paadam" app for backend services, including Google Sign-In, Cloud Firestore for data storage (user profiles, worksheets, progress, scores), and enhance worksheet functionality with interactive attempts and scoring.

**Key Phases & Features:**

## Phase 1: Firebase Setup & Authentication

- **Firebase Project Configuration:**
  - Ensure your Firebase project (`paadam-e5807`) has **Cloud Firestore** enabled and set up with appropriate security rules (initially, rules can be permissive for development, e.g., `allow read, write: if request.auth != null;`).
  - In Firebase Authentication, enable the **Google Sign-In** provider. Ensure you've added the necessary SHA-1 fingerprints for your Android app in the Firebase console if you haven't already.
- **Update Firebase SDKs in App:**
  - Modify `firebaseConfig.ts`:
    - Import `getAuth` from `"firebase/auth"`.
    - Import `getFirestore` from `"firebase/firestore"`.
    - Initialize and export `auth` and `db` (Firestore instance).
- **Authentication Service (`services/AuthService.ts` - New File):**
  - Create a new service to handle all authentication logic.
  - Functions: `signInWithGoogle()`, `signOut()`, `onAuthStateChangedListener(callback)`, `getCurrentUser()`, `ensureUserInFirestore(user)`.
- **User Context/Global State:**
  - Implement a React Context (e.g., `AuthContext`) to provide the current user state and authentication functions throughout the app.
  - The `AuthContext` provider will wrap the main app layout in `app/_layout.tsx`.
- **New "Profile" Tab & Screen:**
  - Modify `app/_layout.tsx` to add a new `Tabs.Screen` for "Profile".
  - Create `app/profile.tsx` for login/logout and user info.

## Phase 2: Firestore Data Models & Storage Logic

- **Firestore Collections:**
  - **`users`**: Document ID: `user.uid`. Fields: `email`, `displayName`, `photoURL`, `createdAt`.
  - **`userWorksheets`**: Document ID: Auto-generated. Fields: `userId`, `worksheetTitle`, `config`, `questions`, `status` ("generated", "attempted", "completed"), `score` (optional), `createdAt`, `lastAttemptedAt` (optional), `completedAt` (optional), `userAnswers` (optional).
- **Update `services/StorageService.ts`:**
  - Refactor methods to interact with Firestore, requiring `userId`.
  - Methods: `getWorksheetHistory(userId)`, `addWorksheetToHistory(userId, worksheetData)`, `updateWorksheetStatus(userId, userWorksheetId, status, score, userAnswers)`, `deleteWorksheet(userId, userWorksheetId)`, `clearHistory(userId)`, `getWorksheetById(userId, userWorksheetId)`.
- **Caching:**
  - Continue using AsyncStorage as a cache for recently accessed worksheets and user profile data.

## Phase 3: UI & Feature Integration

- **Worksheet Generation (`app/[type]/index.tsx`):**
  - Access `AuthContext` for `currentUser`.
  - On `handleGenerate`, if user is logged in, call `StorageService.addWorksheetToHistory` with appropriate data for Firestore.
- **History Screen (`app/history.tsx`):**
  - Enable the tab in `app/_layout.tsx`.
  - Fetch and display user-specific worksheet history from Firestore via `StorageService.getWorksheetHistory`.
  - Allow "View/Re-attempt" (navigating to interactive attempt screen) and "Delete" actions.
- **Interactive Worksheets (`app/attempt/[userWorksheetId].tsx` - New Screen):**
  - **Navigation:** From History screen's "Start/Resume Attempt".
  - **Data Fetching:** Load specific worksheet from Firestore using `StorageService.getWorksheetById`.
  - **UI:** Display question, input for answer, navigation (Next/Previous), progress.
  - **Submission:**
    - Calculate score by comparing user answers with correct answers.
    - Update status to "completed".
    - Call `StorageService.updateWorksheetStatus` to save progress, score, user answers, and timestamps.
  - **Results Display:** Show score and summary after submission.
  - **Resuming Attempts:** Pre-fill answers if resuming an "attempted" worksheet.

## Phase 4: Offline Support & Refinements

- **Firestore Offline Persistence:** Enable Firestore's built-in offline capabilities.
- **AsyncStorage Caching:** Refine strategy for caching user profile and recent worksheets.
- **Error Handling & User Feedback:** Implement robust error handling and clear user feedback for all Firebase operations.

## Mermaid Diagram (High-Level Flow)

```mermaid
graph TD
    subgraph User Interface
        A[App Start] --> AuthCtx{Auth State};
        AuthCtx -- No User --> ProfileTab[Profile Tab: Show Login];
        ProfileTab -- Google Sign-In --> AuthService[AuthService: signInWithGoogle];
        AuthCtx -- User Exists --> MainTabs[Main App Tabs: Home, Worksheet, History, Profile];

        MainTabs -- Generate Worksheet --> WSheetScreen[Worksheet Screen];
        WSheetScreen -- Save --> StorageSvc[StorageService: addWorksheet];

        MainTabs -- View History --> HistoryScreen[History Screen];
        HistoryScreen -- Load --> StorageSvc[StorageService: getHistory];
        HistoryScreen -- Start/Resume Attempt --> AttemptScreen[Attempt Worksheet Screen];

        AttemptScreen -- Load Worksheet --> StorageSvc;
        AttemptScreen -- Submit Attempt --> StorageSvc[StorageService: updateWorksheetStatus];
        AttemptScreen --> ResultsModal[Results Summary];

        MainTabs -- View Profile --> ProfileScreen[Profile Screen: User Info/Logout];
        ProfileScreen -- Sign Out --> AuthService[AuthService: signOut];
    end

    subgraph Backend & Services
        AuthService -- Firebase Auth --> FBAuth[Firebase Authentication];
        AuthService -- User Doc --> FirestoreUsers[Firestore: /users/{uid}];
        StorageSvc -- Worksheet Data --> FirestoreUserWS[Firestore: /userWorksheets/{docId}];
        StorageSvc <--> AsyncStorageCache[AsyncStorage (Cache)];
    end

    WSheetScreen --> WorksheetGenSvc[WorksheetService (Generation Logic)];

    style FBAuth fill:#FFCA28,stroke:#333,stroke-width:2px
    style FirestoreUsers fill:#64B5F6,stroke:#333,stroke-width:2px
    style FirestoreUserWS fill:#64B5F6,stroke:#333,stroke-width:2px
    style AsyncStorageCache fill:#AED581,stroke:#333,stroke-width:2px
```
