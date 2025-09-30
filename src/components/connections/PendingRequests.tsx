import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContextFirebase";
import {
    getReceivedConnectionRequests,
    respondToConnectionRequest,
    getUserProfile
} from "../../firebase/firestore";
import { getProfilePhotoUrl } from "../../utils/images";

export const PendingRequests = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    // Fetch received connection requests
    const { data: connectionRequests = [], isLoading, error } = useQuery({
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

    const requests = connectionRequests;

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
                <p className="text-gray-600">Failed to load pending connection requests.</p>
            </div>
        );
    }


    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">You don't have any pending connection requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requesterProfiles.map((profile: any) => {
                const request = connectionRequests.find(req => req.requesterId === profile.id);
                return (
                    <div key={request?.id} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-start space-x-4">
                            <img
                                src={getProfilePhotoUrl(profile.profilePhoto)}
                                alt={profile.displayName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        parent.innerHTML = `
                                        <div class="w-12 h-12 bg-teal-500 flex items-center justify-center rounded-full border-2 border-gray-200">
                                            <span class="text-white font-bold text-lg">${profile.displayName.charAt(0)}</span>
                                        </div>
                                    `;
                                    }
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{profile.displayName}</h3>
                                        <p className="text-sm text-gray-600">{profile.roleId || 'Crew Member'}</p>
                                        <p className="text-xs text-gray-500">{profile.departmentId} • {profile.currentShipId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            {request?.createdAt ? new Date(request.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                        </p>
                                    </div>
                                </div>

                                {request?.message && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 mt-4">
                                    <button
                                        onClick={() => handleAccept(request?.id)}
                                        disabled={loadingStates[request?.id] || acceptRequestMutation.isLoading}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingStates[request?.id] ? 'Accepting...' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleDecline(request?.id)}
                                        disabled={loadingStates[request?.id] || declineRequestMutation.isLoading}
                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingStates[request?.id] ? 'Declining...' : 'Decline'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
