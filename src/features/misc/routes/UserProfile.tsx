import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../components/Elements/Navbar";
import { ProfileView } from "../../../components/ProfileView";
import { sampleProfiles, getConnectionsForUser } from "../../../data/connections-data";
import { IUserProfile } from "../../../types/connections";

export const UserProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected' | 'blocked'>('none');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        if (userId) {
            // Find profile by ID
            const foundProfile = sampleProfiles.find(p => p.id === userId);
            if (foundProfile) {
                setProfile(foundProfile);
                // Check connection status
                checkConnectionStatus(foundProfile.id);
                
                // Check if we're coming from accepting a connection request
                if (location.state?.connectionAccepted) {
                    setShowSuccessMessage(true);
                    // Hide success message after 3 seconds
                    setTimeout(() => setShowSuccessMessage(false), 3000);
                }
            } else {
                // Profile not found
                navigate('/explore-ships');
            }
        }
    }, [userId, navigate, location.state]);

    const checkConnectionStatus = (profileId: string) => {
        // Simulate checking connection status
        const connections = getConnectionsForUser('current_user');
        const isConnected = connections.some(conn => 
            conn.userId1 === profileId || conn.userId2 === profileId
        );
        
        if (isConnected) {
            setConnectionStatus('connected');
        } else {
            // Check if there's a pending request
            // This would be checked against actual connection requests
            setConnectionStatus('none');
        }
    };

    const handleSendRequest = async (profileId: string, message?: string) => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setConnectionStatus('pending');
            console.log(`Connection request sent to ${profileId}`, message ? `with message: "${message}"` : '');
        } catch (error) {
            console.error('Failed to send connection request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRequest = async (profileId: string) => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setConnectionStatus('none');
            console.log(`Connection request cancelled for ${profileId}`);
        } catch (error) {
            console.error('Failed to cancel connection request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="container">
                <Navbar />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#069B93] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <nav className="flex items-center space-x-2 text-sm">
                            <button 
                                onClick={() => navigate('/explore-ships')}
                                className="text-[#069B93] hover:text-[#058a7a]"
                            >
                                Explore Ships
                            </button>
                            <span className="text-gray-400">›</span>
                            <span className="text-gray-600">{profile.displayName}</span>
                        </nav>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-green-900">Connection Accepted!</h4>
                                    <p className="text-sm text-green-700">
                                        You are now connected with {profile.displayName}. You can see their full profile and start chatting.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Content */}
                    <div className="max-w-4xl mx-auto">
                        <ProfileView
                            profile={profile}
                            connectionStatus={connectionStatus}
                            onSendRequest={handleSendRequest}
                            onCancelRequest={handleCancelRequest}
                            isLoading={isLoading}
                            showFullProfile={connectionStatus === 'connected'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
