import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getProfilePhotoUrl } from "../../utils/images";
import { getUserProfile, getRoles, getDepartments, getShips, getCruiseLines, sendConnectionRequest, getUserConnections, getPendingConnectionRequests, createOrGetChatRoom } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContextFirebase";
import logo from "../../assets/images/Home/logo.png";

export const CrewMemberProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [connectionMessage, setConnectionMessage] = useState('');
    const [showMessageInput, setShowMessageInput] = useState(false);

    // Fetch user profile first (most important)
    const { data: crewProfile, isLoading: profileLoading, error } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => getUserProfile(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch reference data only after profile is loaded (to avoid unnecessary calls)
    const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles,
        enabled: !!crewProfile, // Only fetch after profile is loaded
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const { data: departments = [], isLoading: departmentsLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
        enabled: !!crewProfile, // Only fetch after profile is loaded
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const { data: allShips = [], isLoading: shipsLoading } = useQuery({
        queryKey: ['ships'],
        queryFn: getShips,
        enabled: !!crewProfile, // Only fetch after profile is loaded
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useQuery({
        queryKey: ['cruiseLines'],
        queryFn: getCruiseLines,
        enabled: !!crewProfile, // Only fetch after profile is loaded
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch user's connections to check connection status (only if user is authenticated)
    const { data: userConnections = [] } = useQuery({
        queryKey: ['userConnections', currentUser?.uid],
        queryFn: () => getUserConnections(currentUser!.uid),
        enabled: !!currentUser?.uid && !!crewProfile, // Only fetch after profile is loaded
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch pending connection requests (only if user is authenticated)
    const { data: pendingRequests = [] } = useQuery({
        queryKey: ['pendingRequests', currentUser?.uid],
        queryFn: () => getPendingConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid && !!crewProfile, // Only fetch after profile is loaded
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Helper functions to get names from IDs (memoized for performance)
    const getRoleName = useMemo(() => (roleId: string) => {
        if (!roleId) return 'Crew Member';
        const role = allRoles.find(r => r.id === roleId);
        return role ? role.name : 'Crew Member';
    }, [allRoles]);

    const getDepartmentName = useMemo(() => (departmentId: string) => {
        if (!departmentId) return 'No Department';
        const department = departments.find(d => d.id === departmentId);
        return department ? department.name : 'No Department';
    }, [departments]);

    const getShipName = useMemo(() => (shipId: string) => {
        if (!shipId) return 'No Ship';
        const ship = allShips.find(s => s.id === shipId);
        return ship ? ship.name : 'No Ship';
    }, [allShips]);

    const getCruiseLineName = useMemo(() => (cruiseLineId: string) => {
        if (!cruiseLineId) return 'No Cruise Line';
        const cruiseLine = cruiseLines.find(c => c.id === cruiseLineId);
        return cruiseLine ? cruiseLine.name : 'No Cruise Line';
    }, [cruiseLines]);

    // Check connection status for this user
    const getConnectionStatus = () => {
        if (!userId || !currentUser?.uid) return 'none';
        
        // Check if already connected
        const isConnected = userConnections.some(connection =>
            connection.connectedUserId === userId
        );
        
        if (isConnected) {
            return 'connected';
        }
        
        // Check if there's a pending request
        const hasPendingRequest = pendingRequests.some(request =>
            request.receiverId === userId
        );
        
        if (hasPendingRequest) {
            return 'pending';
        }
        
        return 'none';
    };

    const connectionStatus = { status: getConnectionStatus() };

    // Send connection request mutation
    const sendConnectionRequestMutation = useMutation({
        mutationFn: async (data: { receiverId: string; message?: string }) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            return await sendConnectionRequest(currentUser.uid, data.receiverId, data.message);
        },
        onSuccess: () => {
            // Invalidate queries to update UI immediately
            queryClient.invalidateQueries({ queryKey: ['userConnections'] });
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            queryClient.invalidateQueries({ queryKey: ['receivedConnectionRequests'] });
        },
        onError: (error: any) => {
            console.error('Failed to send connection request:', error);
        }
    });

    // Debug logging (reduced for performance)
    if (process.env.NODE_ENV === 'development') {
        console.log('CrewMemberProfile - userId:', userId, 'profileLoading:', profileLoading);
    }

    // Show loading state
    if (profileLoading) {
        return (
            <div className="container">
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state for reference data (after profile is loaded)
    const isReferenceDataLoading = rolesLoading || departmentsLoading || shipsLoading || cruiseLinesLoading;

    // Show error state
    if (error || !crewProfile) {
        const errorMessage = (error as any)?.message || 'Unknown error';
        const errorStatus = (error as any)?.response?.status;

        return (
            <div className="container">
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-2">This crew member profile could not be found.</p>
                        {!!error && (
                            <div className="text-sm text-gray-500 mb-4">
                                <p>Error: {errorMessage}</p>
                                {errorStatus && <p>Status: {errorStatus}</p>}
                                <p>User ID: {userId}</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const profile = crewProfile as any;

    // Use real connection status from API instead of profile data
    const connectionStatusValue = connectionStatus?.status || 'none';
    const isConnected = connectionStatusValue === 'connected';
    const isPending = connectionStatusValue === 'pending';
    const isDeclined = connectionStatusValue === 'declined';
    
    // Privacy levels
    const isLevel1 = !isConnected && !isPending; // Public level - basic info only
    const isLevel2 = isConnected; // Connected level - full profile access
    
    // Debug logging for profile data (reduced for performance)
    if (process.env.NODE_ENV === 'development') {
        console.log('CrewMemberProfile - profile.displayName:', profile?.displayName, 'isLevel1:', isLevel1, 'isLevel2:', isLevel2);
    }

    // Handle sending connection request
    const handleSendConnectionRequest = async () => {
        if (!userId) return;

        try {
            await sendConnectionRequestMutation.mutateAsync({
                receiverId: userId,
                message: connectionMessage || undefined
            });
            setShowMessageInput(false);
            setConnectionMessage('');
            toast.success('🎉 Connection request sent successfully!', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            toast.error(error.message || 'Failed to send connection request. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Handle starting a conversation
    const handleStartConversation = async () => {
        if (!userId || !currentUser?.uid) return;

        try {
            toast.info('Starting conversation...');
            
            // Create or get existing chat room
            const chatRoomId = await createOrGetChatRoom(currentUser.uid, userId);
            
            // Navigate to the chat room
            navigate(`/chat/room/${chatRoomId}`);
            
            toast.success('Conversation started!');
        } catch (error: any) {
            console.error('Error starting conversation:', error);
            toast.error('Failed to start conversation. Please try again.');
        }
    };

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
                            <h1 className="text-base sm:text-lg font-bold">Profile</h1>
                            <p className="text-xs text-teal-100">
                                {profile.display_name || 'Crew Member'}
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
                <div className="px-4 py-6 sm:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            {/* Profile Header - Mobile Optimized */}
                            <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] p-4 sm:p-6 text-white">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="relative">
                                            <img
                                                src={getProfilePhotoUrl(profile.profilePhoto || profile.profile_photo)}
                                                alt="Profile"
                                                className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left flex-1">
                                        <h1 className="text-xl sm:text-2xl font-bold">{profile.displayName || 'Unknown User'}</h1>
                                        <p className="text-[#B9F3DF] text-base sm:text-lg">{getRoleName(profile.roleId)}</p>
                                        <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-sm text-[#B9F3DF]">Online now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Content - Mobile Optimized */}
                            <div className="p-4 sm:p-6 space-y-6">
                                {/* Connection Actions */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Actions</h2>
                                    <div className="space-y-4">
                                        {!isConnected && !isPending && !isDeclined && (
                                            <div className="space-y-3">
                                                {!showMessageInput ? (
                                                    <button
                                                        onClick={() => setShowMessageInput(true)}
                                                        className="w-full px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                                                    >
                                                        Send Connection Request
                                                    </button>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={connectionMessage}
                                                            onChange={(e) => setConnectionMessage(e.target.value)}
                                                            placeholder="Add a personal message (optional)..."
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent resize-none text-sm"
                                                            rows={3}
                                                            maxLength={500}
                                                        />
                                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                                            <button
                                                                onClick={handleSendConnectionRequest}
                                                                disabled={sendConnectionRequestMutation.isLoading}
                                                                className="flex-1 px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {sendConnectionRequestMutation.isLoading ? 'Sending...' : 'Send Request'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowMessageInput(false);
                                                                    setConnectionMessage('');
                                                                }}
                                                                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {isPending && (
                                            <div className="px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium text-center text-sm">
                                                Connection request pending
                                            </div>
                                        )}
                                        {isDeclined && (
                                            <div className="px-4 py-3 bg-red-100 text-red-800 rounded-lg font-medium text-center text-sm">
                                                Connection request was declined
                                            </div>
                                        )}
                                        {isConnected && (
                                            <button
                                                onClick={handleStartConversation}
                                                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                            >
                                                Send Message
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Information - Mobile Optimized */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                                    {isReferenceDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="w-6 h-6 border-2 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-gray-500 text-sm">Loading details...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Role</h3>
                                                <p className="text-gray-600 text-sm sm:text-base">{getRoleName(profile.roleId || '')}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Department</h3>
                                                <p className="text-gray-600 text-sm sm:text-base">{getDepartmentName(profile.departmentId || '')}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Ship</h3>
                                                <p className="text-gray-600 text-sm sm:text-base">{getShipName(profile.currentShipId || '')}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Cruise Line</h3>
                                                <p className="text-gray-600 text-sm sm:text-base">
                                                    {profile.currentShipId ? 
                                                        (() => {
                                                            const ship = allShips.find(s => s.id === profile.currentShipId);
                                                            return ship ? getCruiseLineName(ship.cruiseLineId) : 'Not specified';
                                                        })() 
                                                        : 'Not specified'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Level 1 Content - Public (always visible) */}
                                {isLevel1 && (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Connect to See More</h3>
                                        <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">Send a connection request to see bio, photos, contacts, and today's assignment.</p>
                                        <button
                                            onClick={() => setShowMessageInput(true)}
                                            className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                                        >
                                            Send Connection Request
                                        </button>
                                    </div>
                                )}

                                {/* Level 2 Content - Only visible when connected */}
                                {isLevel2 && (
                                    <div className="space-y-6">
                                        {/* Bio Section */}
                                        {(profile.bio || profile.bio_text) && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{profile.bio || profile.bio_text}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Photos Section - Mobile Optimized */}
                                        {(profile.photos || profile.additional_photos) && (profile.photos || profile.additional_photos)?.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                    {(profile.photos || profile.additional_photos || []).map((photo: string, index: number) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={photo}
                                                                alt={`Photo ${index + 1}`}
                                                                className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Information - Mobile Optimized */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
                                            <div className="space-y-3">
                                                {(profile.phone || profile.phone_number) && (
                                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Phone</h3>
                                                                <p className="text-gray-600 text-sm sm:text-base truncate">{profile.phone || profile.phone_number}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Social Media Links - Mobile Optimized */}
                                        {(profile.instagram || profile.twitter || profile.facebook || profile.snapchat || profile.website || 
                                          profile.instagram_handle || profile.twitter_handle || profile.facebook_url || profile.snapchat_username || profile.website_url) && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Social Media & Links</h2>
                                                <div className="space-y-3">
                                                    {(profile.instagram || profile.instagram_handle) && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-pink-600 font-bold text-xs sm:text-sm">IG</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Instagram</h3>
                                                                    <a href={profile.instagram || profile.instagram_handle} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.instagram || profile.instagram_handle}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(profile.twitter || profile.twitter_handle) && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-blue-600 font-bold text-xs sm:text-sm">TW</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Twitter</h3>
                                                                    <a href={profile.twitter || profile.twitter_handle} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.twitter || profile.twitter_handle}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(profile.facebook || profile.facebook_url) && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-blue-600 font-bold text-xs sm:text-sm">FB</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Facebook</h3>
                                                                    <a href={profile.facebook || profile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.facebook || profile.facebook_url}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(profile.snapchat || profile.snapchat_username) && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-yellow-600 font-bold text-xs sm:text-sm">SC</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Snapchat</h3>
                                                                    <p className="text-gray-600 text-xs sm:text-sm truncate">{profile.snapchat || profile.snapchat_username}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(profile.website || profile.website_url) && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                                                    </svg>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Website</h3>
                                                                    <a href={profile.website || profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.website || profile.website_url}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Today's Assignment - Mobile Optimized */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Assignment</h2>
                                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-blue-800 font-medium text-sm sm:text-base">Morning: Guest Entertainment Setup</p>
                                                        <p className="text-blue-600 text-xs sm:text-sm">Deck 5 - Main Theater • 9:00 AM - 12:00 PM</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
