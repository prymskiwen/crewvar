import { ref, set, onValue, push, onDisconnect, update, getDatabase } from 'firebase/database';
import { app } from './config';

// Helper function to get database instance (lazy initialization)
const getDatabaseInstance = () => {
    console.log('🔍 Debug: Getting database instance...');
    console.log('🔍 Environment VITE_FIREBASE_DATABASE_URL:', import.meta.env.VITE_FIREBASE_DATABASE_URL);

    // Check if database URL is configured
    if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) {
        console.error('❌ VITE_FIREBASE_DATABASE_URL is not set in environment variables');
        throw new Error('Firebase Realtime Database is not configured. Please set VITE_FIREBASE_DATABASE_URL in your environment variables.');
    }

    try {
        // Get database instance directly from the app
        const dbInstance = getDatabase(app);
        console.log('🔍 Database instance:', dbInstance);

        if (!dbInstance) {
            console.error('❌ Database is null/undefined');
            throw new Error('Firebase Realtime Database is not configured. Please set VITE_FIREBASE_DATABASE_URL in your environment variables.');
        }

        console.log('✅ Database is available');
        return dbInstance;
    } catch (error) {
        console.error('❌ Failed to get database instance:', error);
        throw new Error('Firebase Realtime Database is not configured. Please set VITE_FIREBASE_DATABASE_URL in your environment variables.');
    }
};

// Types for Realtime Database
export interface TypingIndicator {
    isTyping: boolean;
    timestamp: number;
    userId: string;
    userName: string;
}

export interface PresenceStatus {
    status: 'online' | 'offline' | 'away';
    lastSeen: number;
    userId: string;
    userName: string;
}

export interface LiveNotification {
    id: string;
    type: 'message' | 'connection_request' | 'system';
    title: string;
    message: string;
    userId: string;
    roomId?: string;
    timestamp: number;
    read: boolean;
}

// Typing Indicators
export const setTypingIndicator = async (roomId: string, userId: string, userName: string, isTyping: boolean) => {
    try {
        const database = getDatabaseInstance();
        const typingRef = ref(database, `typing/${roomId}/${userId}`);
        if (isTyping) {
            await set(typingRef, {
                isTyping: true,
                timestamp: Date.now(),
                userId,
                userName
            });

            // Auto-remove typing indicator after 3 seconds
            setTimeout(() => {
                set(typingRef, null);
            }, 3000);
        } else {
            await set(typingRef, null);
        }
    } catch (error) {
        console.error('Error setting typing indicator:', error);
        // Don't throw the error, just log it to prevent app crashes
        // This allows the app to continue working even if real-time features are unavailable
    }
};

export const subscribeToTypingIndicators = (roomId: string, callback: (typingUsers: TypingIndicator[]) => void) => {
    try {
        const database = getDatabaseInstance();
        const typingRef = ref(database, `typing/${roomId}`);

        const unsubscribe = onValue(typingRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const typingUsers: TypingIndicator[] = Object.values(data).filter(
                    (user: any) => user && user.isTyping && Date.now() - user.timestamp < 5000
                ) as TypingIndicator[];
                callback(typingUsers);
            } else {
                callback([]);
            }
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to typing indicators:', error);
        // Return a no-op function that can be called safely
        return () => {
            console.log('📝 Typing indicators subscription disabled due to database unavailability');
        };
    }
};

// Online Presence
export const setUserPresence = async (userId: string, userName: string, status: 'online' | 'offline' | 'away' = 'online') => {
    try {
        const database = getDatabaseInstance();
        const presenceRef = ref(database, `presence/${userId}`);
        const userStatusRef = ref(database, `users/${userId}/status`);

        const presenceData = {
            status,
            lastSeen: Date.now(),
            userId,
            userName
        };

        // Set presence
        await set(presenceRef, presenceData);
        await set(userStatusRef, presenceData);

        // Set up disconnect handler
        const disconnectRef = ref(database, `presence/${userId}`);
        await onDisconnect(disconnectRef).set({
            status: 'offline',
            lastSeen: Date.now(),
            userId,
            userName
        });

        return presenceData;
    } catch (error) {
        console.error('Error setting user presence:', error);
        throw error;
    }
};

export const subscribeToUserPresence = (userId: string, callback: (presence: PresenceStatus | null) => void) => {
    try {
        const database = getDatabaseInstance();
        const presenceRef = ref(database, `presence/${userId}`);

        const unsubscribe = onValue(presenceRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as PresenceStatus);
            } else {
                callback(null);
            }
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to user presence:', error);
        return () => { }; // Return empty function as fallback
    }
};

