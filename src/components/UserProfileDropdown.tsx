import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextFirebase';
import { defaultAvatar } from '../utils/images';
import { HiChevronDown, HiUser, HiLogout } from 'react-icons/hi';
import bellIcon from '../assets/images/Home/bell.png';
import { NotificationDropdown } from './NotificationDropdown';

interface UserProfileDropdownProps {
    onSignOut: () => void;
}

export const UserProfileDropdown = ({ onSignOut }: UserProfileDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { userProfile } = useAuth();
    const unreadCount = 0; // TODO: Implement Firebase notifications

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

    const handleSignOut = () => {
        setIsOpen(false);
        onSignOut();
    };

    const handleNotificationClick = () => {
        setIsNotificationOpen(!isNotificationOpen);
        setIsOpen(false); // Close profile dropdown when opening notifications
    };

    if (!userProfile) {
        return (
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    // Construct full URL for the profile photo
    const getFullPhotoUrl = (photoUrl: string | null | undefined) => {
        if (!photoUrl) return defaultAvatar;
        if (photoUrl.startsWith('http')) return photoUrl; // Already a full URL
        if (photoUrl.startsWith('/uploads/')) {
            // Construct full URL using the API base URL
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${photoUrl}`;
        }
        return photoUrl; // Fallback
    };

    const profileImage = getFullPhotoUrl(userProfile?.profilePhoto);
    const displayName = userProfile?.displayName || 'User';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell and User Profile */}
            <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <button
                    onClick={handleNotificationClick}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Notifications"
                >
                    <img
                        src={bellIcon}
                        alt="Notifications"
                        className="w-9 h-9"
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* User Profile Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <img
                        src={profileImage}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {displayName}
                    </span>
                    <HiChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>
            </div>

            {/* Notification Dropdown */}
            <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
            />

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <img
                                src={profileImage}
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {userProfile?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <HiUser className="w-4 h-4" />
                            <span>My Profile</span>
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                            <HiLogout className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
