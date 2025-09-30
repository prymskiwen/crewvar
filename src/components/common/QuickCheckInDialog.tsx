import React from 'react';
import { useAuth } from '../../context/AuthContextFirebase';
import { toast } from 'react-toastify';

interface ShipAssignment {
    shipId: string;
    shipName: string;
    port: string;
    date: string; // YYYY-MM-DD format
    isConfirmed: boolean;
}

interface QuickCheckInDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentShip: ShipAssignment | null;
}

export const QuickCheckInDialog: React.FC<QuickCheckInDialogProps> = ({
    isOpen,
    onClose,
    currentShip
}) => {
    const { currentUser } = useAuth();

    const handleUpdateShip = async () => {
        if (!currentUser?.uid) {
            toast.error('User not authenticated', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return;
        }

        try {
            // Navigate to ship assignment page
            window.location.href = '/ship-assignment';
        } catch (error) {
            console.error('Error navigating to ship assignment:', error);
            toast.error('Failed to navigate to ship assignment page', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Quick Check-In</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        Let us know which ship you're currently on to help other crew members find you.
                    </p>

                    {currentShip ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-800 font-medium">Current Assignment</span>
                            </div>
                            <p className="text-green-700">
                                <strong>{currentShip.shipName}</strong> - {currentShip.date}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800">
                                No current ship assignment. Please update your ship assignment in your profile.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Skip for Now
                    </button>
                    <button
                        onClick={handleUpdateShip}
                        className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                    >
                        Update Ship
                    </button>
                </div>
            </div>
        </div>
    );
};
