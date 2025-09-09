import { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { IChatUser } from "../types/chat";

interface ChatWindowProps {
    chatUser: IChatUser;
    onClose: () => void;
}

export const ChatWindow = ({ chatUser, onClose }: ChatWindowProps) => {
    const { messages, sendMessage, setTyping, typingUsers, isConnected } = useChat();
    const [messageInput, setMessageInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle typing indicator
    useEffect(() => {
        if (isTyping) {
            setTyping("current_user", true);
        } else {
            setTyping("current_user", false);
        }
    }, [isTyping, setTyping]);

    const handleSendMessage = async () => {
        if (!messageInput.trim()) return;

        await sendMessage(messageInput, chatUser.id);
        setMessageInput("");
        setIsTyping(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        
        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMessageStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
                return <span className="text-gray-400">✓</span>;
            case 'delivered':
                return <span className="text-gray-400">✓✓</span>;
            case 'read':
                return <span className="text-blue-500">✓✓</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 bg-[#069B93] text-white">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                        <img 
                            src={chatUser.avatar} 
                            alt={chatUser.displayName}
                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                        />
                        {chatUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm lg:text-base truncate">{chatUser.displayName}</h3>
                        <p className="text-xs lg:text-sm text-[#B9F3DF] truncate">
                            {chatUser.isOnline ? 'Online' : `Last seen ${chatUser.lastSeen}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:text-[#B9F3DF] transition-colors text-lg lg:text-xl font-bold flex-shrink-0 ml-2"
                >
                    ×
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 lg:py-8">
                        <p className="text-sm lg:text-base">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === "current_user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] lg:max-w-md px-3 lg:px-4 py-2 lg:py-2 rounded-lg ${
                                message.senderId === "current_user"
                                    ? "bg-[#069B93] text-white"
                                    : "bg-gray-100 text-gray-900"
                            }`}>
                                <p className="text-sm lg:text-sm break-words">{message.content}</p>
                                <div className={`flex items-center justify-between mt-1 text-xs ${
                                    message.senderId === "current_user" ? "text-[#B9F3DF]" : "text-gray-500"
                                }`}>
                                    <span>{formatTime(message.timestamp)}</span>
                                    {message.senderId === "current_user" && (
                                        <span className="ml-2">
                                            {getMessageStatusIcon(message.status)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Typing Indicator */}
                {typingUsers.some(t => t.userId === chatUser.id) && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 lg:p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-3 lg:px-4 py-2 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                        disabled={!isConnected}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || !isConnected}
                        className="px-4 lg:px-6 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base font-medium"
                    >
                        Send
                    </button>
                </div>
                {!isConnected && (
                    <p className="text-xs text-red-500 mt-1">Connection lost. Trying to reconnect...</p>
                )}
            </div>
        </div>
    );
};
