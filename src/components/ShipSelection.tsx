import { useState, useEffect, useRef } from "react";

interface ShipSelectionProps {
    selectedCruiseLineId?: string;
    selectedShipId?: string;
    onCruiseLineChange: (cruiseLineId: string) => void;
    onShipChange: (shipId: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ id: string; name: string }>;
    placeholder: string;
    disabled?: boolean;
    label: string;
    maxHeight?: string;
    searchPlaceholder?: string;
}

const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    disabled = false, 
    label,
    maxHeight = "200px",
    searchPlaceholder = "Search..."
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(option => option.id === value);

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

    const handleOptionClick = (optionId: string) => {
        onChange(optionId);
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            
            {/* Input Field */}
            <div 
                className={`
                    w-full px-3 py-2 border rounded-lg cursor-pointer
                    ${disabled 
                        ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
                        : 'border-gray-300 hover:border-[#069B93] focus-within:border-[#069B93] focus-within:ring-1 focus-within:ring-[#069B93]'
                    }
                    transition-colors
                `}
                onClick={handleInputClick}
            >
                <div className="flex items-center justify-between">
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
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

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93]"
                        />
                    </div>

                    {/* Options List */}
                    <div 
                        className="overflow-y-auto"
                        style={{ maxHeight }}
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No cruise lines found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`
                                        px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors
                                        ${value === option.id ? 'bg-[#069B93] text-white hover:bg-[#058a7a]' : 'text-gray-900'}
                                    `}
                                    onClick={() => handleOptionClick(option.id)}
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

export const ShipSelection = ({
    selectedCruiseLineId = "",
    selectedShipId = "",
    onCruiseLineChange,
    onShipChange,
    placeholder = "Select your ship",
    disabled = false,
    className = ""
}: ShipSelectionProps) => {
    // TODO: Implement Firebase cruise data functionality
    const cruiseLines: any[] = [];
    const cruiseLinesLoading = false;
    const availableShips: any[] = [];
    const shipsLoading = false;

    // Reset ship selection when cruise line changes
    useEffect(() => {
        if (selectedCruiseLineId && selectedShipId) {
            const ship = availableShips.find(s => s.id === selectedShipId);
            if (!ship) {
                onShipChange("");
            }
        }
    }, [selectedCruiseLineId, availableShips, selectedShipId, onShipChange]);

    const handleCruiseLineChange = (cruiseLineId: string) => {
        onCruiseLineChange(cruiseLineId);
        onShipChange(""); // Reset ship selection
    };

    const handleShipChange = (shipId: string) => {
        onShipChange(shipId);
    };

    const selectedCruiseLine = cruiseLines.find(cl => cl.id === selectedCruiseLineId);
    const selectedShip = availableShips.find(s => s.id === selectedShipId);

    if (cruiseLinesLoading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Step 1: Cruise Line Selection */}
            <CustomSelect
                value={selectedCruiseLineId}
                onChange={handleCruiseLineChange}
                options={cruiseLines}
                placeholder="Choose a cruise line..."
                disabled={disabled}
                label="Step 1: Select Cruise Line"
                maxHeight="200px" // Limit height for mobile
                searchPlaceholder="Search cruise lines..."
            />

            {/* Step 2: Ship Selection */}
            <CustomSelect
                value={selectedShipId}
                onChange={handleShipChange}
                options={availableShips.map(ship => ({
                    id: ship.id,
                    name: ship.name
                }))}
                placeholder={
                    !selectedCruiseLineId 
                        ? "First select a cruise line..." 
                        : shipsLoading
                            ? "Loading ships..."
                            : availableShips.length === 0 
                                ? "No ships available" 
                                : placeholder
                }
                disabled={disabled || !selectedCruiseLineId || shipsLoading}
                label="Step 2: Select Ship"
                maxHeight="200px" // Limit height for mobile
                searchPlaceholder="Search ships..."
            />

            {/* Selection Summary */}
            {selectedCruiseLineId && selectedShipId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">
                            Selected: {selectedCruiseLine?.name} - {selectedShip?.name}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};