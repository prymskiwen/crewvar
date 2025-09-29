import { useState, useEffect } from "react";
import { Autocomplete } from "../ui";

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
    const [cruiseLines, setCruiseLines] = useState<any[]>([]);
    const [availableShips, setAvailableShips] = useState<any[]>([]);
    const [cruiseLinesLoading, setCruiseLinesLoading] = useState(false);
    const [shipsLoading, setShipsLoading] = useState(false);

    // Load cruise lines
    useEffect(() => {
        const loadCruiseLines = async () => {
            setCruiseLinesLoading(true);
            try {
                const { getCruiseLines } = await import('../../firebase/firestore');
                const lines = await getCruiseLines();
                setCruiseLines(lines);
            } catch (error) {
                console.error('Error loading cruise lines:', error);
            } finally {
                setCruiseLinesLoading(false);
            }
        };

        loadCruiseLines();
    }, []);

    // Load ships when cruise line is selected
    useEffect(() => {
        const loadShips = async () => {
            if (!selectedCruiseLineId) {
                setAvailableShips([]);
                return;
            }

            setShipsLoading(true);
            try {
                const { getShips } = await import('../../firebase/firestore');
                const allShips = await getShips();
                const ships = allShips.filter(ship => ship.cruiseLineId === selectedCruiseLineId);
                setAvailableShips(ships);
            } catch (error) {
                console.error('Error loading ships:', error);
                setAvailableShips([]);
            } finally {
                setShipsLoading(false);
            }
        };

        loadShips();
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
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 1: Select Cruise Line
                </label>
                <Autocomplete
                    value={selectedCruiseLineId}
                    onChange={handleCruiseLineChange}
                    options={cruiseLines.map(line => ({ id: line.id, name: line.name }))}
                    placeholder="Choose a cruise line..."
                    loading={cruiseLinesLoading}
                    disabled={disabled}
                />
            </div>

            {/* Step 2: Ship Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 2: Select Ship
                </label>
                <Autocomplete
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
                    loading={shipsLoading}
                    disabled={disabled || !selectedCruiseLineId}
                />
            </div>

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