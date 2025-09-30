import React from 'react';

interface ChatRoomsSummaryProps {
    totalRooms: number;
    hasActiveFilters: boolean;
}

export const ChatRoomsSummary: React.FC<ChatRoomsSummaryProps> = ({
    totalRooms,
    hasActiveFilters
}) => {
    return (
        <div className="mb-4">
            <p className="text-sm text-gray-600">
                Showing {totalRooms} conversations
                {hasActiveFilters && ' (filtered)'}
            </p>
        </div>
    );
};
