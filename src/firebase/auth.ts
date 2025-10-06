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
    // UserCredential type available but not used in current implementation
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
// UserProfile is defined locally in this file

// Re-export auth for convenience
export { auth };

// Re-export getUserProfile from firestore
export { getUserProfile } from './firestore';

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
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(user, { displayName });

        // Send email verification with custom action URL
        const actionCodeSettings = {
            url: `${window.location.origin}/auth/verify-email`,
            handleCodeInApp: true,
        };
        await sendEmailVerification(user, actionCodeSettings);

        // Create user document in Firestore
        const userData: Partial<UserProfile> = {
            id: user.uid,
            email: user.email!,
            displayName,
            isEmailVerified: false,
            isActive: true,
            isAdmin: false,
            createdAt: new Date(),
            updatedAt: new Date()
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
            Object.entries(userData).filter(([_, value]) =>
                value !== undefined && value !== '' && value !== null
            )
        );

        await setDoc(doc(db, 'users', user.uid), cleanUserData);

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
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            // Create user document for new Google user
            const userData: Partial<UserProfile> = {
                id: user.uid,
                email: user.email!,
                displayName: user.displayName || '',
                isEmailVerified: true,
                isActive: true,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Only add profilePhoto if it exists
            if (user.photoURL) {
                userData.profilePhoto = user.photoURL;
            }

            // Filter out undefined, null, and empty string values
            const cleanUserData = Object.fromEntries(
                Object.entries(userData).filter(([_, value]) =>
                    value !== undefined && value !== '' && value !== null
                )
            );

            await setDoc(doc(db, 'users', user.uid), cleanUserData);
        }

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
export const signOutUser = async (): Promise<void> => {
    try {
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
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: new Date()
        });
    } catch (error) {
        throw error;
    }
};
