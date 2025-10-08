import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CrewMemberCard } from './CrewMemberCard';
import { getProfilePhotoUrl } from '../../utils/images';
import { useAuth } from '../../context/AuthContextFirebase';
import { getCrewMembers, getUserConnections, sendConnectionRequest, getPendingConnectionRequests, getReceivedConnectionRequests, getRoles, getDepartments } from '../../firebase/firestore';

export const TodayOnBoardCard = () => {
    const { currentUser, userProfile, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [crewData, setCrewData] = useState<any[]>([]);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    // Fetch crew members from the same ship
    const { data: crewResponse, isLoading: crewLoading, error: crewError } = useQuery({
        queryKey: ['crewMembers', userProfile?.currentShipId],
        queryFn: () => getCrewMembers({
            shipId: userProfile?.currentShipId,
            currentUserId: currentUser?.uid,
            limit: 10 // Get a few more than we need for filtering
        }),
        enabled: !!userProfile?.currentShipId && !!currentUser?.uid && !authLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Fetch user's connections to check connection status
    const { data: userConnections = [] } = useQuery({
        queryKey: ['userConnections', currentUser?.uid],
        queryFn: () => getUserConnections(currentUser!.uid),
        enabled: !!currentUser?.uid && !authLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch pending connection requests (sent by current user)
    const { data: sentRequests = [] } = useQuery({
        queryKey: ['sentConnectionRequests', currentUser?.uid],
        queryFn: () => getPendingConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid && !authLoading,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch received connection requests
    const { data: receivedRequests = [] } = useQuery({
        queryKey: ['receivedConnectionRequests', currentUser?.uid],
        queryFn: () => getReceivedConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid && !authLoading,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch roles for name resolution
    const { data: allRoles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch departments for name resolution
    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Connection request mutation
    const sendConnectionRequestMutation = useMutation({
        mutationFn: async (data: { receiverId: string; message?: string }) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            
            console.log('🔗 TodayOnBoardCard: Mutation received data:', data);
            console.log('🔗 TodayOnBoardCard: About to call sendConnectionRequest with:', {
                requesterId: currentUser.uid,
                receiverId: data.receiverId,
                message: data.message
            });
            
            const result = await sendConnectionRequest(currentUser.uid, data.receiverId, data.message);
            
            console.log('🔗 TodayOnBoardCard: Connection request sent, result:', result);
            return result;
        },
        onSuccess: (result, variables) => {
            console.log('🔗 TodayOnBoardCard: Connection request success:', {
                result,
                receiverId: variables.receiverId
            });
            
            toast.success('Connection request sent successfully!');
            // Invalidate queries to update UI immediately
            queryClient.invalidateQueries({ queryKey: ['userConnections'] });
            queryClient.invalidateQueries({ queryKey: ['sentConnectionRequests'] });
            queryClient.invalidateQueries({ queryKey: ['receivedConnectionRequests'] });
        },
        onError: (error: any) => {
            console.error('🔗 TodayOnBoardCard: Failed to send connection request:', error);
            toast.error('Failed to send connection request. Please try again.');
        }
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

    // Check connection status for a member
    const getConnectionStatus = (memberId: string) => {
        // Check if already connected
        const isConnected = userConnections.some(connection =>
            connection.connectedUserId === memberId
        );
        if (isConnected) return 'connected';

        // Check if there's a pending request sent by current user
        const hasSentRequest = sentRequests.some(request =>
            request.receiverId === memberId && request.status === 'pending'
        );
        if (hasSentRequest) return 'pending';

        // Check if there's a pending request received from this user
        const hasReceivedRequest = receivedRequests.some(request =>
            request.requesterId === memberId && request.status === 'pending'
        );
        if (hasReceivedRequest) return 'pending';

        return 'not_connected';
    };

    // Helper functions to resolve IDs to names
    const getRoleName = (roleId: string) => {
        if (!roleId) return 'Not specified';
        const role = allRoles.find((r: any) => r.id === roleId);
        return role?.name || 'Not specified';
    };

    const getDepartmentName = (departmentId: string) => {
        if (!departmentId) return 'Not specified';
        const department = departments.find((d: any) => d.id === departmentId);
        return department?.name || 'Not specified';
    };

    // Handle connection request
    const handleConnect = async (memberId: string, _memberName: string) => {
        if (!currentUser?.uid) {
            toast.error('You must be logged in to send connection requests');
            return;
        }

        if (loadingStates[memberId] || sendConnectionRequestMutation.isLoading) {
            return; // Prevent duplicate requests
        }

        try {
            setLoadingStates(prev => ({ ...prev, [memberId]: true }));
            
            await sendConnectionRequestMutation.mutateAsync({
                receiverId: memberId,
                message: "Hi! I'd love to connect with you and be friends. Please accept my connection request! 😊"
            });
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [memberId]: false }));
        }
    };

    const handleViewAll = () => {
        window.location.href = '/today-onboard';
    };

    // Show loading while auth is loading or while crew is loading (only if user has a ship)
    if (authLoading || (crewLoading && userProfile?.currentShipId)) {
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

    // Show onboarding message if user hasn't completed ship assignment
    if (!authLoading && (!userProfile?.currentShipId)) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">Today on Board</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        Setup Required
                    </span>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#069B93]/10 to-[#058a7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#069B93]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            <circle cx="12" cy="7" r="2" fill="white"/>
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Complete Your Profile</h4>
                    <p className="text-gray-600 mb-4">Please complete your onboarding to see crew members on your ship.</p>
                    <button
                        onClick={() => window.location.href = '/onboarding'}
                        className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                    >
                        Complete Onboarding
                    </button>
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
                            <CrewMemberCard 
                                key={member.id} 
                                member={{
                                    id: member.id,
                                    name: member.displayName || member.display_name,
                                    role: getRoleName(member.roleId) || member.roleName || member.role_name || 'Not specified',
                                    department: getDepartmentName(member.departmentId) || member.departmentName || member.department_name || 'Not specified',
                                    avatar: getProfilePhotoUrl(member.profilePhoto || member.profile_photo),
                                    shipName: member.shipName || member.ship_name,
                                    cruiseLineName: member.cruiseLineName || member.cruise_line_name,
                                    connectionStatus: getConnectionStatus(member.id)
                                }}
                                onConnect={handleConnect}
                                isConnecting={loadingStates[member.id] || false}
                            />
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
