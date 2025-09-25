import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { SocialMediaLinks } from "../../../components/SocialMediaLinks";
import { SocialMediaDisplay } from "../../../components/SocialMediaDisplay";
import { ProfileEdit } from "../../../components/ProfileEdit";
import { ProfilePhotoUpload } from "../../../components/ProfilePhotoUpload";
import { AdditionalPhotoUpload } from "../../../components/AdditionalPhotoUpload";
import { useDepartments, useAllRoles } from "../../auth/api/jobDataHooks";
import { useUserProfile, useUpdateProfileDetails, useUpdateUserProfile } from "../../auth/api/userProfile";
import { useAllShips, useCruiseLines } from "../../cruise/api/cruiseData";
import { Link } from "react-router-dom";
import { HiCalendar } from "react-icons/hi";
import { getProfilePhotoUrl } from "../../../utils/imageUtils";

export const MyProfile = () => {
    const { currentUser } = useAuth();
    const { data: userProfile, isLoading: profileLoading } = useUserProfile();
    const { data: allShips = [], isLoading: shipsLoading } = useAllShips();
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
    const { mutateAsync: updateUserProfile } = useUpdateUserProfile();
    const { mutateAsync: updateProfileDetails } = useUpdateProfileDetails();
    const { data: departments = [] } = useDepartments();
    const { data: allRoles = [] } = useAllRoles();
    
    // Helper functions to get names from database data
    const getDepartmentName = (departmentId: string) => {
        console.log('getDepartmentName called with:', departmentId);
        console.log('Available departments:', departments);
        
        // Use real database data if available, otherwise fallback to hardcoded
        if (userProfile?.department_name) {
            console.log('Using userProfile.department_name:', userProfile.department_name);
            return userProfile.department_name;
        }
        // Try both formats: raw ID and prefixed ID
        const department = departments.find(d => d.id === departmentId || d.id === `dept-${departmentId}`);
        console.log('Found department:', department);
        return department ? department.name : 'Not specified';
    };
    
    const getRoleName = (roleId: string) => {
        // Use real database data if available, otherwise fallback to hardcoded
        if (userProfile?.role_name) {
            return userProfile.role_name;
        }
        const role = allRoles.find(r => r.id === roleId);
        return role ? role.name : 'Not specified';
    };
    
    const getShipName = (shipId: string) => {
        // Use real database data if available, otherwise fallback to ship list
        if (userProfile?.ship_name) {
            return userProfile.ship_name;
        }
        const ship = allShips.find(s => s.id === shipId);
        return ship ? ship.name : 'Not specified';
    };

    const getCruiseLineFromShip = (shipId: string) => {
        console.log('MyProfile: Looking up cruise line for ship ID:', shipId);
        console.log('MyProfile: Available ships:', allShips);
        console.log('MyProfile: Available cruise lines:', cruiseLines);
        const ship = allShips.find(s => s.id === shipId);
        if (ship) {
            // Try to get cruise line name from ship data first
            if (ship.cruise_line_name) {
                console.log('MyProfile: Found cruise line name from ship:', ship.cruise_line_name);
                return ship.cruise_line_name;
            }
            // Fallback to finding cruise line by ID
            const cruiseLine = cruiseLines.find(c => c.id === ship.cruise_line_id);
            const result = cruiseLine ? cruiseLine.name : 'Not specified';
            console.log('MyProfile: Cruise line lookup result:', result);
            return result;
        }
        console.log('MyProfile: Ship not found, returning Not specified');
        return 'Not specified';
    };
    
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

    // Update profile state when userProfile data is loaded
    useEffect(() => {
        if (userProfile) {
            console.log('MyProfile: Loading userProfile data:', userProfile);
            console.log('MyProfile: Current user data:', currentUser);
            console.log('MyProfile: Bio from database:', userProfile.bio);
            console.log('MyProfile: Phone from database:', userProfile.phone);
            console.log('MyProfile: Profile photo from database:', userProfile.profile_photo);
            
            const avatarValue = userProfile.profile_photo ? getProfilePhotoUrl(userProfile.profile_photo) : (currentUser?.photoURL || '');
            console.log('MyProfile: Setting avatar to:', avatarValue);
            
            setProfile(prev => ({
                ...prev,
                displayName: userProfile.display_name || currentUser?.displayName || '',
                avatar: avatarValue,
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
                photos: [
                    userProfile.additional_photo_1 || '',
                    userProfile.additional_photo_2 || '',
                    userProfile.additional_photo_3 || ''
                ],
                departmentId: userProfile.department_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            }));
            
            console.log('MyProfile: Profile state updated with:', {
                displayName: userProfile.display_name || currentUser?.displayName || '',
                avatar: userProfile.profile_photo ? 'Profile photo data present' : 'No profile photo',
                bio: userProfile.bio || '',
                phone: userProfile.phone || '',
                departmentId: userProfile.department_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            });
        }
    }, [userProfile, currentUser]);

    // Initialize currentCruiseLineId when allShips data is available
    useEffect(() => {
        if (profile.currentShipId && allShips.length > 0) {
            const ship = allShips.find(s => s.id === profile.currentShipId);
            if (ship && !profile.currentCruiseLineId) {
                setProfile(prev => ({
                    ...prev,
                    currentCruiseLineId: ship.cruise_line_id
                }));
            }
        }
    }, [profile.currentShipId, allShips, profile.currentCruiseLineId]);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingSocialMedia, setIsEditingSocialMedia] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [isEditingAssignment, setIsEditingAssignment] = useState(false);
    const [isSavingContact, setIsSavingContact] = useState(false);
    const [isSavingAboutMe, setIsSavingAboutMe] = useState(false);
    
    // Custom dropdown states for Current Assignment
    const [showCruiseLineDropdown, setShowCruiseLineDropdown] = useState(false);
    const [showShipDropdown, setShowShipDropdown] = useState(false);
    const [cruiseLineSearchTerm, setCruiseLineSearchTerm] = useState('');
    const [shipSearchTerm, setShipSearchTerm] = useState('');

    // Debug ProfileEdit data when editing profile
    useEffect(() => {
        if (isEditingProfile) {
            console.log('ProfileEdit initialData:', {
                displayName: profile.displayName,
                departmentId: profile.departmentId ? `dept-${profile.departmentId}` : '',
                roleId: profile.roleId,
                currentShipId: profile.currentShipId,
                phoneNumber: '',
                bio: ''
            });
            console.log('Raw userProfile data:', userProfile);
            console.log('Profile state:', profile);
        }
    }, [isEditingProfile, profile]);

    // Simple utility to convert undefined to null
    const toNull = (value: any) => {
        console.log(`toNull input: ${value} (type: ${typeof value})`);
        const result = value === undefined ? null : value;
        console.log(`toNull output: ${result} (type: ${typeof result})`);
        return result;
    };

    const handleSave = async () => {
        setIsLoading(true);
        
        try {
            // Always save job information (department, role, etc.) regardless of photo changes
            console.log('Updating job information...');
            await updateUserProfile({
                displayName: profile.displayName,
                // Don't send profilePhoto here - it's already updated during upload
                departmentId: profile.departmentId,
                roleId: profile.roleId,
                currentShipId: profile.currentShipId
            });
            console.log('Job information updated successfully');
            
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
            
            console.log('Profile details data:', profileDetailsData);
            console.log('Checking for undefined values:');
            Object.keys(profileDetailsData).forEach(key => {
                const value = (profileDetailsData as any)[key];
                if (value === undefined) {
                    console.error(`UNDEFINED FOUND: ${key} = ${value}`);
                }
            });
            
            await updateProfileDetails(profileDetailsData);
            
            setIsEditing(false);
            console.log('Profile updated successfully');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            console.error('Error details:', error.response?.data);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile. Please try again.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialMediaSave = async (socialMediaData: any) => {
        setIsLoading(true);
        
        // Clean and validate the data before sending
        const cleanedData = {
            bio: toNull(profile.bio),
            phone: toNull(profile.contacts?.phone),
            instagram: toNull(socialMediaData.instagram),
            twitter: toNull(socialMediaData.twitter),
            facebook: toNull(socialMediaData.facebook),
            snapchat: toNull(socialMediaData.snapchat),
            website: toNull(socialMediaData.website),
            additionalPhotos: profile.photos || []
        };
        
        try {
            
            console.log('Cleaned social media data:', cleanedData);
            console.log('Checking for undefined values:');
            Object.keys(cleanedData).forEach(key => {
                const value = (cleanedData as any)[key];
                if (value === undefined) {
                    console.error(`UNDEFINED FOUND: ${key} = ${value}`);
                }
            });
            
            console.log('About to send cleaned data to API:', cleanedData);
            await updateProfileDetails(cleanedData);
            
            setProfile(prev => ({ ...prev, socialMedia: cleanedData }));
            setIsEditingSocialMedia(false);
            console.log('Social media updated successfully');
            
            // Show success message
            alert('Social media links saved successfully!');
            
        } catch (error: any) {
            console.error('Failed to update social media:', error);
            console.error('Error details:', error.response?.data);
            console.error('Request data sent:', cleanedData);
            
            // Better error handling
            let errorMessage = 'Failed to update social media. Please try again.';
            
            if (error.response?.status === 500) {
                errorMessage = 'Server error occurred. The backend may be experiencing issues. Please try again later.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileEditSave = async (profileData: any) => {
        setIsLoading(true);
        
        try {
            console.log('Saving profile data:', profileData);
            
            // Save job information (department, role, etc.) to database
            await updateUserProfile({
                displayName: profileData.displayName,
                profilePhoto: profile.avatar, // Keep existing photo
                departmentId: profileData.departmentId || '', // No need to remove dept- prefix
                roleId: profileData.roleId || '',
                currentShipId: profile.currentShipId // Use current ship from profile state, not form data
            });
            
            // Note: bio and phone are handled in separate Contact and About Me sections
            
            // Update local state
            setProfile(prev => ({ 
                ...prev, 
                displayName: profileData.displayName,
                departmentId: profileData.departmentId,
                roleId: profileData.roleId
                // Don't update currentShipId here since it's not part of Personal Information
            }));
            
            setIsEditingProfile(false);
            console.log('Profile updated successfully in database');
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
                displayName: userProfile.display_name || currentUser?.displayName || '',
                avatar: userProfile.profile_photo ? getProfilePhotoUrl(userProfile.profile_photo) : (currentUser?.photoURL || ''),
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
                photos: [
                    userProfile.additional_photo_1 || '',
                    userProfile.additional_photo_2 || '',
                    userProfile.additional_photo_3 || ''
                ],
                departmentId: userProfile.department_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            }));
        }
    };

    // Show loading state while profile data is being fetched
    if (profileLoading || shipsLoading || cruiseLinesLoading) {
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
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors bg-white text-[#069B93] hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">My Profile</h1>
                            <p className="text-gray-600 text-sm lg:text-base">Manage your profile information and settings</p>
                        </div>
                    </div>
                </div>

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
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                                </div>
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{profile.displayName || 'Crew Member'}</h1>
                                    <p className="text-[#B9F3DF] text-lg lg:text-xl mb-3">Crew Member</p>
                                    <div className="flex items-center justify-center lg:justify-start space-x-3">
                                        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-sm text-white font-medium">Online</span>
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
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <img src="/ship-icon.png" alt="Ship" className="w-6 h-6" />
                                        <span>Current Assignment</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingAssignment(!isEditingAssignment)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                                    >
                                        {isEditingAssignment ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                {isEditingAssignment ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cruise Line
                                            </label>
                                            <div className="relative">
                                                <div 
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-[#069B93] focus-within:border-[#069B93] focus-within:ring-1 focus-within:ring-[#069B93] transition-colors"
                                                    onClick={() => setShowCruiseLineDropdown(!showCruiseLineDropdown)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={profile.currentCruiseLineId ? 'text-gray-900' : 'text-gray-500'}>
                                                            {profile.currentCruiseLineId ? 
                                                                cruiseLines.find(line => line.id === profile.currentCruiseLineId)?.name || 'Choose a cruise line' 
                                                                : 'Choose a cruise line'
                                                            }
                                                        </span>
                                                        <svg 
                                                            className={`w-5 h-5 text-gray-400 transition-transform ${showCruiseLineDropdown ? 'rotate-180' : ''}`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {showCruiseLineDropdown && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                                        <div className="p-2 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                placeholder="Search cruise line..."
                                                                value={cruiseLineSearchTerm}
                                                                onChange={(e) => setCruiseLineSearchTerm(e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93]"
                                                            />
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {cruiseLines
                                                                .filter(line => line.name.toLowerCase().includes(cruiseLineSearchTerm.toLowerCase()))
                                                                .map((line) => (
                                                                    <div
                                                                        key={line.id}
                                                                        className="px-3 py-2 hover:bg-[#069B93]/10 cursor-pointer text-sm"
                                                                        onClick={() => {
                                                                            setProfile(prev => ({ 
                                                                                ...prev, 
                                                                                currentCruiseLineId: line.id,
                                                                                currentShipId: '' // Reset ship when cruise line changes
                                                                            }));
                                                                            setShowCruiseLineDropdown(false);
                                                                            setCruiseLineSearchTerm('');
                                                                        }}
                                                                    >
                                                                        {line.name}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ship
                                            </label>
                                            <div className="relative">
                                                <div 
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-[#069B93] focus-within:border-[#069B93] focus-within:ring-1 focus-within:ring-[#069B93] transition-colors ${
                                                        !profile.currentCruiseLineId ? 'bg-gray-100 cursor-not-allowed' : ''
                                                    }`}
                                                    onClick={() => profile.currentCruiseLineId && setShowShipDropdown(!showShipDropdown)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={profile.currentShipId ? 'text-gray-900' : 'text-gray-500'}>
                                                            {profile.currentShipId ? 
                                                                allShips.find(ship => ship.id === profile.currentShipId)?.name || 'Choose a ship' 
                                                                : 'Choose a ship'
                                                            }
                                                        </span>
                                                        <svg 
                                                            className={`w-5 h-5 text-gray-400 transition-transform ${showShipDropdown ? 'rotate-180' : ''}`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {showShipDropdown && profile.currentCruiseLineId && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                                        <div className="p-2 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                placeholder="Search ship..."
                                                                value={shipSearchTerm}
                                                                onChange={(e) => setShipSearchTerm(e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93]"
                                                            />
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {allShips
                                                                .filter(ship => 
                                                                    ship.cruise_line_id === profile.currentCruiseLineId &&
                                                                    ship.name.toLowerCase().includes(shipSearchTerm.toLowerCase())
                                                                )
                                                                .map((ship) => (
                                                                    <div
                                                                        key={ship.id}
                                                                        className="px-3 py-2 hover:bg-[#069B93]/10 cursor-pointer text-sm"
                                                                        onClick={() => {
                                                                            setProfile(prev => ({ 
                                                                                ...prev, 
                                                                                currentShipId: ship.id 
                                                                            }));
                                                                            setShowShipDropdown(false);
                                                                            setShipSearchTerm('');
                                                                        }}
                                                                    >
                                                                        {ship.name}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => setIsEditingAssignment(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        // Ensure all fields have proper values (not undefined)
                                                        const updateData = {
                                                            displayName: profile.displayName || '',
                                                            profilePhoto: profile.avatar || '', // Include current profile photo
                                                            departmentId: profile.departmentId || '',
                                                            roleId: profile.roleId || '',
                                                            currentShipId: profile.currentShipId || ''
                                                        };
                                                        
                                                        console.log('Updating assignment with data:', updateData);
                                                        await updateUserProfile(updateData);
                                                        setIsEditingAssignment(false);
                                                    } catch (error) {
                                                        console.error('Error updating assignment:', error);
                                                        alert('Failed to update assignment. Please try again.');
                                                    }
                                                }}
                                                disabled={!profile.currentShipId}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                    !profile.currentShipId 
                                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                        : 'text-white bg-[#069B93] hover:bg-[#058a7a]'
                                                }`}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Cruise Line</h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {shipsLoading || cruiseLinesLoading ? (
                                                    <span className="text-[#069B93] animate-pulse">Loading...</span>
                                                ) : profile.currentShipId ? getCruiseLineFromShip(profile.currentShipId) : 'Not specified'}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Ship</h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {shipsLoading ? (
                                                    <span className="text-[#069B93] animate-pulse">Loading...</span>
                                                ) : profile.currentShipId ? getShipName(profile.currentShipId) : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Job Information Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Personal Information</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                                    >
                                        {isEditingProfile ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                
                                {isEditingProfile ? (
                                    <ProfileEdit
                                        initialData={{
                                            displayName: profile.displayName,
                                            departmentId: profile.departmentId || '', // Remove the dept- prefix addition
                                            roleId: profile.roleId || '',
                                            phoneNumber: '',
                                            bio: ''
                                        }}
                                        onSave={handleProfileEditSave}
                                        onCancel={() => setIsEditingProfile(false)}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm3-1a1 1 0 011-1h2a1 1 0 011 1v1H9V5z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Department</h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {profile.departmentId ? getDepartmentName(profile.departmentId) : 'Not specified'}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Position</h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {profile.roleId ? getRoleName(profile.roleId) : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bio Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>About Me</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingAboutMe(!isEditingAboutMe)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                                    >
                                        {isEditingAboutMe ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                {isEditingAboutMe ? (
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell other crew members about yourself, your interests, and what makes you unique..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none resize-none transition-all duration-200"
                                        rows={4}
                                    />
                                ) : (
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            {profile.bio || 'No bio added yet. Click "Edit" to add information about yourself.'}
                                        </p>
                                    </div>
                                )}
                                
                                {isEditingAboutMe && (
                                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setIsEditingAboutMe(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (isSavingAboutMe) return;
                                                setIsSavingAboutMe(true);
                                                try {
                                                    console.log('Saving bio:', { bio: profile.bio });
                                                    await updateProfileDetails({
                                                        bio: profile.bio
                                                    });
                                                    console.log('Bio saved successfully');
                                                    console.log('Refreshing profile data...');
                                                    setIsEditingAboutMe(false);
                                                } catch (error) {
                                                    console.error('Error updating bio:', error);
                                                    alert('Failed to save bio. Please try again.');
                                                } finally {
                                                    setIsSavingAboutMe(false);
                                                }
                                            }}
                                            disabled={isSavingAboutMe}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                isSavingAboutMe 
                                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                    : 'text-white bg-[#069B93] hover:bg-[#058a7a]'
                                            }`}
                                        >
                                            {isSavingAboutMe ? 'Updating...' : 'Update'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Photos Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-6">
                                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Photos</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {profile.photos.map((photo, index) => (
                                        <AdditionalPhotoUpload
                                            key={index}
                                            currentPhoto={photo}
                                            onPhotoChange={(photoUrl) => {
                                                const newPhotos = [...profile.photos];
                                                newPhotos[index] = photoUrl;
                                                setProfile(prev => ({ ...prev, photos: newPhotos }));
                                            }}
                                            onPhotoDelete={() => {
                                                const newPhotos = [...profile.photos];
                                                newPhotos[index] = '';
                                                setProfile(prev => ({ ...prev, photos: newPhotos }));
                                            }}
                                            index={index}
                                        />
                                    ))}
                                </div>
                                {isEditing && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            💡 You can add up to 3 photos. Drag & drop or click to upload images (max 10MB each).
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Contact & Social */}
                        <div className="space-y-6">
                            {/* Contact Information Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Contact</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingContact(!isEditingContact)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                                    >
                                        {isEditingContact ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl">
                                        <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Email</p>
                                            {isEditingContact ? (
                                                <input
                                                    type="email"
                                                    value={profile.contacts.email}
                                                    onChange={(e) => setProfile(prev => ({ 
                                                        ...prev, 
                                                        contacts: { ...prev.contacts, email: e.target.value }
                                                    }))}
                                                    className="w-full text-gray-700 font-medium bg-transparent border-none p-0 focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-gray-700 font-medium">{profile.contacts.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl">
                                        <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Phone</p>
                                            {isEditingContact ? (
                                                <input
                                                    type="tel"
                                                    value={profile.contacts.phone}
                                                    onChange={(e) => setProfile(prev => ({ 
                                                        ...prev, 
                                                        contacts: { ...prev.contacts, phone: e.target.value }
                                                    }))}
                                                    placeholder="Add phone number"
                                                    className="w-full text-gray-700 font-medium bg-transparent border-none p-0 focus:outline-none placeholder-gray-400"
                                                />
                                            ) : (
                                                <p className="text-gray-700 font-medium">{profile.contacts.phone || 'No phone number'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {isEditingContact && (
                                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setIsEditingContact(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (isSavingContact) return;
                                                setIsSavingContact(true);
                                                try {
                                                    console.log('Saving contact info:', { phone: profile.contacts.phone });
                                                    await updateProfileDetails({
                                                        phone: profile.contacts.phone
                                                    });
                                                    console.log('Contact info saved successfully');
                                                    console.log('Refreshing profile data...');
                                                    setIsEditingContact(false);
                                                } catch (error) {
                                                    console.error('Error updating contact:', error);
                                                    alert('Failed to save contact information. Please try again.');
                                                } finally {
                                                    setIsSavingContact(false);
                                                }
                                            }}
                                            disabled={isSavingContact}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                isSavingContact 
                                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                    : 'text-white bg-[#069B93] hover:bg-[#058a7a]'
                                            }`}
                                        >
                                            {isSavingContact ? 'Updating...' : 'Update'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Social Media Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span>Social Media</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingSocialMedia(!isEditingSocialMedia)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93] flex items-center justify-center"
                                    >
                                        {isEditingSocialMedia ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                
                                {isEditingSocialMedia ? (
                                    <SocialMediaLinks
                                        initialData={profile.socialMedia}
                                        onSave={handleSocialMediaSave}
                                        onCancel={() => setIsEditingSocialMedia(false)}
                                    />
                                ) : (
                                    <SocialMediaDisplay socialMedia={profile.socialMedia} />
                                )}
                            </div>

                        </div>
                    </div>


                    {/* Save Button */}
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex-1 px-8 py-4 text-white bg-gradient-to-r from-[#069B93] to-[#00A59E] hover:from-[#058a7a] hover:to-[#069B93] rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving Changes...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Update</span>
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-8 py-4 text-gray-600 bg-white hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
