interface CrewMemberCardProps {
    member: {
        id: string;
        name: string;
        role: string;
        department?: string;
        avatar: string;
        shipName?: string;
        cruiseLineName?: string;
        connectionStatus?: string;
    };
}

export const CrewMemberCard = ({ member }: CrewMemberCardProps) => {
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
                {member.connectionStatus === 'connected' ? (
                    <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
                        Connected
                    </span>
                ) : (
                    <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">✓</span>
                )}
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
