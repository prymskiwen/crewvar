/**
 * Notification type definitions
 */

export interface INotification {
    id: string;
    userId: string;
    type: 'connection_request' | 'message' | 'system' | 'admin';
    title: string;
    message: string;
    isRead: boolean;
    data?: Record<string, any>;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    connectionRequests: boolean;
    messages: boolean;
    systemUpdates: boolean;
    marketing: boolean;
}
