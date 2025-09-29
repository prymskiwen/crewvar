import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/Home/logo.png';
import { AdminTabType, AdminAppBarProps } from '../../../types';

export const AdminAppBar: React.FC<AdminAppBarProps> = ({
    currentUser,
    onLogout,
    activeTab,
    onTabChange
}) => {
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
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">Admin Dashboard</h1>
                            <p className="text-xs text-teal-100">Manage users, content, and system settings</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-teal-100 hidden sm:block">{currentUser?.email}</span>
                        <button
                            onClick={onLogout}
                            className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors text-white"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
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
