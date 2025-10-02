import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextFirebase';
import { getNotifications, getReceivedConnectionRequests, getUnreadMessageCount, subscribeToLiveNotifications, LiveNotification } from '../firebase/firestore';
import { LiveNotifications } from '../components/notifications/LiveNotifications';
import {
    HiBell,
    HiHome,
    HiUser,
    HiLogout,
    HiMenu
} from 'react-icons/hi';
import { defaultAvatar } from '../utils/images';

// Internal AppBar Component
const AppBar = ({
    onToggleSidebar,
    setShowCheckInDialog
}: {
    onToggleSidebar?: () => void;
    setShowCheckInDialog?: (show: boolean) => void;
}) => {
    const { currentUser, userProfile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);


    // Fetch notifications count
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', currentUser?.uid],
        queryFn: () => getNotifications(currentUser!.uid),
        enabled: !!currentUser?.uid
    });

    // Fetch connection requests count
    const { data: connectionRequests = [] } = useQuery({
        queryKey: ['receivedConnectionRequests', currentUser?.uid],
        queryFn: () => getReceivedConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid
    });

    // Fetch unread message count
    const { data: unreadMessageCount = 0 } = useQuery({
        queryKey: ['unreadMessageCount', currentUser?.uid],
        queryFn: () => getUnreadMessageCount(currentUser!.uid),
        enabled: !!currentUser?.uid,
        refetchInterval: 30000 // Refetch every 30 seconds
    });

    // Subscribe to live notifications
    useEffect(() => {
        if (!currentUser) {
            console.log('🔔 No current user, skipping live notifications subscription');
            return;
        }

        console.log('🔔 Setting up live notifications subscription for user:', currentUser.uid);
        const unsubscribe = subscribeToLiveNotifications(currentUser.uid, (notifications: LiveNotification[]) => {
            console.log('🔔 Live notifications received in AppBar:', notifications.length, 'notifications');
            console.log('🔔 Notifications data:', notifications);
            setLiveNotifications(notifications);
        });

        return () => {
            console.log('🔔 Cleaning up live notifications subscription');
            unsubscribe();
        };
    }, [currentUser]);

    // Calculate total unread notifications (live + legacy)
    const unreadLiveNotifications = liveNotifications.filter(n => !n.read);
    const unreadLegacyNotifications = notifications.filter((n: any) => !n.isRead);
    const unreadNotifications = unreadLiveNotifications.length + unreadLegacyNotifications.length;


    // Check if user is admin
    const isAdmin = !!currentUser && (
        currentUser.email === 'admin@crewvar.com' || (currentUser as any).isAdmin === true
    );

    // Navigation items for desktop
    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Update Location', path: '/ship-location', isButton: true },
        { name: 'Discover Crew', path: '/explore-ships' },
        { name: 'Connection Requests', path: '/connections/pending' },
        { name: 'Messages', path: '/chat' },
        { name: 'Favorites', path: '/favorites' },
        // Admin link (only visible to admins)
        ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin' }] : []),
    ];

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Logged out successfully!');
            navigate('/auth/login');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Failed to log out.');
        }
    };

    // Don't show app bar on auth pages or admin pages
    if (!currentUser) {
        return null;
    }

    // Don't show app bar on admin pages (they have their own app bar)
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="px-4 lg:px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Left side - Hamburger Menu & Logo/Home */}
                    <div className="flex items-center space-x-3">
                        {/* Hamburger Menu Button - Only show on mobile */}
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                            >
                                <HiMenu className="w-6 h-6" />
                            </button>
                        )}

                        <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 text-[#069B93] hover:text-[#058a7a] transition-colors"
                        >
                            <HiHome className="w-6 h-6" />
                            <span className="font-bold text-lg">Crewvar</span>
                        </Link>
                    </div>

                    {/* Center - Desktop Navigation (hidden on mobile) */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;

                            // Special handling for Update Location - show QuickCheckIn dialog
                            if (item.isButton) {
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            if (setShowCheckInDialog) {
                                                setShowCheckInDialog(true);
                                            }
                                        }}
                                        className={`px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 ${isActive
                                            ? 'text-[#069B93] font-bold'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className={`${isActive ? 'text-base font-bold' : 'text-sm font-medium'}`}>{item.name}</span>
                                    </button>
                                );
                            }

                            // Regular navigation items
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`relative px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 ${isActive
                                        ? 'text-[#069B93] font-bold'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={`${isActive ? 'text-base font-bold' : 'text-sm font-medium'}`}>{item.name}</span>
                                    {/* Show badge for Connection Requests if there are pending requests */}
                                    {item.name === 'Connection Requests' && connectionRequests.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                            {connectionRequests.length}
                                        </span>
                                    )}
                                    {/* Show badge for Messages if there are unread messages */}
                                    {item.name === 'Messages' && unreadMessageCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - User actions */}
                    <div className="flex items-center space-x-3">

                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                            >
                                <HiBell className="w-5 h-5 text-gray-600" />
                                {/* Notification badge */}
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Live Notifications Dropdown */}
                            <LiveNotifications
                                isOpen={isNotificationsOpen}
                                onClose={() => setIsNotificationsOpen(false)}
                            />
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <img
                                    src={userProfile?.profilePhoto || defaultAvatar}
                                    alt={userProfile?.displayName || 'User'}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-[#069B93]"
                                />
                                <span className="hidden md:block text-sm font-medium text-gray-700">
                                    {userProfile?.displayName || 'User'}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900">
                                            {userProfile?.displayName || 'User'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {userProfile?.email || currentUser?.email}
                                        </p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <HiUser className="w-4 h-4 mr-3" />
                                        My Profile
                                    </Link>

                                    <Link
                                        to="/dashboard"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <HiHome className="w-4 h-4 mr-3" />
                                        Dashboard
                                    </Link>

                                    {connectionRequests.length > 0 && (
                                        <Link
                                            to="/connections/pending"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <HiBell className="w-4 h-4 mr-3" />
                                            Connection Requests ({connectionRequests.length})
                                        </Link>
                                    )}

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <HiLogout className="w-4 h-4 mr-3" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppBar;