import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContextFirebase';
import { HiUsers, HiLocationMarker, HiChat, HiBell, HiMenu, HiX, HiShieldCheck } from 'react-icons/hi';
import { ConnectionPendingCard } from '../../connections/components/ConnectionPendingCard';
import { getProfilePhotoUrl } from '../../../utils/imageUtils';
import { UserProfileDropdown } from '../../../components/UserProfileDropdown';
import { ShipSelection } from '../../../components/ShipSelection';

// TODO: Implement Firebase hooks for crew data
const useCrewOnboard = () => {
    return {
        data: { crew: [] },
        isLoading: false,
        error: null
    };
};

const useCrewInPort = (_date: string) => {
    return {
        data: { crew: [] },
        isLoading: false,
        error: null
    };
};

const useLinkShips = () => {
    return {
        mutateAsync: async (data: any) => {
            console.log('TODO: Implement linkShips with Firebase', data);
            return Promise.resolve();
        }
    };
};

// Type definitions
interface CrewMember {
    id: string;
    display_name: string;
    role_name?: string;
    department_name?: string;
    profile_photo?: string;
    ship_name?: string;
    cruise_line_name?: string;
}

const CrewMemberCard = ({ member }: {
    member: {
        id: string;
        name: string;
        role: string;
        department: string;
        avatar: string;
        shipName?: string;
        cruiseLineName?: string;
    };
}) => {
    return (
        <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
            <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs lg:text-sm truncate">{member.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                    {/* Desktop: Show more details, Mobile: Keep compact */}
                    <div className="hidden lg:flex flex-wrap items-center gap-1 mt-1">
                        {member.shipName && member.shipName !== 'Not specified' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {member.shipName}
                            </span>
                        )}
                        {member.cruiseLineName && member.cruiseLineName !== 'Not specified' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {member.cruiseLineName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">✓</span>
                <button
                    onClick={() => window.location.href = `/crew/${member.id}`}
                    className="px-2 py-1 lg:px-3 lg:py-1.5 text-xs lg:text-sm bg-[#069B93] text-white rounded hover:bg-[#058a7a] transition-colors"
                >
                    View
                </button>
            </div>
        </div>
    );
};

// Today on Board Card Component
const TodayOnBoardCard = ({ onConnectClick }: { onConnectClick: () => void }) => {
    const { data: crewData, isLoading: crewLoading, error: crewError } = useCrewOnboard();

    const crew = crewData?.crew || [];

    const handleViewAll = () => {
        window.location.href = '/today-onboard';
    };

    if (crewLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Today on Board</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        ...
                    </span>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (crewError) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Today on Board</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        0
                    </span>
                </div>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Failed to load crew data</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-center mb-3 lg:mb-4">
                <h3 className="text-base lg:text-lg font-semibold text-[#069B93]">Today on Board</h3>
                <div className="flex items-center space-x-2">
                    <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full font-medium">
                        {crew.length}
                    </span>
                    <button
                        onClick={onConnectClick}
                        className="px-2 py-1 bg-[#069B93] text-white text-xs rounded hover:bg-[#058a7a] transition-colors"
                    >
                        Connect
                    </button>
                </div>
            </div>

            <div className="space-y-1 lg:space-y-3 mb-3 lg:mb-4">
                {crew.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1 lg:gap-3">
                        {crew.slice(0, 8).map((member: CrewMember) => (
                            <CrewMemberCard key={member.id} member={{
                                id: member.id,
                                name: member.display_name,
                                role: member.role_name || 'Not specified',
                                department: member.department_name || 'Not specified',
                                avatar: getProfilePhotoUrl(member.profile_photo),
                                shipName: member.ship_name,
                                cruiseLineName: member.cruise_line_name
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">No matching results</p>
                        <p className="text-gray-500 text-xs">Please, keep checking for new friends.</p>
                    </div>
                )}
            </div>

            {/* View All Button */}
            {crew.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={handleViewAll}
                        className="px-4 py-2 text-sm text-[#069B93] hover:text-[#058a7a] hover:bg-[#069B93]/5 rounded-lg transition-colors font-medium"
                    >
                        View All ({crew.length})
                    </button>
                </div>
            )}

        </div>
    );
};

// Who's in Your Port Card Component
const WhosInPortCard = () => {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState("");
    const [selectedShipId, setSelectedShipId] = useState("");

    const today = new Date().toISOString().split('T')[0];
    const { data: crewData, isLoading: crewLoading } = useCrewInPort(today);
    const { mutateAsync: linkShips } = useLinkShips();

    const crew = crewData?.crew || [];

    const handleViewAll = () => {
        window.location.href = '/whos-in-port';
    };

    const handleLinkShips = async () => {
        try {
            await linkShips({
                shipId: selectedShipId,
                portName: "Current Port", // You might want to get this from user's current location
                date: today
            });
            setShowLinkModal(false);
            setSelectedCruiseLineId("");
            setSelectedShipId("");
        } catch (error) {
            console.error('Failed to link ships:', error);
        }
    };

    if (crewLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">📍 Who's in port with you today</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        ...
                    </span>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-semibold text-[#069B93]">Who's in port with you today</h3>
                    <div className="flex items-center space-x-2">
                        <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full font-medium">
                            {crew.length}
                        </span>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="px-2 py-1 bg-[#069B93] text-white text-xs rounded hover:bg-[#058a7a] transition-colors"
                        >
                            Who's docked with you today?
                        </button>
                    </div>
                </div>

                <div className="space-y-1 lg:space-y-3 mb-3 lg:mb-4">
                    {crew.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1 lg:gap-3">
                            {crew.slice(0, 8).map((member: CrewMember) => (
                                <CrewMemberCard key={member.id} member={{
                                    id: member.id,
                                    name: member.display_name,
                                    role: member.ship_name || 'Not specified',
                                    department: member.cruise_line_name || 'Not specified',
                                    avatar: getProfilePhotoUrl(member.profile_photo),
                                    shipName: member.ship_name,
                                    cruiseLineName: member.cruise_line_name
                                }} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#069B93]/10 to-[#058a7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">No ships linked yet</h4>
                            <p className="text-gray-600 text-sm mb-4">Tell us who is in port with you today and find your friends</p>
                        </div>
                    )}
                </div>

                {/* View All Button */}
                {crew.length > 0 && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleViewAll}
                            className="px-4 py-2 text-sm text-[#069B93] hover:text-[#058a7a] hover:bg-[#069B93]/5 rounded-lg transition-colors font-medium"
                        >
                            View All ({crew.length})
                        </button>
                    </div>
                )}

            </div>

            {/* Link Ships Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Who's docked with you today?</h3>

                        <div className="space-y-6">
                            <ShipSelection
                                selectedCruiseLineId={selectedCruiseLineId}
                                selectedShipId={selectedShipId}
                                onCruiseLineChange={setSelectedCruiseLineId}
                                onShipChange={setSelectedShipId}
                                placeholder="Select a cruise line"
                                disabled={false}
                            />
                        </div>

                        <div className="flex space-x-3 mt-8">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLinkShips}
                                disabled={!selectedCruiseLineId || !selectedShipId}
                                className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Connect Ships
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const DashboardSidebar = ({ isOpen, onToggle, setShowCheckInDialog }: { isOpen: boolean; onToggle: () => void; setShowCheckInDialog: (show: boolean) => void }) => {
    const { currentUser } = useAuth();
    const isAdmin = !!currentUser && (
        currentUser.email === 'admin@crewvar.com' || (currentUser as any).isAdmin === true
    );
    const sidebarClasses = `
        fixed top-0 left-0 h-full bg-[#069B93] text-white z-[9999] transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        w-64 lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    const menuItems = [
        { name: 'Dashboard', icon: HiUsers, path: '/dashboard' },
        { name: 'Update where you are', icon: HiLocationMarker, path: '/ship-location' },
        { name: 'Discover Who\'s with You Today', icon: HiUsers, path: '/explore-ships' },
        { name: 'My Profile', icon: HiUsers, path: '/profile' },
        { name: 'Messages', icon: HiChat, path: '/chat' },
        { name: 'Notifications', icon: HiBell, path: '/all-notifications' },
        { name: 'Favorites & Alerts', icon: HiBell, path: '/favorites' },
        // Admin link (only visible to admins)
        ...(isAdmin ? [{ name: 'Admin', icon: HiShieldCheck, path: '/admin' }] : []),
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998] lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={sidebarClasses}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">Crewvar</h2>
                        <button
                            onClick={onToggle}
                            className="lg:hidden text-white hover:text-gray-300"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            // Special handling for Update where you are - show QuickCheckIn dialog
                            if (item.name === 'Update where you are') {
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            setShowCheckInDialog(true);
                                            // Close sidebar on mobile after action
                                            if (window.innerWidth < 1024) {
                                                onToggle();
                                            }
                                        }}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#058a7a] transition-colors w-full text-left"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            }

                            // Regular navigation items
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#058a7a] transition-colors"
                                    onClick={() => {
                                        // Close sidebar on mobile after navigation
                                        if (window.innerWidth < 1024) {
                                            onToggle();
                                        }
                                    }}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
};

const DashboardNew = () => {
    const { signOut } = useAuth();
    // TODO: Implement Firebase quick check-in functionality
    const setShowCheckInDialog = () => {
        // Placeholder function
    };
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1">
                {/* Sidebar */}
                <DashboardSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} setShowCheckInDialog={setShowCheckInDialog} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Simple Top Bar */}
                    <div className="bg-white shadow-sm border-b px-3 sm:px-4 lg:px-8 xl:px-12 py-3">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <HiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <div className="flex-1"></div>
                            <UserProfileDropdown onSignOut={handleSignOut} />
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 flex-1 lg:ml-72">
                        {/* Welcome Section - Compact Desktop Design */}
                        <div className="mb-4 lg:mb-6">
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-4xl">
                                Manage your profile and connections.
                            </p>
                        </div>


                        {/* Main Dashboard Cards - Equal Size */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
                            {/* Today on Board */}
                            <div>
                                <TodayOnBoardCard onConnectClick={() => console.log('Connect clicked')} />
                            </div>

                            {/* Who's in Your Port */}
                            <div>
                                <WhosInPortCard />
                            </div>

                            {/* New Connections Pending */}
                            <div>
                                <ConnectionPendingCard />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardNew;