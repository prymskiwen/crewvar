import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfilePhotoUrl } from "../../utils/images";
import logo from "../../assets/images/Home/logo.png";

export const CrewMemberProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    // TODO: Implement Firebase crew profile and connection functionality
    const crewProfile: any = {
        display_name: 'John Doe',
        profile_photo: null,
        role_name: 'Captain',
        department_name: 'Bridge',
        ship_name: 'Sample Ship',
        cruise_line_name: 'Sample Cruise Line',
        bio: 'Sample bio text',
        additional_photos: [],
        phone: null,
        instagram: null,
        twitter: null,
        facebook: null,
        snapchat: null,
        website: null
    };
    const profileLoading = false;
    const error = null;
    const connectionStatus: any = { status: 'none' };
    const sendConnectionRequest = {
        mutateAsync: async (data: any) => {
            // Placeholder function
            console.log('Send connection request:', data);
        },
        isLoading: false
    };
    const [connectionMessage, setConnectionMessage] = useState('');
    const [showMessageInput, setShowMessageInput] = useState(false);

    // Debug logging
    console.log('CrewMemberProfile - userId:', userId);
    console.log('CrewMemberProfile - profileLoading:', profileLoading);
    console.log('CrewMemberProfile - error:', error);
    console.log('CrewMemberProfile - crewProfile:', crewProfile);
    console.log('CrewMemberProfile - connectionStatus:', connectionStatus);

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

    const profile = crewProfile;

    // Use real connection status from API instead of profile data
    const connectionStatusValue = connectionStatus?.status || 'none';
    const isConnected = connectionStatusValue === 'connected';
    const isPending = connectionStatusValue === 'pending';
    const isDeclined = connectionStatusValue === 'declined';

    // Handle sending connection request
    const handleSendConnectionRequest = async () => {
        if (!userId) return;

        try {
            await sendConnectionRequest.mutateAsync({
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
            toast.error(error.response?.data?.error || 'Failed to send connection request. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
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
                                                src={getProfilePhotoUrl(profile.profile_photo)}
                                                alt="Profile"
                                                className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left flex-1">
                                        <h1 className="text-xl sm:text-2xl font-bold">{profile.display_name}</h1>
                                        <p className="text-[#B9F3DF] text-base sm:text-lg">{profile.role_name || 'Crew Member'}</p>
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
                                                                disabled={sendConnectionRequest.isLoading}
                                                                className="flex-1 px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {sendConnectionRequest.isLoading ? 'Sending...' : 'Send Request'}
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
                                                onClick={() => navigate(`/chat/${userId}`)}
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Role</h3>
                                            <p className="text-gray-600 text-sm sm:text-base">{profile.role_name || 'Not specified'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Department</h3>
                                            <p className="text-gray-600 text-sm sm:text-base">{profile.department_name || 'Not specified'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Ship</h3>
                                            <p className="text-gray-600 text-sm sm:text-base">{profile.ship_name || 'Not specified'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Cruise Line</h3>
                                            <p className="text-gray-600 text-sm sm:text-base">{profile.cruise_line_name || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Level 2 Content - Only visible when connected */}
                                {!isConnected && !isPending ? (
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
                                ) : (
                                    <div className="space-y-6">
                                        {/* Bio Section */}
                                        {profile.bio && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Photos Section - Mobile Optimized */}
                                        {profile.additional_photos && profile.additional_photos.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                    {profile.additional_photos.map((photo: string, index: number) => (
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
                                                {profile.phone && (
                                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Phone</h3>
                                                                <p className="text-gray-600 text-sm sm:text-base truncate">{profile.phone}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Social Media Links - Mobile Optimized */}
                                        {(profile.instagram || profile.twitter || profile.facebook || profile.snapchat || profile.website) && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Social Media & Links</h2>
                                                <div className="space-y-3">
                                                    {profile.instagram && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-pink-600 font-bold text-xs sm:text-sm">IG</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Instagram</h3>
                                                                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.instagram}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.twitter && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-blue-600 font-bold text-xs sm:text-sm">TW</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Twitter</h3>
                                                                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.twitter}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.facebook && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-blue-600 font-bold text-xs sm:text-sm">FB</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Facebook</h3>
                                                                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.facebook}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.snapchat && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-yellow-600 font-bold text-xs sm:text-sm">SC</span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Snapchat</h3>
                                                                    <p className="text-gray-600 text-xs sm:text-sm truncate">{profile.snapchat}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.website && (
                                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                                                    </svg>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Website</h3>
                                                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm truncate block">
                                                                        {profile.website}
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
