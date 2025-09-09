import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Elements/Navbar";
import { ChatList } from "../../../components/ChatList";
import { ChatWindow } from "../../../components/ChatWindow";
import { getChatUserById, getChatRoomByParticipants } from "../../../data/chat-data";
import { IChatUser } from "../../../types/chat";

export const Chat = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState<IChatUser | null>(null);

    // Check if user is connected (simplified check)
    const isConnected = (targetUserId: string) => {
        const room = getChatRoomByParticipants("current_user", targetUserId);
        return room !== null;
    };

    // Handle user selection from chat list
    const handleSelectChat = (user: IChatUser) => {
        setSelectedUser(user);
        navigate(`/chat/${user.id}`);
    };

    // Handle closing chat window
    const handleCloseChat = () => {
        setSelectedUser(null);
        navigate('/chat');
    };

    // If userId is provided, find the user
    if (userId && !selectedUser) {
        const user = getChatUserById(userId);
        if (user && isConnected(userId)) {
            setSelectedUser(user);
        } else {
            // User not found or not connected, redirect to chat list
            navigate('/chat');
        }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <Navbar />
            <div className="min-h-screen">
                <div className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
                    {/* Breadcrumb - Hidden on mobile when chat is open */}
                    <div className={`mb-4 lg:mb-6 ${selectedUser ? 'hidden lg:block' : 'block'}`}>
                        <nav className="flex items-center space-x-2 text-xs lg:text-sm">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="text-[#069B93] hover:text-[#058a7a]"
                            >
                                Dashboard
                            </button>
                            <span className="text-gray-400">›</span>
                            <span className="text-gray-600 truncate">
                                {selectedUser ? `Chat with ${selectedUser.displayName}` : 'Messages'}
                            </span>
                        </nav>
                    </div>

                    {/* Chat Interface */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
                        <div className="flex h-full">
                            {/* Chat List Sidebar - Hidden on mobile when chat is open */}
                            <div className={`${selectedUser ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200`}>
                                <ChatList onSelectChat={handleSelectChat} />
                            </div>

                            {/* Chat Window - Full width on mobile, flex-1 on desktop */}
                            <div className={`${selectedUser ? 'block' : 'hidden lg:block'} flex-1`}>
                                {selectedUser ? (
                                    <ChatWindow 
                                        chatUser={selectedUser} 
                                        onClose={handleCloseChat}
                                    />
                                ) : (
                                    <div className="hidden lg:flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl">💬</span>
                                            </div>
                                            <p className="text-lg font-medium">Select a conversation</p>
                                            <p className="text-sm mt-2">Choose a chat from the sidebar to start messaging</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Connection Notice - Hidden on mobile when chat is open */}
                    <div className={`mt-4 lg:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 ${selectedUser ? 'hidden lg:block' : 'block'}`}>
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">ℹ</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 text-sm lg:text-base">Chat Access</h4>
                                <p className="text-xs lg:text-sm text-blue-700 mt-1">
                                    You can only chat with crew members you've connected with. 
                                    Send connection requests from the Explore Ships page - once accepted, you'll be able to view their full profile and chat directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
