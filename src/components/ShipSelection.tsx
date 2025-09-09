import { useState, useEffect } from "react";
import { IShip } from "../types/onboarding";
import { sampleCruiseLines } from "../data/onboarding-data";

interface ShipSelectionProps {
    selectedCruiseLineId?: string;
    selectedShipId?: string;
    onCruiseLineChange: (cruiseLineId: string) => void;
    onShipChange: (shipId: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const ShipSelection = ({
    selectedCruiseLineId = "",
    selectedShipId = "",
    onCruiseLineChange,
    onShipChange,
    placeholder = "Select your ship",
    disabled = false,
    className = ""
}: ShipSelectionProps) => {
    const [availableShips, setAvailableShips] = useState<IShip[]>([]);

    // Update available ships when cruise line changes
    useEffect(() => {
        if (selectedCruiseLineId) {
            const cruiseLine = sampleCruiseLines.find(cl => cl.id === selectedCruiseLineId);
            setAvailableShips(cruiseLine?.ships || []);
        } else {
            setAvailableShips([]);
        }
    }, [selectedCruiseLineId]);

    // Reset ship selection when cruise line changes
    useEffect(() => {
        if (selectedCruiseLineId && selectedShipId) {
            const ship = availableShips.find(s => s.id === selectedShipId);
            if (!ship) {
                onShipChange("");
            }
        }
    }, [selectedCruiseLineId, availableShips, selectedShipId, onShipChange]);

    const handleCruiseLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cruiseLineId = e.target.value;
        onCruiseLineChange(cruiseLineId);
        onShipChange(""); // Reset ship selection
    };

    const handleShipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onShipChange(e.target.value);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Step 1: Cruise Line Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 1: Select Cruise Line
                </label>
                <select
                    value={selectedCruiseLineId}
                    onChange={handleCruiseLineChange}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">Choose a cruise line...</option>
                    {sampleCruiseLines.map((cruiseLine) => (
                        <option key={cruiseLine.id} value={cruiseLine.id}>
                            {cruiseLine.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Step 2: Ship Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 2: Select Ship
                </label>
                <select
                    value={selectedShipId}
                    onChange={handleShipChange}
                    disabled={disabled || !selectedCruiseLineId || availableShips.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">
                        {!selectedCruiseLineId 
                            ? "First select a cruise line..." 
                            : availableShips.length === 0 
                                ? "No ships available" 
                                : placeholder
                        }
                    </option>
                    {availableShips.map((ship) => (
                        <option key={ship.id} value={ship.id}>
                            {ship.name} {ship.port && `(${ship.port})`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selection Summary */}
            {selectedCruiseLineId && selectedShipId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">
                            Selected: {sampleCruiseLines.find(cl => cl.id === selectedCruiseLineId)?.name} - {availableShips.find(s => s.id === selectedShipId)?.name}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
