import {
    ref,
    set,
    get,
    onValue,
    onDisconnect,
    serverTimestamp,
    update
} from 'firebase/database';
import { database } from './config';

// Helper function to check if database is available
const checkDatabaseAvailability = (): boolean => {
    if (!database) {
        console.warn('⚠️ Firebase Realtime Database is not available');
        return false;
    }
    return true;
};

// Types
export interface OnlineUser {
    userId: string;
    userName: string;
    lastSeen: any;
    status: 'online' | 'away' | 'offline';
}

export interface TypingUser {
    userId: string;
    userName: string;
    roomId: string;
    timestamp: any;
}

// Online status management
export const setUserOnline = async (userId: string, userName: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const userStatusRef = ref(database!, `users/${userId}/status`);
        const userInfoRef = ref(database!, `users/${userId}/info`);

        await Promise.all([
            set(userStatusRef, {
                status: 'online',
                lastSeen: serverTimestamp()
            }),
            set(userInfoRef, {
                userName,
                lastSeen: serverTimestamp()
            })
        ]);

        // Set up disconnect handler
        const disconnectRef = ref(database!, `users/${userId}/status`);
        await onDisconnect(disconnectRef).set({
            status: 'offline',
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
};

export const setUserOffline = async (userId: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const userStatusRef = ref(database!, `users/${userId}/status`);
        await set(userStatusRef, {
            status: 'offline',
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
};

export const updateUserStatus = async (userId: string, status: 'online' | 'away' | 'offline') => {
    try {
        if (!checkDatabaseAvailability()) return;

        const userStatusRef = ref(database!, `users/${userId}/status`);
        await update(userStatusRef, {
            status,
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
};

// Get online users
export const getOnlineUsers = async (): Promise<OnlineUser[]> => {
    try {
        if (!checkDatabaseAvailability()) return [];

        const usersRef = ref(database!, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const users = snapshot.val();
            return Object.keys(users).map(userId => ({
                userId,
                userName: users[userId].info?.userName || 'Unknown User',
                lastSeen: users[userId].status?.lastSeen,
                status: users[userId].status?.status || 'offline'
            }));
        }

        return [];
    } catch (error) {
        throw error;
    }
};

// Subscribe to online users
export const subscribeToOnlineUsers = (callback: (users: OnlineUser[]) => void) => {
    if (!checkDatabaseAvailability()) {
        console.warn('⚠️ Cannot subscribe to online users - database not available');
        return () => { }; // Return empty unsubscribe function
    }

    const usersRef = ref(database!, 'users');

    const unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            const onlineUsers = Object.keys(users).map(userId => ({
                userId,
                userName: users[userId].info?.userName || 'Unknown User',
                lastSeen: users[userId].status?.lastSeen,
                status: users[userId].status?.status || 'offline'
            }));
            callback(onlineUsers);
        } else {
            callback([]);
        }
    });

    return unsubscribe;
};

// Chat room presence
export const joinChatRoom = async (roomId: string, userId: string, userName: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const roomPresenceRef = ref(database!, `rooms/${roomId}/participants/${userId}`);
        await set(roomPresenceRef, {
            userName,
            joinedAt: serverTimestamp()
        });

        // Set up disconnect handler
        await onDisconnect(roomPresenceRef).remove();
    } catch (error) {
        throw error;
    }
};

export const leaveChatRoom = async (roomId: string, userId: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const roomPresenceRef = ref(database!, `rooms/${roomId}/participants/${userId}`);
        await set(roomPresenceRef, null);
    } catch (error) {
        throw error;
    }
};

// Typing indicators
export const startTyping = async (roomId: string, userId: string, userName: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const typingRef = ref(database!, `rooms/${roomId}/typing/${userId}`);
        await set(typingRef, {
            userName,
            timestamp: serverTimestamp()
        });

        // Auto-remove typing indicator after 3 seconds
        setTimeout(() => {
            stopTyping(roomId, userId);
        }, 3000);
    } catch (error) {
        throw error;
    }
};

export const stopTyping = async (roomId: string, userId: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const typingRef = ref(database!, `rooms/${roomId}/typing/${userId}`);
        await set(typingRef, null);
    } catch (error) {
        throw error;
    }
};

// Subscribe to typing indicators
export const subscribeToTyping = (
    roomId: string,
    callback: (typingUsers: TypingUser[]) => void
) => {
    if (!checkDatabaseAvailability()) {
        console.warn('⚠️ Cannot subscribe to typing indicators - database not available');
        return () => { }; // Return empty unsubscribe function
    }

    const typingRef = ref(database!, `rooms/${roomId}/typing`);

    const unsubscribe = onValue(typingRef, (snapshot) => {
        if (snapshot.exists()) {
            const typingData = snapshot.val();
            const typingUsers = Object.keys(typingData).map(userId => ({
                userId,
                userName: typingData[userId].userName,
                roomId,
                timestamp: typingData[userId].timestamp
            }));
            callback(typingUsers);
        } else {
            callback([]);
        }
    });

    return unsubscribe;
};

// Subscribe to room participants
export const subscribeToRoomParticipants = (
    roomId: string,
    callback: (participants: { [userId: string]: { userName: string; joinedAt: any } }) => void
) => {
    if (!checkDatabaseAvailability()) {
        console.warn('⚠️ Cannot subscribe to room participants - database not available');
        return () => { }; // Return empty unsubscribe function
    }

    const participantsRef = ref(database!, `rooms/${roomId}/participants`);

    const unsubscribe = onValue(participantsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback({});
        }
    });

    return unsubscribe;
};

// Message delivery status
export const markMessageAsDelivered = async (roomId: string, messageId: string, userId: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const deliveryRef = ref(database!, `rooms/${roomId}/messages/${messageId}/delivered/${userId}`);
        await set(deliveryRef, {
            deliveredAt: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
};

export const markMessageAsRead = async (roomId: string, messageId: string, userId: string) => {
    try {
        if (!checkDatabaseAvailability()) return;

        const readRef = ref(database!, `rooms/${roomId}/messages/${messageId}/read/${userId}`);
        await set(readRef, {
            readAt: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
};

// Subscribe to message status
export const subscribeToMessageStatus = (
    roomId: string,
    messageId: string,
    callback: (status: { delivered: string[]; read: string[] }) => void
) => {
    if (!checkDatabaseAvailability()) {
        console.warn('⚠️ Cannot subscribe to message status - database not available');
        return () => { }; // Return empty unsubscribe function
    }

    const messageRef = ref(database!, `rooms/${roomId}/messages/${messageId}`);

    const unsubscribe = onValue(messageRef, (snapshot) => {
        if (snapshot.exists()) {
            const messageData = snapshot.val();
            callback({
                delivered: Object.keys(messageData.delivered || {}),
                read: Object.keys(messageData.read || {})
            });
        } else {
            callback({ delivered: [], read: [] });
        }
    });

    return unsubscribe;
};
