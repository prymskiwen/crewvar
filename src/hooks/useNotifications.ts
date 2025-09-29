import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextFirebase';
import {
    getNotificationsForUser,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    subscribeToNotifications,
    Notification
} from '../firebase/firestore';

export const useNotifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load initial notifications
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const loadNotifications = async () => {
            try {
                setLoading(true);
                setError(null);

                const [notificationsData, unreadCountData] = await Promise.all([
                    getNotificationsForUser(currentUser.uid, 20),
                    getUnreadNotificationsCount(currentUser.uid)
                ]);

                setNotifications(notificationsData);
                setUnreadCount(unreadCountData);
            } catch (err) {
                console.error('Error loading notifications:', err);
                setError('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [currentUser]);

    // Subscribe to real-time notifications
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToNotifications(currentUser.uid, (newNotifications) => {
            setNotifications(newNotifications);
            setUnreadCount(newNotifications.filter(n => !n.isRead).length);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            // Update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead(currentUser?.uid || '');
            // Update local state
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            setError('Failed to mark all notifications as read');
        }
    };

    const loadMoreNotifications = async (limit: number = 20) => {
        if (!currentUser || notifications.length === 0) return;

        try {
            const lastNotification = notifications[notifications.length - 1];
            const moreNotifications = await getNotificationsForUser(
                currentUser.uid,
                limit,
                lastNotification
            );

            setNotifications(prev => [...prev, ...moreNotifications]);
        } catch (err) {
            console.error('Error loading more notifications:', err);
            setError('Failed to load more notifications');
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        loadMoreNotifications,
        hasUnread: unreadCount > 0
    };
};
