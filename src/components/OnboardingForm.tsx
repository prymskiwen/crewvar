import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOnboardingGuard } from "../context/OnboardingGuardContext";
import { Spinner } from "./Elements/Spinner";
import { sampleCruiseLines, sampleDepartments, sampleRoles } from "../data/onboarding-data";
import { ShipSelection } from "./ShipSelection";
import { AssignmentForm } from "./AssignmentForm";
import { CalendarView } from "./CalendarView";
import { MissingShipFeedback } from "./MissingShipFeedback";
import { ISubcategory, IRole, ISuggestedProfile } from "../types/onboarding";

const onboardingValidationSchema = yup.object({
    displayName: yup.string()
        .required("Display name is required")
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name must be less than 50 characters"),
    profilePhoto: yup.mixed()
        .required("Profile photo is required"),
    departmentId: yup.string().required("Department is required"),
    subcategoryId: yup.string().required("Subcategory is required"),
    roleId: yup.string().required("Role is required"),
    currentShipId: yup.string().required("Current ship is required"),
    contractCalendar: yup.mixed().nullable().optional(),
});

const OnboardingForm = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { updateOnboardingProgress, markOnboardingComplete } = useOnboardingGuard();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
    const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const [suggestedProfiles, setSuggestedProfiles] = useState<ISuggestedProfile[]>([]);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(onboardingValidationSchema),
    });

    const watchedDepartmentId = watch("departmentId");
    const watchedSubcategoryId = watch("subcategoryId");

    // Update subcategories when department changes
    useEffect(() => {
        if (watchedDepartmentId) {
            const department = sampleDepartments.find(d => d.id === watchedDepartmentId);
            setSubcategories(department?.subcategories || []);
            setValue("subcategoryId", "");
            setValue("roleId", "");
            setRoles([]);
        }
    }, [watchedDepartmentId, setValue]);

    // Update roles when subcategory changes
    useEffect(() => {
        if (watchedSubcategoryId) {
            const filteredRoles = sampleRoles.filter(r => r.subcategoryId === watchedSubcategoryId);
            setRoles(filteredRoles);
            setValue("roleId", "");
        }
    }, [watchedSubcategoryId, setValue]);

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update onboarding progress with completed fields
            if (currentUser) {
                await updateOnboardingProgress(currentUser.uid, {
                    hasProfilePhoto: true,
                    hasDisplayName: true,
                    hasDepartment: true,
                    hasRole: true,
                    hasShipAssignment: true
                });
            }
            
            // Generate suggested profiles based on selected ship and department
            const department = sampleDepartments.find(d => d.id === data.departmentId);
            const allShips = sampleCruiseLines.flatMap(cl => cl.ships);
            const ship = allShips.find(s => s.id === data.currentShipId);
            
            if (department && ship) {
                const suggestions: ISuggestedProfile[] = [
                    {
                        id: "1",
                        displayName: "Sarah Johnson",
                        avatar: "/src/assets/images/default-avatar.webp",
                        role: "Head Waiter",
                        shipName: ship.name,
                        department: department.name
                    },
                    {
                        id: "2",
                        displayName: "Mike Chen",
                        avatar: "/src/assets/images/default-avatar.webp",
                        role: "Restaurant Manager",
                        shipName: ship.name,
                        department: department.name
                    },
                    {
                        id: "3",
                        displayName: "Emma Rodriguez",
                        avatar: "/src/assets/images/default-avatar.webp",
                        role: "Maitre D'",
                        shipName: ship.name,
                        department: department.name
                    }
                ];
                setSuggestedProfiles(suggestions);
            }
            
            console.log("Welcome to Crewvar! Your profile is now active.");
            
            // Mark onboarding as complete and redirect to dashboard
            setOnboardingComplete(true);
            
            // Mark onboarding as complete in the guard system
            if (currentUser) {
                await markOnboardingComplete(currentUser.uid);
            }
            
            // Set flag for Quick Check-In dialog to appear
            localStorage.setItem('onboardingComplete', 'true');
            
            // Redirect to dashboard after a short delay to show success message
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
            
        } catch (error) {
            console.error("Failed to complete onboarding. Please try again.");
            console.error("Onboarding error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {isSubmitting && <Spinner />}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Profile Photo and Display Name Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Profile Setup</h2>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="mx-auto md:mx-0">
                            <div className="shrink-0 w-36 h-36 sm:w-52 sm:h-52">
                                {!preview ? (
                                    <>
                                        <label className="rounded-full cursor-pointer w-full h-full flex items-center flex-col justify-center px-4 py-3 border-gray-200 border focus:border-[#069B93] focus:outline-none text-sm hover:bg-gray-100 transition-colors">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                                            <p className="text-red-500 font-semibold mt-2">{errors.profilePhoto?.message}</p>
                                            <input
                                                {...register("profilePhoto")}
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
                                        src={preview as string}
                                        onClick={() => {
                                            setPreview(null);
                                            setValue("profilePhoto", "");
                                        }}
                                        alt="Profile preview"
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
                                    {...register("displayName")}
                                    type="text"
                                    id="displayName"
                                    placeholder="How should others see you?"
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
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Department & Role</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                {...register("departmentId")}
                                id="departmentId"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                            >
                                <option value="">Select your department</option>
                                {sampleDepartments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                            )}
                        </div>

                        {watchedDepartmentId && subcategories.length > 0 && (
                            <div>
                                <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory
                                </label>
                                <select
                                    {...register("subcategoryId")}
                                    id="subcategoryId"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">Select subcategory</option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subcategoryId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subcategoryId.message}</p>
                                )}
                            </div>
                        )}

                        {watchedSubcategoryId && roles.length > 0 && (
                            <div>
                                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    {...register("roleId")}
                                    id="roleId"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">Select your role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.roleId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.roleId.message}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Ship Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Current Ship</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Which ship are you on today?
                        </label>
                        <ShipSelection
                            selectedCruiseLineId={selectedCruiseLineId}
                            selectedShipId={watch("currentShipId")}
                            onCruiseLineChange={setSelectedCruiseLineId}
                            onShipChange={(shipId) => setValue("currentShipId", shipId)}
                            placeholder="Select your current ship"
                        />
                        {errors.currentShipId && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentShipId.message}</p>
                        )}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                        <p className="text-sm text-blue-800">
                            <strong>Privacy Note:</strong> We'll only show today's ship to others. Your future assignments remain private.
                        </p>
                    </div>
                    
                    {/* Missing Ship Feedback */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
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

                {/* Cruise Schedule Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Cruise Schedule</h2>
                    <p className="text-gray-600 mb-4">
                        Add your cruise assignments to help us suggest connections when you're on the same ship or in the same port.
                    </p>
                    
                    {!showCalendar ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">ℹ</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Schedule Management</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Create your cruise assignments directly in Crewvar. No need to upload documents - 
                                            just select your cruise line, ship, and dates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className="w-full px-4 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                            >
                                Manage My Cruise Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">My Schedule</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(false)}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                >
                                    Hide Calendar
                                </button>
                            </div>
                            
                            <CalendarView
                                onAddAssignment={() => setShowAssignmentForm(true)}
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
                                        src={profile.avatar || "/src/assets/images/default-avatar.webp"}
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
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 text-lg font-semibold"
                        >
                            {isSubmitting ? "Setting up your profile..." : "Complete Setup"}
                        </button>
                    </div>
                )}
            </form>

            {/* Assignment Form Modal */}
            {showAssignmentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <AssignmentForm
                            onClose={() => setShowAssignmentForm(false)}
                            onSuccess={() => {
                                setShowAssignmentForm(false);
                                // Optionally refresh calendar data
                            }}
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
