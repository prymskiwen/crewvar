import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContextFirebase';
import { HiBell, HiUser, HiLogout } from 'react-icons/hi';
import { toast } from 'react-toastify';
import logo from '../../../assets/images/Home/logo.png';
import { AdminTabType, AdminAppBarProps } from '../../../types';

export const AdminAppBar: React.FC<AdminAppBarProps> = ({
    currentUser,
    onLogout,
    activeTab,
    onTabChange
}) => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
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
            await onLogout();
            toast.success('Logged out successfully!');
            navigate('/auth/login');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Failed to log out.');
        }
    };
    const tabs: Array<{ id: AdminTabType; label: string; icon: string; shortLabel: string }> = [
        { id: 'overview', label: 'Overview', icon: '📊', shortLabel: 'Overview' },
        { id: 'users', label: 'Users', icon: '👥', shortLabel: 'Users' },
        { id: 'reports', label: 'Reports', icon: '🚨', shortLabel: 'Reports' },
        { id: 'flagged-messages', label: 'Flagged', icon: '⚠️', shortLabel: 'Flagged' },
        { id: 'role-requests', label: 'Roles', icon: '🔐', shortLabel: 'Roles' },
        { id: 'data-management', label: 'Data', icon: '📊', shortLabel: 'Data' },
        { id: 'support', label: 'Support', icon: '🎧', shortLabel: 'Support' },
        { id: 'settings', label: 'Settings', icon: '⚙️', shortLabel: 'Settings' }
    ];

    return (
        <>
            {/* Mobile Header - Matching Other Pages Style */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link to="/dashboard" className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors">
                            <img
                                src={logo}
                                alt="Crewvar Logo"
                                className="h-5 sm:h-6 w-auto brightness-0 invert"
                                style={{ filter: 'brightness(0) invert(1)' }}
                            />
                        </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Notifications */}
                        <button className="p-2 rounded-lg hover:bg-teal-700 transition-colors relative">
                            <HiBell className="w-5 h-5 text-white" />
                            {/* Notification badge */}
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                {userProfile?.profilePhoto ? (
                                    <img
                                        src={userProfile.profilePhoto}
                                        alt={userProfile?.displayName || 'Admin'}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-white/80 shadow-lg ring-1 ring-white/20"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/80 shadow-lg ring-1 ring-white/20 flex items-center justify-center">
                                        <HiUser className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <span className="hidden md:block text-sm font-medium text-white">
                                    {userProfile?.displayName || 'Admin'}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900">
                                            {userProfile?.displayName || 'Admin'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {userProfile?.email || currentUser?.email}
                                        </p>
                                    </div>

                                    {/* <div className="border-t border-gray-100 my-1"></div> */}

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

            {/* Navigation Tabs - Mobile Responsive */}
            <div className="bg-white/80 backdrop-blur border-b">
                <div className="px-3 sm:px-4 lg:px-8">
                    <nav className="flex overflow-x-auto gap-2 py-2 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-teal-100 text-teal-800 shadow-sm'
                                    : 'text-gray-600 hover:text-teal-800 hover:bg-teal-50'
                                    }`}
                            >
                                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.shortLabel}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};
