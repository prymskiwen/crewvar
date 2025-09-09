import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Elements/Navbar";
import { FavoritesList } from "../../../components/FavoritesList";
import { FavoritesAlerts } from "../../../components/FavoritesAlerts";

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
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <Navbar />
            <div className="min-h-screen">
                <div className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
                    {/* Breadcrumb */}
                    <div className="mb-4 lg:mb-6">
                        <nav className="flex items-center space-x-2 text-xs lg:text-sm">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="text-[#069B93] hover:text-[#058a7a]"
                            >
                                Dashboard
                            </button>
                            <span className="text-gray-400">›</span>
                            <span className="text-gray-600">Favorites & Alerts</span>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#069B93] mb-2">Favorites & Alerts</h1>
                        <p className="text-sm lg:text-base text-gray-600">
                            Stay connected with your favorite crew members. We'll let you know when you sail together again!
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 lg:mb-8 bg-gray-100 rounded-lg p-1 max-w-md">
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 px-4 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'favorites'
                                    ? 'bg-white text-[#069B93] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            My Favorites
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`flex-1 px-4 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'alerts'
                                    ? 'bg-white text-[#069B93] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Alerts
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-w-4xl mx-auto">
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

                    {/* Quick Actions */}
                    <div className="mt-6 lg:mt-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
                            <h3 className="text-base lg:text-lg font-semibold text-[#069B93] mb-3 lg:mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                                <button 
                                    onClick={() => navigate('/explore-ships')}
                                    className="p-3 lg:p-4 text-left border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#B9F3DF] transition-colors"
                                >
                                    <h4 className="font-medium text-gray-900 text-sm lg:text-base">Explore Ships</h4>
                                    <p className="text-xs lg:text-sm text-gray-600">Find crew members to add to favorites</p>
                                </button>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="p-3 lg:p-4 text-left border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#B9F3DF] transition-colors"
                                >
                                    <h4 className="font-medium text-gray-900 text-sm lg:text-base">Dashboard</h4>
                                    <p className="text-xs lg:text-sm text-gray-600">View your daily crew updates</p>
                                </button>
                                <button 
                                    onClick={() => navigate('/chat')}
                                    className="p-3 lg:p-4 text-left border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#B9F3DF] transition-colors"
                                >
                                    <h4 className="font-medium text-gray-900 text-sm lg:text-base">Messages</h4>
                                    <p className="text-xs lg:text-sm text-gray-600">Chat with your connected crew</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
