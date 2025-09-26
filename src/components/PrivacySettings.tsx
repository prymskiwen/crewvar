import { useState } from "react";
// TODO: Implement Firebase privacy functionality
import { IPrivacySettings } from "../types/privacy";

export const PrivacySettings = () => {
    // TODO: Implement Firebase privacy functionality
    const privacySettings = {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        allowMessages: true
    };
    const updatePrivacySettings = () => {
        // Placeholder function
    };
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<IPrivacySettings>(privacySettings);

    const handleSave = async () => {
        setIsLoading(true);

        try {
            await updatePrivacySettings(settings);
            setIsEditing(false);
            console.log('Privacy settings saved');
        } catch (error) {
            console.error('Failed to save privacy settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setSettings(privacySettings);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-[#069B93]">Privacy & Security</h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your privacy settings and security preferences</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors"
                >
                    {isEditing ? 'Cancel' : 'Edit Settings'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Verification Status */}
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Status</h3>
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${settings.verificationStatus === 'verified' ? 'bg-green-500' :
                                settings.verificationStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                        <span className="text-gray-700 capitalize">
                            {settings.verificationStatus === 'verified' ? '✅ Verified' :
                                settings.verificationStatus === 'pending' ? '⏳ Pending Verification' : '❌ Verification Rejected'}
                        </span>
                    </div>
                    {settings.verificationStatus === 'verified' && settings.verificationDate && (
                        <p className="text-sm text-gray-500 mt-1">
                            Verified on {new Date(settings.verificationDate).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Ship Visibility Settings */}
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Ship Assignment Visibility</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Show only today's ship assignment
                                </label>
                                <p className="text-xs text-gray-500">
                                    Future ship assignments will be hidden from other crew members
                                </p>
                            </div>
                            {isEditing ? (
                                <input
                                    type="checkbox"
                                    checked={settings.showOnlyTodayShip}
                                    onChange={(e) => setSettings(prev => ({ ...prev, showOnlyTodayShip: e.target.checked }))}
                                    className="w-4 h-4 text-[#069B93] border-gray-300 rounded focus:ring-[#069B93]"
                                />
                            ) : (
                                <span className={`px-2 py-1 text-xs rounded-full ${settings.showOnlyTodayShip ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {settings.showOnlyTodayShip ? 'Enabled' : 'Disabled'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Allow future ship visibility
                                </label>
                                <p className="text-xs text-gray-500">
                                    Let connected crew members see your future ship assignments
                                </p>
                            </div>
                            {isEditing ? (
                                <input
                                    type="checkbox"
                                    checked={settings.allowFutureShipVisibility}
                                    onChange={(e) => setSettings(prev => ({ ...prev, allowFutureShipVisibility: e.target.checked }))}
                                    className="w-4 h-4 text-[#069B93] border-gray-300 rounded focus:ring-[#069B93]"
                                />
                            ) : (
                                <span className={`px-2 py-1 text-xs rounded-full ${settings.allowFutureShipVisibility ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {settings.allowFutureShipVisibility ? 'Enabled' : 'Disabled'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Request Handling Settings */}
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Connection Request Handling</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Decline requests silently
                                </label>
                                <p className="text-xs text-gray-500">
                                    Declined requests won't notify the sender
                                </p>
                            </div>
                            {isEditing ? (
                                <input
                                    type="checkbox"
                                    checked={settings.declineRequestsSilently}
                                    onChange={(e) => setSettings(prev => ({ ...prev, declineRequestsSilently: e.target.checked }))}
                                    className="w-4 h-4 text-[#069B93] border-gray-300 rounded focus:ring-[#069B93]"
                                />
                            ) : (
                                <span className={`px-2 py-1 text-xs rounded-full ${settings.declineRequestsSilently ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {settings.declineRequestsSilently ? 'Enabled' : 'Disabled'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Block enforces invisibility both ways
                                </label>
                                <p className="text-xs text-gray-500">
                                    When you block someone, you become invisible to them too
                                </p>
                            </div>
                            {isEditing ? (
                                <input
                                    type="checkbox"
                                    checked={settings.blockEnforcesInvisibility}
                                    onChange={(e) => setSettings(prev => ({ ...prev, blockEnforcesInvisibility: e.target.checked }))}
                                    className="w-4 h-4 text-[#069B93] border-gray-300 rounded focus:ring-[#069B93]"
                                />
                            ) : (
                                <span className={`px-2 py-1 text-xs rounded-full ${settings.blockEnforcesInvisibility ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {settings.blockEnforcesInvisibility ? 'Enabled' : 'Disabled'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Status */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Account Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Account Active
                                </label>
                                <p className="text-xs text-gray-500">
                                    Your account is currently active and visible to other crew members
                                </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${settings.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {settings.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Last Active
                                </label>
                                <p className="text-xs text-gray-500">
                                    When you were last seen on the platform
                                </p>
                            </div>
                            <span className="text-sm text-gray-600">
                                {new Date(settings.lastActiveDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                    <div className="flex space-x-4 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-6 py-3 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">ℹ</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Privacy Protection</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            These settings help protect your privacy and ensure a safe environment for all crew members.
                            Only verified active profiles can see other crew members, and ship assignments are limited to today's information by default.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
