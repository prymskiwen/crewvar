import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserProfile } from "../types/connections";
import { sampleConnectionContext } from "../data/connections-data";
import { usePrivacy } from "../context/PrivacyContext";
import { ReportUser } from "./ReportUser";

interface ConnectionRequestProps {
    profile: IUserProfile;
    onSendRequest: (profileId: string, message?: string) => void;
    onCancelRequest: (profileId: string) => void;
    requestStatus?: 'pending' | 'sent' | 'accepted' | 'declined' | 'blocked';
    isLoading?: boolean;
}

export const ConnectionRequest = ({ 
    profile, 
    onSendRequest, 
    onCancelRequest, 
    requestStatus,
    isLoading = false 
}: ConnectionRequestProps) => {
    const navigate = useNavigate();
    const { isUserVerified, isUserActive, isUserBlocked, isInDeclineCooldown, blockUser } = usePrivacy();
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [message, setMessage] = useState("");
    const [showBlockOption, setShowBlockOption] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Privacy checks
    const canSeeProfile = isUserVerified("current_user") && isUserActive("current_user") && 
                         isUserVerified(profile.id) && isUserActive(profile.id);
    const isBlocked = isUserBlocked("current_user", profile.id);
    const inCooldown = isInDeclineCooldown("current_user", profile.id);

    const handleSendRequest = () => {
        if (!canSeeProfile) {
            console.log("Cannot send request: Privacy rules prevent interaction");
            return;
        }
        
        if (message.trim()) {
            onSendRequest(profile.id, message.trim());
            setMessage("");
            setShowRequestForm(false);
        } else {
            onSendRequest(profile.id);
            setShowRequestForm(false);
        }
    };

    const handleCancelRequest = () => {
        onCancelRequest(profile.id);
    };

    const handleBlockUser = async () => {
        try {
            await blockUser(profile.id, "User requested blocking");
            setShowBlockOption(false);
            console.log(`Blocked user ${profile.id}`);
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const getButtonText = () => {
        switch (requestStatus) {
            case 'pending': return 'Request Sent';
            case 'sent': return 'Request Sent';
            case 'accepted': return 'Connected';
            case 'declined': return 'Request Declined';
            case 'blocked': return 'Blocked';
            default: return 'Request to Connect';
        }
    };

    const getButtonStyle = () => {
        switch (requestStatus) {
            case 'pending':
            case 'sent':
                return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'accepted':
                return 'bg-green-500 hover:bg-green-600 text-white';
            case 'declined':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'blocked':
                return 'bg-gray-500 hover:bg-gray-600 text-white';
            default:
                return 'bg-[#069B93] hover:bg-[#058a7a] text-white';
        }
    };

    const isDisabled = requestStatus && requestStatus !== 'declined' || !canSeeProfile || isBlocked || inCooldown;

    // Show privacy restriction message
    if (!canSeeProfile) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                            {profile.displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{profile.displayName}</h3>
                        <p className="text-sm text-gray-600 truncate">{profile.role}</p>
                    </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">🔒</span>
                        <p className="text-sm text-yellow-800">
                            Profile not visible due to privacy settings. Only verified active profiles can see rosters.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isBlocked) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                            {profile.displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{profile.displayName}</h3>
                        <p className="text-sm text-gray-600 truncate">{profile.role}</p>
                    </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-red-600">🚫</span>
                        <p className="text-sm text-red-800">
                            This user is blocked. You are invisible to each other.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    <img 
                        src={profile.avatar} 
                        alt={profile.displayName} 
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    {profile.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{profile.displayName}</h3>
                    <p className="text-sm text-gray-600 truncate">{profile.role}</p>
                    <p className="text-xs text-gray-500 truncate">{profile.subcategory}</p>
                </div>
            </div>
            
            <div className="mb-3">
                <p className="text-sm text-gray-700">
                    <span className="font-medium">Ship:</span> {profile.shipName}
                </p>
                <p className="text-sm text-gray-700">
                    <span className="font-medium">Port:</span> {profile.port}
                </p>
                <p className="text-xs text-gray-500">
                    {profile.isOnline ? 'Online now' : `Last seen ${profile.lastSeen}`}
                </p>
            </div>

            {/* Connection Context */}
            <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Connection Context:</p>
                <p className="text-xs text-blue-600">
                    {sampleConnectionContext.mutualFriends} mutual friends
                </p>
                {sampleConnectionContext.pastCoincidences.length > 0 && (
                    <p className="text-xs text-blue-600">
                        {sampleConnectionContext.pastCoincidences.length} past coincidences
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
                {/* View Profile Button */}
                <button
                    onClick={() => navigate(`/profile/${profile.id}`)}
                    className="w-full px-4 py-2 text-sm font-medium text-[#069B93] border border-[#069B93] hover:bg-[#069B93] hover:text-white rounded-lg transition-colors"
                >
                    View Profile
                </button>

                {!showRequestForm ? (
                    <button
                        onClick={() => setShowRequestForm(true)}
                        disabled={isDisabled || isLoading}
                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isDisabled || isLoading 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : getButtonStyle()
                        }`}
                    >
                        {isLoading ? 'Sending...' : getButtonText()}
                    </button>
                ) : (
                    <div className="space-y-2">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a personal message (optional)..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                            rows={2}
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSendRequest}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send Request'}
                            </button>
                            <button
                                onClick={() => setShowRequestForm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {requestStatus === 'pending' && (
                    <button
                        onClick={handleCancelRequest}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                        Cancel Request
                    </button>
                )}

                {/* Block User Option */}
                <div className="pt-2 border-t border-gray-200">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowBlockOption(!showBlockOption)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            {showBlockOption ? 'Cancel Block' : 'Block User'}
                        </button>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-300 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            Report
                        </button>
                    </div>
                    
                    {showBlockOption && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 mb-3">
                                Blocking this user will make you invisible to each other. This action cannot be undone by the blocked user.
                            </p>
                            <button
                                onClick={handleBlockUser}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Confirm Block
                            </button>
                        </div>
                    )}
                </div>

                {/* Cooldown Notice */}
                {inCooldown && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                            <span className="font-medium">Cooldown Active:</span> You cannot send requests to this user for 24 hours after declining.
                        </p>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <ReportUser
                    reportedUserId={profile.id}
                    reportedUserName={profile.displayName}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};
