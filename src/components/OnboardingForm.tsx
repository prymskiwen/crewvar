import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Spinner } from "./Elements/Spinner";
import { ShipSelection } from "./ShipSelection";
import { getProfilePhotoUrl } from "../utils/imageUtils";
import { AssignmentForm } from "./AssignmentForm";
import { CalendarView } from "./CalendarView";
import { MissingShipFeedback } from "./MissingShipFeedback";
import { ISuggestedProfile } from "../types/onboarding";
import { ICruiseAssignment } from "../types/calendar";

// Dynamic validation schema based on whether user has existing profile
const createValidationSchema = (hasExistingProfile: boolean) => yup.object({
    displayName: yup.string()
        .required("Display name is required")
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name must be less than 50 characters"),
    profilePhoto: hasExistingProfile 
        ? yup.mixed().optional() // Optional if user already has a photo
        : yup.mixed().required("Profile photo is required"), // Required for new users
    departmentId: yup.string().required("Department is required"),
    roleId: yup.string().required("Role is required"),
    currentShipId: yup.string().required("Current ship is required"),
    contractCalendar: yup.mixed().nullable().optional(),
});

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

// Removed unused compressImage function - using handleCustomSubmit instead

const OnboardingForm = () => {
    const navigate = useNavigate();
    // TODO: Implement Firebase user profile functionality
    const userProfile = null;
    const profileLoading = false;
    const profileError = null;
    const allShips: any[] = [];
    const updateProfile = () => {
        // Placeholder function
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
    const [suggestedProfiles] = useState<ISuggestedProfile[]>([]);
    const [onboardingComplete] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ICruiseAssignment | null>(null);
    
    // Add a flag to prevent OnboardingGuard redirect when AssignmentForm is open
    useEffect(() => {
        if (showAssignmentForm) {
            // Set a flag in localStorage to prevent OnboardingGuard redirect
            localStorage.setItem('assignmentFormOpen', 'true');
        } else {
            localStorage.removeItem('assignmentFormOpen');
        }
        
        // Cleanup on unmount
        return () => {
            localStorage.removeItem('assignmentFormOpen');
        };
    }, [showAssignmentForm]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { formState: { errors }, watch, setValue, reset, clearErrors, register } = useForm({
        resolver: userProfile && (userProfile.display_name || userProfile.profile_photo) 
            ? undefined // No validation for existing profiles
            : yupResolver(createValidationSchema(false)), // Only validate for new profiles
        defaultValues: {
            displayName: '',
            departmentId: '',
            roleId: '',
            currentShipId: ''
        },
        mode: 'onSubmit' // Only validate on submit, not on change
    });

    const watchedDepartmentId = watch("departmentId");
    
    // TODO: Implement Firebase job data functionality
    const departments: any[] = [];
    const departmentsLoading = false;
    const roles: any[] = [];
    const rolesLoading = false;

    // Memoized callback functions to prevent infinite re-renders
    const handleCruiseLineChange = useCallback((cruiseLineId: string) => {
        setSelectedCruiseLineId(cruiseLineId);
        setValue("currentShipId", ""); // Reset ship when cruise line changes
    }, [setValue]);

    const handleShipChange = useCallback((shipId: string) => {
        setValue("currentShipId", shipId);
    }, [setValue]);

    // Load existing user data when profile is loaded
    useEffect(() => {
        if (userProfile) {
            console.log('Loading existing user data:', userProfile);
            
            // Pre-populate form with existing data
            const formData = {
                displayName: userProfile.display_name || '',
                departmentId: userProfile.department_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            };
            
            console.log('Setting form data:', formData);
            
            // Set form values directly
            reset(formData);
            
            // Also set individual values to ensure they're registered
            setValue("displayName", userProfile.display_name || '');
            setValue("departmentId", userProfile.department_id || '');
            setValue("roleId", userProfile.role_id || '');
            setValue("currentShipId", userProfile.current_ship_id || '');
            
            console.log('Form values set:', {
                displayName: watch("displayName"),
                departmentId: watch("departmentId"),
                roleId: watch("roleId"),
                currentShipId: watch("currentShipId")
            });
            
            // Clear any existing validation errors
            clearErrors();
            
            // Force clear validation errors after a short delay to ensure form is updated
            setTimeout(() => {
                clearErrors();
            }, 100);

            // Set profile photo preview if exists
            if (userProfile.profile_photo) {
                setPreview(userProfile.profile_photo);
            }

            // Set cruise line based on ship selection
            if (userProfile.current_ship_id) {
                const ship = allShips.find(s => s.id === userProfile.current_ship_id);
                if (ship) {
                    setSelectedCruiseLineId(ship.cruise_line_id);
                }
            }

            // Note: Subcategories and roles are now loaded via React Query hooks
            // No need to manually set state as the hooks handle this automatically
        }
    }, [userProfile, reset, setValue, clearErrors, allShips]);

    // Note: Subcategories and roles are now automatically loaded via React Query hooks
    // based on the watchedDepartmentId and watchedSubcategoryId values

    // Custom submit handler that bypasses validation for existing profiles
    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
            
            // Get current form values
            const formData = {
                displayName: watch("displayName") || userProfile?.display_name || '',
                departmentId: watch("departmentId") || userProfile?.department_id || '',
                roleId: watch("roleId") || userProfile?.role_id || '',
                currentShipId: watch("currentShipId") || userProfile?.current_ship_id || ''
            };
            
            console.log('Custom submit - Form data:', formData);
            
            // Check if all required fields have values
            if (!formData.displayName || !formData.departmentId || !formData.roleId || !formData.currentShipId) {
                console.error('Missing required fields:', formData);
                alert('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }
            
            // Handle profile photo
            let profilePhotoBase64 = '';
            if (preview && typeof preview === 'string') {
                profilePhotoBase64 = preview;
            } else if (userProfile?.profile_photo) {
                profilePhotoBase64 = userProfile.profile_photo;
            }
            
            const updateData = {
                displayName: formData.displayName,
                profilePhoto: profilePhotoBase64,
                departmentId: formData.departmentId,
                roleId: formData.roleId,
                currentShipId: formData.currentShipId
            };
            
            console.log('Sending update data to backend:', updateData);
            
            // Send profile data to backend
            try {
                await updateProfile(updateData);
                
                // Wait a moment for the profile to be updated in the backend
                // This prevents race conditions with OnboardingGuard
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error: any) {
                if (error.response?.status === 413) {
                    alert('Profile photo is too large. Please choose a smaller image.');
                } else {
                    alert('Failed to update profile. Please try again.');
                }
                setIsSubmitting(false);
                return;
            }
            
            // Profile update successful - redirect to dashboard
            // Set flag to indicate onboarding is complete (new user)
            localStorage.setItem('onboardingComplete', 'true');
            
            // The OnboardingGuard will now see the updated profile and allow navigation
            navigate('/dashboard', { replace: true });
            
        } catch (error) {
            alert("Failed to save your profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while profile is being loaded
    if (profileLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Show error state if profile loading failed
    if (profileError) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">⚠</span>
                    </div>
                    <p className="text-red-600 font-medium">Failed to load your profile</p>
                    <p className="text-gray-600 text-sm mt-2">Please try refreshing the page</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a]"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {isSubmitting && <Spinner />}
            
            <form onSubmit={handleCustomSubmit} className="space-y-6 sm:space-y-8">
                {/* Profile Photo and Display Name Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg sm:text-xl font-bold text-[#069B93] mb-4">
                        {userProfile && (userProfile.display_name || userProfile.profile_photo) 
                            ? 'Update Your Profile' 
                            : 'Profile Setup'
                        }
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="mx-auto sm:mx-0">
                            <div className="shrink-0 w-32 h-32 sm:w-36 sm:h-36 md:w-52 md:h-52">
                                {!(preview || userProfile?.profile_photo) ? (
                                    <>
                                        <label className="rounded-full cursor-pointer w-full h-full flex items-center flex-col justify-center px-4 py-3 border-gray-200 border focus:border-[#069B93] focus:outline-none text-sm hover:bg-gray-100 transition-colors">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                                            <p className="text-red-500 font-semibold mt-2">{errors.profilePhoto?.message}</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden focus:outline-none"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const file = e.target.files[0];
                                                        setValue("profilePhoto", file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setPreview(reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </>
                                ) : (
                                    <img
                                        className="h-full w-full cursor-pointer object-cover rounded-[50%]"
                                        src={(preview as string) || getProfilePhotoUrl(userProfile?.profile_photo)}
                                        onClick={() => {
                                            setPreview(null);
                                            setValue("profilePhoto", "");
                                        }}
                                        alt="Profile preview"
                                        onError={(e) => {
                                            console.error('Image failed to load:', e);
                                            console.log('Image src:', (e.target as HTMLImageElement).src);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    placeholder="How should others see you?"
                                    {...register("displayName")}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                />
                                {errors.displayName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department & Role Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg sm:text-xl font-bold text-[#069B93] mb-4">Department & Role</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            {departmentsLoading ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <span className="text-gray-500">Loading departments...</span>
                                    </div>
                                </div>
                            ) : (
                                <CustomDropdown
                                    value={watch("departmentId") || userProfile?.department_id || ''}
                                    onChange={(value) => setValue("departmentId", value)}
                                    options={departments}
                                    placeholder="Select your department"
                                    label="Department"
                                    maxHeight="200px"
                                />
                            )}
                            {errors.departmentId && (
                                <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                            )}
                        </div>

                        {watchedDepartmentId && (rolesLoading ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                    <span className="text-gray-500">Loading positions...</span>
                                </div>
                            </div>
                        ) : roles.length > 0 ? (
                            <div>
                                <CustomDropdown
                                    value={watch("roleId") || userProfile?.role_id || ''}
                                    onChange={(value) => setValue("roleId", value)}
                                    options={roles}
                                    placeholder="Select your position"
                                    label="Position"
                                    maxHeight="200px"
                                />
                                {errors.roleId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.roleId.message}</p>
                                )}
                            </div>
                        ) : null)}
                    </div>
                </div>

                {/* Current Ship Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg sm:text-xl font-bold text-[#069B93] mb-4">Current Ship</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Which ship are you on today?
                        </label>
                        <ShipSelection
                            selectedCruiseLineId={selectedCruiseLineId}
                            selectedShipId={watch("currentShipId") || userProfile?.current_ship_id || ''}
                            onCruiseLineChange={handleCruiseLineChange}
                            onShipChange={handleShipChange}
                            placeholder="Select your current ship"
                        />
                        {errors.currentShipId && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentShipId.message}</p>
                        )}
                    </div>
                    
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mt-4">
                        <p className="text-xs sm:text-sm text-blue-800">
                            <strong>Privacy Note:</strong> We'll only show today's ship to others. Your future assignments remain private.
                        </p>
                    </div>
                    
                    {/* Missing Ship Feedback */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600 text-sm">Can't find your ship?</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFeedbackModal(true)}
                                className="text-[#069B93] hover:text-[#058a7a] text-sm font-medium underline transition-colors text-left sm:text-right"
                            >
                                Missing a ship or position?
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cruise Schedule Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg sm:text-xl font-bold text-[#069B93] mb-4">Cruise Schedule</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Add your cruise assignments to help us suggest connections when you're on the same ship or in the same port.
                    </p>
                    
                    {!showCalendar ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">ℹ</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900 text-sm sm:text-base">Schedule Management</h4>
                                        <p className="text-xs sm:text-sm text-blue-700 mt-1">
                                            Create your cruise assignments directly in Crewvar. No need to upload documents - 
                                            just select your cruise line, ship, and dates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className="w-full px-4 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium text-sm sm:text-base"
                            >
                                Manage My Cruise Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Schedule</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(false)}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium self-start sm:self-auto"
                                >
                                    Hide Calendar
                                </button>
                            </div>
                            
                            <CalendarView
                                onAddAssignment={() => {
                                    setEditingAssignment(null);
                                    setShowAssignmentForm(true);
                                }}
                                onEditAssignment={(assignment) => {
                                    setEditingAssignment(assignment);
                                    setShowAssignmentForm(true);
                                }}
                                className="border-0 shadow-none"
                            />
                        </div>
                    )}
                </div>

                {/* Suggested Profiles Section */}
                {suggestedProfiles.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold text-[#069B93] mb-4">You're All Set!</h2>
                        <p className="text-gray-600 mb-4">Here are some crew members you might know:</p>
                        
                        <div className="space-y-4">
                            {suggestedProfiles.map((profile) => (
                                <div key={profile.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={getProfilePhotoUrl(profile.avatar)}
                                        alt={profile.displayName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{profile.displayName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {profile.role} • {profile.shipName}
                                        </p>
                                        <p className="text-xs text-[#069B93] mt-1">
                                            They are on board {profile.shipName} today — you might know each other.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg mt-4">
                            <p className="text-sm text-green-800">
                                <strong>Welcome to Crewvar!</strong> Your profile is now active and you can start connecting with your crew family.
                            </p>
                            <p className="text-sm text-green-700 mt-2">
                                Redirecting to your dashboard in 3 seconds...
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                {!onboardingComplete && (
                    <div className="text-center px-4 sm:px-0">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            onClick={() => {
                                console.log('Button clicked!');
                                console.log('Form data:', watch());
                                console.log('User profile:', userProfile);
                                console.log('Current ship ID from form:', watch("currentShipId"));
                                console.log('Current ship ID from profile:', userProfile?.current_ship_id);
                            }}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 text-base sm:text-lg font-semibold"
                        >
                            {isSubmitting 
                                ? (userProfile && (userProfile.display_name || userProfile.profile_photo) 
                                    ? "Updating your profile..." 
                                    : "Setting up your profile..."
                                  )
                                : (userProfile && (userProfile.display_name || userProfile.profile_photo) 
                                    ? "Update Profile" 
                                    : "Complete Setup"
                                  )
                            }
                        </button>
                    </div>
                )}
            </form>

            {/* Assignment Form Modal */}
            {showAssignmentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <AssignmentForm
                            onClose={() => {
                                setShowAssignmentForm(false);
                                setEditingAssignment(null);
                            }}
                            onSuccess={() => {
                                setShowAssignmentForm(false);
                                setEditingAssignment(null);
                                // Optionally refresh calendar data
                            }}
                            editingAssignment={editingAssignment}
                        />
                    </div>
                </div>
            )}

            {/* Missing Ship Feedback Modal */}
            <MissingShipFeedback
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
            />
        </div>
    );
};

export default OnboardingForm;
