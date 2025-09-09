export interface IConnectionRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    createdAt: string;
    updatedAt: string;
    message?: string;
}

export interface IConnection {
    id: string;
    userId1: string;
    userId2: string;
    createdAt: string;
    status: 'active' | 'blocked';
}

export interface IUserProfile {
    id: string;
    displayName: string;
    avatar: string;
    role: string;
    department: string;
    subcategory: string;
    shipName: string;
    port: string;
    bio?: string;
    photos?: string[];
    contacts?: {
        email?: string;
        phone?: string;
        social?: string[];
    };
    isOnline: boolean;
    lastSeen?: string;
}

export interface IConnectionContext {
    mutualFriends: number;
    mutualFriendsNames?: string[];
    pastCoincidences: {
        ship: string;
        port: string;
        date: string;
    }[];
}

export interface INotification {
    id: string;
    userId: string;
    type: 'connection_request' | 'connection_accepted' | 'message_received';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
}
