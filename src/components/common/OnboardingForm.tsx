import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContextFirebase";
import {
    getDepartments,
    getRolesByDepartment,
    updateUserProfile,
    Department,
    Role
} from "../../firebase/firestore";
import { uploadProfilePhoto } from "../../firebase/storage";
import { Spinner } from "../Elements/Spinner";
import { ShipSelection } from "./ShipSelection";
import { AssignmentForm } from "./AssignmentForm";
import { MissingShipFeedback } from "./MissingShipFeedback";
import { Autocomplete, Input, Button, FileUpload, FormGroup } from "../ui";
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
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ICruiseAssignment | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Data loading states
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);

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

                    const departmentsData = await getDepartments();
                    setDepartments(departmentsData);
                } catch (error) {
                    console.error('Error loading initial data:', error);
                    toast.error('Failed to load form data');
                } finally {
                    setLoadingDepartments(false);
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


            // Ship selection is now handled by ShipSelection component

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



    // Form submission
    const onSubmit = async (data: any) => {
        if (!currentUser) {
            toast.error('No user logged in');
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData: any = {
                displayName: data.displayName,
                departmentId: data.departmentId,
                roleId: data.roleId,
                currentShipId: data.currentShipId
            };

            // Handle profile photo upload if a file is selected
            if (data.profilePhoto && data.profilePhoto instanceof File) {
                console.log('Uploading profile photo:', data.profilePhoto.name);
                
                // Show upload progress
                toast.info('Uploading profile photo...');
                
                try {
                    const photoUrl = await uploadProfilePhoto(
                        data.profilePhoto, 
                        currentUser.uid,
                        (progress) => {
                            console.log('Upload progress:', progress);
                        }
                    );
                    
                    // Add photo URL to update data
                    updateData.profilePhoto = photoUrl;
                    console.log('Profile photo uploaded successfully:', photoUrl);
                    
                } catch (uploadError) {
                    console.error('Error uploading profile photo:', uploadError);
                    toast.error('Failed to upload profile photo. Please try again.');
                    return;
                }
            }

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
                <div className="bg-white rounded-2xl shadow-xl">
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
                        <FormGroup
                            label="Display Name"
                            error={errors.displayName?.message}
                            required
                        >
                            <Input
                                {...register("displayName")}
                                type="text"
                                placeholder="Enter your display name"
                                variant="outlined"
                                size="lg"
                            />
                        </FormGroup>

                        {/* Profile Photo */}
                        <FormGroup
                            label="Profile Photo"
                            error={errors.profilePhoto?.message}
                            required={!hasExistingProfile}
                            className="flex justify-center"
                        >
                            <FileUpload
                                {...register("profilePhoto")}
                                variant="avatar"
                                size="xl"
                                accept="image/*"
                                onFileSelect={(files) => {
                                    if (files && files[0]) {
                                        setValue("profilePhoto", files[0]);
                                    }
                                }}
                                onFileRemove={() => {
                                    setValue("profilePhoto", undefined);
                                }}
                            />
                        </FormGroup>

                        {/* Department */}
                        <FormGroup
                            label="Department"
                            error={errors.departmentId?.message}
                            required
                        >
                            <Autocomplete
                                value={watchedDepartmentId}
                                onChange={(value) => setValue("departmentId", value)}
                                options={departments.map(dept => ({ id: dept.id, name: dept.name }))}
                                placeholder="Select your department"
                                loading={loadingDepartments}
                            />
                        </FormGroup>

                        {/* Role */}
                        <FormGroup
                            label="Role"
                            error={errors.roleId?.message}
                            required
                        >
                            <Autocomplete
                                value={watch("roleId")}
                                onChange={(value) => setValue("roleId", value)}
                                options={roles.map(role => ({ id: role.id, name: role.name }))}
                                placeholder={watchedDepartmentId ? "Select your role" : "Select department first"}
                                loading={loadingRoles}
                                disabled={!watchedDepartmentId}
                            />
                        </FormGroup>

                        {/* Ship Selection */}
                        <FormGroup
                            label="Current Ship"
                            required
                        >
                            <ShipSelection
                                selectedCruiseLineId={selectedCruiseLineId}
                                selectedShipId={watch("currentShipId")}
                                onCruiseLineChange={handleCruiseLineChange}
                                onShipChange={handleShipChange}
                                placeholder="Select your ship"
                            />
                        </FormGroup>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={isSubmitting}
                                loadingText={isSubmitting
                                    ? (hasExistingProfile ? "Updating..." : "Setting up...")
                                    : undefined
                                }
                                disabled={isSubmitting}
                            >
                                {hasExistingProfile ? "Update Profile" : "Complete Setup"}
                            </Button>
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