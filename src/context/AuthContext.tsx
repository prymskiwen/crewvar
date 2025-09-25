import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "../app/api";

interface Props {
    children: ReactNode;
}

// Firebase-compatible User interface
interface FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAdmin?: boolean;
    getIdToken: () => Promise<string>;
    reload: () => Promise<void>;
}

interface IAuthContext {
  currentUser: FirebaseUser | null;
  isLoading: boolean;
  isBanned: boolean;
  banInfo: any;
  signIn: (email: string, password: string) => Promise<{ user: FirebaseUser }>;
  signOut: () => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
    currentUser: null,
    isLoading: true,
    isBanned: false,
    banInfo: null,
    signIn: async () => { throw new Error('Auth not initialized'); },
    signOut: () => {},
    logout: () => {}
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: Props) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isBanned, setIsBanned] = useState<boolean>(false);
    const [banInfo, setBanInfo] = useState<any>(null);

    const signIn = async (email: string, password: string) => {
        try {
            // Use backend authentication
            const response = await api.post('/auth/login', { email, password });
            
            // Check if user is banned
            if (response.status === 403 && response.data.banInfo) {
                setIsBanned(true);
                setBanInfo(response.data.banInfo);
                throw new Error(response.data.error || 'Account suspended');
            }
            
            const { token, user } = response.data;
            
            // Store token
            localStorage.setItem('token', token);
            
            // Create Firebase-compatible user object
            const firebaseUser: FirebaseUser = {
                uid: user.userId || user.id || 'unknown',
                email: user.email,
                displayName: user.displayName || user.fullName || user.email?.split('@')[0] || 'User',
                photoURL: user.profilePhoto || user.avatar || null,
                isAdmin: user.isAdmin || false,
                getIdToken: async () => token,
                reload: async () => {
                    // Refresh user data from backend
                    try {
                        const userResponse = await api.get('/users/profile');
                        const updatedUser = userResponse.data.user; // Fixed: use response.data.user
                        setCurrentUser({
                            ...firebaseUser,
                            displayName: updatedUser.display_name || firebaseUser.displayName,
                            photoURL: updatedUser.profile_photo || firebaseUser.photoURL,
                            isAdmin: updatedUser.is_admin || firebaseUser.isAdmin
                        });
                    } catch (error) {
                        console.error('Failed to reload user:', error);
                    }
                }
            };
            
            setCurrentUser(firebaseUser);
            return { user: firebaseUser };
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            localStorage.removeItem('token');
            setCurrentUser(null);
            setIsBanned(false);
            setBanInfo(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsBanned(false);
        setBanInfo(null);
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    // Get actual user profile from backend
                    const response = await api.get('/users/profile');
                    const user = response.data.user; // Fixed: use response.data.user instead of response.data
                    
                    // Construct full URL for profile photo
                    const getFullPhotoUrl = (photoUrl: string | null | undefined) => {
                        if (!photoUrl) return null;
                        if (photoUrl.startsWith('http')) return photoUrl; // Already a full URL
                        if (photoUrl.startsWith('/uploads/')) {
                            // Construct full URL using the API base URL
                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                            return `${baseUrl}${photoUrl}`;
                        }
                        return photoUrl; // Fallback
                    };

                    // Create Firebase-compatible user object with real data
                    const firebaseUser: FirebaseUser = {
                        uid: user.id, // Fixed: use user.id instead of user.userId
                        email: user.email,
                        displayName: user.display_name || user.email?.split('@')[0] || 'User', // Fixed: use display_name
                        photoURL: getFullPhotoUrl(user.profile_photo),
                        isAdmin: user.is_admin || false,
                        getIdToken: async () => token,
                        reload: async () => {
                            console.log('User reload called');
                        }
                    };
                    setCurrentUser(firebaseUser);
                    console.log('AuthContext initialized with user:', firebaseUser.uid);
                } catch (error) {
                    console.error('Failed to load user profile:', error);
                    // Fallback to basic user object
                    const firebaseUser: FirebaseUser = {
                        uid: 'current_user',
                        email: 'user@example.com',
                        displayName: 'User',
                        photoURL: null,
                        getIdToken: async () => token,
                        reload: async () => {
                            console.log('User reload called');
                        }
                    };
                    setCurrentUser(firebaseUser);
                }
            } else {
                setCurrentUser(null);
            }
            
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    // WebSocket handling for ban notifications
    useEffect(() => {
        if (!currentUser) return;

        console.log('🔌 Setting up ban notification listeners for user:', currentUser.uid);

        const handleUserBanned = (event: any) => {
            const data = event.detail;
            console.log('🚫 Account banned notification received:', data);
            console.log('🚫 Setting ban state...');
            setIsBanned(true);
            setBanInfo({
                isBanned: true,
                isPermanent: data.permanent,
                expiresAt: data.expiresAt,
                message: data.message,
                reason: data.reason
            });
            console.log('🚫 Ban state set successfully');
        };

        const handleUserUnbanned = (event: any) => {
            const data = event.detail;
            console.log('✅ Account unbanned notification received:', data);
            setIsBanned(false);
            setBanInfo(null);
            // Show success message or notification
            alert('Your account has been restored!');
        };

        // Listen for custom events
        window.addEventListener('userBanned', handleUserBanned);
        window.addEventListener('userUnbanned', handleUserUnbanned);

        return () => {
            window.removeEventListener('userBanned', handleUserBanned);
            window.removeEventListener('userUnbanned', handleUserUnbanned);
        };
    }, [currentUser]);

    const value = {
        currentUser,
        isLoading,
        isBanned,
        banInfo,
        signIn,
        signOut,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};