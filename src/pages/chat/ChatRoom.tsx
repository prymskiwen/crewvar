import React, { useState, useEffect, useRef, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContextFirebase";
import { sendMessage, getMessages, markMessagesAsRead, getChatRooms } from "../../firebase/firestore";
import { EmojiPicker } from '../../components/ui/EmojiPicker';
import { ReportUserModal } from '../../components/reports/ReportUserModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatTimeAgo } from '../../utils/data';
import { defaultAvatar } from '../../utils/images';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { LoadingPage } from '../../components/ui';

export const ChatRoom = memo(() => {
    const { roomId } = useParams<{ roomId: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Fetch chat room data
    const { data: chatRooms = [], isLoading: isLoadingRooms } = useQuery({
        queryKey: ['chatRooms', currentUser?.uid],
        queryFn: () => getChatRooms(currentUser?.uid || ''),
        enabled: !!currentUser?.uid
    });

    const chatRoom = chatRooms.find(room => room.id === roomId);

    // Show loading while fetching chat rooms
    if (isLoadingRooms) {
        return (
            <DashboardLayout>
                <LoadingPage message="Loading chat room..." backgroundColor="#f9fafb" />
            </DashboardLayout>
        );
    }

    // Show error if chat room not found
    if (!chatRoom) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-120px)] -m-3 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat Room Not Found</h2>
                        <p className="text-gray-600 mb-4">The chat room you're looking for doesn't exist.</p>
                        <button
                            onClick={() => navigate('/chat')}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            Back to Chat
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Check if user is near bottom of messages
    const isNearBottom = () => {
        if (!messagesContainerRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        return scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
    };

    // Handle scroll events
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const nearBottom = isNearBottom();
        setShouldAutoScroll(nearBottom);
    };

    // Fetch messages using React Query
    const { data: messages = [], isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', chatRoom.id],
        queryFn: () => getMessages(chatRoom.id),
        enabled: !!chatRoom.id,
        refetchInterval: 2000 // Refetch every 2 seconds for real-time updates
    });

    // Mark messages as read when component mounts or room changes
    useEffect(() => {
        if (chatRoom.id && currentUser) {
            markMessagesAsRead(chatRoom.id, currentUser.uid);
        }
        // Reset auto-scroll state when room changes
        setShouldAutoScroll(true);
        setLastMessageCount(0);
        setLastMessageId(null);
    }, [chatRoom.id, currentUser]);

    // Auto-scroll to bottom only when new messages arrive (not on initial load or refetch)
    useEffect(() => {
        if (messages.length === 0) {
            setLastMessageCount(0);
            setLastMessageId(null);
            return;
        }

        const currentMessageCount = messages.length;
        const currentLastMessageId = messages[messages.length - 1]?.id;

        // Only auto-scroll if:
        // 1. User is near bottom
        // 2. Message count increased (new message added)
        // 3. OR last message ID changed (new message added)
        const hasNewMessage = currentMessageCount > lastMessageCount ||
            (currentLastMessageId && currentLastMessageId !== lastMessageId);

        if (hasNewMessage && shouldAutoScroll) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

        // Update tracking variables
        setLastMessageCount(currentMessageCount);
        setLastMessageId(currentLastMessageId);
    }, [messages, shouldAutoScroll, lastMessageCount, lastMessageId]);

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: ({ roomId, message }: { roomId: string; message: string }) =>
            sendMessage(roomId, currentUser!.uid, message),
        onSuccess: () => {
            setMessageInput("");
            // Force auto-scroll when user sends a message
            setShouldAutoScroll(true);
            // Reset tracking to ensure auto-scroll triggers
            setLastMessageCount(0);
            setLastMessageId(null);
            // Invalidate messages query to refetch
            queryClient.invalidateQueries({ queryKey: ['messages', chatRoom.id] });
            // Invalidate chat rooms query to update last message
            queryClient.invalidateQueries({ queryKey: ['chatRooms', currentUser?.uid] });
        },
        onError: (error) => {
            console.error('Error sending message:', error);
        }
    });

    // Handle sending messages
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentUser || sendMessageMutation.isLoading) return;

        const messageContent = messageInput.trim();
        sendMessageMutation.mutate({ roomId: chatRoom.id, message: messageContent });
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-120px)] -m-3">
                <div className="flex flex-col h-full bg-white overflow-hidden rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <button
                                onClick={() => navigate('/chat')}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors lg:hidden flex-shrink-0"
                                title="Back to messages"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <img
                                src={chatRoom.otherUserProfile?.profilePhoto || defaultAvatar}
                                alt={chatRoom.otherUserProfile?.displayName || 'User'}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{chatRoom.otherUserProfile?.displayName || 'Unknown User'}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    {chatRoom.otherUserProfile?.currentShipId ? 'Ship: ' + chatRoom.otherUserProfile.currentShipId : 'No ship assigned'}
                                </p>
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
                                onClick={() => navigate('/chat')}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0 min-h-0"
                    >
                        {messagesLoading ? (
                            <div className="flex justify-center items-center h-full min-h-[400px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <div className="text-gray-500">Loading messages...</div>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex justify-center items-center h-full min-h-[400px]">
                                <div className="text-center">
                                    <div className="text-gray-500">No messages yet. Start the conversation!</div>
                                </div>
                            </div>
                        ) : (
                            messages.map((message: any) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'} min-w-0`}
                                >
                                    <div
                                        className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg break-words ${message.senderId === currentUser?.uid
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm break-words chat-message">{message.message}</p>
                                        <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid
                                            ? 'text-blue-100'
                                            : 'text-gray-500'
                                            }`}>
                                            {formatTimeAgo(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-3 sm:p-4 min-w-0 flex-shrink-0 bg-white">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 min-w-0">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
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
                                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                disabled={sendMessageMutation.isLoading}
                            />

                            <button
                                type="submit"
                                disabled={!messageInput.trim() || sendMessageMutation.isLoading}
                                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base flex-shrink-0"
                            >
                                {sendMessageMutation.isLoading ? 'Sending...' : 'Send'}
                            </button>
                        </form>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-16 left-2 sm:left-4 right-2 sm:right-4 max-w-sm">
                                <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                            </div>
                        )}
                    </div>

                    {/* Report Modal */}
                    {showReportModal && (
                        <ReportUserModal
                            isOpen={showReportModal}
                            reportedUserId={chatRoom.otherUserId}
                            reportedUserName={chatRoom.otherUserProfile?.displayName || 'Unknown User'}
                            onClose={() => setShowReportModal(false)}
                            onReport={(data) => {
                                console.log('Report submitted:', data);
                                setShowReportModal(false);
                            }}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
});

ChatRoom.displayName = 'ChatRoom';
