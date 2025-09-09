import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { sampleCruiseLines, sampleDepartments, sampleRoles } from "../data/onboarding-data";
import { ShipSelection } from "./ShipSelection";
import { MissingShipFeedback } from "./MissingShipFeedback";

interface ProfileEditData {
    displayName: string;
    departmentId: string;
    subcategoryId: string;
    roleId: string;
    currentShipId: string;
    phoneNumber: string;
    bio: string;
}

interface ProfileEditProps {
    initialData: ProfileEditData;
    onSave: (data: ProfileEditData) => void;
    onCancel: () => void;
    className?: string;
}

const profileEditValidationSchema = yup.object({
    displayName: yup.string().required("Display name is required").min(2, "Display name must be at least 2 characters"),
    departmentId: yup.string().required("Department is required"),
    subcategoryId: yup.string().required("Subcategory is required"),
    roleId: yup.string().required("Role is required"),
    currentShipId: yup.string().required("Current ship is required"),
    phoneNumber: yup.string().optional(),
    bio: yup.string().optional()
}) as yup.ObjectSchema<ProfileEditData>;

export const ProfileEdit = ({ 
    initialData, 
    onSave, 
    onCancel,
    className = ""
}: ProfileEditProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProfileEditData>({
        resolver: yupResolver(profileEditValidationSchema),
        defaultValues: initialData
    });

    const watchedDepartmentId = watch("departmentId");
    const watchedSubcategoryId = watch("subcategoryId");

    // Load subcategories when department changes
    useEffect(() => {
        if (watchedDepartmentId) {
            const department = sampleDepartments.find(d => d.id === watchedDepartmentId);
            if (department) {
                setSubcategories(department.subcategories);
                setValue("subcategoryId", "");
                setValue("roleId", "");
            }
        }
    }, [watchedDepartmentId, setValue]);

    // Load roles when subcategory changes
    useEffect(() => {
        if (watchedSubcategoryId) {
            const subcategory = subcategories.find(s => s.id === watchedSubcategoryId);
            if (subcategory) {
                const subcategoryRoles = sampleRoles.filter(r => r.subcategoryId === watchedSubcategoryId);
                setRoles(subcategoryRoles);
                setValue("roleId", "");
            }
        }
    }, [watchedSubcategoryId, subcategories, setValue]);

    // Set initial cruise line
    useEffect(() => {
        if (initialData.currentShipId) {
            const allShips = sampleCruiseLines.flatMap(cl => cl.ships);
            const ship = allShips.find(s => s.id === initialData.currentShipId);
            if (ship) {
                setSelectedCruiseLineId(ship.cruiseLineId);
            }
        }
    }, [initialData.currentShipId]);

    const onSubmit = async (data: ProfileEditData) => {
        setIsSubmitting(true);
        
        try {
            await onSave(data);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#069B93]">Edit Profile</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Display Name */}
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                    </label>
                    <input
                        {...register("displayName")}
                        type="text"
                        id="displayName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                    />
                    {errors.displayName && (
                        <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                    )}
                </div>

                {/* Department Selection */}
                <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                    </label>
                    <select
                        {...register("departmentId")}
                        id="departmentId"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                    >
                        <option value="">Select department</option>
                        {sampleDepartments.map(department => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>
                    {errors.departmentId && (
                        <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                    )}
                </div>

                {/* Subcategory Selection */}
                <div>
                    <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                    </label>
                    <select
                        {...register("subcategoryId")}
                        id="subcategoryId"
                        disabled={!watchedDepartmentId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100"
                    >
                        <option value="">Select subcategory</option>
                        {subcategories.map(subcategory => (
                            <option key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                            </option>
                        ))}
                    </select>
                    {errors.subcategoryId && (
                        <p className="text-red-500 text-sm mt-1">{errors.subcategoryId.message}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div>
                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
                        Role/Position
                    </label>
                    <select
                        {...register("roleId")}
                        id="roleId"
                        disabled={!watchedSubcategoryId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100"
                    >
                        <option value="">Select role</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                    {errors.roleId && (
                        <p className="text-red-500 text-sm mt-1">{errors.roleId.message}</p>
                    )}
                </div>

                {/* Ship Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Ship
                    </label>
                    <ShipSelection
                        selectedCruiseLineId={selectedCruiseLineId}
                        selectedShipId={watch("currentShipId")}
                        onCruiseLineChange={(cruiseLineId) => {
                            setSelectedCruiseLineId(cruiseLineId);
                            setValue("currentShipId", "");
                        }}
                        onShipChange={(shipId) => setValue("currentShipId", shipId)}
                        placeholder="Select your current ship"
                    />
                    {errors.currentShipId && (
                        <p className="text-red-500 text-sm mt-1">{errors.currentShipId.message}</p>
                    )}
                    
                    {/* Missing Ship Feedback */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600 text-sm">Can't find your ship?</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFeedbackModal(true)}
                                className="text-[#069B93] hover:text-[#058a7a] text-sm font-medium underline transition-colors"
                            >
                                Missing a ship or position?
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phone Number */}
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        {...register("phoneNumber")}
                        type="tel"
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                    </label>
                    <textarea
                        {...register("bio")}
                        id="bio"
                        rows={4}
                        placeholder="Tell other crew members about yourself, your experience, and what you're looking for..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                    />
                </div>

                {/* Update Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-green-900">Profile Update</h4>
                            <p className="text-sm text-green-700 mt-1">
                                Updating your profile will help other crewvar users find you based on your current role and department. 
                                This information will be visible to other crewvar users.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
                    </button>
                </div>
            </form>

            {/* Missing Ship Feedback Modal */}
            <MissingShipFeedback
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
            />
        </div>
    );
};
