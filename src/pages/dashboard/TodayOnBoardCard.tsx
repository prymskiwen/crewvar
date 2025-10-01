import { CrewMemberCard } from './CrewMemberCard';
import { getProfilePhotoUrl } from '../../utils/images';

interface TodayOnBoardCardProps {
    onConnectClick: () => void;
}

export const TodayOnBoardCard = ({ onConnectClick }: TodayOnBoardCardProps) => {
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
