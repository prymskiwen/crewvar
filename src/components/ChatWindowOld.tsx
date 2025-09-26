import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useAuth } from "../context/AuthContextFirebase";
import { useRealtime } from "../context/RealtimeContextFirebase";
import { sendChatMessage, subscribeToChatMessages, markNotificationAsRead } from "../firebase/firestore";
import { IChatMessage } from "../types/chat.d";
import { EmojiPicker } from './EmojiPicker';
import { ReportUserModal } from '../features/reports/components/ReportUserModal';
import { useQueryClient } from '@tanstack/react-query';

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
    const { joinRoom, leaveRoom, startTyping, stopTyping } = useRealtime();
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Debounce timer for chat rooms updates
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasMarkedAsReadRef = useRef<boolean>(false);
    
    // Reset the mark as read flag when room changes
    useEffect(() => {
        hasMarkedAsReadRef.current = false;
    }, [chatRoom.room_id]);
    
    // Debounced function to update chat rooms
    const debouncedUpdateChatRooms = useCallback((data: any) => {
        if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
        }
        
        updateTimerRef.current = setTimeout(() => {
            queryClient.setQueryData(['chatRooms'], (oldData: { success: boolean; rooms: any[] } | undefined) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    rooms: oldData.rooms.map(room => {
                        if (room.room_id === data.roomId) {
                            return {
                                ...room,
                                last_message_content: data.content,
                                last_message_time: data.timestamp,
                                last_message_status: data.status || 'sent',
                                last_message_sender_id: data.senderId,
                                updated_at: data.timestamp,
                                unread_count: room.unread_count + 1
                            };
                        }
                        return room;
                    })
                };
            });
        }, 200); // Debounce for 200ms
    }, [queryClient]);
    
    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [allMessages, setAllMessages] = useState<IChatMessage[]>([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSendingRef = useRef(false);
    
    // Fetch messages
    const { data: messagesData, isLoading } = useChatMessages(chatRoom.room_id, currentPage, 20);
    
    // Update messages when data changes
    useEffect(() => {
        if (messagesData) {
            if (currentPage === 1) {
                // First page - replace all messages
                setAllMessages(messagesData.messages);
            } else {
                // Subsequent pages - prepend older messages
                setAllMessages(prev => [...messagesData.messages, ...prev]);
            }
            setHasMoreMessages(messagesData.pagination.hasMore);
            setIsLoadingMore(false);
        }
    }, [messagesData, currentPage]);
    
    // Reset when chat room changes
    useEffect(() => {
        setCurrentPage(1);
        setHasMoreMessages(true);
        setAllMessages([]);
        
        // Join the chat room
        joinRoom(chatRoom.room_id);
        
        return () => {
            leaveRoom(chatRoom.room_id);
        };
    }, [chatRoom.room_id, joinRoom, leaveRoom]);
    
    // Auto-scroll to bottom (only if user is near bottom)
    useEffect(() => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            
            // Only auto-scroll if user is near the bottom
            if (isNearBottom || allMessages.length <= 20) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [allMessages.length]);
    
    // Load more messages when scrolling to top
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const isAtTop = container.scrollTop === 0;
        
        if (isAtTop && hasMoreMessages && !isLoadingMore && !isLoading) {
            setIsLoadingMore(true);
            setCurrentPage(prev => prev + 1);
        }
    }, [hasMoreMessages, isLoadingMore, isLoading]);
    
    // WebSocket event handlers
    useEffect(() => {
        const handleNewMessage = (data: any) => {
            console.log('📨 Received new message:', data);
            
            // Only add message if it's for this room and not from current user (to avoid duplicates with optimistic updates)
            if (data.roomId === chatRoom.room_id && data.senderId !== currentUser?.uid) {
                setAllMessages(prev => {
                    // Check if message already exists (by ID or content + timestamp)
                    const messageExists = prev.some(msg => 
                        msg.id === data.id || 
                        (msg.content === data.content && 
                         msg.sender_id === data.senderId && 
                         Math.abs(new Date(msg.created_at).getTime() - new Date(data.timestamp).getTime()) < 1000)
                    );
                    
                    if (messageExists) {
                        console.log('📨 Message already exists, skipping duplicate');
                        return prev;
                    }
                    
                    const newMessage: IChatMessage = {
                        id: data.id,
                        sender_id: data.senderId,
                        receiver_id: data.receiverId,
                        content: data.content,
                        message_type: data.messageType || 'text',
                        status: data.status || 'sent',
                        created_at: data.timestamp,
                        sender_name: data.senderName || 'Unknown User',
                        sender_avatar: ''
                    };
                    
                    return [...prev, newMessage];
                });
                
                // Use debounced update for chat rooms list
                debouncedUpdateChatRooms(data);
            }
        };
        
        const handleMessageStatusUpdate = (data: any) => {
            setAllMessages(prev => 
                prev.map(msg => 
                    msg.id === data.messageId ? { ...msg, status: data.status } : msg
                )
            );
        };
        
        const handleTyping = (data: any) => {
            if (data.userId !== currentUser?.uid) {
                setTypingUsers(prev => 
                    data.isTyping 
                        ? [...prev.filter(id => id !== data.userId), data.userId]
                        : prev.filter(id => id !== data.userId)
                );
            }
        };

        const handleMessagesRead = (data: any) => {
            console.log('📖 Messages read by:', data.readerId, 'in room:', data.roomId);
            // Update message statuses to 'read' for messages sent by current user
            setAllMessages(prev => 
                prev.map(msg => 
                    msg.sender_id === currentUser?.uid && msg.status !== 'read' 
                        ? { ...msg, status: 'read' as const }
                        : msg
                )
            );
        };
        
        onEvent('new_message', handleNewMessage);
        onEvent('message_status_update', handleMessageStatusUpdate);
        onEvent('user_typing', handleTyping);
        onEvent('messages_read', handleMessagesRead);
        
        return () => {
            offEvent('new_message', handleNewMessage);
            offEvent('message_status_update', handleMessageStatusUpdate);
            offEvent('user_typing', handleTyping);
            offEvent('messages_read', handleMessagesRead);
        };
    }, [onEvent, offEvent, currentUser?.uid, chatRoom.room_id, debouncedUpdateChatRooms]);
    
    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
            }
            hasMarkedAsReadRef.current = false;
        };
    }, []);
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const menuContainer = target.closest('.menu-container');
            
            if (showMenu && !menuContainer) {
                setShowMenu(false);
            }
        };
        
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showMenu]);
    
    // Mark messages as read when chat window opens (only once per room)
    useEffect(() => {
        if (chatRoom.unread_count && chatRoom.unread_count > 0 && !hasMarkedAsReadRef.current) {
            hasMarkedAsReadRef.current = true;
            markAsReadMutation.mutate({ roomId: chatRoom.room_id });
        }
    }, [chatRoom.room_id, chatRoom.unread_count]);
    
    // Send message
    const handleSendMessage = useCallback(async () => {
        if (!messageInput.trim() || !sendMessageMutation || isSendingRef.current) return;
        
        isSendingRef.current = true;
        const messageContent = messageInput.trim();
        
        // Add message optimistically to local state
        const optimisticMessage: IChatMessage = {
            id: `temp-${Date.now()}`,
            sender_id: currentUser?.uid || 'current_user',
            receiver_id: chatRoom.other_user_id,
            content: messageContent,
            message_type: 'text',
            status: 'sent',
            created_at: new Date().toISOString(),
            sender_name: 'You',
            sender_avatar: ''
        };
        
        setAllMessages(prev => [...prev, optimisticMessage]);
            setMessageInput("");
            setIsTyping(false);
            
        // Scroll to bottom immediately when sending message
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 50);
        
        // Send to backend
        sendMessageMutation.mutate({
            roomId: chatRoom.room_id,
                content: messageContent
        }, {
            onSuccess: (newMessage: any) => {
                // Replace optimistic message with real message
                setAllMessages(prev => 
                    prev.map(msg => 
                        msg.id === optimisticMessage.id ? newMessage.message : msg
                    )
                );
                
                // Restore focus
                setTimeout(() => {
                    if (messageInputRef.current) {
                        messageInputRef.current.focus();
                    }
                }, 50);
                
                isSendingRef.current = false;
            },
            onError: (error: any) => {
            console.error('Failed to send message:', error);
                // Remove optimistic message on error
                setAllMessages(prev => 
                    prev.filter(msg => msg.id !== optimisticMessage.id)
                );
                isSendingRef.current = false;
            }
        });
    }, [messageInput, chatRoom.room_id, chatRoom.other_user_id, sendMessageMutation, currentUser?.uid]);
    
    // Typing handlers
    const handleStartTyping = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            emitEvent('typing', { 
                roomId: chatRoom.room_id, 
                isTyping: true 
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 3000);
    }, [isTyping, emitEvent, chatRoom.room_id]);
    
    const handleStopTyping = useCallback(() => {
        if (isTyping) {
            setIsTyping(false);
            emitEvent('typing', { 
                roomId: chatRoom.room_id, 
                isTyping: false 
            });
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [isTyping, emitEvent, chatRoom.room_id]);
    
    // Input change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        
        if (e.target.value.length > 0) {
            handleStartTyping();
        } else {
            handleStopTyping();
        }
    };
    
    // Emoji picker functions
    const handleEmojiSelect = useCallback((emoji: string) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
        
        // Focus back to input
        setTimeout(() => {
            if (messageInputRef.current) {
                messageInputRef.current.focus();
            }
        }, 100);
    }, []);
    
    const toggleEmojiPicker = useCallback(() => {
        setShowEmojiPicker(prev => !prev);
    }, []);
    
    // Utility functions
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMessageStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <span className="text-white">✓✓</span>;
            case 'sent':
                return <span className="text-white">✓</span>;
            default:
                return null;
        }
    };

    if (isLoading && allMessages.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-teal-700 rounded-lg transition-colors flex-shrink-0"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {/* Avatar with unread badge */}
                    <div className="relative flex-shrink-0">
                        <img
                            src={chatRoom.other_user_avatar || '/default-avatar.webp'}
                            alt={chatRoom.other_user_name}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                        />
                        {/* Unread count badge */}
                        {chatRoom.unread_count && chatRoom.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-lg border-2 border-teal-600">
                                {chatRoom.unread_count > 99 ? '99+' : chatRoom.unread_count}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-medium text-sm sm:text-base truncate">{chatRoom.other_user_name}</h2>
                        <p className="text-xs text-teal-100 truncate">
                            <span className="hidden sm:inline">{chatRoom.ship_name} • </span>
                            {chatRoom.department_name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 relative menu-container">
                    {/* Chat Menu Button */}
                <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-teal-700 rounded-lg transition-colors"
                    >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
                    
                    {/* Menu Dropdown */}
                    {showMenu && (
                        <div 
                            className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-32"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => {
                                    setShowReportModal(true);
                                    setShowMenu(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>Report User</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
                onScroll={handleScroll}
            >
                {isLoadingMore && (
                    <div className="text-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                    </div>
                )}
                
                {allMessages.map((message) => {
                    const isOwnMessage = message.sender_id === currentUser?.uid;
                        
                        return (
                            <div
                                key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                            <div
                                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                                    isOwnMessage 
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                }`}
                            >
                                <p className="text-sm sm:text-base break-words">{message.content}</p>
                                <div className={`flex items-center justify-between mt-1 ${
                                        isOwnMessage ? 'text-teal-100' : 'text-gray-500'
                                    }`}>
                                        <span className="text-xs">
                                        {formatTime(message.created_at)}
                                        </span>
                                        {isOwnMessage && getMessageStatusIcon(message.status)}
                                    </div>
                                </div>
                            </div>
                        );
                })}
                
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-900 px-3 sm:px-4 py-2 rounded-lg">
                            <p className="text-sm italic">
                                {typingUsers.length === 1 
                                    ? `${typingUsers[0]} is typing...`
                                    : `${typingUsers.length} people are typing...`
                                }
                            </p>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-3 sm:p-4 relative">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleEmojiPicker}
                        className={`p-1.5 sm:p-2 transition-colors flex-shrink-0 ${
                            showEmojiPicker 
                                ? 'text-teal-600 bg-teal-50 rounded-lg' 
                                : 'text-gray-500 hover:text-teal-600'
                        }`}
                    >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    
                    <input
                        ref={messageInputRef}
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isSendingRef.current) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                    />
                    
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation?.isLoading || isSendingRef.current}
                        className="px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm sm:text-base"
                    >
                        {isSendingRef.current ? 'Sending...' : 'Send'}
                    </button>
                </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-20 w-72 sm:w-80 md:w-96 max-h-80 overflow-hidden">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 max-h-80 overflow-y-auto">
                            <EmojiPicker 
                                onEmojiSelect={handleEmojiSelect} 
                                onClose={() => setShowEmojiPicker(false)}
                            />
            </div>
                    </div>
                )}
            </div>
            
            {/* Report User Modal */}
            <ReportUserModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                reportedUserId={chatRoom.other_user_id}
                reportedUserName={chatRoom.other_user_name}
            />
        </div>
    );
});
