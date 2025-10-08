import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextFirebase';
import { subscribeToLiveNotifications, markLiveNotificationAsRead, clearAllNotifications, clearAllLegacyNotifications, LiveNotification, getNotifications, markNotificationAsRead } from '../../firebase/firestore';
import { formatTimeAgo } from '../../utils/data';

interface LiveNotificationsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LiveNotifications: React.FC<LiveNotificationsProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
    const [legacyNotifications, setLegacyNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearingAll, setClearingAll] = useState(false);

    // Fetch legacy notifications
    useEffect(() => {
        const fetchLegacyNotifications = async () => {
            if (!currentUser) return;
            
            try {
                const notifications = await getNotifications(currentUser.uid);
                setLegacyNotifications(notifications);
            } catch (error) {
                console.error('Error fetching legacy notifications:', error);
            }
        };

        fetchLegacyNotifications();
    }, [currentUser]);

    // Subscribe to live notifications
    useEffect(() => {
        if (!currentUser) {
            console.log('🔔 LiveNotifications: No current user, skipping subscription');
            return;
        }

        console.log('🔔 LiveNotifications: Setting up subscription for user:', currentUser.uid);
        const unsubscribe = subscribeToLiveNotifications(currentUser.uid, (liveNotifications: LiveNotification[]) => {
            console.log('🔔 LiveNotifications: Received notifications:', liveNotifications.length, 'notifications');
            console.log('🔔 LiveNotifications: Notifications data:', liveNotifications);
            setLiveNotifications(liveNotifications);
            setLoading(false);
        });

        return () => {
            console.log('🔔 LiveNotifications: Cleaning up subscription');
            unsubscribe();
        };
    }, [currentUser]);

    // Combine both notification types
    const allNotifications = [
        ...liveNotifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.timestamp,
            read: n.read,
            isLive: true
        })),
        ...legacyNotifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.createdAt?.toDate?.()?.getTime() || Date.now(),
            read: n.isRead,
            isLive: false
        }))
    ].sort((a, b) => b.timestamp - a.timestamp);

    const handleMarkAsRead = async (notificationId: string, isLive: boolean) => {
        if (!currentUser) return;

        try {
            if (isLive) {
                await markLiveNotificationAsRead(notificationId);
            } else {
                await markNotificationAsRead(notificationId);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleClearAll = async () => {
        if (!currentUser || clearingAll) return;

        setClearingAll(true);
        try {
            console.log('🗑️ Clearing all notifications for user:', currentUser.uid);
            
            // Clear both live and legacy notifications
            await Promise.all([
                clearAllNotifications(currentUser.uid),
                clearAllLegacyNotifications(currentUser.uid)
            ]);
            
            console.log('✅ All notifications cleared successfully');
            
            // Refresh both notification lists
            setLiveNotifications([]);
            setLegacyNotifications([]);
        } catch (error) {
            console.error('❌ Error clearing all notifications:', error);
        } finally {
            setClearingAll(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            case 'connection_request':
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                );
            case 'system':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
                    </svg>
                );
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'message':
                return 'border-l-blue-500 bg-blue-50';
            case 'connection_request':
                return 'border-l-green-500 bg-green-50';
            case 'system':
                return 'border-l-yellow-500 bg-yellow-50';
            default:
                return 'border-l-gray-500 bg-gray-50';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">All Notifications</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                ) : allNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                            <span className="text-3xl text-gray-300">🗑️</span>
                        </div>
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {allNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            )}
                                        </div>
                                        <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTimeAgo(notification.timestamp)}
                                        </p>
                                        {!notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id, notification.isLive)}
                                                className="text-xs text-blue-600 hover:text-blue-800 mt-2 transition-colors"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {allNotifications.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleClearAll}
                        disabled={clearingAll}
                        className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {clearingAll ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Clearing...</span>
                            </>
                        ) : (
                            <span>Clear all notifications</span>
                        )}
                    </button>
                    
                    <Link
                        to="/all-notifications"
                        onClick={onClose}
                        className="w-full mt-2 text-sm text-[#069B93] hover:text-[#058a7a] transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>View All Notifications</span>
                    </Link>
                </div>
            )}
            
            {allNotifications.length === 0 && !loading && (
                <div className="p-4 border-t border-gray-200">
                    <Link
                        to="/all-notifications"
                        onClick={onClose}
                        className="w-full text-sm text-[#069B93] hover:text-[#058a7a] transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>View All Notifications</span>
                    </Link>
                </div>
            )}
        </div>
    );
};
