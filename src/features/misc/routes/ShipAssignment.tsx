import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ShipSelection } from "../../../components/ShipSelection";

export const ShipAssignment = () => {
    const navigate = useNavigate();
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [selectedShipId, setSelectedShipId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Implement Firebase ship assignment functionality
    const updateShipAssignmentMutation = {
        mutateAsync: async (data: any) => {
            // Placeholder function
            console.log('Update ship assignment:', data);
        },
        isLoading: false
    };
    const { data: userProfile } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            // TODO: Implement Firebase user profile fetch
            return null;
        }
    }) as { data: any };
    const allShips: any[] = [];
    const cruiseLines: any[] = [];

    // Initialize with user's current ship
    useEffect(() => {
        if (userProfile?.user?.current_ship_id) {
            const currentShip = allShips?.find(ship => ship.id === userProfile.user.current_ship_id);
            if (currentShip) {
                setSelectedCruiseLineId(currentShip.cruise_line_id || '');
                setSelectedShipId(currentShip.id);
            }
        }
    }, [userProfile, allShips]);

    const handleUpdate = async () => {
        if (!selectedShipId) {
            toast.error('Please select a ship');
            return;
        }

        setIsLoading(true);

        try {
            await updateShipAssignmentMutation.mutateAsync({
                currentShipId: selectedShipId
            });

            // Also save to localStorage for quick access
            const selectedShip = allShips?.find(ship => ship.id === selectedShipId);
            if (selectedShip) {
                const today = new Date().toISOString().split('T')[0];
                const shipAssignment = {
                    shipId: selectedShip.id,
                    shipName: selectedShip.name,
                    port: "Current Port",
                    date: today,
                    isConfirmed: true
                };

                localStorage.setItem('currentShipAssignment', JSON.stringify(shipAssignment));
                localStorage.setItem('lastShipConfirmation', today);
            }

            toast.success('Ship assignment updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to update ship assignment:', error);
            toast.error('Failed to update ship assignment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCruiseLineChange = (cruiseLineId: string) => {
        setSelectedCruiseLineId(cruiseLineId);
        setSelectedShipId(""); // Reset ship selection when cruise line changes
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#069B93] text-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">Update where you are</h1>
                        <p className="text-[#B9F3DF] mt-1 text-sm sm:text-base">
                            Change your current ship assignment. This will be visible to other crew members.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white hover:text-[#B9F3DF] transition-colors text-2xl font-bold"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                {/* Current Assignment Info */}
                {userProfile?.user?.current_ship_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">ℹ</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900">Current Assignment</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    {(() => {
                                        const currentShip = allShips?.find(ship => ship.id === userProfile.user.current_ship_id);
                                        const currentCruiseLine = cruiseLines?.find(cl => cl.id === currentShip?.cruise_line_id);
                                        return currentShip && currentCruiseLine
                                            ? `${currentShip.name || 'Unknown Ship'} • ${currentCruiseLine.name || 'Unknown Cruise Line'}`
                                            : 'Loading...';
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ship Selection */}
                <div className="mb-6">
                    <ShipSelection
                        selectedCruiseLineId={selectedCruiseLineId}
                        selectedShipId={selectedShipId}
                        onCruiseLineChange={handleCruiseLineChange}
                        onShipChange={setSelectedShipId}
                        placeholder="Select your new ship"
                    />
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">ℹ</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Privacy Notice</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Your new ship assignment will be visible to other crew members immediately.
                                This helps them find and connect with you on the same ship.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={!selectedShipId || isLoading || updateShipAssignmentMutation.isLoading}
                        className="flex-1 px-6 py-3 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading || updateShipAssignmentMutation.isLoading ? 'Updating...' : 'Update Ship'}
                    </button>
                </div>
            </div>
        </div>
    );
};
