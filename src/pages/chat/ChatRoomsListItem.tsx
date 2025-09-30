import React from 'react';
import { formatTimeAgo, getShipName, getDepartmentName, getRoleName } from '../../utils/data';
import { defaultAvatar } from '../../utils/images';

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

interface ChatRoomsListItemProps {
    room: ChatRoom;
    onSelectRoom: (room: ChatRoom) => void;
    allShips: any[];
    allDepartments: any[];
    allRoles: any[];
}

export const ChatRoomsListItem: React.FC<ChatRoomsListItemProps> = ({
    room,
    onSelectRoom,
    allShips,
    allDepartments,
    allRoles
}) => {
    return (
        <div
            onClick={() => onSelectRoom(room)}
            className={`flex items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${(room.unreadCount ?? 0) > 0 ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                }`}
        >
            {/* Avatar with unread badge */}
            <div className="relative flex-shrink-0">
                <img
                    src={room.otherUserProfile?.profilePhoto || defaultAvatar}
                    alt={room.otherUserProfile?.displayName || 'User'}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                />
                {/* Unread count badge */}
                {(room.unreadCount ?? 0) > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-lg border-2 border-white">
                        {(room.unreadCount ?? 0) > 99 ? '99+' : (room.unreadCount ?? 0)}
                    </div>
                )}
            </div>

            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <div className="flex items-center">
                    <div className="flex flex-col">
                        <h3 className={`text-sm sm:text-base font-medium text-gray-900 truncate ${(room.unreadCount ?? 0) > 0 ? 'font-bold' : ''
                            }`}>
                            {room.otherUserProfile?.displayName || 'Unknown User'}
                        </h3>
                        {room.otherUserProfile?.roleId && (
                            <span className="text-xs text-gray-500 truncate">
                                {getRoleName(room.otherUserProfile.roleId, allRoles)}
                            </span>
                        )}
                        <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                            {/* Always show ship info, even if currentShipId is not available */}
                            <span className="sm:inline">
                                {room.otherUserProfile?.currentShipId ?
                                    getShipName(room.otherUserProfile.currentShipId, allShips) :
                                    'Not assigned'
                                }
                            </span>
                            {room.otherUserProfile?.currentShipId && room.otherUserProfile?.departmentId && (
                                <span className="sm:inline ml-1 mr-1"> • </span>
                            )}
                            {room.otherUserProfile?.departmentId && (
                                <span className="truncate">
                                    {getDepartmentName(room.otherUserProfile.departmentId, allDepartments)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm text-gray-600 truncate ${(room.unreadCount ?? 0) > 0 ? 'font-semibold' : ''
                        }`}>
                        {room.lastMessage || 'No messages yet'}
                    </p>
                    <span className="text-xs text-gray-500">
                        {room.lastMessageAt ?
                            formatTimeAgo(room.lastMessageAt || '') :
                            formatTimeAgo(room.createdAt || '')
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};
