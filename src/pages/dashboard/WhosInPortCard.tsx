import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { CrewMemberCard } from './CrewMemberCard';
import { getProfilePhotoUrl } from '../../utils/images';
import { useAuth } from '../../context/AuthContextFirebase';
import { getActivePortLinks, getSuggestedPortCrewProfiles, sendConnectionRequest, getPendingConnectionRequests, getReceivedConnectionRequests, getUserConnections, getRoles, getDepartments, getShips } from '../../firebase/firestore';

export const WhosInPortCard = () => {
    const { currentUser, userProfile } = useAuth();
    const queryClient = useQueryClient();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    // Get active port links for current user's ship
    const { data: activePortLinks = [], isLoading: portLinksLoading } = useQuery({
        queryKey: ['activePortLinks', userProfile?.currentShipId],
        queryFn: () => {
            if (!userProfile?.currentShipId) throw new Error('No ship ID');
            return getActivePortLinks(userProfile.currentShipId);
        },
        enabled: !!userProfile?.currentShipId,
        refetchInterval: 60000, // Refetch every minute to check for new links
    });

    // Get suggested crew profiles from linked ships
    const { data: suggestedCrew = [], isLoading: crewLoading, isFetching } = useQuery({
        queryKey: ['suggestedPortCrew', userProfile?.currentShipId, userProfile?.departmentId],
        queryFn: () => {
            if (!userProfile?.currentShipId) throw new Error('No ship ID');
            return getSuggestedPortCrewProfiles(
                userProfile.currentShipId,
                userProfile?.departmentId,
                8 // Limit to 8 profiles
            );
        },
        enabled: !!userProfile?.currentShipId && activePortLinks.length > 0,
        refetchInterval: 300000, // Refetch every 5 minutes
        retry: false, // Don't retry if disabled
        staleTime: 0, // Always refetch when enabled
    });

    // Fetch user's connections to check connection status
    const { data: userConnections = [] } = useQuery({
        queryKey: ['userConnections', currentUser?.uid],
        queryFn: () => getUserConnections(currentUser!.uid),
        enabled: !!currentUser?.uid,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch pending connection requests (sent by current user)
    const { data: sentRequests = [] } = useQuery({
        queryKey: ['sentConnectionRequests', currentUser?.uid],
        queryFn: () => getPendingConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch received connection requests
    const { data: receivedRequests = [] } = useQuery({
        queryKey: ['receivedConnectionRequests', currentUser?.uid],
        queryFn: () => getReceivedConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid,
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

    // Fetch ships for name resolution
    const { data: ships = [] } = useQuery({
        queryKey: ['ships'],
        queryFn: getShips,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const crew = suggestedCrew || [];
    const hasActivePortLinks = activePortLinks.length > 0;
    
    // Fix loading state - if query is disabled, it shouldn't be loading
    const crewQueryEnabled = !!userProfile?.currentShipId && activePortLinks.length > 0;
    const isActuallyLoadingCrew = crewQueryEnabled && (crewLoading || isFetching);

    // Connection request mutation
    const sendConnectionRequestMutation = useMutation({
        mutationFn: async (data: { receiverId: string; message?: string }) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            return await sendConnectionRequest(currentUser.uid, data.receiverId, data.message);
        },
        onSuccess: () => {
            toast.success('Connection request sent successfully!');
            // Invalidate queries to update UI immediately
            queryClient.invalidateQueries({ queryKey: ['userConnections'] });
            queryClient.invalidateQueries({ queryKey: ['sentConnectionRequests'] });
            queryClient.invalidateQueries({ queryKey: ['receivedConnectionRequests'] });
        },
        onError: (error: any) => {
            console.error('Failed to send connection request:', error);
            toast.error('Failed to send connection request. Please try again.');
        }
    });

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

    const getShipName = (shipId: string) => {
        if (!shipId) return 'Not specified';
        const ship = ships.find((s: any) => s.id === shipId);
        return ship?.name || 'Not specified';
    };

    // Debug logging
    console.log('WhosInPortCard Debug:', {
        userProfile: userProfile?.currentShipId,
        portLinksLoading,
        crewLoading,
        isFetching,
        isActuallyLoadingCrew,
        crewQueryEnabled,
        activePortLinks: activePortLinks.length,
        suggestedCrew: suggestedCrew.length,
        hasActivePortLinks,
        shouldShowLoading: (portLinksLoading || isActuallyLoadingCrew) && userProfile?.currentShipId
    });

    const handleViewAll = () => {
        window.location.href = '/whos-in-port';
    };


    // Show loading only when actually loading something meaningful
    if ((portLinksLoading || isActuallyLoadingCrew) && userProfile?.currentShipId) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">
                        Crewvar automatically detects when ships are docked together based on crew connections, have you checked who is with you today?
                    </h3>
                    <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        ...
                    </span>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                    <p className="ml-3 text-gray-600">Checking for ships in port...</p>
                </div>
            </div>
        );
    }

    // If user doesn't have a ship assigned, show a different message
    if (!userProfile?.currentShipId) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-semibold text-[#069B93]">
                        Crewvar automatically detects when ships are docked together based on crew connections, have you checked who is with you today?
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full font-medium">0</span>
                    </div>
                </div>
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Complete your profile</h4>
                    <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto">
                        <Link to="/profile" className="text-[#069B93] hover:text-[#058a7a] font-semibold underline">
                            Complete your profile
                        </Link> to tell us which ship you are on to unlock finding your friends on your ship or on another ship.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-semibold text-[#069B93]">
                        Who's in port with you today?
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full font-medium">
                            {crew.length}
                        </span>
                    </div>
                </div>

                <div className="space-y-1 lg:space-y-3 mb-3 lg:mb-4">
                    {crew.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1 lg:gap-3">
                            {crew.slice(0, 8).map((member) => (
                                <CrewMemberCard 
                                    key={member.id} 
                                    member={{
                                    id: member.id,
                                        name: member.displayName,
                                        role: getRoleName(member.roleId),
                                        department: getDepartmentName(member.departmentId),
                                        avatar: getProfilePhotoUrl(member.profilePhoto),
                                        shipName: getShipName(member.currentShipId),
                                        cruiseLineName: '',
                                        connectionStatus: getConnectionStatus(member.id)
                                    }}
                                    onConnect={handleConnect}
                                    isConnecting={loadingStates[member.id] || false}
                                />
                            ))}
                        </div>
                    ) : hasActivePortLinks ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#069B93]/10 to-[#058a7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Loading crew profiles...</h4>
                            <p className="text-gray-600 text-sm mb-4">Finding crew members from the linked ship</p>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#069B93]/10 to-[#058a7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">No ships detected in port</h4>
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

                {/* Description text at bottom */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 text-center">
                        Crewvar automatically detects when ships are docked together based on crew connections, have you checked who is with you today?{' '}
                        <Link 
                            to="/explore-ships" 
                            className="text-[#069B93] hover:text-[#058a7a] underline font-semibold"
                        >
                            Find your friends.
                        </Link>
                    </p>
                </div>

            </div>

        </>
    );
};
