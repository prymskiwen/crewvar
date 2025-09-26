import { useState, useEffect } from 'react';
import { HiArrowLeft, HiBell, HiMail, HiCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const NotificationSettings = () => {
    // TODO: Implement Firebase notification preferences
    const preferences = {
        email: true,
        push: true,
        connectionRequests: true,
        messages: true,
        announcements: true,
        inAppBadges: true,
        inAppToasts: true,
        emailConnectionRequest: true,
        emailConnectionAccepted: true,
        emailNewMessageOffline: true,
        emailDailySummary: true
    };
    const updatePreferences = async (prefs: any) => {
        // Placeholder function
        console.log('Update preferences:', prefs);
    };
    const [localPreferences, setLocalPreferences] = useState(preferences);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalPreferences(preferences);
    }, [preferences]);

    const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
        setLocalPreferences((prev: typeof preferences) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePreferences(localPreferences);
            // Show success message
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalPreferences(preferences);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/dashboard"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <HiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center space-x-3">
                            <HiBell className="w-6 h-6 text-[#069B93]" />
                            <h1 className="text-xl font-semibold text-gray-900">Notification Settings</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* In-App Notifications */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <HiBell className="w-5 h-5 text-[#069B93]" />
                            <h2 className="text-lg font-semibold text-gray-900">In-App Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Notification Badges</h3>
                                    <p className="text-sm text-gray-500">Show red badge with count on bell icon</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.inAppBadges}
                                        onChange={(e) => handlePreferenceChange('inAppBadges', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Toast Notifications</h3>
                                    <p className="text-sm text-gray-500">Show pop-up messages for new notifications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.inAppToasts}
                                        onChange={(e) => handlePreferenceChange('inAppToasts', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Email Notifications */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <HiMail className="w-5 h-5 text-[#069B93]" />
                            <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Connection Requests</h3>
                                    <p className="text-sm text-gray-500">Email when someone sends you a connection request</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.emailConnectionRequest}
                                        onChange={(e) => handlePreferenceChange('emailConnectionRequest', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Connection Accepted</h3>
                                    <p className="text-sm text-gray-500">Email when someone accepts your connection request</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.emailConnectionAccepted}
                                        onChange={(e) => handlePreferenceChange('emailConnectionAccepted', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">New Messages (Offline)</h3>
                                    <p className="text-sm text-gray-500">Email when you receive a message while offline</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.emailNewMessageOffline}
                                        onChange={(e) => handlePreferenceChange('emailNewMessageOffline', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Daily Summary</h3>
                                    <p className="text-sm text-gray-500">Daily email digest of all notifications (opt-in)</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.emailDailySummary}
                                        onChange={(e) => handlePreferenceChange('emailDailySummary', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleReset}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Reset to Default
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center space-x-2 px-6 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <HiCheck className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
