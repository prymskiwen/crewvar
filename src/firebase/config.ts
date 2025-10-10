/**
 * Firebase Configuration
 * 
 * Centralized Firebase setup with proper environment variable handling
 * and emulator support for development.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
        try {
          this._app = initializeApp(firebaseConfig, 'default');
        } catch (secondError) {
          console.error("❌ Second Firebase initialization attempt failed:", secondError);
          throw secondError;
        }
      }
    }
    return this._app;
  }

  public get auth(): Auth {
    if (!this._auth) {
      this._auth = getAuth(this.app);
      
      // Set up authentication persistence
      try {
        setPersistence(this._auth, browserLocalPersistence).then(() => {
          console.log('✅ Firebase Auth persistence set to local storage');
        }).catch((error) => {
          console.warn('⚠️ Failed to set auth persistence:', error);
        });
      } catch (error) {
        console.warn('⚠️ Auth persistence setup failed:', error);
      }
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

        // Ensure app is initialized first
        const app = this.app;
        this._database = getDatabase(app);
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

export default app;
