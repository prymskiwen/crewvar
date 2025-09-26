import { useState } from "react";
// TODO: Implement Firebase port connection and quick check-in functionality
import { getConnectionDuration } from "../data/port-connections-data";
import { defaultAvatar } from "../utils/images";

interface WhoInPortProps {
    portName: string;
    date: string;
    onConnect?: (userId: string, userName: string) => void;
}

export const WhoInPort = ({ portName, date, onConnect }: WhoInPortProps) => {
    // TODO: Implement Firebase quick check-in and port connection functionality
    const currentShip = null;
    const getCrewInSamePort = () => {
        // Placeholder function
    };
    const [connectionRequests, setConnectionRequests] = useState<{ [key: string]: 'pending' | 'sent' | 'accepted' | 'declined' | 'none' }>({});

    if (!currentShip) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Please select your ship to see crew members in port.</p>
                </div>
            </div>
        );
    }

    const crewInSamePort = getCrewInSamePort(portName, currentShip.shipId, date);

    const handleConnect = (userId: string, userName: string) => {
        setConnectionRequests(prev => ({ ...prev, [userId]: 'sent' }));

        if (onConnect) {
            onConnect(userId, userName);
        }

        // Simulate connection request
        setTimeout(() => {
            setConnectionRequests(prev => ({ ...prev, [userId]: 'pending' }));
        }, 1000);
    };

    const getConnectionStatus = (userId: string) => {
        return connectionRequests[userId] || 'none';
    };

    const getButtonText = (status: string) => {
        switch (status) {
            case 'sent': return 'Request Sent';
            case 'pending': return 'Request Pending';
            case 'accepted': return 'Connected';
            case 'declined': return 'Request Declined';
            default: return 'Connect';
        }
    };

    const getButtonStyle = (status: string) => {
        switch (status) {
            case 'sent':
            case 'pending':
                return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'accepted':
                return 'bg-green-500 hover:bg-green-600 text-white';
            case 'declined':
                return 'bg-red-500 hover:bg-red-600 text-white';
            default:
                return 'bg-[#069B93] hover:bg-[#058a7a] text-white';
        }
    };

    if (crewInSamePort.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-[#069B93] mb-4">
                    Who's in {portName} Today?
                </h2>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">🚢</span>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No other crew members found</p>
                    <p className="text-gray-400 text-sm">
                        Mark your port status to connect with crew from other ships docked in the same port.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#069B93]">
                    Who's in {portName} Today?
                </h2>
                <span className="text-sm text-gray-500">
                    {crewInSamePort.length} crew member{crewInSamePort.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-4">
                {crewInSamePort.map((crewMember) => {
                    const connectionStatus = getConnectionStatus(crewMember.userId);
                    const isDisabled = connectionStatus !== 'none' && connectionStatus !== 'declined';

                    return (
                        <div key={crewMember.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    src={defaultAvatar}
                                    alt={crewMember.userDisplayName}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>

                            {/* Crew Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {crewMember.userDisplayName}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">
                                    {crewMember.userRole}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {crewMember.shipName}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {getConnectionDuration(crewMember)}
                                </p>
                            </div>

                            {/* Connection Button */}
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => handleConnect(crewMember.userId, crewMember.userDisplayName)}
                                    disabled={isDisabled}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDisabled
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : getButtonStyle(connectionStatus)
                                        }`}
                                >
                                    {getButtonText(connectionStatus)}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">ℹ</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Port Connections</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            These crew members are from ships docked in the same port as your ship today.
                            Connect with them to chat and plan meetups!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
