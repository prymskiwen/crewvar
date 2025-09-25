import { useNavigate } from "react-router-dom";
import { useAllShips } from "../features/cruise/api/cruiseData";

interface QuickCheckInProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (shipId: string, shipName: string) => void;
    currentShip?: string;
    isLoading?: boolean;
}

export const QuickCheckIn = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    currentShip,
    isLoading = false 
}: QuickCheckInProps) => {
    const navigate = useNavigate();
    const { data: allShips } = useAllShips();
    
    // Get the current ship name for display
    const currentShipData = allShips?.find(ship => ship.id === currentShip);
    const shipName = currentShipData?.name || 'Unknown Ship';

    const handleYes = () => {
        if (currentShip && currentShipData) {
            onConfirm(currentShip, currentShipData.name);
        }
    };

    const handleModify = () => {
        onClose();
        navigate('/profile');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="bg-[#069B93] text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Quick Check-In</h2>
                            <p className="text-[#B9F3DF] mt-1">
                                Confirm your ship for today
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-[#B9F3DF] transition-colors text-2xl font-bold"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-[#069B93]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <img src="/ship-icon.png" alt="Ship" className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Ship Confirmation
                            </h3>
                            <p className="text-gray-600">
                                According to your account, you are on:
                            </p>
                            <div className="mt-3 p-3 bg-[#069B93]/10 rounded-lg border border-[#069B93]/20">
                                <p className="font-semibold text-[#069B93] text-lg">
                                    {shipName}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleModify}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={isLoading}
                            >
                                Modify
                            </button>
                            <button
                                onClick={handleYes}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isLoading ? 'Confirming...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};