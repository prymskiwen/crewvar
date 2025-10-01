import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CrewMemberCard } from './CrewMemberCard';
import { getProfilePhotoUrl } from '../../utils/images';
import { useAuth } from '../../context/AuthContextFirebase';
import { getCrewMembers } from '../../firebase/firestore';

interface TodayOnBoardCardProps {
    onConnectClick: () => void;
}

export const TodayOnBoardCard = ({ onConnectClick }: TodayOnBoardCardProps) => {
    const { currentUser, userProfile } = useAuth();
    const [crewData, setCrewData] = useState<any[]>([]);

    // Fetch crew members from the same ship
    const { data: crewResponse, isLoading: crewLoading, error: crewError } = useQuery({
        queryKey: ['crewMembers', userProfile?.currentShipId],
        queryFn: () => getCrewMembers({
            shipId: userProfile?.currentShipId,
            currentUserId: currentUser?.uid,
            limit: 10 // Get a few more than we need for filtering
        }),
        enabled: !!userProfile?.currentShipId && !!currentUser?.uid,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter and limit crew data
    useEffect(() => {
        if (crewResponse?.crew) {
            // Filter to show only 5 crew members and exclude current user
            const filteredCrew = crewResponse.crew
                .filter((member: any) => member.id !== currentUser?.uid)
                .slice(0, 5);
            setCrewData(filteredCrew);
        }
    }, [crewResponse, currentUser?.uid]);

    const crew = crewData || [];

    const handleViewAll = () => {
        window.location.href = '/today-onboard';
    };

    if (crewLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">Today on Board</h3>
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
                    <h3 className="text-xl font-bold text-[#069B93]"> Today on Board</h3>
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
                </div>
            </div>

            <div className="space-y-1 lg:space-y-3 mb-3 lg:mb-4">
                {crew.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1 lg:gap-3">
                        {crew.map((member) => (
                            <CrewMemberCard key={member.id} member={{
                                id: member.id,
                                name: member.displayName || member.display_name,
                                role: member.roleName || member.role_name || 'Not specified',
                                department: member.departmentName || member.department_name || 'Not specified',
                                avatar: getProfilePhotoUrl(member.profilePhoto || member.profile_photo),
                                shipName: member.shipName || member.ship_name,
                                cruiseLineName: member.cruiseLineName || member.cruise_line_name
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
                        <p className="text-gray-600 text-sm mb-2">No crew members found</p>
                        <p className="text-gray-500 text-xs">No other crew members are currently on your ship.</p>
                    </div>
                )}
            </div>

            {/* View All Button */}
            {crewResponse?.crew && crewResponse.crew.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={handleViewAll}
                        className="px-4 py-2 text-sm text-[#069B93] hover:text-[#058a7a] hover:bg-[#069B93]/5 rounded-lg transition-colors font-medium"
                    >
                        View All ({crewResponse.crew.filter((member: any) => member.id !== currentUser?.uid).length})
                    </button>
                </div>
            )}

        </div>
    );
};
