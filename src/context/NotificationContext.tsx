import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useRealtime } from './RealtimeContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
    INotificationResponse,
    INotificationPreferencesResponse
} from '../features/notifications/api/notificationApi';

export interface INotification {
    id: string;
    type: 'connection_request' | 'connection_accepted' | 'connection_declined' | 'new_message' | 'message' | 'assignment' | 'port_connection' | 'moderation' | 'daily_summary' | 'general' | 'admin_message';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    userId: string;
    relatedUserId?: string;
    relatedMessageId?: string;
}

export interface INotificationPreferences {
    emailConnectionRequest: boolean;
    emailConnectionAccepted: boolean;
    emailNewMessageOffline: boolean;
    emailDailySummary: boolean;
    inAppBadges: boolean;
    inAppToasts: boolean;
}

// Convert API response to context format
const convertAPINotificationToContext = (apiNotification: INotificationResponse): INotification => ({
    id: apiNotification.id,
    type: apiNotification.type as INotification['type'],
    title: apiNotification.title,
    message: apiNotification.message,
    isRead: apiNotification.is_read,
    createdAt: apiNotification.created_at,
    userId: '', // Will be set by the context
    relatedUserId: apiNotification.data?.relatedUserId,
    relatedMessageId: apiNotification.data?.relatedMessageId
});

