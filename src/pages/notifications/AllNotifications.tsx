import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextFirebase';
import { LoadingPage } from '../../components/ui';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../firebase/firestore';
import { DashboardLayout } from '../../layout';
import { formatTimeAgo } from '../../utils/data';

// TODO: Define INotification interface
interface INotification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: any; // Can be Firestore timestamp object or string
}

export const AllNotificationsPage = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    // Fetch notifications from Firebase
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', currentUser?.uid],
        queryFn: () => getNotifications(currentUser!.uid),
        enabled: !!currentUser?.uid
    });

    const unreadCount = notifications.filter((n: INotification) => !n.isRead).length;

    // Mark notification as read mutation
    const markAsReadMutation = useMutation(
        async (notificationId: string) => {
            return await markNotificationAsRead(notificationId);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
            onError: (error: any) => {
                console.error('Failed to mark notification as read:', error);
                toast.error('Failed to mark notification as read');
            }
        }
    );

    // Mark all notifications as read mutation
    const markAllAsReadMutation = useMutation(
        async () => {
            return await markAllNotificationsAsRead(currentUser!.uid);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                toast.success('All notifications marked as read');
            },
            onError: (error: any) => {
                console.error('Failed to mark all notifications as read:', error);
                toast.error('Failed to mark all notifications as read');
            }
        }
    );

    // Delete notification mutation
    const deleteNotificationMutation = useMutation(
        async (notificationId: string) => {
            return await deleteNotification(notificationId);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
            onError: (error: any) => {
                console.error('Failed to delete notification:', error);
                toast.error('Failed to delete notification');
            }
        }
    );

    const markAsRead = async (notificationId: string) => {
        await markAsReadMutation.mutateAsync(notificationId);
    };

    const markAllAsRead = async () => {
        await markAllAsReadMutation.mutateAsync();
    };

    const removeNotification = async (notificationId: string) => {
        await deleteNotificationMutation.mutateAsync(notificationId);
    };
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
    const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteAction, setDeleteAction] = useState<{
        type: 'all' | 'selected';
        count: number;
        action: () => void;
    } | null>(null);
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());


    const toggleMessageExpansion = (notificationId: string) => {
        setExpandedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(notificationId)) {
                newSet.delete(notificationId);
            } else {
                newSet.add(notificationId);
            }
            return newSet;
        });
    };

    const isMessageLong = (message: string) => {
        return message.length > 150;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'connection_request':
                return (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                );
            case 'connection_accepted':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'message':
            case 'new_message':
                return (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                );
            case 'admin_message':
                return (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5V6a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v11a2.5 2.5 0 01-2.5 2.5h-15z" />
                        </svg>
                    </div>
                );
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter((n: INotification) => !n.isRead)
        : notifications;

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation(); // Prevent triggering the mark as read action
        try {
            await removeNotification(notificationId);
            toast.success('🗑️ Notification deleted', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification. Please try again.', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        setIsMarkingAsRead(true);
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            setIsMarkingAsRead(false);
        }
    };

    const handleSelectNotification = (notificationId: string) => {
        setSelectedNotifications(prev => {
            const newSet = new Set(prev);
            if (newSet.has(notificationId)) {
                newSet.delete(notificationId);
            } else {
                newSet.add(notificationId);
            }
            return newSet;
        });
    };

    const handleMarkSelectedAsRead = async () => {
        setIsMarkingAsRead(true);
        try {
            for (const notificationId of selectedNotifications) {
                await markAsRead(notificationId);
            }
            setSelectedNotifications(new Set());
        } catch (error) {
            console.error('Failed to mark selected notifications as read:', error);
        } finally {
            setIsMarkingAsRead(false);
        }
    };

    const handleDeleteAllNotifications = () => {
        setDeleteAction({
            type: 'all',
            count: filteredNotifications.length,
            action: async () => {
                setIsMarkingAsRead(true);
                try {
                    for (const notification of filteredNotifications) {
                        await removeNotification(notification.id);
                    }
                    setSelectedNotifications(new Set());
                    toast.success(`🗑️ Deleted ${filteredNotifications.length} notifications`, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } catch (error) {
                    console.error('Failed to delete all notifications:', error);
                    toast.error('Failed to delete notifications. Please try again.', {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } finally {
                    setIsMarkingAsRead(false);
                }
            }
        });
        setShowDeleteConfirm(true);
    };

    const handleDeleteSelectedNotifications = () => {
        setDeleteAction({
            type: 'selected',
            count: selectedNotifications.size,
            action: async () => {
                setIsMarkingAsRead(true);
                try {
                    for (const notificationId of selectedNotifications) {
                        await removeNotification(notificationId);
                    }
                    setSelectedNotifications(new Set());
                    toast.success(`🗑️ Deleted ${selectedNotifications.size} notifications`, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } catch (error) {
                    console.error('Failed to delete selected notifications:', error);
                    toast.error('Failed to delete notifications. Please try again.', {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } finally {
                    setIsMarkingAsRead(false);
                }
            }
        });
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (deleteAction) {
            deleteAction.action();
        }
        setShowDeleteConfirm(false);
        setDeleteAction(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteAction(null);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // The context will automatically reload notifications
            // We just need to wait a bit for the refresh
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingPage message="Loading notifications..." backgroundColor="#f9fafb" />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Header */}
                <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div>
                                <h1 className="text-base sm:text-lg font-bold">All Notifications</h1>
                                <p className="text-xs text-teal-100">
                                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 text-white hover:text-teal-100 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh notifications"
                            >
                                <svg
                                    className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {filteredNotifications.length > 0 && (
                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-teal-500">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={isMarkingAsRead}
                                    className="px-3 py-1.5 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isMarkingAsRead ? 'Marking...' : 'Mark All Read'}
                                </button>
                            )}
                            {selectedNotifications.size > 0 && (
                                <button
                                    onClick={handleMarkSelectedAsRead}
                                    disabled={isMarkingAsRead}
                                    className="px-3 py-1.5 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isMarkingAsRead ? 'Marking...' : `Mark ${selectedNotifications.size} Read`}
                                </button>
                            )}
                            {selectedNotifications.size > 0 && (
                                <button
                                    onClick={handleDeleteSelectedNotifications}
                                    disabled={isMarkingAsRead}
                                    className="px-3 py-1.5 text-xs bg-red-500/20 text-white rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isMarkingAsRead ? 'Deleting...' : `Delete ${selectedNotifications.size}`}
                                </button>
                            )}
                            <button
                                onClick={handleDeleteAllNotifications}
                                disabled={isMarkingAsRead}
                                className="px-3 py-1.5 text-xs bg-red-500/20 text-white rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isMarkingAsRead ? 'Deleting...' : 'Delete All'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${filter === 'all'
                                ? 'border-teal-600 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${filter === 'unread'
                                ? 'border-teal-600 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="p-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5V6a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v11a2.5 2.5 0 01-2.5 2.5h-15z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                                {filter === 'unread'
                                    ? 'All caught up! Check back later for new notifications.'
                                    : 'You\'ll see notifications here when you receive connection requests, messages, and other updates.'
                                }
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                                >
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <Link
                                    to="/notifications"
                                    className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    Notification Settings
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification: INotification) => (
                                <div
                                    key={notification.id}
                                    className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md max-w-full ${!notification.isRead ? 'border-l-4 border-l-teal-500' : 'border-gray-200'
                                        } ${selectedNotifications.has(notification.id) ? 'ring-2 ring-teal-500' : ''}`}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Checkbox for selection */}
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.has(notification.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSelectNotification(notification.id);
                                            }}
                                            className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                        />

                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                                            }`}>
                                                            {notification.title}
                                                        </h4>
                                                        {isMessageLong(notification.message) && (
                                                            <div className="flex items-center text-xs sm:text-xs text-gray-400">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Expandable</span>
                                                                <span className="sm:hidden">Tap</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`text-sm sm:text-sm mb-2 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                        {isMessageLong(notification.message) ? (
                                                            <div className="relative">
                                                                <div
                                                                    className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-md p-3 -m-2 border-l-2 touch-manipulation ${expandedMessages.has(notification.id)
                                                                        ? 'bg-gray-50 border-blue-300'
                                                                        : 'border-transparent hover:border-gray-200'
                                                                        }`}
                                                                    onClick={() => toggleMessageExpansion(notification.id)}
                                                                    title="Tap to expand/collapse message"
                                                                >
                                                                    <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-sm">
                                                                        {expandedMessages.has(notification.id)
                                                                            ? notification.message
                                                                            : notification.message.substring(0, 150) + '...'
                                                                        }
                                                                    </p>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
                                                                        <span className="text-sm sm:text-xs text-blue-600 font-medium flex items-center hover:text-blue-700 active:text-blue-800 transition-colors touch-manipulation">
                                                                            {expandedMessages.has(notification.id) ? (
                                                                                <>
                                                                                    <svg className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                                    </svg>
                                                                                    Show Less
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <svg className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                    </svg>
                                                                                    Show More
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                        <span className="text-sm sm:text-xs text-gray-400">
                                                                            {expandedMessages.has(notification.id) ? 'Tap to collapse' : 'Tap to expand'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-sm">
                                                                {notification.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeAgo(notification.createdAt)}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            {!notification.isRead && (
                                                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                                            )}
                                                            {!notification.isRead && (
                                                                <span className="text-xs text-teal-600 font-medium">
                                                                    <span className="hidden sm:inline">Click to mark as read</span>
                                                                    <span className="sm:hidden">Tap to mark as read</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                                                    className="flex-shrink-0 ml-2 p-2 sm:p-1 text-gray-400 hover:text-red-500 active:text-red-600 transition-colors touch-manipulation"
                                                    title="Delete notification"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && deleteAction && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Delete Notifications
                                </h3>
                            </div>

                            <p className="text-gray-600 mb-6">
                                {deleteAction.type === 'all'
                                    ? `Are you sure you want to delete all ${deleteAction.count} notifications? This action cannot be undone.`
                                    : `Are you sure you want to delete ${deleteAction.count} selected notification${deleteAction.count > 1 ? 's' : ''}? This action cannot be undone.`
                                }
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isMarkingAsRead}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isMarkingAsRead ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
