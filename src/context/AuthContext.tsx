import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "../app/api";

interface Props {
    children: ReactNode;
}

// User interface
interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAdmin?: boolean;
    getIdToken: () => Promise<string>;
    reload: () => Promise<void>;
}

interface IAuthContext {
  currentUser: User | null;
  isLoading: boolean;
  isBanned: boolean;
  banInfo: any;
  signIn: (email: string, password: string) => Promise<{ user: User }>;
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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
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
            
            const { token, user: userData } = response.data;
            
            // Store token
            localStorage.setItem('token', token);
            
            // Create user object
            const user: User = {
                uid: userData.userId || userData.id || 'unknown',
                email: userData.email,
                displayName: userData.displayName || userData.fullName || userData.email?.split('@')[0] || 'User',
                photoURL: userData.profilePhoto || userData.avatar || null,
                isAdmin: userData.isAdmin || false,
                getIdToken: async () => token,
                reload: async () => {
                    // Refresh user data from backend
                    try {
                        const userResponse = await api.get('/users/profile');
                        const updatedUser = userResponse.data.user; // Fixed: use response.data.user
                        setCurrentUser({
                            ...user,
                            displayName: updatedUser.display_name || user.displayName,
                            photoURL: updatedUser.profile_photo || user.photoURL,
                            isAdmin: updatedUser.is_admin || user.isAdmin
                        });
                    } catch (error) {
                        console.error('Failed to reload user:', error);
                    }
                }
            };
            
            setCurrentUser(user);
            return { user: user };
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
                    const userData = response.data.user; // Fixed: use response.data.user instead of response.data
                    
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

                    // Create user object with real data
                    const user: User = {
                        uid: userData.id, // Fixed: use userData.id instead of user.userId
                        email: userData.email,
                        displayName: userData.display_name || userData.email?.split('@')[0] || 'User', // Fixed: use display_name
                        photoURL: getFullPhotoUrl(userData.profile_photo),
                        isAdmin: userData.is_admin || false,
                        getIdToken: async () => token,
                        reload: async () => {
                            // User reload functionality
                        }
                    };
                    setCurrentUser(user);
                } catch (error) {
                    console.error('Failed to load user profile:', error);
                    // Fallback to basic user object
                    const fallbackUser: User = {
                        uid: 'current_user',
                        email: 'user@example.com',
                        displayName: 'User',
                        photoURL: null,
                        isAdmin: false,
                        getIdToken: async () => token,
                        reload: async () => {
                            // User reload functionality
                        }
                    };
                    setCurrentUser(fallbackUser);
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

        // Setting up ban notification listeners

        const handleUserBanned = (event: any) => {
            const data = event.detail;
            setIsBanned(true);
            setBanInfo({
                isBanned: true,
                isPermanent: data.permanent,
                expiresAt: data.expiresAt,
                message: data.message,
                reason: data.reason
            });
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