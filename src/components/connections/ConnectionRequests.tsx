import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IConnectionRequest, INotification } from "../../types/connections";
import { defaultAvatar } from "../../utils/images";
import {
    getPendingRequestsForUser,
    getSentRequestsForUser,
    sampleProfiles,
    sampleConnections,
    sampleConnectionRequests
} from "../../data/samples/connections-data";
import {
    getNotificationsForUser,
    getUnreadNotificationsCount
} from "../../firebase/firestore";

interface ConnectionRequestsProps {
    currentUserId: string;
    onAcceptRequest: (requestId: string) => void;
    onDeclineRequest: (requestId: string) => void;
    onBlockUser: (userId: string) => void;
}

export const ConnectionRequests = ({
    currentUserId,
    onAcceptRequest,
    onDeclineRequest,
    onBlockUser
}: ConnectionRequestsProps) => {
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState<IConnectionRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<IConnectionRequest[]>([]);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'pending' | 'sent' | 'notifications'>('pending');
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    useEffect(() => {
        // Load data
        setPendingRequests(getPendingRequestsForUser(currentUserId));
        setSentRequests(getSentRequestsForUser(currentUserId));

        // Load notifications asynchronously
        const loadNotifications = async () => {
            try {
                setLoadingNotifications(true);
                const [notificationsData, unreadCountData] = await Promise.all([
                    getNotificationsForUser(currentUserId),
                    getUnreadNotificationsCount(currentUserId)
                ]);
                setNotifications(notificationsData as INotification[]);
                setUnreadCount(unreadCountData);
            } catch (error) {
                console.error('Error loading notifications:', error);
            } finally {
                setLoadingNotifications(false);
            }
        };

        loadNotifications();
    }, [currentUserId]);

    const handleAcceptRequest = (requestId: string) => {
        onAcceptRequest(requestId);

        // Find the request to get the user ID
        const request = pendingRequests.find((req: IConnectionRequest) => req.id === requestId);
        if (request) {
            // Update the connection request status to accepted
            const requestIndex = sampleConnectionRequests.findIndex((req: any) => req.id === requestId);
            if (requestIndex !== -1) {
                sampleConnectionRequests[requestIndex].status = 'accepted';
                sampleConnectionRequests[requestIndex].updatedAt = new Date().toISOString();
            }

            // Add a new connection
            const newConnection = {
                id: `conn_${Date.now()}`,
                user1_id: "current_user",
                user2_id: request.fromUserId,
                created_at: new Date().toISOString(),
                status: "connected"
            };
            sampleConnections.push(newConnection);

            // Update local state
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Navigate to the person's profile to show Level 2 access
            navigate(`/profile/${request.fromUserId}`, {
                state: { connectionAccepted: true }
            });
        }
    };

    const handleDeclineRequest = (requestId: string) => {
        onDeclineRequest(requestId);
        // Update local state
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleBlockUser = (userId: string) => {
        onBlockUser(userId);
        // Update local state
        setPendingRequests(prev => prev.filter(req => req.fromUserId !== userId));
    };

    const markNotificationAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#069B93]">Connection Requests</h2>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'pending'
                        ? 'bg-white text-[#069B93] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Pending ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sent'
                        ? 'bg-white text-[#069B93] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Sent ({sentRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'notifications'
                        ? 'bg-white text-[#069B93] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Notifications ({unreadCount})
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'pending' && (
                    <div>
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No pending connection requests</p>
                            </div>
                        ) : (
                            pendingRequests.map((request) => {
                                const requesterProfile = sampleProfiles.find((profile: any) => profile.id === request.fromUserId);
                                return (
                                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <img
                                                src={requesterProfile?.avatar || defaultAvatar}
                                                alt={requesterProfile?.displayName || "User"}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {requesterProfile?.displayName || "Unknown User"}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {requesterProfile?.role} • {requesterProfile?.department}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {request.message && (
                                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">"{request.message}"</p>
                                            </div>
                                        )}

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAcceptRequest(request.id)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDeclineRequest(request.id)}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleBlockUser(request.fromUserId)}
                                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                Block
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'sent' && (
                    <div>
                        {sentRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No sent connection requests</p>
                            </div>
                        ) : (
                            sentRequests.map((request) => (
                                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#00A59E] to-[#069B93] rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">U</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">Request Sent</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                                            Pending
                                        </span>
                                    </div>

                                    {request.message && (
                                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700">"{request.message}"</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div>
                        {loadingNotifications ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-500">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${notification.isRead
                                        ? 'border-gray-200 bg-white'
                                        : 'border-[#069B93] bg-[#069B93]/5'
                                        }`}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? 'bg-gray-300' : 'bg-[#069B93]'
                                            }`}></div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
