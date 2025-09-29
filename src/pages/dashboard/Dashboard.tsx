import { useState } from 'react';
import { ConnectionPendingCard } from '../../components/connections/ConnectionPendingCard';
import { getProfilePhotoUrl } from '../../utils/images';
import { ShipSelection } from '../../components/common/ShipSelection';
import { DashboardLayout } from '../../layout/DashboardLayout';

const CrewMemberCard = ({ member }: {
    member: any;
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
    // TODO: Implement Firebase crew onboard functionality
    const crewData: any[] = [];
    const crewLoading = false;
    const crewError = null;

    const crew = crewData || [];

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
                        {crew.slice(0, 8).map((member) => (
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

    // TODO: Implement Firebase port linking functionality
    const crewData: any[] = [];
    const crewLoading = false;
    const linkShips = () => {
        // Placeholder function
    };

    const crew = crewData || [];

    const handleViewAll = () => {
        window.location.href = '/whos-in-port';
    };

    const handleLinkShips = async () => {
        if (!selectedCruiseLineId || !selectedShipId) return;

        try {
            await linkShips();
            setShowLinkModal(false);
            setSelectedCruiseLineId("");
            setSelectedShipId("");
        } catch (error) {
            console.error('Failed to link ships:', error);
            alert('Failed to link ships. Please try again.');
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
                            {crew.slice(0, 8).map((member) => (
                                <CrewMemberCard key={member.id} member={{
                                    id: member.id,
                                    name: member.display_name,
                                    role: member.ship_name,
                                    department: member.cruise_line_name,
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


const Dashboard = () => {
    return (
        <DashboardLayout>
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
        </DashboardLayout>
    );
};

export default Dashboard;