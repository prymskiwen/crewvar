import { useState } from "react";
import { usePortConnection } from "../context/PortConnectionContext";
import { useQuickCheckIn } from "../context/QuickCheckInContext";
import { PortConnectionForm } from "./PortConnectionForm";
import { WhoInPort } from "./WhoInPort";
import { getConnectionDuration } from "../data/port-connections-data";

export const PortConnectionsDashboard = () => {
    const { currentShip } = useQuickCheckIn();
    const { getConnectionsForShip, removePortConnection } = usePortConnection();
    const [showPortForm, setShowPortForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

    if (!currentShip) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">🚢</span>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No ship selected</p>
                    <p className="text-gray-400 text-sm">
                        Please select your current ship to manage port connections.
                    </p>
                </div>
            </div>
        );
    }

    const currentConnections = getConnectionsForShip(currentShip.shipId, selectedDate);

    const handleRemoveConnection = async (connectionId: string) => {
        setIsLoading(prev => ({ ...prev, [connectionId]: true }));
        
        try {
            await removePortConnection(connectionId);
        } catch (error) {
            console.error('Failed to remove connection:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [connectionId]: false }));
        }
    };

    const handleConnect = (userId: string, userName: string) => {
        console.log(`Connection request sent to ${userName} (${userId})`);
        // In a real app, this would send a connection request
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-[#069B93]">Port Connections</h1>
                    <button
                        onClick={() => setShowPortForm(true)}
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                    >
                        Mark Port Status
                    </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">ℹ</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">How Port Connections Work</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Mark when your ship is docked with another ship in the same port. 
                                This allows you to see and connect with crew members from other ships docked nearby.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Ship Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-[#069B93] mb-4">Your Ship</h2>
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#069B93] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {currentShip.shipName.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{currentShip.shipName}</h3>
                        <p className="text-sm text-gray-600">{currentShip.port || 'No port assigned'}</p>
                    </div>
                </div>
            </div>

            {/* Current Connections */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#069B93]">Your Port Connections</h2>
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                        />
                    </div>
                </div>

                {currentConnections.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-2xl">📍</span>
                        </div>
                        <p className="text-gray-500 text-lg mb-2">No port connections</p>
                        <p className="text-gray-400 text-sm mb-4">
                            Mark your port status to connect with crew from other ships.
                        </p>
                        <button
                            onClick={() => setShowPortForm(true)}
                            className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                        >
                            Mark Port Status
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentConnections.map((connection) => (
                            <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-gray-600 font-medium text-sm">
                                            {connection.dockedWithShipName.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Docked with {connection.dockedWithShipName}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {connection.portName} • {getConnectionDuration(connection)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveConnection(connection.id)}
                                    disabled={isLoading[connection.id]}
                                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {isLoading[connection.id] ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Who's in Port */}
            {currentConnections.length > 0 && (
                <WhoInPort
                    portName={currentConnections[0].portName}
                    date={selectedDate}
                    onConnect={handleConnect}
                />
            )}

            {/* Port Form Modal */}
            {showPortForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <PortConnectionForm
                            onClose={() => setShowPortForm(false)}
                            onSuccess={() => {
                                setShowPortForm(false);
                                // Optionally refresh data
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
