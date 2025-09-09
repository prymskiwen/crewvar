import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IChatMessage, IChatRoom, ITypingIndicator, IChatContext } from "../types/chat";
import { 
    sampleChatRooms, 
    getMessagesForRoom, 
    markMessagesAsRead 
} from "../data/chat-data";

interface ChatContextType extends IChatContext {
    setCurrentChatRoom: (room: IChatRoom | null) => void;
    sendMessage: (content: string, receiverId: string) => void;
    setTyping: (userId: string, isTyping: boolean) => void;
    markAsRead: (roomId: string) => void;
    getChatRooms: () => IChatRoom[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
    const [currentChatRoom, setCurrentChatRoom] = useState<IChatRoom | null>(null);
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<ITypingIndicator[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load messages when chat room changes
    useEffect(() => {
        if (currentChatRoom) {
            const roomMessages = getMessagesForRoom(currentChatRoom.id);
            setMessages(roomMessages);
            markAsRead(currentChatRoom.id);
        } else {
            setMessages([]);
        }
    }, [currentChatRoom]);

    // Update unread count
    useEffect(() => {
        const totalUnread = sampleChatRooms.reduce((total, room) => total + room.unreadCount, 0);
        setUnreadCount(totalUnread);
    }, [currentChatRoom]);

    const sendMessage = async (content: string, receiverId: string) => {
        if (!currentChatRoom || !content.trim()) return;

        const newMessage: IChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: "current_user",
            receiverId,
            content: content.trim(),
            timestamp: new Date().toISOString(),
            status: 'sent',
            type: 'text'
        };

        // Add message to local state
        setMessages(prev => [...prev, newMessage]);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update message status to delivered
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === newMessage.id 
                        ? { ...msg, status: 'delivered' as const }
                        : msg
                )
            );

            // Update room's last message
            const room = sampleChatRooms.find(r => r.id === currentChatRoom.id);
            if (room) {
                room.lastMessage = { ...newMessage, status: 'delivered' };
                room.lastActivity = newMessage.timestamp;
            }

            console.log(`Message sent to ${receiverId}:`, content);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const setTyping = (userId: string, isTyping: boolean) => {
        setTypingUsers(prev => {
            const filtered = prev.filter(t => t.userId !== userId);
            if (isTyping) {
                return [...filtered, {
                    userId,
                    isTyping: true,
                    timestamp: new Date().toISOString()
                }];
            }
            return filtered;
        });

        // Auto-remove typing indicator after 3 seconds
        if (isTyping) {
            setTimeout(() => {
                setTypingUsers(prev => prev.filter(t => t.userId !== userId));
            }, 3000);
        }
    };

    const markAsRead = (roomId: string) => {
        markMessagesAsRead(roomId);
        
        // Update local state
        setMessages(prev => 
            prev.map(msg => 
                msg.receiverId === "current_user" && msg.status !== 'read'
                    ? { ...msg, status: 'read' as const }
                    : msg
            )
        );
    };

    const getChatRooms = () => {
        return sampleChatRooms.filter(room => 
            room.participants.includes("current_user")
        );
    };

    const value: ChatContextType = {
        currentChatRoom,
        messages,
        typingUsers,
        isConnected: true,
        unreadCount,
        setCurrentChatRoom,
        sendMessage,
        setTyping,
        markAsRead,
        getChatRooms
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
