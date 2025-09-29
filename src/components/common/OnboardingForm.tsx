import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContextFirebase";
import {
    getDepartments,
    getRolesByDepartment,
    getCruiseLines,
    getShips,
    updateUserProfile,
    Department,
    Role,
    CruiseLine
} from "../../firebase/firestore";
import { toast } from "react-toastify";
import { Spinner } from "../Elements/Spinner";
import { ShipSelection } from "./ShipSelection";
import { AssignmentForm } from "./AssignmentForm";
import { MissingShipFeedback } from "./MissingShipFeedback";
import { Autocomplete } from "../ui";
import { ICruiseAssignment } from "../../types/calendar";

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
});


const OnboardingForm = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile, loading: authLoading } = useAuth();

    // State management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ICruiseAssignment | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Data loading states
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [cruiseLines, setCruiseLines] = useState<CruiseLine[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingCruiseLines, setLoadingCruiseLines] = useState(false);

    // Refs for preventing infinite loops
    const profileLoadedRef = useRef(false);
    const dataLoadedRef = useRef(false);

    // Form setup
    const hasExistingProfile = Boolean(userProfile && (userProfile.displayName || userProfile.profilePhoto));
    const validationSchema = createValidationSchema(hasExistingProfile);

    const {
        formState: { errors },
        watch,
        setValue,
        reset,
        clearErrors,
        register,
        handleSubmit
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            displayName: '',
            profilePhoto: undefined,
            departmentId: '',
            roleId: '',
            currentShipId: ''
        }
    });

    // Watch form values
    const watchedDepartmentId = watch("departmentId");

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            if (!dataLoadedRef.current) {
                dataLoadedRef.current = true;

                try {
                    setLoadingDepartments(true);
                    setLoadingCruiseLines(true);

                    const [departmentsData, cruiseLinesData] = await Promise.all([
                        getDepartments(),
                        getCruiseLines()
                    ]);

                    setDepartments(departmentsData);
                    setCruiseLines(cruiseLinesData);
                } catch (error) {
                    console.error('Error loading initial data:', error);
                    toast.error('Failed to load form data');
                } finally {
                    setLoadingDepartments(false);
                    setLoadingCruiseLines(false);
                }
            }
        };

        loadInitialData();
    }, []);

    // Load roles when department changes
    useEffect(() => {
        const loadRoles = async () => {
            if (watchedDepartmentId) {
                try {
                    setLoadingRoles(true);
                    const rolesData = await getRolesByDepartment(watchedDepartmentId);
                    setRoles(rolesData);
                } catch (error) {
                    console.error('Error loading roles:', error);
                    toast.error('Failed to load roles');
                } finally {
                    setLoadingRoles(false);
                }
            } else {
                setRoles([]);
            }
        };

        loadRoles();
    }, [watchedDepartmentId]);


    // Load existing user data when profile is loaded
    useEffect(() => {
        if (userProfile && !profileLoadedRef.current) {
            console.log('Loading existing user data:', userProfile);
            profileLoadedRef.current = true;

            const formData = {
                displayName: userProfile.displayName || '',
                departmentId: userProfile.departmentId || '',
                roleId: userProfile.roleId || '',
                currentShipId: userProfile.currentShipId || ''
            };

            reset(formData);

            if (userProfile.profilePhoto) {
                setPreview(userProfile.profilePhoto);
            }

            if (userProfile.currentShipId) {
                // Find the ship and set cruise line
                const findShipAndSetCruiseLine = async () => {
                    try {
                        const allShips = await getShips();
                        const ship = allShips.find(s => s.id === userProfile.currentShipId);
                        if (ship) {
                            setSelectedCruiseLineId(ship.cruiseLineId);
                        }
                    } catch (error) {
                        console.error('Error finding ship:', error);
                    }
                };
                findShipAndSetCruiseLine();
            }

            clearErrors();
        }
    }, [userProfile, reset, clearErrors]);

    // Handle assignment form state
    useEffect(() => {
        if (showAssignmentForm) {
            localStorage.setItem('assignmentFormOpen', 'true');
        } else {
            localStorage.removeItem('assignmentFormOpen');
        }

        return () => {
            localStorage.removeItem('assignmentFormOpen');
        };
    }, [showAssignmentForm]);

    // Handle ship change
    const handleShipChange = useCallback((shipId: string) => {
        setValue("currentShipId", shipId);
    }, [setValue]);

    // Handle cruise line change
    const handleCruiseLineChange = useCallback((cruiseLineId: string) => {
        setSelectedCruiseLineId(cruiseLineId);
        setValue("currentShipId", ""); // Reset ship selection
    }, [setValue]);

    // Handle profile photo change
    const handlePhotoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result || null);
            };
            reader.readAsDataURL(file);
            setValue("profilePhoto", file);
        }
    }, [setValue]);


    // Form submission
    const onSubmit = async (data: any) => {
        if (!currentUser) {
            toast.error('No user logged in');
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData = {
                displayName: data.displayName,
                departmentId: data.departmentId,
                roleId: data.roleId,
                currentShipId: data.currentShipId
            };

            // Update user profile
            await updateUserProfile(currentUser.uid, updateData);

            toast.success('Profile updated successfully!');

            // Mark onboarding as complete
            localStorage.setItem('onboardingComplete', 'true');

            // Navigate to dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">
                            {hasExistingProfile ? 'Update Your Profile' : 'Complete Your Profile'}
                        </h1>
                        <p className="text-[#B9F3DF]">
                            {hasExistingProfile
                                ? 'Keep your information up to date'
                                : 'Tell us about yourself to get started'
                            }
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Display Name *
                            </label>
                            <input
                                {...register("displayName")}
                                type="text"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none transition-all duration-200"
                                placeholder="Enter your display name"
                            />
                            {errors.displayName && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.displayName.message}
                                </p>
                            )}
                        </div>

                        {/* Profile Photo */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Profile Photo {!hasExistingProfile && '*'}
                            </label>
                            <div className="flex justify-center">
                                <div className="relative">
                                    <input
                                        {...register("profilePhoto")}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="profilePhoto"
                                    />
                                    <label
                                        htmlFor="profilePhoto"
                                        className="cursor-pointer block w-32 h-32 rounded-full overflow-hidden border-4 border-[#069B93] hover:border-[#058a7a] transition-all duration-200 hover:shadow-lg"
                                    >
                                        {preview ? (
                                            <img
                                                src={preview as string}
                                                alt="Profile preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center hover:bg-gray-300 transition-colors">
                                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs text-gray-500 font-medium">Click to upload</span>
                                            </div>
                                        )}
                                    </label>
                                    {preview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreview(null);
                                                setValue("profilePhoto", undefined);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {errors.profilePhoto && (
                                <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.profilePhoto.message}
                                </p>
                            )}
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Department *
                            </label>
                            <Autocomplete
                                value={watchedDepartmentId}
                                onChange={(value) => setValue("departmentId", value)}
                                options={departments.map(dept => ({ id: dept.id, name: dept.name }))}
                                placeholder="Select your department"
                                loading={loadingDepartments}
                                error={errors.departmentId?.message}
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Role *
                            </label>
                            <Autocomplete
                                value={watch("roleId")}
                                onChange={(value) => setValue("roleId", value)}
                                options={roles.map(role => ({ id: role.id, name: role.name }))}
                                placeholder={watchedDepartmentId ? "Select your role" : "Select department first"}
                                loading={loadingRoles}
                                disabled={!watchedDepartmentId}
                                error={errors.roleId?.message}
                            />
                        </div>

                        {/* Cruise Line */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Cruise Line *
                            </label>
                            <Autocomplete
                                value={selectedCruiseLineId}
                                onChange={handleCruiseLineChange}
                                options={cruiseLines.map(line => ({ id: line.id, name: line.name }))}
                                placeholder="Select your cruise line"
                                loading={loadingCruiseLines}
                            />
                        </div>

                        {/* Ship Selection */}
                        {selectedCruiseLineId && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Current Ship *
                                </label>
                                <ShipSelection
                                    selectedCruiseLineId={selectedCruiseLineId}
                                    selectedShipId={watch("currentShipId")}
                                    onCruiseLineChange={handleCruiseLineChange}
                                    onShipChange={handleShipChange}
                                    placeholder="Select your ship"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-[#069B93] to-[#00A59E] text-white font-semibold rounded-xl hover:from-[#058a7a] hover:to-[#069B93] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isSubmitting && (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                <span>
                                    {isSubmitting
                                        ? (hasExistingProfile ? "Updating..." : "Setting up...")
                                        : (hasExistingProfile ? "Update Profile" : "Complete Setup")
                                    }
                                </span>
                            </button>
                        </div>
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
            </div>
        </div>
    );
};

export default OnboardingForm;