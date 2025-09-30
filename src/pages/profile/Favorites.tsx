import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FavoritesList } from "../../components/common";
import { FavoritesAlerts } from "../../components/notifications";
import { DashboardLayout } from "../../layout";

export const Favorites = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'favorites' | 'alerts'>('favorites');

    const handleViewProfile = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    const handleStartChat = (userId: string) => {
        navigate(`/chat/${userId}`);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Header */}
                <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div>
                                <h1 className="text-base sm:text-lg font-bold">Favorites & Alerts</h1>
                                <p className="text-xs text-teal-100">Stay connected with your favorite crew members</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'favorites'
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                My Favorites
                            </button>
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'alerts'
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Alerts
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === 'favorites' ? (
                            <FavoritesList
                                onViewProfile={handleViewProfile}
                                onStartChat={handleStartChat}
                            />
                        ) : (
                            <FavoritesAlerts
                                onViewProfile={handleViewProfile}
                                onStartChat={handleStartChat}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
