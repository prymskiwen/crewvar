import { useState } from 'react';
import { CrewMemberCard } from './CrewMemberCard';
import { getProfilePhotoUrl } from '../../utils/images';
import { ShipSelection } from '../../components/common/ShipSelection';

export const WhosInPortCard = () => {
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
