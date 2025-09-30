import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiCalendar } from "react-icons/hi";
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
    updateUserProfile,
    getShips,
    getCruiseLines,
    getDepartments,
    getRolesByDepartment
} from "../../firebase/firestore";
import { toast } from "react-toastify";

export const MyProfile = () => {
    const { currentUser, userProfile } = useAuth();
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
            const allRolesData = [];
            for (const dept of departments) {
                try {
                    const roles = await getRolesByDepartment(dept.id);
                    allRolesData.push(...roles);
                } catch (error) {
                    console.error(`Error fetching roles for department ${dept.id}:`, error);
                }
            }
            return allRolesData;
        },
        enabled: departments.length > 0
    });

    const updateUserProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            if (!currentUser?.uid) throw new Error('User not authenticated');
            await updateUserProfile(currentUser.uid, data);
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
            await updateUserProfile(currentUser.uid, data);
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

    const getUserDepartmentName = () => {
        return profile.departmentId ? getDepartmentName(profile.departmentId) : 'Crew Member';
    };

    const getUserStatus = () => {
        return { status: userProfile?.isActive ? 'Online' : 'Offline', color: !userProfile?.isActive ? 'bg-red-400' : 'bg-green-400' };

    };

    const getUserJobTitle = () => {
        const roleName = getUserRoleName();
        const departmentName = getUserDepartmentName();

        if (roleName !== 'Crew Member' && departmentName !== 'Crew Member') {
            return `${roleName} • ${departmentName}`;
        } else if (roleName !== 'Crew Member') {
            return roleName;
        } else if (departmentName !== 'Crew Member') {
            return departmentName;
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
                photos: ['', '', ''],
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

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [isEditingAssignment, setIsEditingAssignment] = useState(false);

    const toNull = (value: any) => {
        return value === undefined ? null : value;
    };

    const handleSave = async () => {
        setIsLoading(true);

        try {
            // Always save job information (department, role, etc.) regardless of photo changes
            await updateUserProfileFunc({
                displayName: profile.displayName,
                departmentId: profile.departmentId,
                roleId: profile.roleId,
                currentShipId: profile.currentShipId
            });

            // Save profile details (bio, contacts, social media, additional photos)
            const profileDetailsData = {
                bio: toNull(profile.bio),
                phone: toNull(profile.contacts?.phone),
                instagram: toNull(profile.socialMedia?.instagram),
                twitter: toNull(profile.socialMedia?.twitter),
                facebook: toNull(profile.socialMedia?.facebook),
                snapchat: toNull(profile.socialMedia?.snapchat),
                website: toNull(profile.socialMedia?.website),
                additionalPhotos: profile.photos || [],
                additionalPhotosCount: (profile.photos || []).length
            };

            await updateProfileDetails(profileDetailsData);

            setIsEditing(false);
            console.log('Profile updated successfully');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile. Please try again.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values from userProfile
        if (userProfile) {
            setProfile(prev => ({
                ...prev,
                displayName: userProfile.displayName || currentUser?.displayName || '',
                avatar: userProfile.profilePhoto ? getProfilePhotoUrl(userProfile.profilePhoto) : (currentUser?.photoURL || ''),
                bio: userProfile.bio || '',
                contacts: {
                    ...prev.contacts,
                    email: userProfile.email || currentUser?.email || '',
                    phone: userProfile.phone || ''
                },
                socialMedia: {
                    instagram: userProfile.instagram || '',
                    twitter: userProfile.twitter || '',
                    facebook: userProfile.facebook || '',
                    snapchat: userProfile.snapchat || '',
                    website: userProfile.website || ''
                },
                photos: ['', '', ''],
                departmentId: userProfile.departmentId || '',
                roleId: userProfile.roleId || '',
                currentShipId: userProfile.currentShipId || ''
            }));
        }
    };



    const handleProfileEditSave = async (profileData: any) => {
        try {
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


    if (shipsLoading || cruiseLinesLoading || departmentsLoading || rolesLoading) {
        return (
            <div className="container">
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#B9F3DF] via-[#E8F8F5] to-[#B9F3DF]">
            <div className="container mx-auto px-4 py-6 lg:py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-[#069B93] via-[#00A59E] to-[#069B93] p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                                <div className="relative flex-shrink-0">
                                    <ProfilePhotoUpload
                                        currentPhoto={profile.avatar}
                                        onPhotoChange={(photoUrl) => {
                                            setProfile(prev => ({ ...prev, avatar: photoUrl }));
                                        }}
                                        size="large"
                                        className="w-24 h-24 lg:w-32 lg:h-32 rounded-full shadow-2xl"
                                        showInstructions={false}
                                    />
                                </div>
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{profile.displayName || 'Crew Member'}</h1>
                                    <p className="text-[#B9F3DF] text-lg lg:text-xl mb-3">{getUserJobTitle()}</p>
                                    <div className="flex items-center justify-center lg:justify-start space-x-3">
                                        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                                            <div className={`w-2 h-2 ${getUserStatus().color} rounded-full`}></div>
                                            <span className="text-sm text-white font-medium">{getUserStatus().status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/calendar"
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-[#069B93] rounded-xl font-semibold transition-all duration-200 hover:bg-[#069B93] hover:text-white shadow-md hover:shadow-lg"
                            >
                                <HiCalendar className="w-4 h-4" />
                                <span>My Calendar</span>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Current Assignment Card */}
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

                            {/* Job Information Card */}
                            <JobInformationCard
                                profile={profile}
                                setProfile={setProfile}
                                isEditing={isEditingProfile}
                                setIsEditing={setIsEditingProfile}
                                departments={departments}
                                allRoles={allRoles}
                                getDepartmentName={getDepartmentName}
                                getRoleName={getRoleName}
                                handleProfileEditSave={handleProfileEditSave}
                            />

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
                                isEditing={isEditing}
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
    );
};
