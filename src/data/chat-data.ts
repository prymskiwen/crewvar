import { IChatMessage, IChatRoom, IChatUser } from "../types/chat";

// Sample Chat Users
export const sampleChatUsers: IChatUser[] = [
    {
        id: "1",
        displayName: "Sarah Johnson",
        avatar: "/src/assets/images/default-avatar.webp",
        isOnline: true,
        lastSeen: "Online now"
    },
    {
        id: "2",
        displayName: "Mike Rodriguez",
        avatar: "/src/assets/images/default-avatar.webp",
        isOnline: false,
        lastSeen: "1 hour ago"
    },
    {
        id: "3",
        displayName: "Emma Thompson",
        avatar: "/src/assets/images/default-avatar.webp",
        isOnline: true,
        lastSeen: "2 minutes ago"
    }
];

// Sample Chat Messages
export const sampleChatMessages: IChatMessage[] = [
    {
        id: "msg1",
        senderId: "1",
        receiverId: "current_user",
        content: "Hey! Great to connect with you! 👋",
        timestamp: "2024-01-15T10:30:00Z",
        status: "read",
        type: "text"
    },
    {
        id: "msg2",
        senderId: "current_user",
        receiverId: "1",
        content: "Hi Sarah! Nice to meet you too! How's your day going?",
        timestamp: "2024-01-15T10:32:00Z",
        status: "delivered",
        type: "text"
    },
    {
        id: "msg3",
        senderId: "1",
        receiverId: "current_user",
        content: "It's going great! Just finished my shift. Are you working on the same ship today?",
        timestamp: "2024-01-15T10:35:00Z",
        status: "read",
        type: "text"
    },
    {
        id: "msg4",
        senderId: "current_user",
        receiverId: "1",
        content: "Yes! I'm on Royal Caribbean Symphony of the Seas. What about you?",
        timestamp: "2024-01-15T10:37:00Z",
        status: "delivered",
        type: "text"
    },
    {
        id: "msg5",
        senderId: "1",
        receiverId: "current_user",
        content: "Same ship! That's awesome! Maybe we can grab coffee during break? ☕",
        timestamp: "2024-01-15T10:40:00Z",
        status: "read",
        type: "text"
    }
];

// Sample Chat Rooms
export const sampleChatRooms: IChatRoom[] = [
    {
        id: "room1",
        participants: ["current_user", "1"],
        lastMessage: sampleChatMessages[sampleChatMessages.length - 1],
        lastActivity: "2024-01-15T10:40:00Z",
        unreadCount: 0
    },
    {
        id: "room2",
        participants: ["current_user", "2"],
        lastMessage: {
            id: "msg6",
            senderId: "2",
            receiverId: "current_user",
            content: "Thanks for connecting!",
            timestamp: "2024-01-15T09:15:00Z",
            status: "delivered",
            type: "text"
        },
        lastActivity: "2024-01-15T09:15:00Z",
        unreadCount: 1
    },
    {
        id: "room3",
        participants: ["current_user", "3"],
        lastMessage: {
            id: "msg7",
            senderId: "current_user",
            receiverId: "3",
            content: "Hey Emma! How's the entertainment department?",
            timestamp: "2024-01-15T08:45:00Z",
            status: "read",
            type: "text"
        },
        lastActivity: "2024-01-15T08:45:00Z",
        unreadCount: 0
    }
];

// Helper functions
export const getChatRoomByParticipants = (userId1: string, userId2: string): IChatRoom | null => {
    return sampleChatRooms.find(room => 
        room.participants.includes(userId1) && room.participants.includes(userId2)
    ) || null;
};

export const getMessagesForRoom = (roomId: string): IChatMessage[] => {
    const room = sampleChatRooms.find(r => r.id === roomId);
    if (!room) return [];
    
    return sampleChatMessages.filter(msg => 
        room.participants.includes(msg.senderId) && room.participants.includes(msg.receiverId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getChatUserById = (userId: string): IChatUser | null => {
    return sampleChatUsers.find(user => user.id === userId) || null;
};

export const getUnreadMessagesCount = (userId: string): number => {
    return sampleChatRooms.reduce((total, room) => {
        if (room.participants.includes(userId)) {
            return total + room.unreadCount;
        }
        return total;
    }, 0);
};

export const markMessagesAsRead = (roomId: string): void => {
    const room = sampleChatRooms.find(r => r.id === roomId);
    if (room) {
        room.unreadCount = 0;
    }
};
