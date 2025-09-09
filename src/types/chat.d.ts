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
