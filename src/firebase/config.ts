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

// Validate required fields
if (!firebaseConfig.apiKey) {
  console.error('❌ VITE_FIREBASE_API_KEY is missing or undefined');
}
if (!firebaseConfig.projectId) {
  console.error('❌ VITE_FIREBASE_PROJECT_ID is missing or undefined');
}

// Debug Firebase configuration
console.log('🔧 Firebase Configuration Debug:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
  databaseURL: firebaseConfig.databaseURL ? '✅ Set' : '❌ Missing'
});

// Check if we're in development mode
if (import.meta.env.DEV) {
  console.log('🔧 Development mode detected - Firebase services may be limited');
  console.log('📝 Environment variables:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing'
  });
}

/**
 * Firebase singleton instance to prevent multiple initializations
 */
class FirebaseSingleton {
  private static instance: FirebaseSingleton;
  private _app: FirebaseApp | null = null;
  private _auth: Auth | null = null;
  private _db: Firestore | null = null;
  private _storage: FirebaseStorage | null = null;
  private _functions: Functions | null = null;
  private _database: Database | null = null;

  private constructor() { }

  public static getInstance(): FirebaseSingleton {
    if (!FirebaseSingleton.instance) {
      FirebaseSingleton.instance = new FirebaseSingleton();
    }
    return FirebaseSingleton.instance;
  }

  public get app(): FirebaseApp {
    if (!this._app) {
      try {
        this._app = initializeApp(firebaseConfig);
      } catch (error) {
        console.error("❌ Firebase initialization failed:", error);

        // If app already exists, get the existing instance
        this._app = initializeApp(firebaseConfig, 'default');
      }
    }
    return this._app;
  }

  public get auth(): Auth {
    if (!this._auth) {
      this._auth = getAuth(this.app);
    }
    return this._auth;
  }

  public get db(): Firestore {
    if (!this._db) {
      this._db = getFirestore(this.app);
    }
    return this._db;
  }

  public get storage(): FirebaseStorage | null {
    if (!this._storage) {
      try {
        // Check if storage bucket is configured
        if (!firebaseConfig.storageBucket) {
          console.warn('⚠️ Firebase Storage bucket not configured - storage will be disabled');
          return null;
        }
        this._storage = getStorage(this.app);
        console.log('✅ Firebase Storage initialized successfully');
      } catch (error) {
        console.warn('⚠️ Firebase Storage is not available:', error);
        return null;
      }
    }
    return this._storage;
  }

  public get functions(): Functions | null {
    if (!this._functions) {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          console.warn('⚠️ Firebase Functions not available in server environment');
          return null;
        }
        this._functions = getFunctions(this.app);
        console.log('✅ Firebase Functions initialized successfully');
      } catch (error) {
        console.warn('⚠️ Firebase Functions is not available:', error);
        return null;
      }
    }
    return this._functions;
  }

  public get database(): Database | null {
    if (!this._database) {
      try {
        // Check if database URL is configured
        if (!firebaseConfig.databaseURL) {
          console.warn('⚠️ Firebase Realtime Database URL not configured - database will be disabled');
          return null;
        }
        this._database = getDatabase(this.app);
        console.log('✅ Firebase Realtime Database initialized successfully');
      } catch (error) {
        console.warn('⚠️ Firebase Realtime Database is not available:', error);
        return null;
      }
    }
    return this._database;
  }

  public cleanup(): void {
    // Clean up listeners and connections
    if (this._auth) {
      // Firebase Auth doesn't need explicit cleanup
    }
    if (this._db) {
      // Firestore listeners are automatically cleaned up
    }
    if (this._storage) {
      // Storage doesn't need explicit cleanup
    }
    if (this._functions) {
      // Functions don't need explicit cleanup
    }
    if (this._database) {
      // Realtime Database listeners are automatically cleaned up
    }
  }
}

// Get singleton instance
const firebaseInstance = FirebaseSingleton.getInstance();

// Export services
export const auth: Auth = firebaseInstance.auth;
export const db: Firestore = firebaseInstance.db;
export const storage: FirebaseStorage | null = firebaseInstance.storage;
export const functions: Functions | null = firebaseInstance.functions;
export const database: Database | null = firebaseInstance.database;
export const app: FirebaseApp = firebaseInstance.app;

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
