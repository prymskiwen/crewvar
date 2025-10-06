import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserProfile, UserProfile } from '../firebase/auth';
import { createUserProfile } from '../firebase/firestore';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isBanned: boolean;
    banInfo: any;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string, additionalData?: any) => Promise<void>;
    signOut: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    let profile;
                    try {
                        profile = await getUserProfile(user.uid) as any;
                    } catch (error: any) {
                        // If profile doesn't exist or permissions error, create a default one
                        if (error.code === 'permission-denied' || error.message.includes('not found')) {
                            console.log('User profile not found or permission denied, creating default profile');

                            const defaultProfile = {
                                id: user.uid,
                                email: user.email || '',
                                displayName: user.displayName || '',
                                profilePhoto: user.photoURL || '',
                                bio: '',
                                phone: '',
                                instagram: '',
                                twitter: '',
                                facebook: '',
                                snapchat: '',
                                website: '',
                                isEmailVerified: user.emailVerified || false,
                                isActive: true,
                                isAdmin: false,
                                createdAt: new Date(),
                                updatedAt: new Date()
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
                        email: profile.email || user.email || '',
                        displayName: profile.displayName || profile.display_name || user.displayName || '',
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
                        isEmailVerified: profile.isEmailVerified ?? user.emailVerified ?? false,
                        isActive: profile.isActive ?? true,
                        isAdmin: profile.isAdmin ?? false,
                        isBanned: profile.isBanned ?? false,
                        banReason: profile.banReason,
                        banExpiresAt: profile.banExpiresAt,
                        isDeleted: profile.isDeleted ?? false,
                        deleteReason: profile.deleteReason,
                        deletedAt: profile.deletedAt,
                        createdAt: profile.createdAt || profile.created_at,
                        updatedAt: profile.updatedAt || profile.updated_at
                    };
                    setUserProfile(fullProfile);

                    // Check if user is banned, deactivated, or deleted
                    if (fullProfile && (fullProfile.isBanned || !fullProfile.isActive || fullProfile.isDeleted)) {
                        setIsBanned(true);
                        if (fullProfile.isDeleted) {
                            setBanInfo({
                                reason: 'Account deleted',
                                message: fullProfile.deleteReason || 'Your account has been deleted by an administrator.',
                                banExpiresAt: fullProfile.deletedAt
                            });
                            // Automatically sign out deleted users
                            console.log('🚪 User account deleted, signing out...');
                            await logout();
                            return;
                        } else if (fullProfile.isBanned) {
                            setBanInfo({
                                reason: fullProfile.banReason || 'Account banned',
                                message: 'Your account has been banned. Please contact support for more information.',
                                banExpiresAt: fullProfile.banExpiresAt
                            });
                        } else {
                            setBanInfo({
                                reason: 'Account deactivated',
                                message: 'Your account has been deactivated. Please contact support.'
                            });
                        }
                    } else {
                        setIsBanned(false);
                        setBanInfo(null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
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
            const { signInWithEmail } = await import('../firebase/auth');
            await signInWithEmail(email, password);
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName: string, additionalData?: any) => {
        try {
            const { signUpWithEmail } = await import('../firebase/auth');
            await signUpWithEmail(email, password, displayName, additionalData);
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { signOutUser } = await import('../firebase/auth');
            await signOutUser();
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await signOut();
    };

    const resetPassword = async (email: string) => {
        try {
            const { resetPassword: resetPasswordFn } = await import('../firebase/auth');
            await resetPasswordFn(email);
        } catch (error) {
            throw error;
        }
    };

    const updateUserProfile = async (updates: Partial<UserProfile>) => {
        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            const { updateUserProfile: updateProfile } = await import('../firebase/auth');
            await updateProfile(currentUser.uid, updates);

            // Update local state
            setUserProfile(prev => prev ? { ...prev, ...updates } : null);
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
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
