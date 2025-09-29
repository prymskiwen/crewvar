import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ProfileEditProps } from '../../types';

interface ProfileEditData {
    displayName: string;
    departmentId: string;
    roleId: string;
    phoneNumber: string;
    bio: string;
}

// Custom Dropdown Component for Department, Subcategory, and Role
interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ id: string; name: string }>;
    placeholder: string;
    disabled?: boolean;
    label: string;
    maxHeight?: string;
}

const CustomDropdown = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    label,
    maxHeight = "200px"
}: CustomDropdownProps) => {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            placeholder={`Search ${label.toLowerCase()}...`}
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
                                No options found
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
    className = ""
}: ProfileEditProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get real data from API
    // TODO: Implement Firebase job data functionality
    const departments: any[] = [];

    console.log('ProfileEdit: Available departments:', departments);
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

    const roles: any[] = [];

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
                    <CustomDropdown
                        value={watch("departmentId")}
                        onChange={(value) => setValue("departmentId", value)}
                        options={departments}
                        placeholder="Select department"
                        label="Department"
                        maxHeight="200px"
                    />
                    {errors.departmentId && (
                        <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div>
                    <CustomDropdown
                        value={watch("roleId")}
                        onChange={(value) => setValue("roleId", value)}
                        options={roles}
                        placeholder="Select role"
                        label="Position"
                        disabled={!watchedDepartmentId}
                        maxHeight="200px"
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
                        <input
                            {...register("phoneNumber")}
                            type="tel"
                            id="phoneNumber"
                            placeholder="Enter your phone number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
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
                        {isSubmitting ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};
