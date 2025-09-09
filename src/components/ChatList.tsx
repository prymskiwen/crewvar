import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { IChatRoom, IChatUser } from "../types/chat";
import { getChatUserById } from "../data/chat-data";

interface ChatListProps {
    onSelectChat: (user: IChatUser) => void;
}

export const ChatList = ({ onSelectChat }: ChatListProps) => {
    const { getChatRooms, unreadCount } = useChat();
    const [searchTerm, setSearchTerm] = useState("");

    const chatRooms = getChatRooms();
    const filteredRooms = chatRooms.filter(room => {
        if (!searchTerm) return true;
        
        const otherUser = getChatUserById(
            room.participants.find(id => id !== "current_user") || ""
        );
        
        return otherUser?.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleRoomClick = (room: IChatRoom) => {
        const otherUserId = room.participants.find(id => id !== "current_user");
        if (otherUserId) {
            const otherUser = getChatUserById(otherUserId);
            if (otherUser) {
                onSelectChat(otherUser);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-3 lg:p-4 border-b border-gray-200 bg-[#069B93] text-white">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h2 className="text-lg lg:text-xl font-bold">Messages</h2>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                
                {/* Search */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base bg-white text-gray-900 rounded-lg focus:border-[#B9F3DF] focus:ring-1 focus:ring-[#B9F3DF] focus:outline-none"
                />
            </div>

            {/* Chat Rooms List */}
            <div className="flex-1 overflow-y-auto">
                {filteredRooms.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No conversations found</p>
                        {searchTerm && (
                            <p className="text-sm mt-2">Try adjusting your search</p>
                        )}
                    </div>
                ) : (
                    filteredRooms.map((room) => {
                        const otherUserId = room.participants.find(id => id !== "current_user");
                        const otherUser = otherUserId ? getChatUserById(otherUserId) : null;
                        
                        if (!otherUser) return null;

                        return (
                            <div
                                key={room.id}
                                onClick={() => handleRoomClick(room)}
                                className="flex items-center space-x-3 p-3 lg:p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={otherUser.avatar} 
                                        alt={otherUser.displayName}
                                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                                    />
                                    {otherUser.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">
                                            {otherUser.displayName}
                                        </h3>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <span className="text-xs text-gray-500">
                                                {formatTime(room.lastActivity)}
                                            </span>
                                            {room.unreadCount > 0 && (
                                                <span className="bg-[#069B93] text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    {room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs lg:text-sm text-gray-600 truncate mt-1">
                                        {room.lastMessage?.content || "No messages yet"}
                                    </p>
                                    
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${
                                            otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                        <span className="text-xs text-gray-500 truncate">
                                            {otherUser.isOnline ? 'Online' : `Last seen ${otherUser.lastSeen}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Empty State */}
            {chatRooms.length === 0 && (
                <div className="text-center text-gray-500 py-6 lg:py-8">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                        <span className="text-xl lg:text-2xl">💬</span>
                    </div>
                    <p className="text-base lg:text-lg font-medium">No conversations yet</p>
                    <p className="text-xs lg:text-sm mt-2">Connect with crew members to start chatting!</p>
                </div>
            )}
        </div>
    );
};
