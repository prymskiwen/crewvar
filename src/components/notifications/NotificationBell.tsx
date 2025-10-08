import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/data';

// TODO: Define INotification interface
interface INotification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationBellProps {
    className?: string;
}

export const NotificationBell = ({ className = '' }: NotificationBellProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    // TODO: Implement Firebase notifications functionality
    const unreadCount = 0;
    const notifications: INotification[] = [];
    const isLoading = false;
    const markAsRead = (notificationId: string) => {
        // Placeholder function
        console.log('Marking notification as read:', notificationId);
    };
    const markAllAsRead = () => {
        // Placeholder function
        console.log('Marking all notifications as read');
    };
    const removeNotification = (notificationId: string) => {
        // Placeholder function
        console.log('Removing notification:', notificationId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notification: INotification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'connection_request':
                navigate('/connections/pending');
                break;
            case 'connection_accepted':
                navigate('/connections/list');
                break;
            case 'connection_declined':
                navigate('/connections/list');
                break;
            case 'message':
                navigate('/chat');
                break;
            case 'assignment':
                navigate('/calendar');
                break;
            case 'port_connection':
                navigate('/port-connections');
                break;
            case 'moderation':
                navigate('/moderation');
                break;
            default:
                // Stay on current page for system notifications
                break;
        }

        setIsOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount > 0) {
            await markAllAsRead();
        }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        await removeNotification(notificationId);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'connection_request':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            case 'connection_accepted':
                return '✅';
            case 'connection_declined':
                return '❌';
            case 'message':
            case 'new_message':
                return '💬';
            case 'system':
                return '🔔';
            case 'assignment':
                return '📅';
            case 'port_connection':
                return '🚢';
            case 'moderation':
                return '🛡️';
            default:
                return '📢';
        }
    };


    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-[#069B93] transition-colors"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"
                    />
                </svg>

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-[#069B93] hover:text-[#058a7a] font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center">
                                <div className="w-6 h-6 border-2 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl text-gray-400">🗑️</span>
                                </div>
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.slice(0, 10).map((notification: INotification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <span className="text-lg">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                            }`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                                                        className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete notification"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-500">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => navigate('/all-notifications')}
                                className="w-full text-center text-[#069B93] hover:text-[#058a7a] text-sm font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
