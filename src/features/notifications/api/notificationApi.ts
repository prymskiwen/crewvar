import { api } from '../../../app/api';

export interface INotificationResponse {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    is_read: boolean;
    created_at: string;
}

export interface INotificationPreferencesResponse {
    type: string;
    email_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;
    created_at: string;
}

export interface INotificationPreferencesUpdate {
    type: string;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    inAppEnabled?: boolean;
}

export interface INotificationsResponse {
    notifications: INotificationResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface IUnreadCountResponse {
    unreadCount: number;
}

// Get user's notifications
export const getNotifications = async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}): Promise<INotificationsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());

    const response = await api.get(`/notifications?${queryParams.toString()}`);
    return response.data;
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<IUnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.put('/notifications/read-all');
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
};

// Get notification preferences
export const getNotificationPreferences = async (): Promise<{ preferences: INotificationPreferencesResponse[] }> => {
    const response = await api.get('/notifications/preferences');
    return response.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences: INotificationPreferencesUpdate[]): Promise<void> => {
    await api.put('/notifications/preferences', { preferences });
};

// Create test notification
export const createTestNotification = async (data: {
    type?: string;
    title?: string;
    message?: string;
    data?: any;
}): Promise<void> => {
    await api.post('/notifications/test', data);
};