import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ProfileEditProps } from '../../types';
import { Button, Input, Autocomplete } from '../ui';

interface ProfileEditData {
    displayName: string;
    departmentId: string;
    roleId: string;
    phoneNumber: string;
    bio: string;
}



const profileEditValidationSchema = yup.object({
    displayName: yup.string().required("Display name is required").min(2, "Display name must be at least 2 characters"),
    departmentId: yup.string().required("Department is required"),
    roleId: yup.string().required("Role is required"),
    phoneNumber: yup.string().optional(),
    bio: yup.string().optional()
}) as yup.ObjectSchema<ProfileEditData>;

export const ProfileEdit = ({
    initialData,
    onSave,
    onCancel,
    departments = [],
    roles = [],
    className = ""
}: ProfileEditProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log('ProfileEdit: Available departments:', departments);
    console.log('ProfileEdit: Available roles:', roles);
    console.log('ProfileEdit: Initial departmentId:', initialData.departmentId);
    console.log('ProfileEdit: Initial roleId:', initialData.roleId);

    // Check if department ID format matches
    const matchingDept = departments.find(d => d.id === initialData.departmentId);
    console.log('ProfileEdit: Matching department:', matchingDept);
    console.log('ProfileEdit: Department ID format check - input:', initialData.departmentId, 'available IDs:', departments.map(d => d.id));

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ProfileEditData>({
        resolver: yupResolver(profileEditValidationSchema),
        defaultValues: initialData
    });

    const watchedDepartmentId = watch("departmentId");

    // Filter roles based on selected department
    const filteredRoles = roles.filter(role =>
        role.departmentId === watchedDepartmentId ||
        role.department_id === watchedDepartmentId
    );

    console.log('ProfileEdit: Filtered roles for department', watchedDepartmentId, ':', filteredRoles);

    // Reset form when initialData changes
    useEffect(() => {
        console.log('ProfileEdit: Resetting form with initialData:', initialData);
        reset(initialData);
    }, [initialData, reset]);

    // Reset role when department changes (but not on initial load)
    useEffect(() => {
        if (watchedDepartmentId && watchedDepartmentId !== initialData.departmentId) {
            setValue("roleId", "");
        }
    }, [watchedDepartmentId, setValue, initialData.departmentId]);

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
                <Button
                    onClick={onCancel}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Display Name */}
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                    </label>
                    <Input
                        {...register("displayName")}
                        type="text"
                        id="displayName"
                        className="w-full"
                    />
                    {errors.displayName && (
                        <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                    )}
                </div>

                {/* Department Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                    </label>
                    <Autocomplete
                        value={watch("departmentId")}
                        onChange={(value) => setValue("departmentId", value)}
                        options={departments.map(dept => ({ id: dept.id, name: dept.name }))}
                        placeholder="Select department"
                        className="w-full"
                    />
                    {errors.departmentId && (
                        <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                    </label>
                    <Autocomplete
                        value={watch("roleId")}
                        onChange={(value) => setValue("roleId", value)}
                        options={filteredRoles.map(role => ({ id: role.id, name: role.name }))}
                        placeholder="Select role"
                        disabled={!watchedDepartmentId}
                        className="w-full"
                    />
                    {errors.roleId && (
                        <p className="text-red-500 text-sm mt-1">{errors.roleId.message}</p>
                    )}
                </div>


                {/* Phone Number - Only show if not empty */}
                {initialData.phoneNumber && (
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <Input
                            {...register("phoneNumber")}
                            type="tel"
                            id="phoneNumber"
                            placeholder="Enter your phone number"
                            className="w-full"
                        />
                    </div>
                )}

                {/* Bio - Only show if not empty */}
                {initialData.bio && (
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
                )}


                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
