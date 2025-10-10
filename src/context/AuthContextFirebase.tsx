import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, getUserProfile, UserProfile } from "../firebase/auth";
import { createUserProfile } from "../firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isBanned: boolean;
  banInfo: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    additionalData?: any
  ) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  syncEmailVerificationStatus: () => Promise<void>;
  forceUpdateVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<any>(null);

  const syncEmailVerificationStatus = async () => {
    try {
      if (!currentUser || !userProfile) {
        console.log("Sync: No currentUser or userProfile available");
        return;
      }

      console.log("Sync: Checking verification status:", {
        authVerified: currentUser.emailVerified,
        firestoreVerified: userProfile.isEmailVerified,
        userId: currentUser.uid,
      });

      // Check if Firebase Auth says email is verified but Firestore doesn't
      if (currentUser.emailVerified && !userProfile.isEmailVerified) {
        console.log(
          "Sync: Firebase Auth verified but Firestore not - updating Firestore"
        );
        await updateUserProfile({
          isEmailVerified: true,
        });
        console.log("Sync: Firestore update completed");
      } else {
        console.log("Sync: No sync needed - both statuses match");
      }
    } catch (error) {
      console.error("Error syncing email verification status:", error);
    }
  };

  // Force update verification status (for debugging)
  const forceUpdateVerification = async () => {
    try {
      if (!currentUser) {
        console.log("Force update: No currentUser available");
        return;
      }

      console.log(
        "Force update: Updating verification status for user:",
        currentUser.uid
      );
      await updateUserProfile({
        isEmailVerified: true,
      });
      console.log("Force update: Verification status updated successfully");
    } catch (error) {
      console.error("Force update error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      setCurrentUser(user);

      if (user) {
        try {
          let profile;
          try {
            profile = (await getUserProfile(user.uid)) as any;
          } catch (error: any) {
            // If profile doesn't exist or permissions error, create a default one
            if (
              error.code === "permission-denied" ||
              error.message.includes("not found")
            ) {
              console.log(
                "User profile not found or permission denied, creating default profile"
              );

              const defaultProfile = {
                id: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                profilePhoto: user.photoURL || "",
                bio: "",
                phone: "",
                instagram: "",
                twitter: "",
                facebook: "",
                snapchat: "",
                website: "",
                isEmailVerified: user.emailVerified || false,
                isActive: true,
                isAdmin: false,
                isOnline: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Create the user profile in Firestore
              await createUserProfile(user.uid, defaultProfile);
              profile = defaultProfile;
            } else {
              throw error;
            }
          }

          // Ensure profile has all required properties with defaults
          const fullProfile: UserProfile = {
            id: profile.id || user.uid,
            email: profile.email || user.email || "",
            displayName:
              profile.displayName ||
              profile.display_name ||
              user.displayName ||
              "",
            profilePhoto: profile.profilePhoto || profile.profile_photo,
            photos: profile.photos || [],
            bio: profile.bio,
            phone: profile.phone,
            instagram: profile.instagram,
            twitter: profile.twitter,
            facebook: profile.facebook,
            snapchat: profile.snapchat,
            website: profile.website,
            departmentId: profile.departmentId || profile.department_id,
            roleId: profile.roleId || profile.role_id,
            currentShipId: profile.currentShipId || profile.current_ship_id,
            isEmailVerified: (() => {
              const firestoreVerified = profile.isEmailVerified;
              const authVerified = user.emailVerified;
              // Prioritize Firebase Auth verification status
              const finalVerified = authVerified || firestoreVerified || false;
              console.log("🔍 AuthContext: Email verification status:", {
                firestoreVerified,
                authVerified,
                finalVerified,
                email: user.email,
                userId: user.uid,
              });
              return finalVerified;
            })(),
            isActive: profile.isActive ?? true,
            isAdmin: profile.isAdmin ?? false,
            isOnline: profile.isOnline ?? false,
            isBanned: profile.isBanned ?? false,
            banReason: profile.banReason,
            banExpiresAt: profile.banExpiresAt,
            isDeleted: profile.isDeleted ?? false,
            deleteReason: profile.deleteReason,
            deletedAt: profile.deletedAt,
            createdAt: profile.createdAt || profile.created_at,
            updatedAt: profile.updatedAt || profile.updated_at,
          };
          setUserProfile(fullProfile);

          // Check if user is banned, deactivated, or deleted
          if (
            fullProfile &&
            (fullProfile.isBanned ||
              !fullProfile.isActive ||
              fullProfile.isDeleted)
          ) {
            setIsBanned(true);
            if (fullProfile.isDeleted) {
              setBanInfo({
                reason: "Account deleted",
                message:
                  fullProfile.deleteReason ||
                  "Your account has been deleted by an administrator.",
                banExpiresAt: fullProfile.deletedAt,
              });
              // Automatically sign out deleted users
              console.log("🚪 User account deleted, signing out...");
              await logout();
              return;
            } else if (fullProfile.isBanned) {
              setBanInfo({
                reason: fullProfile.banReason || "Account banned",
                message:
                  "Your account has been banned. Please contact support for more information.",
                banExpiresAt: fullProfile.banExpiresAt,
              });
            } else {
              setBanInfo({
                reason: "Account deactivated",
                message:
                  "Your account has been deactivated. Please contact support.",
              });
            }
          } else {
            setIsBanned(false);
            setBanInfo(null);
          }

          // Sync email verification status after profile is loaded
          if (user && profile) {
            console.log("🔄 AuthContext: Setting up sync for user:", user.uid);
            // Use a longer delay to ensure all state is properly set
            setTimeout(() => {
              console.log("🔄 AuthContext: Running sync after delay");
              syncEmailVerificationStatus();
            }, 2000); // Increased delay to ensure profile is set
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setIsBanned(false);
        setBanInfo(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { signInWithEmail } = await import("../firebase/auth");
      await signInWithEmail(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    additionalData?: any
  ) => {
    try {
      const { signUpWithEmail } = await import("../firebase/auth");
      await signUpWithEmail(email, password, displayName, additionalData);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (!currentUser) {
        throw new Error("No user logged in");
      }
      const { signOutUser } = await import("../firebase/auth");
      await signOutUser(currentUser.uid);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { resetPassword: resetPasswordFn } = await import(
        "../firebase/auth"
      );
      await resetPasswordFn(email);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!currentUser) {
        throw new Error("No user logged in");
      }

      const { updateUserProfile: updateProfile } = await import(
        "../firebase/auth"
      );
      await updateProfile(currentUser.uid, updates);

      // Update local state
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    isBanned,
    banInfo,
    signIn,
    signUp,
    signOut,
    logout,
    resetPassword,
    updateUserProfile,
    syncEmailVerificationStatus,
    forceUpdateVerification,
  };

  // Make force update available globally for debugging
  React.useEffect(() => {
    (window as any).forceUpdateVerification = forceUpdateVerification;
    (window as any).syncEmailVerificationStatus = syncEmailVerificationStatus;
  }, [forceUpdateVerification, syncEmailVerificationStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
