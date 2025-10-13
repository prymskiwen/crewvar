/**
 * Firebase Authentication Module
 *
 * Provides authentication functions and user management utilities
 * for the CrewVar application.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  // UserCredential type available but not used in current implementation
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
// UserProfile is defined locally in this file

// Re-export auth for convenience
export { auth };

// Re-export getUserProfile from firestore
export { getUserProfile } from "./firestore";

/**
 * User profile interface for Firestore documents
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePhoto?: string;
  photos?: string[];
  bio?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
  website?: string;
  departmentId?: string;
  roleId?: string;
  currentShipId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isOnline?: boolean;
  isAdmin: boolean;
  isBanned?: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  isDeleted?: boolean;
  deleteReason?: string;
  deletedAt?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Listen to authentication state changes
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Sign in with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated user
 * @throws Firebase auth error if sign-in fails
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userRef = doc(db, "users", userCredential.user.uid);
    await updateDoc(userRef, {
      isOnline: true,
      updatedAt: new Date(),
    });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign up with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @param displayName - User's display name
 * @param additionalData - Optional additional user data
 * @returns Promise resolving to the authenticated user
 * @throws Firebase auth error if sign-up fails
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  additionalData?: {
    departmentId?: string;
    roleId?: string;
    currentShipId?: string;
  }
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // Send email verification with custom action URL
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verification-pending`,
      handleCodeInApp: false,
    };

    console.log(
      "🔍 Sending email verification with settings:",
      actionCodeSettings
    );
    console.log("🔍 Current origin:", window.location.origin);

    await sendEmailVerification(user, actionCodeSettings);
    console.log("✅ Email verification sent successfully");

    // Create user document in Firestore
    const userData: Partial<UserProfile> = {
      id: user.uid,
      email: user.email!,
      displayName,
      isEmailVerified: false,
      isActive: true,
      isAdmin: false,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add optional fields if they have values
    if (additionalData?.departmentId) {
      userData.departmentId = additionalData.departmentId;
    }
    if (additionalData?.roleId) {
      userData.roleId = additionalData.roleId;
    }
    if (additionalData?.currentShipId) {
      userData.currentShipId = additionalData.currentShipId;
    }

    // Filter out undefined, null, and empty string values
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(
        ([_, value]) => value !== undefined && value !== "" && value !== null
      )
    );

    await setDoc(doc(db, "users", user.uid), cleanUserData);

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with Google OAuth
 *
 * @returns Promise resolving to the authenticated user
 * @throws Firebase auth error if sign-in fails
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    let credential;
    if (Capacitor.isNativePlatform()) {
      // ✅ Native Google sign-in (for Android/iOS)
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication.idToken;
      credential = GoogleAuthProvider.credential(idToken);
    } else {
      // ✅ Fallback for Web Browser
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      credential = GoogleAuthProvider.credentialFromResult(result);
    }

    // Sign in with Firebase
    const userCredential = await signInWithCredential(auth, credential!);
    const user = userCredential.user;

    // ✅ Save or update user in Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create user document for new Google user
      const userData: Partial<UserProfile> = {
        id: user.uid,
        email: user.email!,
        displayName: user.displayName || "",
        isEmailVerified: true,
        isActive: true,
        isAdmin: false,
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only add profilePhoto if it exists
      if (user.photoURL) {
        userData.profilePhoto = user.photoURL;
      }

      // Filter out undefined, null, and empty string values
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(
          ([_, value]) => value !== undefined && value !== "" && value !== null
        )
      );

      await setDoc(doc(db, "users", user.uid), cleanUserData);
    }

    await updateDoc(userRef, {
      isOnline: true,
      updatedAt: new Date(),
    });
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out the current user
 *
 * @throws Firebase auth error if sign-out fails
 */
export const signOutUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline: false,
      updatedAt: new Date(),
    });
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Send password reset email
 *
 * @param email - Email address to send reset link to
 * @throws Firebase auth error if email sending fails
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile in Firestore
 *
 * @param userId - User ID to update
 * @param updates - Partial user profile data to update
 * @throws Firebase error if update fails
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};