// Convert API preferences to context format
const convertAPIPreferencesToContext = (apiPreferences: INotificationPreferencesResponse[]): INotificationPreferences => {
    const prefs: INotificationPreferences = {
        emailConnectionRequest: true,
        emailConnectionAccepted: true,
        emailNewMessageOffline: true,
        emailDailySummary: false,
        inAppBadges: true,
        inAppToasts: true,
    };

    apiPreferences.forEach(pref => {
        switch (pref.type) {
            case 'connection_request':
                prefs.emailConnectionRequest = pref.email_enabled;
                prefs.inAppBadges = pref.in_app_enabled;
                prefs.inAppToasts = pref.in_app_enabled;
                break;
            case 'connection_accepted':
                prefs.emailConnectionAccepted = pref.email_enabled;
                break;
            case 'message':
                prefs.emailNewMessageOffline = pref.email_enabled;
                break;
            case 'system':
                prefs.emailDailySummary = pref.email_enabled;
                break;
        }
    });

    return prefs;
};

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    preferences: INotificationPreferences;
    isLoading: boolean;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    updatePreferences: (preferences: Partial<INotificationPreferences>) => void;
    addNotification: (notification: Omit<INotification, 'id' | 'createdAt' | 'isRead'>) => void;
    removeNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [preferences, setPreferences] = useState<INotificationPreferences>({
        emailConnectionRequest: true,
        emailConnectionAccepted: true,
        emailNewMessageOffline: true,
        emailDailySummary: false,
        inAppBadges: true,
        inAppToasts: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const { socket } = useRealtime();
    const location = useLocation();
    const { currentUser } = useAuth();

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Test function to create a test notification
    const createTestNotification = () => {
        const testNotification: INotification = {
            id: `test-${Date.now()}`,
            type: 'message',
            title: 'Test Message',
            message: 'This is a test notification',
            isRead: false,
            createdAt: new Date().toISOString(),
            userId: 'test-user',
            relatedUserId: 'test-sender',
            relatedMessageId: 'test-message-id'
        };
        
        setNotifications(prev => [testNotification, ...prev]);
        
        if (preferences.inAppToasts) {
            toast.info(testNotification.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Add test function to window for debugging
    useEffect(() => {
        (window as any).createTestNotification = createTestNotification;
        (window as any).testMessageNotification = () => {
            if (socket) {
                console.log('🧪 Emitting test new_message event');
                socket.emit('test_new_message', {
                    id: 'test-msg-123',
                    roomId: 'test-room',
                    userId: 'test-sender',
                    userName: 'Test User',
                    message: 'This is a test message',
                    timestamp: new Date().toISOString(),
                    receiverId: 'current-user'
                });
            } else {
                console.log('❌ Socket not available for test');
            }
        };
        console.log('🧪 Test functions added: window.createTestNotification() and window.testMessageNotification()');
    }, [preferences.inAppToasts, socket]);

    // Check if user is currently on messages page
    const isOnMessagesPage = () => {
        return location.pathname.startsWith('/chat');
    };

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
            loadPreferences();
        }
    }, [currentUser]);

    // Set up WebSocket listeners for real-time notifications only when user is authenticated
    useEffect(() => {
        if (socket && currentUser) {
            // Listen for new notifications
            socket.on('new_notification', (notificationData: any) => {
                const newNotification: INotification = {
                    id: notificationData.id,
                    type: notificationData.type,
                    title: notificationData.title,
                    message: notificationData.message,
                    isRead: false,
                    createdAt: notificationData.createdAt,
                    userId: notificationData.userId,
                    relatedUserId: notificationData.data?.relatedUserId,
                    relatedMessageId: notificationData.data?.relatedMessageId
                };

                // Add to notifications list
                setNotifications(prev => [newNotification, ...prev]);

                // Show toast if enabled
                if (preferences.inAppToasts) {
                    toast.info(newNotification.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }

                // Send email if enabled and conditions are met
                if (shouldSendEmail(newNotification)) {
                    sendEmailNotification(newNotification);
                }
            });

            // Listen for notification updates (e.g., marked as read)
            socket.on('notification_updated', (notificationData: any) => {
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notificationData.id 
                            ? { ...n, isRead: notificationData.is_read }
                            : n
                    )
                );
            });

            // Listen for new messages to create notifications when not on messages page
            socket.on('new_message', (messageData: any) => {
                // Only create notification if user is NOT on messages page
                if (!isOnMessagesPage()) {
                    const messageNotification: INotification = {
                        id: `msg-${messageData.id}-${Date.now()}`, // Generate unique ID
                        type: 'message',
                        title: 'New Message',
                        message: `${messageData.userName || 'Someone'} sent you a message`,
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        userId: messageData.userId || '',
                        relatedUserId: messageData.userId,
                        relatedMessageId: messageData.id
                    };

                    // Add to notifications list
                    setNotifications(prev => [messageNotification, ...prev]);

                    // Show toast if enabled
                    if (preferences.inAppToasts) {
                        toast.info(messageNotification.message, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                }
            });

            // Listen for admin messages
            socket.on('admin_message', (adminMessageData: any) => {
                const adminNotification: INotification = {
                    id: `admin-${Date.now()}-${Math.random()}`, // Generate unique ID
                    type: 'admin_message',
                    title: adminMessageData.subject || 'Admin Message',
                    message: adminMessageData.message,
                    isRead: false,
                    createdAt: adminMessageData.timestamp || new Date().toISOString(),
                    userId: '', // Admin messages don't have a specific user ID
                    relatedUserId: '',
                    relatedMessageId: ''
                };

                // Add to notifications list
                setNotifications(prev => [adminNotification, ...prev]);

                // Show simple toast notification
                toast.info(
                    <div className="max-w-xs">
                        <div className="font-semibold text-sm">📧 You received a new message from Support Team</div>
                    </div>,
                    {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    }
                );
            });

            return () => {
                socket.off('new_notification');
                socket.off('notification_updated');
                socket.off('new_message');
                socket.off('admin_message');
            };
        }
    }, [socket, preferences.inAppToasts, location.pathname, currentUser]);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await getNotifications({ limit: 50 });
            const convertedNotifications = response.notifications.map(convertAPINotificationToContext);
            setNotifications(convertedNotifications);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Fallback to empty array on error
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadPreferences = async () => {
        try {
            const response = await getNotificationPreferences();
            const convertedPreferences = convertAPIPreferencesToContext(response.preferences);
            setPreferences(convertedPreferences);
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
            // Fallback to default preferences
            const savedPreferences = localStorage.getItem('notificationPreferences');
            if (savedPreferences) {
                setPreferences(JSON.parse(savedPreferences));
            }
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            
            await markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true }))
            );
            
            await markAllNotificationsAsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const updatePreferences = async (newPreferences: Partial<INotificationPreferences>) => {
        try {
            const updatedPreferences = { ...preferences, ...newPreferences };
            setPreferences(updatedPreferences);
            
            // Convert context preferences to API format
            const apiPreferences = [
                {
                    type: 'connection_request',
                    emailEnabled: updatedPreferences.emailConnectionRequest,
                    inAppEnabled: updatedPreferences.inAppBadges && updatedPreferences.inAppToasts
                },
                {
                    type: 'connection_accepted',
                    emailEnabled: updatedPreferences.emailConnectionAccepted,
                    inAppEnabled: updatedPreferences.inAppBadges && updatedPreferences.inAppToasts
                },
                {
                    type: 'message',
                    emailEnabled: updatedPreferences.emailNewMessageOffline,
                    inAppEnabled: updatedPreferences.inAppBadges && updatedPreferences.inAppToasts
                },
                {
                    type: 'system',
                    emailEnabled: updatedPreferences.emailDailySummary,
                    inAppEnabled: updatedPreferences.inAppBadges && updatedPreferences.inAppToasts
                }
            ];
            
            await updateNotificationPreferences(apiPreferences);
            
            // Also save to localStorage as backup
            localStorage.setItem('notificationPreferences', JSON.stringify(updatedPreferences));
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
        }
    };

    const addNotification = (notification: Omit<INotification, 'id' | 'createdAt' | 'isRead'>) => {
        const newNotification: INotification = {
            ...notification,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isRead: false,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast if enabled
        if (preferences.inAppToasts) {
            toast.info(newNotification.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }

        // Send email if enabled and conditions are met
        if (shouldSendEmail(newNotification)) {
            sendEmailNotification(newNotification);
        }
    };

    const removeNotification = async (notificationId: string) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            await deleteNotification(notificationId);
        } catch (error) {
            console.error('Failed to remove notification:', error);
        }
    };

    const shouldSendEmail = (notification: INotification): boolean => {
        switch (notification.type) {
            case 'connection_request':
                return preferences.emailConnectionRequest;
            case 'connection_accepted':
                return preferences.emailConnectionAccepted;
            case 'new_message':
                return preferences.emailNewMessageOffline && !isUserOnline();
            case 'daily_summary':
                return preferences.emailDailySummary;
            default:
                return false;
        }
    };

    const isUserOnline = (): boolean => {
        // Check if user is currently online
        return navigator.onLine;
    };

    const sendEmailNotification = async (notification: INotification) => {
        try {
            // API call to send email notification
            // await api.post('/notifications/send-email', {
            //     type: notification.type,
            //     title: notification.title,
            //     message: notification.message,
            //     userId: notification.userId
            // });
            console.log('Email notification sent:', notification.title);
        } catch (error) {
            console.error('Failed to send email notification:', error);
        }
    };

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        preferences,
        isLoading,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        addNotification,
        removeNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
