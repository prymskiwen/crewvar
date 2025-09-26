import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserProfile } from "../types/connections";
import { FavoriteButton } from "./FavoriteButton";

interface ProfileViewProps {
    profile: IUserProfile;
    connectionStatus?: 'none' | 'pending' | 'connected' | 'blocked';
    onSendRequest?: (profileId: string, message?: string) => void;
    onCancelRequest?: (profileId: string) => void;
    isLoading?: boolean;
    showFullProfile?: boolean; // Level 2 access
}

export const ProfileView = ({ 
    profile, 
    connectionStatus = 'none',
    onSendRequest,
    onCancelRequest,
    isLoading = false,
    showFullProfile = false
}: ProfileViewProps) => {
    const navigate = useNavigate();
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [message, setMessage] = useState("");

    const handleSendRequest = () => {
        if (message.trim() && onSendRequest) {
            onSendRequest(profile.id, message.trim());
            setMessage("");
            setShowRequestForm(false);
        } else if (onSendRequest) {
            onSendRequest(profile.id);
            setShowRequestForm(false);
        }
    };

    const handleCancelRequest = () => {
        if (onCancelRequest) {
            onCancelRequest(profile.id);
        }
    };

    const getButtonText = () => {
        switch (connectionStatus) {
            case 'pending': return 'Request Sent';
            case 'connected': return 'Connected';
            case 'blocked': return 'Blocked';
            default: return 'Request to Connect';
        }
    };

    const getButtonStyle = () => {
        switch (connectionStatus) {
            case 'pending':
                return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'connected':
                return 'bg-green-500 hover:bg-green-600 text-white';
            case 'blocked':
                return 'bg-gray-500 hover:bg-gray-600 text-white';
            default:
                return 'bg-[#069B93] hover:bg-[#058a7a] text-white';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] p-6 text-white">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <img 
                            src={profile.avatar} 
                            alt={profile.displayName} 
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {profile.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                        <p className="text-[#B9F3DF] text-lg">{profile.role}</p>
                        <p className="text-[#B9F3DF] text-sm">{profile.department} • {profile.subcategory}</p>
                        <div className="flex items-center space-x-2 mt-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-[#B9F3DF]">
                                {profile.isOnline ? 'Online now' : `Last seen ${profile.lastSeen}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
                {/* Level 1 - Basic Info (Always Visible) */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Assignment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-1">Ship</h3>
                            <p className="text-gray-600">{profile.shipName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-1">Port</h3>
                            <p className="text-gray-600">{profile.port}</p>
                        </div>
                    </div>
                </div>

                {/* Level 2 - Extended Info (Only for Connected Users) */}
                {showFullProfile && connectionStatus === 'connected' && (
                    <div className="space-y-6">
                        {/* Bio */}
                        {profile.bio && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                            </div>
                        )}

                        {/* Additional Photos */}
                        {profile.photos && profile.photos.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {profile.photos.map((photo, index) => (
                                        <img 
                                            key={index}
                                            src={photo} 
                                            alt={`${profile.displayName} photo ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact Information */}
                        {profile.contacts && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
                                <div className="space-y-3">
                                    {profile.contacts.email && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-[#069B93] rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm">✉</span>
                                            </div>
                                            <span className="text-gray-700">{profile.contacts.email}</span>
                                        </div>
                                    )}
                                    {profile.contacts.phone && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-[#069B93] rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm">📞</span>
                                            </div>
                                            <span className="text-gray-700">{profile.contacts.phone}</span>
                                        </div>
                                    )}
                                    {profile.contacts.social && profile.contacts.social.length > 0 && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-[#069B93] rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm">🌐</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                {profile.contacts.social.map((social, index) => (
                                                    <span key={index} className="text-gray-700">{social}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Level 1 Restriction Notice */}
                {!showFullProfile && connectionStatus !== 'connected' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">ℹ</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900">Connect to See More</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Send a connection request to see {profile.displayName}'s full profile and chat directly with them once accepted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200">
                    {connectionStatus === 'none' && !showRequestForm && (
                        <button
                            onClick={() => setShowRequestForm(true)}
                            disabled={isLoading}
                            className={`w-full px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isLoading 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : getButtonStyle()
                            }`}
                        >
                            {isLoading ? 'Sending...' : getButtonText()}
                        </button>
                    )}

                    {connectionStatus === 'none' && showRequestForm && (
                        <div className="space-y-4">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a personal message (optional)..."
                                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                                rows={3}
                            />
                            <div className="flex space-x-3">
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

                    {connectionStatus === 'pending' && (
                        <div className="space-y-3">
                            <button
                                disabled
                                className="w-full px-6 py-3 text-sm font-medium text-white bg-yellow-500 rounded-lg cursor-not-allowed"
                            >
                                Request Sent
                            </button>
                            <button
                                onClick={handleCancelRequest}
                                className="w-full px-6 py-3 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel Request
                            </button>
                        </div>
                    )}

                    {connectionStatus === 'connected' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <button
                                    disabled
                                    className="px-6 py-3 text-sm font-medium text-white bg-green-500 rounded-lg cursor-not-allowed"
                                >
                                    ✓ Connected
                                </button>
                                <FavoriteButton 
                                    userId={profile.id} 
                                    userName={profile.displayName}
                                    size="md"
                                />
                            </div>
                            <button 
                                onClick={() => navigate(`/chat/${profile.id}`)}
                                className="w-full px-6 py-3 text-sm font-medium text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg transition-colors"
                            >
                                Start Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
