import React, { useState, useEffect, useRef, memo } from "react";
import { useAuth } from "../context/AuthContextFirebase";
import { useRealtime } from "../context/RealtimeContextFirebase";
import { sendChatMessage, subscribeToChatMessages } from "../firebase/firestore";
import { ChatMessage } from "../firebase/firestore";
import { EmojiPicker } from './EmojiPicker';
import { ReportUserModal } from '../features/reports/components/ReportUserModal';

interface ChatWindowProps {
    chatRoom: {
        room_id: string;
        other_user_id: string;
        other_user_name: string;
        other_user_avatar: string;
        ship_name: string;
        department_name: string;
        unread_count?: number;
    };
    onClose: () => void;
}

export const ChatWindow = memo(({ chatRoom, onClose }: ChatWindowProps) => {
    const { currentUser } = useAuth();
    const { joinRoom, leaveRoom, startTyping, stopTyping, typingUsers } = useRealtime();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to chat messages
    useEffect(() => {
        if (!chatRoom.room_id || !currentUser) return;

        // Join the chat room
        joinRoom(chatRoom.room_id);

        // Subscribe to messages
        const unsubscribe = subscribeToChatMessages(chatRoom.room_id, (newMessages) => {
            setMessages(newMessages);
            // Auto-scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => {
            unsubscribe();
            leaveRoom(chatRoom.room_id);
        };
    }, [chatRoom.room_id, currentUser, joinRoom, leaveRoom]);

    // Handle sending messages
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentUser || isLoading) return;

        const messageContent = messageInput.trim();
        setMessageInput("");
        setIsLoading(true);

        try {
            await sendChatMessage(
                chatRoom.room_id,
                currentUser.uid,
                messageContent,
                'text'
            );
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message input on error
            setMessageInput(messageContent);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle typing indicators
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);

        // Start typing indicator
        startTyping(chatRoom.room_id);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(chatRoom.room_id);
        }, 3000);
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Get typing users for this room
    const roomTypingUsers = typingUsers[chatRoom.room_id] || [];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                    <img
                        src={chatRoom.other_user_avatar || '/default-avatar.png'}
                        alt={chatRoom.other_user_name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900">{chatRoom.other_user_name}</h3>
                        <p className="text-sm text-gray-500">{chatRoom.ship_name} • {chatRoom.department_name}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        title="Report User"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === currentUser?.uid
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                                }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid
                                ? 'text-blue-100'
                                : 'text-gray-500'
                                }`}>
                                {new Date(message.createdAt?.toDate?.() || message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {roomTypingUsers.length > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm">
                            {roomTypingUsers.map(user => user.userName).join(', ')} {roomTypingUsers.length === 1 ? 'is' : 'are'} typing...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    <input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={!messageInput.trim() || isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </form>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4">
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <ReportUserModal
                    isOpen={showReportModal}
                    reportedUserId={chatRoom.other_user_id}
                    reportedUserName={chatRoom.other_user_name}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
});

ChatWindow.displayName = 'ChatWindow';