export const subscribeToRoomPresence = (roomId: string, callback: (presenceList: PresenceStatus[]) => void) => {
    try {
        const database = getDatabaseInstance();
        const roomPresenceRef = ref(database, `roomPresence/${roomId}`);

        const unsubscribe = onValue(roomPresenceRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const presenceList: PresenceStatus[] = Object.values(data);
                callback(presenceList);
            } else {
                callback([]);
            }
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to room presence:', error);
        return () => { }; // Return empty function as fallback
    }
};

export const joinRoomPresence = async (roomId: string, userId: string, userName: string) => {
    try {
        const database = getDatabaseInstance();
        const roomPresenceRef = ref(database, `roomPresence/${roomId}/${userId}`);
        const userPresenceRef = ref(database, `presence/${userId}`);

        const presenceData = {
            status: 'online',
            lastSeen: Date.now(),
            userId,
            userName
        };

        await set(roomPresenceRef, presenceData);
        await set(userPresenceRef, presenceData);

        // Set up disconnect handler for room
        await onDisconnect(roomPresenceRef).remove();
        await onDisconnect(userPresenceRef).set({
            status: 'offline',
            lastSeen: Date.now(),
            userId,
            userName
        });

        return presenceData;
    } catch (error) {
        console.error('Error joining room presence:', error);
        throw error;
    }
};

export const leaveRoomPresence = async (roomId: string, userId: string) => {
    try {
        const database = getDatabaseInstance();
        const roomPresenceRef = ref(database, `roomPresence/${roomId}/${userId}`);
        await set(roomPresenceRef, null);
    } catch (error) {
        console.error('Error leaving room presence:', error);
    }
};

// Live Notifications
export const sendLiveNotification = async (
    userId: string,
    type: 'message' | 'connection_request' | 'system',
    title: string,
    message: string,
    roomId?: string
) => {
    try {
        const database = getDatabaseInstance();
        const notificationsRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationsRef);

        const notification: LiveNotification = {
            id: newNotificationRef.key!,
            type,
            title,
            message,
            userId,
            roomId,
            timestamp: Date.now(),
            read: false
        };

        await set(newNotificationRef, notification);
        return notification;
    } catch (error) {
        console.error('Error sending live notification:', error);
        throw error;
    }
};

export const subscribeToLiveNotifications = (userId: string, callback: (notifications: LiveNotification[]) => void) => {
    try {
        const database = getDatabaseInstance();
        const notificationsRef = ref(database, `notifications/${userId}`);

        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const notifications: LiveNotification[] = Object.values(data).sort(
                    (a: any, b: any) => b.timestamp - a.timestamp
                ) as LiveNotification[];
                callback(notifications);
            } else {
                callback([]);
            }
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to live notifications:', error);
        return () => { }; // Return empty function as fallback
    }
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
    try {
        const database = getDatabaseInstance();
        const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
        await update(notificationRef, { read: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

export const clearAllNotifications = async (userId: string) => {
    try {
        const database = getDatabaseInstance();
        const notificationsRef = ref(database, `notifications/${userId}`);
        await set(notificationsRef, null);
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
};

// Message typing integration
export const startTyping = (roomId: string, userId: string, userName: string) => {
    setTypingIndicator(roomId, userId, userName, true);
};

export const stopTyping = (roomId: string, userId: string) => {
    setTypingIndicator(roomId, userId, '', false);
};

// Cleanup functions
export const cleanupPresence = async (userId: string) => {
    try {
        const database = getDatabaseInstance();
        const presenceRef = ref(database, `presence/${userId}`);
        await set(presenceRef, null);
    } catch (error) {
        console.error('Error cleaning up presence:', error);
    }
};

export const cleanupRoomPresence = async (roomId: string, userId: string) => {
    try {
        const database = getDatabaseInstance();
        const roomPresenceRef = ref(database, `roomPresence/${roomId}/${userId}`);
        await set(roomPresenceRef, null);
    } catch (error) {
        console.error('Error cleaning up room presence:', error);
    }
};

// Test function to verify database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
    try {
        console.log('🧪 Testing database connection...');
        const database = getDatabaseInstance();
        const testRef = ref(database, 'test/connection');
        await set(testRef, { timestamp: Date.now() });
        await set(testRef, null); // Clean up
        console.log('✅ Database connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
};