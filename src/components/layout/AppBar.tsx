import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextFirebase';
import {
    HiBell,
    HiUser,
    HiLogout,
    HiHome
} from 'react-icons/hi';
import { defaultAvatar } from '../../utils/images';
import { toast } from 'react-toastify';

export const AppBar: React.FC = () => {
    const { currentUser, userProfile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
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
                    {/* Left side - Logo/Home */}
                    <div className="flex items-center space-x-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 text-[#069B93] hover:text-[#058a7a] transition-colors"
                        >
                            <HiHome className="w-6 h-6" />
                            <span className="font-bold text-lg">Crewvar</span>
                        </Link>
                    </div>

                    {/* Right side - User actions */}
                    <div className="flex items-center space-x-3">
                        {/* Notifications */}
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                            <HiBell className="w-5 h-5 text-gray-600" />
                            {/* Notification badge */}
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </button>

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
