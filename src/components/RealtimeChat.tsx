import { useState, useRef, useEffect } from 'react';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl } from '../utils/imageUtils';

interface RealtimeChatProps {
    roomId: string;
    className?: string;
}

export const RealtimeChat = ({ roomId, className = '' }: RealtimeChatProps) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false); // Start with false to prevent initial scroll
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const { currentUser } = useAuth();
    const { 
        messages, 
        isConnected, 
        typingText, 
        sendMessage, 
        handleStartTyping, 
        handleStopTyping 
    } = useRealtimeChat({ roomId });

    // Ensure chat scrolls to bottom on initial load (for direct navigation)
    useEffect(() => {
        if (messagesContainerRef.current && messages.length > 0) {
            // Small delay to ensure messages are rendered
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [messages.length]); // Run when messages are first loaded

    // Focus input field on mount for better UX
    useEffect(() => {
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, []); // Run once on mount
    useEffect(() => {
        if (messagesContainerRef.current && messages.length > 0 && isConnected) {
            // Ensure we scroll to bottom when component mounts with messages (direct navigation)
            const timer = setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [isConnected]); // Run when connection state changes

    // Smart auto-scroll: only scroll when user sends message or is near bottom
    useEffect(() => {
        if (!messagesContainerRef.current || !messagesEndRef.current) return;
        
        const container = messagesContainerRef.current;
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
        
        // Only auto-scroll if:
        // 1. User is near the bottom (within 100px), OR
        // 2. User just sent a message (message count increased and last message is from current user)
        const messageCountIncreased = messages.length > lastMessageCount;
        const lastMessage = messages[messages.length - 1];
        const isLastMessageFromCurrentUser = lastMessage && lastMessage.userId === currentUser?.uid;
        
        // Don't auto-scroll on initial load unless user is near bottom
        const isInitialLoad = lastMessageCount === 0 && messages.length > 0;
        
        if (shouldAutoScroll || isNearBottom || (messageCountIncreased && isLastMessageFromCurrentUser && !isInitialLoad)) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setShouldAutoScroll(false); // Reset after scrolling
        }
        
        setLastMessageCount(messages.length);
    }, [messages, currentUser?.uid, lastMessageCount, shouldAutoScroll]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(message);
            setMessage('');
            
            // Restore focus to input field for better UX
            setTimeout(() => {
                if (messageInputRef.current) {
                    messageInputRef.current.focus();
                }
            }, 50);
            
            // Trigger auto-scroll for user's own message
            setShouldAutoScroll(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        
        if (e.target.value.length > 0) {
            handleStartTyping();
        } else {
            handleStopTyping();
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isConnected) {
        return (
            <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Connecting to chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[500px] sm:h-[600px] bg-white rounded-lg shadow-lg ${className}`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#069B93] text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="font-medium">Real-time Chat</span>
                </div>
                <div className="text-sm opacity-75">
                    Room: {roomId}
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-xs lg:max-w-md ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                <img
                                    src={getProfilePhotoUrl(currentUser?.photoURL)}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                                <div className={`ml-3 ${msg.isOwn ? 'mr-3' : ''}`}>
                                    <div
                                        className={`px-4 py-2 rounded-lg ${
                                            msg.isOwn
                                                ? 'bg-[#069B93] text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                    <div className={`text-xs text-gray-500 mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {/* Typing Indicator */}
                {typingText && (
                    <div className="flex justify-start">
                        <div className="flex max-w-xs lg:max-w-md">
                            <div className="ml-3">
                                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-1">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="ml-2">{typingText}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 rounded-b-lg">
                <div className="flex space-x-2">
                    <input
                        ref={messageInputRef}
                        type="text"
                        value={message}
                        onChange={handleInputChange}
                        onBlur={handleStopTyping}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent outline-none"
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || !isConnected}
                        className="px-6 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};
