import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePortConnection } from "../context/PortConnectionContext";
import { useAuth } from "../context/AuthContext";
import { useQuickCheckIn } from "../context/QuickCheckInContext";
import { samplePorts, getAvailableShipsForPort } from "../data/port-connections-data";
import { IPortConnectionFormData } from "../types/port-connections";

interface PortConnectionFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const portConnectionValidationSchema = yup.object({
    portName: yup.string().required("Port is required"),
    dockedWithShipId: yup.string().required("Ship is required"),
    date: yup.string().required("Date is required")
}) as yup.ObjectSchema<IPortConnectionFormData>;

export const PortConnectionForm = ({ onClose, onSuccess }: PortConnectionFormProps) => {
    const { currentUser } = useAuth();
    const { currentShip } = useQuickCheckIn();
    const { addPortConnection } = usePortConnection();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableShips, setAvailableShips] = useState<any[]>([]);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<IPortConnectionFormData>({
        resolver: yupResolver(portConnectionValidationSchema),
        defaultValues: {
            portName: "",
            dockedWithShipId: "",
            date: new Date().toISOString().split('T')[0] // Today's date
        }
    });

    const watchedPortName = watch("portName");
    const watchedDate = watch("date");

    // Update available ships when port or date changes
    useEffect(() => {
        if (watchedPortName && watchedDate) {
            const ships = getAvailableShipsForPort(watchedPortName, watchedDate);
            setAvailableShips(ships);
            setValue("dockedWithShipId", ""); // Reset ship selection
        }
    }, [watchedPortName, watchedDate, setValue]);

    const onSubmit = async (data: IPortConnectionFormData) => {
        if (!currentUser || !currentShip) {
            console.error('User or ship information missing');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const selectedShip = availableShips.find(ship => ship.id === data.dockedWithShipId);
            if (!selectedShip) {
                console.error('Selected ship not found');
                return;
            }

            const connectionData = {
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || currentUser.email || 'Unknown User',
                userRole: "Crew Member", // This could be enhanced to get actual role
                shipId: currentShip.shipId,
                shipName: currentShip.shipName,
                portName: data.portName,
                dockedWithShipId: data.dockedWithShipId,
                dockedWithShipName: selectedShip.name,
                date: data.date
            };

            await addPortConnection(connectionData);
            
            if (onSuccess) {
                onSuccess();
            }
            onClose();
            
        } catch (error) {
            console.error('Failed to add port connection:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#069B93]">Mark Port Status</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Ship Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">ℹ</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Your Ship</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                {currentShip ? currentShip.shipName : 'No ship selected'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Port Selection */}
                <div>
                    <label htmlFor="portName" className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                    </label>
                    <select
                        {...register("portName")}
                        id="portName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                    >
                        <option value="">Select port</option>
                        {samplePorts.map(port => (
                            <option key={port.id} value={port.name}>
                                {port.name}, {port.country}
                            </option>
                        ))}
                    </select>
                    {errors.portName && (
                        <p className="text-red-500 text-sm mt-1">{errors.portName.message}</p>
                    )}
                </div>

                {/* Date Selection */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                    </label>
                    <input
                        {...register("date")}
                        type="date"
                        id="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                    />
                    {errors.date && (
                        <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                </div>

                {/* Ship Selection */}
                <div>
                    <label htmlFor="dockedWithShipId" className="block text-sm font-medium text-gray-700 mb-2">
                        I am docked with
                    </label>
                    <select
                        {...register("dockedWithShipId")}
                        id="dockedWithShipId"
                        disabled={!watchedPortName || !watchedDate || availableShips.length === 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100"
                    >
                        <option value="">Select ship</option>
                        {availableShips.map(ship => (
                            <option key={ship.id} value={ship.id}>
                                {ship.name} ({ship.cruiseLineName})
                            </option>
                        ))}
                    </select>
                    {errors.dockedWithShipId && (
                        <p className="text-red-500 text-sm mt-1">{errors.dockedWithShipId.message}</p>
                    )}
                    {watchedPortName && watchedDate && availableShips.length === 0 && (
                        <p className="text-gray-500 text-sm mt-1">
                            No available ships found for this port and date.
                        </p>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-green-900">Port Connection</h4>
                            <p className="text-sm text-green-700 mt-1">
                                By marking your port status, you'll be able to see and connect with crew members 
                                from other ships docked in the same port today.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !watchedPortName || !watchedDate || availableShips.length === 0}
                        className="flex-1 px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Marking Port...' : 'Mark Port Status'}
                    </button>
                </div>
            </form>
        </div>
    );
};
