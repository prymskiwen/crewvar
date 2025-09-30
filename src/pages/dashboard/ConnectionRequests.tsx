import { useState } from "react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContextFirebase";
import { DashboardLayout } from '../../layout/DashboardLayout';
import {
    getReceivedConnectionRequests,
    respondToConnectionRequest,
    getUserProfile
} from "../../firebase/firestore";
import { getProfilePhotoUrl } from "../../utils/images";

export const ConnectionRequests = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    // Fetch received connection requests
    const { data: connectionRequests = [], isLoading: requestsLoading } = useQuery({
        queryKey: ['receivedConnectionRequests', currentUser?.uid],
        queryFn: () => getReceivedConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid
    });

    // Fetch requester profiles
    const { data: requesterProfiles = [] } = useQuery({
        queryKey: ['requesterProfiles', connectionRequests.map(req => req.requesterId)],
        queryFn: async () => {
            const profiles = [];
            for (const request of connectionRequests) {
                try {
                    const profile = await getUserProfile(request.requesterId);
                    profiles.push({ ...profile, requestId: request.id });
                } catch (error) {
                    console.error(`Error fetching profile for ${request.requesterId}:`, error);
                }
            }
            return profiles;
        },
        enabled: connectionRequests.length > 0
    });

    // Accept connection request mutation
    const acceptRequestMutation = useMutation(
        async (requestId: string) => {
            return await respondToConnectionRequest(requestId, 'accepted');
        },
        {
            onSuccess: () => {
                toast.success('Connection request accepted!');
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['receivedConnectionRequests'] });
                queryClient.invalidateQueries({ queryKey: ['userConnections'] });
                queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            },
            onError: (error: any) => {
                console.error('Failed to accept connection request:', error);
                toast.error(error.message || 'Failed to accept connection request');
            }
        }
    );

    // Decline connection request mutation
    const declineRequestMutation = useMutation(
        async (requestId: string) => {
            return await respondToConnectionRequest(requestId, 'declined');
        },
        {
            onSuccess: () => {
                toast.success('Connection request declined');
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['receivedConnectionRequests'] });
            },
            onError: (error: any) => {
                console.error('Failed to decline connection request:', error);
                toast.error(error.message || 'Failed to decline connection request');
            }
        }
    );

    // Handle accept request
    const handleAccept = async (requestId: string) => {
        try {
            setLoadingStates(prev => ({ ...prev, [requestId]: true }));
            await acceptRequestMutation.mutateAsync(requestId);
        } catch (error: any) {
            console.error('Failed to accept connection request:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [requestId]: false }));
        }
    };

    // Handle decline request
    const handleDecline = async (requestId: string) => {
        try {
            setLoadingStates(prev => ({ ...prev, [requestId]: true }));
            await declineRequestMutation.mutateAsync(requestId);
        } catch (error: any) {
            console.error('Failed to decline connection request:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [requestId]: false }));
        }
    };

    // View profile handler
    const handleViewProfile = (userId: string) => {
        window.location.href = `/crew/${userId}`;
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
                            <p className="text-gray-600 text-sm mt-1">Manage your pending connection requests</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Loading State */}
                    {requestsLoading && (
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                <span className="ml-3 text-gray-600">Loading connection requests...</span>
                            </div>
                        </div>
                    )}

                    {/* Connection Requests */}
                    {!requestsLoading && (
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-teal-600">
                                    Pending Requests ({connectionRequests.length})
                                </h2>
                            </div>

                            {connectionRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-base">No pending connection requests</p>
                                    <p className="text-gray-400 text-sm mt-1">You'll see connection requests here when people want to connect with you</p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {requesterProfiles.map((profile: any) => {
                                        const request = connectionRequests.find(req => req.requesterId === profile.id);
                                        return (
                                            <div key={request?.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-teal-300 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                                    {/* Avatar and Info */}
                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                        {/* Avatar */}
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={getProfilePhotoUrl(profile.profilePhoto)}
                                                                alt={profile.displayName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const parent = target.parentElement;
                                                                    if (parent) {
                                                                        parent.innerHTML = `
                                                                        <div class="w-full h-full bg-teal-500 flex items-center justify-center">
                                                                            <span class="text-white font-bold text-sm sm:text-lg">${profile.displayName.charAt(0)}</span>
                                                                        </div>
                                                                    `;
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Profile Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                                {profile.displayName}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                                {profile.roleId || 'Crew Member'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {profile.departmentId} • {profile.currentShipId}
                                                            </p>
                                                            {request?.message && (
                                                                <p className="text-xs text-gray-600 mt-1 italic">
                                                                    "{request.message}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex space-x-2 sm:flex-shrink-0">
                                                        <button
                                                            onClick={() => handleAccept(request?.id)}
                                                            disabled={loadingStates[request?.id] || acceptRequestMutation.isLoading}
                                                            className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {loadingStates[request?.id] ? 'Accepting...' : 'Accept'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecline(request?.id)}
                                                            disabled={loadingStates[request?.id] || declineRequestMutation.isLoading}
                                                            className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {loadingStates[request?.id] ? 'Declining...' : 'Decline'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewProfile(profile.id)}
                                                            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:border-teal-600 hover:text-teal-600 hover:bg-teal-50 transition-colors font-medium"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
