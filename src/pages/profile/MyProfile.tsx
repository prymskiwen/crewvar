import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContextFirebase";
import { ProfilePhotoUpload } from "../../components/users";
import {
    AssignmentCard,
    JobInformationCard,
    BioCard,
    PhotosCard,
    ContactCard,
    SocialMediaCard
} from "../../components/profile";
import { getProfilePhotoUrl } from "../../utils/images";
import {
    getShips,
    getCruiseLines,
    getDepartments,
    getRolesByDepartment
} from "../../firebase/firestore";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../layout/DashboardLayout";

export const MyProfile = () => {
    const { currentUser, userProfile, updateUserProfile: updateUserProfileFromAuth } = useAuth();
    const queryClient = useQueryClient();

    const { data: allShips = [], isLoading: shipsLoading } = useQuery({
        queryKey: ['ships'],
        queryFn: getShips
    });
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useQuery({
        queryKey: ['cruiseLines'],
        queryFn: getCruiseLines
    });
    const { data: departments = [], isLoading: departmentsLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments
    });
    const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            // Only fetch roles for user's department to improve performance
            if (userProfile?.departmentId) {
                try {
                    return await getRolesByDepartment(userProfile.departmentId);
                } catch (error) {
                    console.error(`Error fetching roles for department ${userProfile.departmentId}:`, error);
                    return [];
                }
            }
            return [];
        },
        enabled: !!userProfile?.departmentId
    });

    const updateUserProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            await updateUserProfileFromAuth(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
            toast.success('Profile updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        },
        onError: (error: any) => {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }
    });

    // Update profile details mutation (for bio, phone, social media, etc.)
    const updateProfileDetailsMutation = useMutation({
        mutationFn: async (data: any) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            await updateUserProfileFromAuth(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
            toast.success('Profile details updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        },
        onError: (error: any) => {
            console.error('Failed to update profile details:', error);
            toast.error('Failed to update profile details. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }
    });

    const [profile, setProfile] = useState({
        displayName: '',
        avatar: '',
        bio: '',
        photos: ['', '', ''],
        contacts: {
            email: '',
            phone: '',
            social: ['']
        },
        socialMedia: {
            instagram: '',
            twitter: '',
            facebook: '',
            snapchat: '',
            website: ''
        },
        // Job information
        departmentId: '',
        roleId: '',
        currentShipId: '',
        currentCruiseLineId: '',
        cruiseLineId: '',
    });

    // Sync local profile state with userProfile from AuthContext
    useEffect(() => {
        if (userProfile) {
            setProfile(prev => ({
                ...prev,
                displayName: userProfile.displayName || '',
                avatar: userProfile.profilePhoto || '',
                bio: userProfile.bio || '',
                contacts: {
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    social: ['']
                },
                socialMedia: {
                    instagram: userProfile.instagram || '',
                    twitter: userProfile.twitter || '',
                    facebook: userProfile.facebook || '',
                    snapchat: userProfile.snapchat || '',
                    website: userProfile.website || ''
                },
                // Job information - CRITICAL: Keep the currentShipId from userProfile
                departmentId: userProfile.departmentId || '',
                roleId: userProfile.roleId || '',
                currentShipId: userProfile.currentShipId || '', // This was the missing piece!
                currentCruiseLineId: '',
                cruiseLineId: '',
            }));
        }
    }, [userProfile]);

    const updateUserProfileFunc = async (data: any) => {
        await updateUserProfileMutation.mutateAsync(data);
    };

    const updateProfileDetails = async (data: any) => {
        await updateProfileDetailsMutation.mutateAsync(data);
    };

    const getDepartmentName = (departmentId: string) => {
        const department = departments.find(d => d.id === departmentId || d.id === `dept-${departmentId}`);
        return department ? department.name : 'Select Department';
    };

    const getRoleName = (roleId: string) => {
        const role = allRoles.find(r => r.id === roleId);
        return role ? role.name : 'Select Role';
    };

    const getShipName = (shipId: string) => {
        const ship = allShips.find(s => s.id === shipId);
        return ship ? ship.name : 'Select Ship';
    };

    const getUserRoleName = () => {
        return profile.roleId ? getRoleName(profile.roleId) : 'Crew Member';
    };



    const getUserJobTitle = () => {
        const roleName = getUserRoleName();
        
        if (roleName !== 'Crew Member') {
            return roleName;
        }
        return 'Crew Member';
    };

    const getCruiseLineFromShip = (shipId: string) => {
        const ship = allShips.find(s => s.id === shipId);
        if (ship) {
            const cruiseLine = cruiseLines.find(c => c.id === ship.cruiseLineId);
            const result = cruiseLine ? cruiseLine.name : 'Select Cruise Line';

            return result;
        }
        return 'Select Cruise Line';
    };

    useEffect(() => {
        if (userProfile && currentUser) {
            const avatarValue = userProfile.profilePhoto ? getProfilePhotoUrl(userProfile.profilePhoto) : (currentUser?.photoURL || '');

            setProfile({
                displayName: userProfile.displayName || currentUser?.displayName || '',
                avatar: avatarValue,
                bio: userProfile.bio || '',
                photos: (userProfile as any).photos || ['', '', ''],
                contacts: {
                    email: userProfile.email || currentUser?.email || '',
                    phone: userProfile.phone || '',
                    social: ['']
                },
                socialMedia: {
                    instagram: userProfile.instagram || '',
                    twitter: userProfile.twitter || '',
                    facebook: userProfile.facebook || '',
                    snapchat: userProfile.snapchat || '',
                    website: userProfile.website || ''
                },
                departmentId: userProfile.departmentId || '',
                roleId: userProfile.roleId || '',
                currentShipId: userProfile.currentShipId || '',
                currentCruiseLineId: '',
                cruiseLineId: '',
            });
        }
    }, [userProfile, currentUser]);


    useEffect(() => {
        if (profile.currentShipId && allShips.length > 0) {
            const ship = allShips.find(s => s.id === profile.currentShipId);
            if (ship && !profile.currentCruiseLineId) {
                setProfile(prev => ({
                    ...prev,
                    currentCruiseLineId: ship.cruiseLineId
                }));
            }
        }
    }, [profile.currentShipId, allShips, profile.currentCruiseLineId]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [isEditingAssignment, setIsEditingAssignment] = useState(false);
    const [isEditingPhotos, setIsEditingPhotos] = useState(true);

    const handleProfileEditSave = async (profileData: any) => {
        try {
            console.log('🔧 Profile update data:', {
                displayName: profileData.displayName,
                profilePhoto: profile.avatar,
                departmentId: profileData.departmentId || '',
                roleId: profileData.roleId || '',
                currentShipId: profile.currentShipId,
                userProfileCurrentShipId: userProfile?.currentShipId
            });

            await updateUserProfileFunc({
                displayName: profileData.displayName,
                profilePhoto: profile.avatar,
                departmentId: profileData.departmentId || '',
                roleId: profileData.roleId || '',
                currentShipId: profile.currentShipId
            });

            setProfile(prev => ({
                ...prev,
                displayName: profileData.displayName,
                departmentId: profileData.departmentId,
                roleId: profileData.roleId
            }));

            setIsEditingProfile(false);
            console.log('Profile updated successfully in database');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile. Please try again.';
            alert(`Error: ${errorMessage}`);
        }
    };


    // Show loading skeleton instead of blocking the entire page
    const isLoading = shipsLoading || cruiseLinesLoading || departmentsLoading || rolesLoading;

    return (
        <DashboardLayout>
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">My Profile</h1>
                            <p className="text-xs text-teal-100">Manage your personal information</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gradient-to-br from-[#B9F3DF] via-[#E8F8F5] to-[#B9F3DF]">
                <div className="container mx-auto px-4 py-6 lg:py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 border-2 border-teal-500">
                            <div className="bg-white p-6 lg:p-8">
                                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                                    <div className="relative flex-shrink-0">
                                        <ProfilePhotoUpload
                                            currentPhoto={profile.avatar}
                                            onPhotoChange={async (photoUrl) => {
                                                // Update local state immediately for UI responsiveness
                                                setProfile(prev => ({ ...prev, avatar: photoUrl }));
                                                
                                                // Save to Firestore
                                                try {
                                                    await updateUserProfileFunc({
                                                        displayName: profile.displayName,
                                                        profilePhoto: photoUrl,
                                                        departmentId: profile.departmentId,
                                                        roleId: profile.roleId,
                                                        currentShipId: profile.currentShipId
                                                    });
                                                    toast.success('Profile photo updated successfully!');
                                                } catch (error: any) {
                                                    console.error('Failed to update profile photo:', error);
                                                    toast.error('Failed to save profile photo. Please try again.');
                                                    // Revert local state on error
                                                    setProfile(prev => ({ ...prev, avatar: profile.avatar }));
                                                }
                                            }}
                                            size="large"
                                            className="w-24 h-24 lg:w-32 lg:h-32 rounded-full shadow-2xl border-4 border-teal-500"
                                            showInstructions={false}
                                        />
                                    </div>
                                    <div className="flex-1 text-center lg:text-left">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{profile.displayName || 'Crew Member'}</h1>
                                        <p className="text-teal-600 text-lg lg:text-xl mb-3 font-medium">{getUserJobTitle()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* My ship today. Card */}
                                {isLoading ? (
                                    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                ) : (
                                    <AssignmentCard
                                        profile={profile}
                                        setProfile={setProfile}
                                        isEditing={isEditingAssignment}
                                        setIsEditing={setIsEditingAssignment}
                                        cruiseLines={cruiseLines}
                                        allShips={allShips}
                                        getCruiseLineFromShip={getCruiseLineFromShip}
                                        getShipName={getShipName}
                                        updateUserProfileFunc={updateUserProfileFunc}
                                        shipsLoading={shipsLoading}
                                        cruiseLinesLoading={cruiseLinesLoading}
                                    />
                                )}

                                {/* Job Information Card */}
                                {isLoading ? (
                                    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                ) : (
                                    <JobInformationCard
                                        profile={profile}
                                        isEditing={isEditingProfile}
                                        setIsEditing={setIsEditingProfile}
                                        departments={departments}
                                        allRoles={allRoles}
                                        getDepartmentName={getDepartmentName}
                                        getRoleName={getRoleName}
                                        handleProfileEditSave={handleProfileEditSave}
                                    />
                                )}

                                {/* Bio Card */}
                                <BioCard
                                    profile={profile}
                                    setProfile={setProfile}
                                    isEditing={isEditingAboutMe}
                                    setIsEditing={setIsEditingAboutMe}
                                    updateProfileDetails={updateProfileDetails}
                                />

                                {/* Photos Card */}
                                <PhotosCard
                                    profile={profile}
                                    setProfile={setProfile}
                                    isEditing={isEditingPhotos}
                                    setIsEditing={setIsEditingPhotos}
                                    updateProfileFunc={updateUserProfileFunc}
                                />
                            </div>

                            {/* Right Column - Contact & Social */}
                            <div className="space-y-6">
                                {/* Contact Information Card */}
                                <ContactCard
                                    profile={profile}
                                    setProfile={setProfile}
                                    isEditing={isEditingContact}
                                    setIsEditing={setIsEditingContact}
                                    updateProfileDetails={updateProfileDetails}
                                />

                                {/* Social Media Card */}
                                <SocialMediaCard
                                    profile={profile}
                                    setProfile={setProfile}
                                    updateProfileDetails={updateProfileDetails}
                                />

                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
