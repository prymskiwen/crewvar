export interface IChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'file';
}

export interface IChatRoom {
    id: string;
    room_id: string;
    other_user_id: string;
    other_user_name: string;
    other_user_avatar: string;
    ship_name: string;
    department_name: string;
    role_name: string;
    last_message_content?: string;
    last_message_time?: string;
    last_message_status?: string;
    unread_count?: number;
    created_at?: string;
    updated_at?: string;
    participants: string[]; // User IDs
    lastMessage?: IChatMessage;
    lastActivity: string;
    unreadCount: number;
}

export interface ITypingIndicator {
    userId: string;
    isTyping: boolean;
    timestamp: string;
}

export interface IChatContext {
    currentChatRoom: IChatRoom | null;
    messages: IChatMessage[];
    typingUsers: ITypingIndicator[];
    isConnected: boolean;
    unreadCount: number;
}

export interface IChatUser {
    id: string;
    displayName: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
}
