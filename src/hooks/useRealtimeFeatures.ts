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
    markLiveNotificationAsRead,
    startTyping,
    stopTyping,
    cleanupPresence,
    TypingIndicator,
    PresenceStatus,
    LiveNotification
} from '../firebase/firestore';

export const useRealtimeFeatures = (roomId?: string) => {
    const { currentUser, userProfile } = useAuth();

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
                const displayName = userProfile?.displayName || currentUser.displayName || 'Unknown User';
                await setUserPresence(currentUser.uid, displayName, 'online');
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
                const displayName = userProfile?.displayName || currentUser.displayName || 'Unknown User';
                await joinRoomPresence(roomId, currentUser.uid, displayName);
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
    }, [roomId, currentUser, userProfile]);

    // Subscribe to typing indicators
    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToTypingIndicators(roomId, (typingUsers: TypingIndicator[]) => {
            // Filter out current user from typing indicators
            const otherUsersTyping = typingUsers.filter(
                (user: TypingIndicator) => user.userId !== currentUser?.uid
            );
            setTypingUsers(otherUsersTyping);
        });

        return unsubscribe;
    }, [roomId, currentUser]);

    // Subscribe to room presence
    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToRoomPresence(roomId, (presenceList: PresenceStatus[]) => {
            setRoomPresence(presenceList);
        });

        return unsubscribe;
    }, [roomId]);

    // Subscribe to live notifications
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToLiveNotifications(currentUser.uid, (notifications: LiveNotification[]) => {
            setLiveNotifications(notifications);
        });

        return unsubscribe;
    }, [currentUser]);

    // Typing functions
    const handleStartTyping = useCallback(() => {
        if (!roomId || !currentUser || isTyping) return;

        setIsTyping(true);
        const displayName = userProfile?.displayName || currentUser.displayName || 'Unknown User';
        startTyping(roomId, currentUser.uid, displayName);
    }, [roomId, currentUser, userProfile, isTyping]);

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
            await markLiveNotificationAsRead(notificationId);
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
