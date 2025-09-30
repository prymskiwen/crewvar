import { useRef, useEffect } from 'react';
import { HiBell, HiCheck, HiX, HiCog } from 'react-icons/hi';
import { Link } from 'react-router-dom';
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

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
    // TODO: Implement Firebase notifications functionality
    const notifications: INotification[] = [];
    const unreadCount = 0;
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
    const isLoading = false;

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'connection_request':
                return '👋';
            case 'connection_accepted':
                return '✅';
            case 'new_message':
                return '💬';
            case 'daily_summary':
                return '📧';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'connection_request':
                return 'text-blue-600';
            case 'connection_accepted':
                return 'text-green-600';
            case 'new_message':
                return 'text-purple-600';
            case 'daily_summary':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };


    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <HiBell className="w-5 h-5 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                        <Link
                            to="/notifications"
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={onClose}
                        >
                            <HiCog className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <HiBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification: INotification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
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
                                            <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-1 ml-2">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 text-gray-400 hover:text-green-600"
                                                    title="Mark as read"
                                                >
                                                    <HiCheck className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeNotification(notification.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Remove"
                                            >
                                                <HiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <Link
                        to="/all-notifications"
                        className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={onClose}
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
};
