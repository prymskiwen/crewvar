import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCalendar } from "../context/CalendarContext";
import { ShipSelection } from "./ShipSelection";
import { IAssignmentFormData, ICruiseAssignment } from "../types/calendar";

interface AssignmentFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialDate?: string;
    className?: string;
    editingAssignment?: ICruiseAssignment | null;
}

const assignmentValidationSchema = yup.object({
    cruiseLineId: yup.string().required("Cruise line is required"),
    shipId: yup.string().required("Ship is required"),
    startDate: yup.string().required("Start date is required"),
    endDate: yup.string().required("End date is required"),
    description: yup.string().optional()
}) as yup.ObjectSchema<IAssignmentFormData>;

export const AssignmentForm = ({ 
    onClose, 
    onSuccess,
    initialDate,
    className = "",
    editingAssignment = null
}: AssignmentFormProps) => {
    const { addAssignment, updateAssignment } = useCalendar();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");

    const isEditing = !!editingAssignment;
    
    // Debug component lifecycle
    useEffect(() => {
        console.log('🚨 AssignmentForm MOUNTED - isEditing:', isEditing);
        return () => {
            console.log('🚨 AssignmentForm UNMOUNTING');
        };
    }, [isEditing]);

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<IAssignmentFormData>({
        resolver: yupResolver(assignmentValidationSchema),
        defaultValues: {
            cruiseLineId: editingAssignment?.cruiseLineId || "",
            shipId: editingAssignment?.shipId || "",
            startDate: editingAssignment?.startDate || initialDate || new Date().toISOString().split('T')[0],
            endDate: editingAssignment?.endDate || initialDate || new Date().toISOString().split('T')[0],
            description: editingAssignment?.description || ""
        }
    });

    const watchedStartDate = watch("startDate");
    const watchedEndDate = watch("endDate");
    
    // Debug validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('🚨 VALIDATION ERRORS:', errors);
        }
    }, [errors]);

    // Reset form when editingAssignment changes
    useEffect(() => {
        if (editingAssignment) {
            // Convert ISO dates to yyyy-MM-dd format for HTML date inputs
            const formatDateForInput = (isoDate: string) => {
                if (!isoDate) return new Date().toISOString().split('T')[0];
                return new Date(isoDate).toISOString().split('T')[0];
            };
            
            const formData = {
                cruiseLineId: editingAssignment.cruiseLineId || "",
                shipId: editingAssignment.shipId || "",
                startDate: formatDateForInput(editingAssignment.startDate),
                endDate: formatDateForInput(editingAssignment.endDate),
                description: editingAssignment.description || ""
            };
            reset(formData);
            setSelectedCruiseLineId(editingAssignment.cruiseLineId || "");
        } else {
            reset({
                cruiseLineId: "",
                shipId: "",
                startDate: initialDate || new Date().toISOString().split('T')[0],
                endDate: initialDate || new Date().toISOString().split('T')[0],
                description: ""
            });
            setSelectedCruiseLineId("");
        }
    }, [editingAssignment, reset, initialDate]);

    // Update end date when start date changes (minimum 1 day duration)
    useEffect(() => {
        if (watchedStartDate && watchedEndDate) {
            const startDate = new Date(watchedStartDate);
            const endDate = new Date(watchedEndDate);
            
            if (endDate <= startDate) {
                const newEndDate = new Date(startDate);
                newEndDate.setDate(newEndDate.getDate() + 1);
                setValue("endDate", newEndDate.toISOString().split('T')[0]);
            }
        }
    }, [watchedStartDate, watchedEndDate, setValue]);

    const onSubmit = async (data: IAssignmentFormData) => {
        console.log('🚨 FORM SUBMITTED! This should not happen automatically!', data);
        console.log('🚨 isEditing:', isEditing, 'editingAssignment:', editingAssignment);
        setIsSubmitting(true);
        
        try {
            if (isEditing && editingAssignment) {
                // Update existing assignment
                await updateAssignment(editingAssignment.id, {
                    cruiseLineId: data.cruiseLineId,
                    shipId: data.shipId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: editingAssignment.status // Keep existing status
                });
            } else {
                // Create new assignment
                await addAssignment({
                    cruiseLineId: data.cruiseLineId,
                    shipId: data.shipId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: 'upcoming'
                });
            }
            
            console.log('🚨 FORM SUCCESS - Calling onSuccess and onClose');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(`Failed to ${isEditing ? 'update' : 'add'} assignment:`, error);
            // Don't close the form on error, let user see the error
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMinEndDate = () => {
        if (watchedStartDate) {
            const startDate = new Date(watchedStartDate);
            startDate.setDate(startDate.getDate() + 1);
            return startDate.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#069B93]">
                    {isEditing ? 'Edit Cruise Assignment' : 'Add Cruise Assignment'}
                </h2>
                <button
                    onClick={() => {
                        console.log('🚨 CLOSE BUTTON CLICKED');
                        onClose();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Ship Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Ship Assignment
                    </label>
                    <ShipSelection
                        selectedCruiseLineId={selectedCruiseLineId}
                        selectedShipId={watch("shipId")}
                        onCruiseLineChange={(cruiseLineId) => {
                            setSelectedCruiseLineId(cruiseLineId);
                            setValue("cruiseLineId", cruiseLineId);
                            setValue("shipId", "");
                        }}
                        onShipChange={(shipId) => setValue("shipId", shipId)}
                        placeholder="Select ship for this assignment"
                    />
                    {errors.cruiseLineId && (
                        <p className="text-red-500 text-sm mt-1">{errors.cruiseLineId.message}</p>
                    )}
                    {errors.shipId && (
                        <p className="text-red-500 text-sm mt-1">{errors.shipId.message}</p>
                    )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            {...register("startDate")}
                            type="date"
                            id="startDate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                        />
                        {errors.startDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            {...register("endDate")}
                            type="date"
                            id="endDate"
                            min={getMinEndDate()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                        />
                        {errors.endDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                        )}
                    </div>
                </div>

                {/* Duration Display */}
                {watchedStartDate && watchedEndDate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">
                                Duration: {Math.ceil((new Date(watchedEndDate).getTime() - new Date(watchedStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                        </div>
                    </div>
                )}

                {/* Description (Optional) */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        {...register("description")}
                        id="description"
                        rows={3}
                        placeholder="Add any notes about this assignment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                    />
                </div>

                {/* Privacy Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">ℹ</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-green-900">Schedule Privacy</h4>
                            <p className="text-sm text-green-700 mt-1">
                                Your cruise assignments help us suggest connections when you're on the same ship or in the same port. 
                                Only your current assignment is visible to others.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log('Manual submit button clicked');
                            const formData = {
                                cruiseLineId: watch("cruiseLineId"),
                                shipId: watch("shipId"),
                                startDate: watch("startDate"),
                                endDate: watch("endDate"),
                                description: watch("description")
                            };
                            console.log('Form data:', formData);
                            onSubmit(formData);
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSubmitting 
                            ? (isEditing ? 'Updating Assignment...' : 'Adding Assignment...') 
                            : (isEditing ? 'Update Assignment' : 'Add Assignment')
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};
