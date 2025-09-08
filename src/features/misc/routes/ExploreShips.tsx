import Navbar from "../../../components/Elements/Navbar";
import { useState } from "react";
import { sampleShips, sampleDepartments } from "../../../data/onboarding-data";
import { IShip, IDepartment, ISubcategory } from "../../../types/onboarding";

export const ExploreShips = () => {
    const [selectedShip, setSelectedShip] = useState<string>("");
    const [selectedPort, setSelectedPort] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [showSubcategories, setShowSubcategories] = useState<boolean>(false);

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

    // Sample crew data
    const sampleCrew = [
        {
            id: "1",
            name: "Sarah Johnson",
            role: "Head Waiter",
            department: "Food & Beverage",
            subcategory: "Restaurant",
            avatar: "/src/assets/images/default-avatar.webp",
            shipName: "Royal Caribbean Symphony of the Seas",
            port: "Miami, Florida"
        },
        {
            id: "2",
            name: "Mike Chen", 
            role: "Restaurant Manager",
            department: "Food & Beverage",
            subcategory: "Management",
            avatar: "/src/assets/images/default-avatar.webp",
            shipName: "Carnival Mardi Gras",
            port: "Port Canaveral, Florida"
        },
        {
            id: "3",
            name: "Emma Rodriguez",
            role: "Maitre D'",
            department: "Food & Beverage", 
            subcategory: "Restaurant",
            avatar: "/src/assets/images/default-avatar.webp",
            shipName: "Norwegian Encore",
            port: "Miami, Florida"
        },
        {
            id: "4",
            name: "David Elseword",
            role: "Bartender",
            department: "Food & Beverage",
            subcategory: "Bar",
            avatar: "/src/assets/images/default-avatar.webp", 
            shipName: "Royal Caribbean Symphony of the Seas",
            port: "Miami, Florida"
        },
        {
            id: "5",
            name: "Lisa Wang",
            role: "Chef de Cuisine",
            department: "Food & Beverage",
            subcategory: "Kitchen",
            avatar: "/src/assets/images/default-avatar.webp",
            shipName: "Carnival Mardi Gras", 
            port: "Port Canaveral, Florida"
        }
    ];

    const handleRequestConnection = (crewId: string) => {
        console.log(`Requesting connection with crew member ${crewId}`);
    };

    const filteredCrew = sampleCrew.filter(crew => {
        const matchesShip = !selectedShip || crew.shipName === selectedShip;
        const matchesPort = !selectedPort || crew.port === selectedPort;
        const matchesDepartment = !selectedDepartment || crew.department === selectedDepartment;
        
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
                            Explore Ships & Categories
                        </h1>
                        <p className="text-lg text-gray-600">
                            Select a ship or port to explore crew members by department
                        </p>
                    </div>

                    {/* Search and Ship/Port Selection */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-semibold text-[#069B93] mb-4">Search & Filter</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Ship Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Ship
                                </label>
                                <select
                                    value={selectedShip}
                                    onChange={(e) => setSelectedShip(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">All Ships</option>
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
                                    Select Port
                                </label>
                                <select
                                    value={selectedPort}
                                    onChange={(e) => setSelectedPort(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">All Ports</option>
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
                                {sampleDepartments.find((d: IDepartment) => d.name === selectedDepartment)?.subcategories?.map((sub: ISubcategory) => (
                                    <button
                                        key={sub.id}
                                        className="p-3 border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-gray-50 transition-colors"
                                    >
                                        <p className="text-sm font-medium text-gray-700">{sub.name}</p>
                                    </button>
                                ))}
                            </div>
                            
                            <button className="px-4 py-2 text-sm font-medium text-[#069B93] border border-[#069B93] rounded-lg hover:bg-[#069B93] hover:text-white transition-colors">
                                View All {selectedDepartment}
                            </button>
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
                                {filteredCrew.map((crew) => (
                                    <div key={crew.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <img
                                                src={crew.avatar}
                                                alt={crew.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{crew.name}</h3>
                                                <p className="text-sm text-gray-600 truncate">{crew.role}</p>
                                                <p className="text-xs text-gray-500 truncate">{crew.subcategory}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Ship:</span> {crew.shipName}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Port:</span> {crew.port}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleRequestConnection(crew.id)}
                                            className="w-full px-4 py-2 text-sm font-medium text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg transition-colors"
                                        >
                                            Request to Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
