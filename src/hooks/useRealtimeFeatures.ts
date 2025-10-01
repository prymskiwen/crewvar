import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextFirebase';
import {
    subscribeToTypingIndicators,
    setUserPresence,
    subscribeToRoomPresence,
    joinRoomPresence,
    leaveRoomPresence,
    sendLiveNotification,
    subscribeToLiveNotifications,
    markNotificationAsRead,
    startTyping,
    stopTyping,
    cleanupPresence,
    testDatabaseConnection,
    TypingIndicator,
    PresenceStatus,
    LiveNotification
} from '../firebase/realtime';

export const useRealtimeFeatures = (roomId?: string) => {
    const { currentUser } = useAuth();

    // Debug logging to track hook calls
    console.log('🔍 useRealtimeFeatures called with roomId:', roomId, 'currentUser:', !!currentUser);

    // All hooks must be called in the same order every time
    const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
    const [roomPresence, setRoomPresence] = useState<PresenceStatus[]>([]);
    const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    // Set user presence when component mounts
    useEffect(() => {
        if (!currentUser) return;

        const initializePresence = async () => {
            try {
                // Test database connection first
                const isConnected = await testDatabaseConnection();
                if (!isConnected) {
                    console.warn('⚠️ Database connection test failed, real-time features may not work');
                    return;
                }

                await setUserPresence(currentUser.uid, currentUser.displayName || 'Unknown User', 'online');
                setIsOnline(true);
            } catch (error) {
                console.error('Error setting user presence:', error);
            }
        };

        initializePresence();

        // Cleanup on unmount
        return () => {
            if (currentUser) {
                cleanupPresence(currentUser.uid);
            }
        };
    }, [currentUser]);

    // Join room presence when roomId changes
    useEffect(() => {
        if (!roomId || !currentUser) return;

        const joinRoom = async () => {
            try {
                await joinRoomPresence(roomId, currentUser.uid, currentUser.displayName || 'Unknown User');
            } catch (error) {
                console.error('Error joining room presence:', error);
            }
        };

        joinRoom();

        // Leave room on cleanup
        return () => {
            if (currentUser) {
                leaveRoomPresence(roomId, currentUser.uid);
            }
        };
    }, [roomId, currentUser]);

    // Subscribe to typing indicators
    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToTypingIndicators(roomId, (typingUsers) => {
            // Filter out current user from typing indicators
            const otherUsersTyping = typingUsers.filter(
                user => user.userId !== currentUser?.uid
            );
            setTypingUsers(otherUsersTyping);
        });

        return unsubscribe;
    }, [roomId, currentUser]);

    // Subscribe to room presence
    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToRoomPresence(roomId, (presenceList) => {
            setRoomPresence(presenceList);
        });

        return unsubscribe;
    }, [roomId]);

    // Subscribe to live notifications
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToLiveNotifications(currentUser.uid, (notifications) => {
            setLiveNotifications(notifications);
        });

        return unsubscribe;
    }, [currentUser]);

    // Typing functions
    const handleStartTyping = useCallback(() => {
        if (!roomId || !currentUser || isTyping) return;

        setIsTyping(true);
        startTyping(roomId, currentUser.uid, currentUser.displayName || 'Unknown User');
    }, [roomId, currentUser, isTyping]);

    const handleStopTyping = useCallback(() => {
        if (!roomId || !currentUser || !isTyping) return;

        setIsTyping(false);
        stopTyping(roomId, currentUser.uid);
    }, [roomId, currentUser, isTyping]);

    // Auto-stop typing after 3 seconds
    useEffect(() => {
        if (!isTyping) return;

        const timer = setTimeout(() => {
            handleStopTyping();
        }, 3000);

        return () => clearTimeout(timer);
    }, [isTyping, handleStopTyping]);

    // Notification functions
    const sendNotification = useCallback(async (
        userId: string,
        type: 'message' | 'connection_request' | 'system',
        title: string,
        message: string,
        roomId?: string
    ) => {
        try {
            await sendLiveNotification(userId, type, title, message, roomId);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!currentUser) return;

        try {
            await markNotificationAsRead(currentUser.uid, notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [currentUser]);

    // Get typing indicator text
    const getTypingText = useCallback(() => {
        if (typingUsers.length === 0) return '';
        if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing...`;
        if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
        return `${typingUsers.length} people are typing...`;
    }, [typingUsers]);

    // Get online users count
    const getOnlineUsersCount = useCallback(() => {
        return roomPresence.filter(user => user.status === 'online').length;
    }, [roomPresence]);

    // Get unread notifications count
    const getUnreadNotificationsCount = useCallback(() => {
        return liveNotifications.filter(notification => !notification.read).length;
    }, [liveNotifications]);

    return {
        // State
        typingUsers,
        roomPresence,
        liveNotifications,
        isTyping,
        isOnline,

        // Functions
        handleStartTyping,
        handleStopTyping,
        sendNotification,
        markAsRead,
        getTypingText,
        getOnlineUsersCount,
        getUnreadNotificationsCount
    };
};
