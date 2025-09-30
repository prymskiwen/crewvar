import React from 'react';
import { ChatRoomsListItem } from './ChatRoomsListItem';

interface ChatRoom {
    id: string;
    otherUserProfile?: {
        displayName?: string;
        profilePhoto?: string;
        currentShipId?: string;
        departmentId?: string;
        roleId?: string;
    };
    lastMessage?: string;
    lastMessageAt?: any;
    createdAt?: any;
    unreadCount?: number;
}

interface ChatRoomsListProps {
    chatRooms: ChatRoom[];
    onSelectRoom: (room: ChatRoom) => void;
    allShips: any[];
    allDepartments: any[];
    allRoles: any[];
}

export const ChatRoomsList: React.FC<ChatRoomsListProps> = ({
    chatRooms,
    onSelectRoom,
    allShips,
    allDepartments,
    allRoles
}) => {
    if (chatRooms.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Start a conversation by connecting with crew members.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
                <div className="space-y-3">
                    {chatRooms.map((room) => (
                        <ChatRoomsListItem
                            key={room.id}
                            room={room}
                            onSelectRoom={onSelectRoom}
                            allShips={allShips}
                            allDepartments={allDepartments}
                            allRoles={allRoles}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
