import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LoadingPage } from '../../components/ui';
import logo from '../../assets/images/Home/logo.png';
import { getProfilePhotoUrl } from '../../utils/images';
import { useAuth } from '../../context/AuthContextFirebase';
import { getActivePortLinks, getSuggestedPortCrewProfiles, createManualPortLink, getCruiseLines, getShips, getRoles, getDepartments, sendConnectionRequest } from '../../firebase/firestore';
import { ShipSelection } from '../../components/common/ShipSelection';

// Real crew member interface matching our data structure
interface ICrewMember {
    id: string;
    displayName: string;
    roleId: string;
    departmentId: string;
    currentShipId: string;
    profilePhoto?: string;
}

export const WhosInPortPage = () => {
    const { userProfile, currentUser } = useAuth();
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState("");
    const [selectedShipId, setSelectedShipId] = useState("");
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Get active port links for current user's ship
    const { data: activePortLinks = [] } = useQuery({
        queryKey: ['activePortLinks', userProfile?.currentShipId],
        queryFn: () => {
            if (!userProfile?.currentShipId) throw new Error('No ship ID');
            return getActivePortLinks(userProfile.currentShipId);
        },
        enabled: !!userProfile?.currentShipId,
        refetchInterval: 60000,
    });

    // Get ALL suggested crew profiles from linked ships (no limit for full page)
    const { data: suggestedCrew = [], isLoading: crewLoading, error: crewError } = useQuery({
        queryKey: ['allPortCrew', userProfile?.currentShipId, userProfile?.departmentId],
        queryFn: () => {
            if (!userProfile?.currentShipId) throw new Error('No ship ID');
            return getSuggestedPortCrewProfiles(
                userProfile.currentShipId,
                userProfile?.departmentId,
                50 // Show up to 50 profiles on full page
            );
        },
        enabled: !!userProfile?.currentShipId && activePortLinks.length > 0,
        refetchInterval: 300000,
    });

    // Get cruise lines for ship selection
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useQuery({
        queryKey: ['cruiseLines'],
        queryFn: getCruiseLines,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Get roles and departments for name resolution
    const { data: allRoles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Get all ships and filter by cruise line client-side
    const { data: allShips = [], isLoading: shipsLoading } = useQuery({
        queryKey: ['ships'],
        queryFn: getShips,
        staleTime: 5 * 60 * 1000,
    });

    // Filter ships by selected cruise line
    const shipsByCruiseLine = selectedCruiseLineId 
        ? allShips.filter((ship: any) => ship.cruiseLineId === selectedCruiseLineId)
        : [];
    const shipsByCruiseLineLoading = shipsLoading;

    const crew = suggestedCrew || [];
    const linkedShips = activePortLinks || [];
    const hasActivePortLinks = activePortLinks.length > 0;

    // Debug logging
    console.log('WhosInPort Debug:', {
        crew: crew.length,
        allRoles: allRoles.length,
        departments: departments.length,
        sampleCrewMember: crew[0],
        sampleRole: allRoles[0],
        sampleDepartment: departments[0]
    });

    // Helper functions to resolve IDs to names
    const getRoleName = (roleId: string) => {
        console.log('getRoleName called with:', roleId);
        console.log('allRoles:', allRoles);
        const role = allRoles.find((r: any) => r.id === roleId);
        console.log('Found role:', role);
        return role?.name || roleId;
    };

    const getDepartmentName = (departmentId: string) => {
        console.log('getDepartmentName called with:', departmentId);
        console.log('departments:', departments);
        const department = departments.find((d: any) => d.id === departmentId);
        console.log('Found department:', department);
        return department?.name || departmentId;
    };

    // Real connection request mutation
    const sendConnectionRequestMutation = useMutation({
        mutationFn: async (data: { receiverId: string; memberName?: string; message?: string }) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            return await sendConnectionRequest(currentUser.uid, data.receiverId, data.message);
        },
        onSuccess: (_, variables) => {
            const displayName = variables.memberName || 'user';
            toast.success(`Connection request sent to ${displayName}!`);
        },
        onError: (error: any) => {
            console.error('Failed to send connection request:', error);
            toast.error('Failed to send connection request. Please try again.');
        }
    });

    const handleLinkShips = async () => {
        if (!selectedCruiseLineId || !selectedShipId || !userProfile?.currentShipId) return;

        try {
            await createManualPortLink(userProfile.currentShipId, selectedShipId);
            
            toast.success('Ships linked successfully!');
            setShowLinkModal(false);
            setSelectedCruiseLineId("");
            setSelectedShipId("");
        } catch (error) {
            console.error('Failed to link ships:', error);
            toast.error('Failed to link ships. Please try again.');
        }
    };

    const handleConnect = async (memberId: string, memberName: string) => {
        // Prevent duplicate requests if already loading
        if (loadingStates[memberId] || sendConnectionRequestMutation.isLoading) {
            return;
        }

        try {
            // Set loading state for this specific member
            setLoadingStates(prev => ({ ...prev, [memberId]: true }));

            // Send connection request using the real API
            // The mutation already handles success/error toasts, so we don't need to show them here
            await sendConnectionRequestMutation.mutateAsync({
                receiverId: memberId,
                memberName: memberName,
                message: `Hi ${memberName}! I'd like to connect with you.`
            });

        } catch (error: any) {
            // Error handling is already done in the mutation's onError callback
            console.error('Failed to send connection request:', error);
        } finally {
            // Clear loading state
            setLoadingStates(prev => ({ ...prev, [memberId]: false }));
        }
    };

    const handleViewProfile = (memberId: string) => {
        // Navigate to member's profile page
        window.location.href = `/profile/${memberId}`;
    };

    // Use the real data from queries

    // Filter possible friends based on search query
    const filteredCrew = crew.filter((member: ICrewMember) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            member.displayName?.toLowerCase().includes(query) ||
            member.roleId?.toLowerCase().includes(query) ||
            member.departmentId?.toLowerCase().includes(query)
        );
    });

    if (crewLoading) {
        return <LoadingPage message="Loading crew in port..." showLogo={true} />;
    }

    if (crewError) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load port data</h3>
                        <p className="text-gray-600 mb-6">This feature requires backend connection</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#069B93] text-white rounded-xl hover:bg-[#058a7a] transition-colors font-semibold"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show message when no port links are active
    if (!hasActivePortLinks) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                {/* Header */}
                <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-base sm:text-lg font-bold">Who's in Port</h1>
                                <p className="text-xs text-teal-100">No ships detected in port</p>
                            </div>
                        </div>
                        <Link to="/dashboard" className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors">
                            <img
                                src={logo}
                                alt="Crewvar Logo"
                                className="h-5 sm:h-6 w-auto brightness-0 invert"
                                style={{ filter: 'brightness(0) invert(1)' }}
                            />
                        </Link>
                    </div>
                </div>

                {/* No Port Links Content */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Ships in Port</h2>
                        <p className="text-gray-600 mb-6">
                            No other ships have been detected in port with you today. Ships are automatically linked when crew members search for each other.
                        </p>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200 font-medium"
                        >
                            Link Ships Manually
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Mobile Header - Matching Messages Page Style */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">Who's in Port</h1>
                            <p className="text-xs text-teal-100">
                                {linkedShips.length > 0 
                                    ? `Connected with ${linkedShips.map(link => 
                                        link.shipAId === userProfile?.currentShipId ? link.shipBName : link.shipAName
                                      ).join(', ')}`
                                    : `${crew.length} crew members found`
                                }
                            </p>
                        </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors">
                        <img
                            src={logo}
                            alt="Crewvar Logo"
                            className="h-5 sm:h-6 w-auto brightness-0 invert"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

                    {/* Port Status */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-base font-semibold text-blue-800">
                                {linkedShips.length > 0
                                    ? `🔗 Linked with ${linkedShips.length} ship${linkedShips.length > 1 ? 's' : ''} today`
                                    : '⚓ No ships linked today'
                                }
                            </span>
                        </div>
                        {linkedShips.length === 0 && (
                            <p className="text-blue-600 text-sm mt-2 ml-7">
                                Click "Link Ships" to connect with other ships in your port and discover friends
                            </p>
                        )}
                    </div>

                    {/* Possible Friends Section */}
                    {crew.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">

                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Possible Friends</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-[#069B93] text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                                        {crew.length}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-500">members</span>
                                </div>
                            </div>

                            {/* Search Component */}
                            <div className="mb-6">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, role, department, ship, or cruise line..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#069B93] focus:border-[#069B93] text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Showing {filteredCrew.length} of {crew.length} possible friends
                                    </p>
                                )}
                            </div>

                            {/* Mobile: Stacked Cards, Desktop: Grid */}
                            {filteredCrew.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {filteredCrew.map((member: ICrewMember) => (
                                        <div key={member.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="p-3 sm:p-4">
                                                <div className="flex items-center space-x-3 sm:space-x-4">
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={getProfilePhotoUrl(member.profilePhoto)}
                                                            alt={member.displayName}
                                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                            {member.displayName}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                                            {member.roleId && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {getRoleName(member.roleId)}
                                                                </span>
                                                            )}
                                                            {member.departmentId && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                    {getDepartmentName(member.departmentId)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center space-x-2 mt-3 sm:mt-4">
                                                    <button
                                                        onClick={() => handleConnect(member.id, member.displayName)}
                                                        disabled={loadingStates[member.id] || sendConnectionRequestMutation.isLoading}
                                                        className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors font-medium shadow-sm hover:shadow-md ${loadingStates[member.id] || sendConnectionRequestMutation.isLoading
                                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                            : 'bg-[#069B93] text-white hover:bg-[#058a7a]'
                                                            }`}
                                                    >
                                                        {loadingStates[member.id] || sendConnectionRequestMutation.isLoading ? 'Sending...' : 'Quick Connect'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewProfile(member.id)}
                                                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] hover:bg-[#069B93]/5 transition-colors font-medium"
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Not matching results found</h3>
                                    <p className="text-gray-500 mb-4">No friends match your search criteria</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm font-medium"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-3">Not matching results found</h3>
                            <p className="text-gray-500 mb-8">Link with ships in your port to discover friends</p>
                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => setShowLinkModal(true)}
                                    className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                                >
                                    Link Ships
                                </button>
                                <Link
                                    to="/dashboard"
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors font-medium"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Link Ships Button */}
                    {crew.length > 0 && (
                        <div className="flex items-center justify-center pt-6">
                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="px-6 py-3 bg-white border border-[#069B93] text-[#069B93] rounded-lg hover:bg-[#069B93] hover:text-white transition-colors font-medium"
                            >
                                + Link More Ships
                            </button>
                        </div>
                    )}

                    {/* Link Ships Modal */}
                    {showLinkModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Link Ships in Port</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Cruise Line
                                        </label>
                                        {cruiseLinesLoading ? (
                                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                                <span className="text-gray-500">Loading cruise lines...</span>
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedCruiseLineId}
                                                onChange={(e) => {
                                                    setSelectedCruiseLineId(e.target.value);
                                                    setSelectedShipId(""); // Reset ship selection when cruise line changes
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                            >
                                                <option value="">Choose a cruise line...</option>
                                                {cruiseLines.map((cruiseLine) => (
                                                    <option key={cruiseLine.id} value={cruiseLine.id}>
                                                        {cruiseLine.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Ship to Link With
                                        </label>
                                        {!selectedCruiseLineId ? (
                                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                                <span className="text-gray-500">Please select a cruise line first</span>
                                            </div>
                                        ) : shipsByCruiseLineLoading ? (
                                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                                <span className="text-gray-500">Loading ships...</span>
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedShipId}
                                                onChange={(e) => setSelectedShipId(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                            >
                                                <option value="">Choose a ship...</option>
                                                {shipsByCruiseLine.map((ship) => (
                                                    <option key={ship.id} value={ship.id}>
                                                        {ship.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-4 mt-8">
                                    <button
                                        onClick={() => setShowLinkModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLinkShips}
                                        disabled={!selectedCruiseLineId || !selectedShipId}
                                        className="flex-1 px-4 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        Link Ships
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Link Ships Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manual Ship Linking</h3>
                            <p className="text-sm text-gray-600">
                                Tell us which ship is docked with you today. This creates an immediate connection for crew discovery.
                            </p>
                        </div>

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
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Link Ships
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
