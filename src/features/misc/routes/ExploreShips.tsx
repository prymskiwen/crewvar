import Navbar from "../../../components/Elements/Navbar";
import { useState } from "react";
import { sampleShips, sampleDepartments } from "../../../data/onboarding-data";
import { IShip, IDepartment, ISubcategory } from "../../../types/onboarding";
import { ConnectionRequest } from "../../../components/ConnectionRequest";
import { sampleProfiles } from "../../../data/connections-data";

export const ExploreShips = () => {
    const [selectedShip, setSelectedShip] = useState<string>("");
    const [selectedPort, setSelectedPort] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [showSubcategories, setShowSubcategories] = useState<boolean>(false);
    const [showAllSubcategories, setShowAllSubcategories] = useState<boolean>(false);
    const [connectionRequests, setConnectionRequests] = useState<{[key: string]: 'pending' | 'sent' | 'accepted' | 'declined' | 'blocked'}>({});
    const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

    // Sample ports data
    const ports = [
        "Miami, Florida",
        "Fort Lauderdale, Florida", 
        "Port Canaveral, Florida",
        "New York, New York",
        "Los Angeles, California",
        "Seattle, Washington",
        "Barcelona, Spain",
        "Southampton, UK",
        "Copenhagen, Denmark"
    ];

    // Connection request handlers
    const handleSendRequest = async (profileId: string, message?: string) => {
        setIsLoading(prev => ({ ...prev, [profileId]: true }));
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update connection status
            setConnectionRequests(prev => ({ ...prev, [profileId]: 'sent' }));
            
            console.log(`Connection request sent to ${profileId}`, message ? `with message: "${message}"` : '');
        } catch (error) {
            console.error('Failed to send connection request:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [profileId]: false }));
        }
    };

    const handleCancelRequest = async (profileId: string) => {
        setIsLoading(prev => ({ ...prev, [profileId]: true }));
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Remove connection request
            setConnectionRequests(prev => {
                const newState = { ...prev };
                delete newState[profileId];
                return newState;
            });
            
            console.log(`Connection request cancelled for ${profileId}`);
        } catch (error) {
            console.error('Failed to cancel connection request:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [profileId]: false }));
        }
    };

    const filteredCrew = sampleProfiles.filter(profile => {
        const matchesShip = !selectedShip || profile.shipName === selectedShip;
        const matchesPort = !selectedPort || profile.port === selectedPort;
        const matchesDepartment = !selectedDepartment || profile.department === selectedDepartment;
        
        return matchesShip && matchesPort && matchesDepartment;
    });

    return (
        <div className="container">
            <Navbar />
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#069B93] mb-4">
                            Discover Who's with you today!
                        </h1>
                        <p className="text-lg text-gray-600">
                            Find your friends and connect with crewvar users from other ships
                        </p>
                    </div>

                    {/* Search and Ship/Port Selection */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-semibold text-[#069B93] mb-4">Search & Filter</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Ship Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cruise Line
                                </label>
                                <select
                                    value={selectedShip}
                                    onChange={(e) => setSelectedShip(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">All Cruise Lines</option>
                                    {sampleShips.map((ship: IShip) => (
                                        <option key={ship.id} value={ship.name}>
                                            {ship.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Port Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ships
                                </label>
                                <select
                                    value={selectedPort}
                                    onChange={(e) => setSelectedPort(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">All Ships</option>
                                    {ports.map((port) => (
                                        <option key={port} value={port}>
                                            {port}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Department Icons */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-semibold text-[#069B93] mb-4">Departments</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {sampleDepartments.map((dept: IDepartment) => (
                                <button
                                    key={dept.id}
                                    onClick={() => {
                                        setSelectedDepartment(dept.name);
                                        setShowSubcategories(true);
                                        setShowAllSubcategories(false); // Reset to show limited view
                                    }}
                                    className={`p-4 rounded-lg border-2 transition-colors ${
                                        selectedDepartment === dept.name
                                            ? 'border-[#069B93] bg-[#069B93]/5'
                                            : 'border-gray-200 hover:border-[#069B93] hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-2">
                                            <span className="text-white font-bold text-lg">
                                                {dept.name.charAt(0)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {dept.name}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subcategories (when department is selected) */}
                    {showSubcategories && selectedDepartment && (
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-[#069B93]">
                                    {selectedDepartment} Subcategories
                                </h2>
                                <button
                                    onClick={() => setShowSubcategories(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {(() => {
                                    const department = sampleDepartments.find((d: IDepartment) => d.name === selectedDepartment);
                                    const subcategories = department?.subcategories || [];
                                    const displaySubcategories = showAllSubcategories 
                                        ? subcategories 
                                        : subcategories.slice(0, 4);
                                    
                                    return displaySubcategories.map((sub: ISubcategory) => (
                                        <button
                                            key={sub.id}
                                            className="p-3 border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-gray-50 transition-colors"
                                        >
                                            <p className="text-sm font-medium text-gray-700">{sub.name}</p>
                                        </button>
                                    ));
                                })()}
                            </div>
                            
                            {(() => {
                                const department = sampleDepartments.find((d: IDepartment) => d.name === selectedDepartment);
                                const subcategories = department?.subcategories || [];
                                const hasMoreThanFour = subcategories.length > 4;
                                
                                if (!hasMoreThanFour) return null;
                                
                                return (
                                    <button 
                                        onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] border border-[#069B93] rounded-lg hover:bg-[#069B93] hover:text-white transition-colors"
                                    >
                                        {showAllSubcategories ? 'Show Less' : `View All ${selectedDepartment} (${subcategories.length})`}
                                    </button>
                                );
                            })()}
                        </div>
                    )}

                    {/* Crew Results */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-[#069B93]">
                                Crew Members ({filteredCrew.length})
                            </h2>
                        </div>

                        {filteredCrew.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No crew members found matching your criteria.</p>
                                <p className="text-gray-400 text-sm mt-2">Try selecting a ship, port, or department.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCrew.map((profile) => (
                                    <ConnectionRequest
                                        key={profile.id}
                                        profile={profile}
                                        onSendRequest={handleSendRequest}
                                        onCancelRequest={handleCancelRequest}
                                        requestStatus={connectionRequests[profile.id]}
                                        isLoading={isLoading[profile.id]}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
