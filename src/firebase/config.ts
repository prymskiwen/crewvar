/**
 * Firebase Configuration
 * 
 * Centralized Firebase setup with proper environment variable handling
 * and emulator support for development.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { getDatabase, Database } from 'firebase/database';

/**
 * Firebase configuration object
 * All values are loaded from environment variables
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

/**
 * Initialize Firebase app
 */
const app: FirebaseApp = initializeApp(firebaseConfig);

/**
 * Initialize Firebase services
 */
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);
export const database: Database = getDatabase(app);

/**
 * Connect to Firebase emulators in development mode
 * 
 * @note Emulators are disabled by default to use production Firebase
 * Uncomment the code below to enable emulator connections
 */
/*
const connectToEmulators = (): void => {
  if (!import.meta.env.DEV) return;

  try {
    // Auth emulator
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }

    // Firestore emulator
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      console.log('Firestore emulator already connected or not available');
    }

    // Storage emulator
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
      console.log('Storage emulator already connected or not available');
    }

    // Functions emulator
    try {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (error) {
      console.log('Functions emulator already connected or not available');
    }

    // Realtime Database emulator
    try {
      connectDatabaseEmulator(database, 'localhost', 9000);
    } catch (error) {
      console.log('Database emulator already connected or not available');
    }
  } catch (error) {
    console.warn('Firebase emulator connection failed:', error);
  }
};

// Uncomment the line below to enable emulator connections
// connectToEmulators();
*/

export default app;
