import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../../assets/images/Home/logo.png";
import { getProfilePhotoUrl } from "../../../utils/imageUtils";

// Custom Dropdown Component for Mobile-Friendly Selection
interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ id: string; name: string }>;
    placeholder: string;
    disabled?: boolean;
    label: string;
    maxHeight?: string;
}

const CustomDropdown = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    label,
    maxHeight = "200px"
}: CustomDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(option => option.name === value);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleOptionClick = (optionName: string) => {
        onChange(optionName);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm("");
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            {/* Input Field */}
            <div
                className={`
                    w-full px-3 py-3 border rounded-lg cursor-pointer
                    ${disabled
                        ? 'bg-gray-100 cursor-not-allowed border-gray-200 text-gray-500'
                        : 'bg-white border-gray-300 hover:border-teal-500 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500'
                    }
                    transition-colors
                `}
                onClick={handleInputClick}
            >
                <div className="flex items-center justify-between">
                    <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>

                    {/* Options List */}
                    <div
                        className="overflow-y-auto"
                        style={{ maxHeight }}
                    >
                        {/* All Option */}
                        <div
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${value === '' ? 'bg-teal-500 text-white hover:bg-teal-600' : 'text-gray-900'
                                }`}
                            onClick={() => handleOptionClick('')}
                        >
                            All {label}s
                        </div>

                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`
                                        px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors
                                        ${value === option.name ? 'bg-teal-500 text-white hover:bg-teal-600' : 'text-gray-900'}
                                    `}
                                    onClick={() => handleOptionClick(option.name)}
                                >
                                    {option.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ExploreShips = () => {
    const navigate = useNavigate();
    const [selectedCruiseLine, setSelectedCruiseLine] = useState<string>("");
    const [selectedShip, setSelectedShip] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const observerRef = useRef<HTMLDivElement>(null);

    // TODO: Implement Firebase connection functionality
    const sendConnectionRequestMutation = {
        mutateAsync: async (data: any) => {
            // Placeholder function
            console.log('Send connection request:', data);
        },
        isLoading: false
    };

    // TODO: Implement Firebase cruise data functionality
    const cruiseLines: any[] = [];
    const cruiseLinesLoading = false;
    const allShips: any[] = [];
    const shipsLoading = false;

    // Get the cruise line ID from the selected name
    const selectedCruiseLineId = cruiseLines?.find(cl => cl.name === selectedCruiseLine)?.id || '';
    const shipsByCruiseLine: any[] = [];
    const shipsByCruiseLineLoading = false;

    const crewData: any[] = [];
    const crewLoading = false;
    const isFetchingNextPage = false;
    const hasNextPage = false;
    const fetchNextPage = () => {
        // Placeholder function
    };

    // Connection request handler
    const handleConnect = async (memberId: string, memberName: string) => {
        try {
            setLoadingStates(prev => ({ ...prev, [memberId]: true }));

            await sendConnectionRequestMutation.mutateAsync({
                receiverId: memberId,
                message: `Hi ${memberName}! I'd like to connect with you.`
            });

            toast.success(`Connection request sent to ${memberName}!`);
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            toast.error(error.response?.data?.error || 'Failed to send connection request');
        } finally {
            setLoadingStates(prev => ({ ...prev, [memberId]: false }));
        }
    };

    // View profile handler
    const handleViewProfile = (memberId: string) => {
        // Navigate to member's profile page
        window.location.href = `/crew/${memberId}`;
    };


    // Get available ships based on selected cruise line
    const availableShips = useMemo(() => {
        if (selectedCruiseLine && shipsByCruiseLine) {
            return shipsByCruiseLine;
        }
        // If no cruise line selected, show all ships
        if (!selectedCruiseLine && allShips) {
            return allShips;
        }
        return [];
    }, [selectedCruiseLine, shipsByCruiseLine, allShips]);

    // Flatten all crew data from all pages
    const allCrew = useMemo(() => {
        if (!crewData) return [];
        // If crewData is already an array, return it directly
        if (Array.isArray(crewData)) {
            return crewData;
        }
        // If crewData has pages property, flatten them
        if (crewData && typeof crewData === 'object' && 'pages' in crewData) {
            const dataWithPages = crewData as any;
            if (Array.isArray(dataWithPages.pages)) {
                return dataWithPages.pages.flatMap((page: any) => page.crew || []);
            }
        }
        return [];
    }, [crewData]);

    // Filter crew members based on selections (client-side filtering)
    const filteredCrew = useMemo(() => {
        if (!allCrew) return [];

        return allCrew.filter((member: any) => {
            const matchesCruiseLine = !selectedCruiseLine || member.cruise_line_name === selectedCruiseLine;
            const matchesShip = !selectedShip || member.ship_name === selectedShip;
            const matchesSearch = !searchQuery ||
                member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.ship_name?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCruiseLine && matchesShip && matchesSearch;
        });
    }, [allCrew, selectedCruiseLine, selectedShip, searchQuery]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Reset ship selection when cruise line changes
    const handleCruiseLineChange = (cruiseLineName: string) => {
        setSelectedCruiseLine(cruiseLineName);
        setSelectedShip(""); // Reset ship selection
    };

    // Debug logging
    console.log('ExploreShips Debug:', {
        cruiseLines: cruiseLines?.length || 0,
        allShips: allShips?.length || 0,
        crewData: allCrew.length || 0,
        crewDataFull: crewData,
        crewLoading,
        selectedCruiseLine,
        selectedCruiseLineId,
        availableShips: availableShips?.length || 0,
        shipsByCruiseLine: shipsByCruiseLine?.length || 0
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">Explore Ships</h1>
                            <p className="text-xs text-teal-100">Find friends</p>
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

            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Search Section */}
                <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                    <h2 className="text-base sm:text-lg font-semibold text-teal-600 mb-3">Search & Filter</h2>

                    <div className="space-y-3">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Friends
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, department, role, or ship..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base"
                            />
                        </div>

                        {/* Cruise Line Selection */}
                        <CustomDropdown
                            value={selectedCruiseLine}
                            onChange={handleCruiseLineChange}
                            options={cruiseLines || []}
                            placeholder="All Cruise Lines"
                            disabled={cruiseLinesLoading}
                            label="Cruise Line"
                            maxHeight="250px"
                        />

                        {/* Ship Selection */}
                        <CustomDropdown
                            value={selectedShip}
                            onChange={setSelectedShip}
                            options={availableShips || []}
                            placeholder="All Ships"
                            disabled={shipsLoading || shipsByCruiseLineLoading}
                            label="Ship"
                            maxHeight="250px"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {(cruiseLinesLoading || shipsLoading || crewLoading) && (
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            <span className="ml-3 text-gray-600">Loading friends data...</span>
                        </div>
                    </div>
                )}


                {/* Crew Results */}
                {!crewLoading && (
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-teal-600">
                                Possible friends ({filteredCrew.length})
                            </h2>
                            <div className="text-sm text-gray-500">
                                {allCrew.length} total loaded
                            </div>
                        </div>

                        {filteredCrew.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-base">No matching results found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchQuery || selectedCruiseLine || selectedShip
                                        ? "Try adjusting your search or filters"
                                        : "No friends data available"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {filteredCrew.map((member: any) => (
                                    <div key={member.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-teal-300 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                            {/* Avatar and Info */}
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getProfilePhotoUrl(member.profile_photo)}
                                                        alt={member.display_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback to letter avatar if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML = `
                                                                    <div class="w-full h-full bg-teal-500 flex items-center justify-center">
                                                                        <span class="text-white font-bold text-sm sm:text-lg">${member.display_name.charAt(0)}</span>
                                                                    </div>
                                                                `;
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                        {member.display_name}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                        {member.role_name || 'Friend'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {member.department_name} • {member.ship_name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2 sm:flex-shrink-0">
                                                <button
                                                    onClick={() => handleConnect(member.id, member.display_name)}
                                                    disabled={loadingStates[member.id] || sendConnectionRequestMutation.isLoading}
                                                    className="flex-1 sm:flex-none px-3 py-2 bg-[#069B93] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {loadingStates[member.id] ? 'Sending...' : 'Connect'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewProfile(member.id)}
                                                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] hover:bg-[#069B93]/5 transition-colors font-medium"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Infinite scroll loading indicator */}
                                {isFetchingNextPage && (
                                    <div className="flex justify-center py-4">
                                        <div className="flex items-center space-x-2 text-teal-600">
                                            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading more friends...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Infinite scroll trigger */}
                                <div ref={observerRef} className="h-4"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
