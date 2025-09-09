import { useState } from "react";
import Navbar from "../../../components/Elements/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { useQuickCheckIn } from "../../../context/QuickCheckInContext";
import { SocialMediaLinks } from "../../../components/SocialMediaLinks";
import { SocialMediaDisplay } from "../../../components/SocialMediaDisplay";
import { ProfileEdit } from "../../../components/ProfileEdit";
import { sampleDepartments, sampleRoles } from "../../../data/onboarding-data";
import { defaultAvatar } from "../../../utils/images";

export const MyProfile = () => {
    const { currentUser } = useAuth();
    const { currentShip } = useQuickCheckIn();
    
    // Helper functions to get department and role names
    const getDepartmentName = (departmentId: string) => {
        const department = sampleDepartments.find(d => d.id === departmentId);
        return department ? department.name : 'Not specified';
    };
    
    const getRoleName = (roleId: string) => {
        const role = sampleRoles.find(r => r.id === roleId);
        return role ? role.name : 'Not specified';
    };
    
    const [profile, setProfile] = useState({
        displayName: currentUser?.displayName || '',
        bio: '',
        photos: ['', '', ''],
        contacts: {
            email: currentUser?.email || '',
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
        subcategoryId: '',
        roleId: '',
        currentShipId: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingSocialMedia, setIsEditingSocialMedia] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsEditing(false);
            console.log('Profile updated:', profile);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialMediaSave = async (socialMediaData: any) => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setProfile(prev => ({ ...prev, socialMedia: socialMediaData }));
            setIsEditingSocialMedia(false);
            console.log('Social media updated:', socialMediaData);
        } catch (error) {
            console.error('Failed to update social media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileEditSave = async (profileData: any) => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setProfile(prev => ({ 
                ...prev, 
                ...profileData,
                contacts: { ...prev.contacts, phone: profileData.phoneNumber }
            }));
            setIsEditingProfile(false);
            console.log('Profile updated:', profileData);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values
        setProfile({
            displayName: currentUser?.displayName || '',
            bio: '',
            photos: ['', '', ''],
            contacts: {
                email: currentUser?.email || '',
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
            subcategoryId: '',
            roleId: '',
            currentShipId: ''
        });
    };

    return (
        <div className="container">
            <Navbar />
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-[#069B93] mb-2">My Profile</h1>
                                <p className="text-gray-600">Manage your profile information and privacy settings</p>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-6 py-3 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors"
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] p-6 text-white">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <img 
                                            src={defaultAvatar} 
                                            alt="Profile" 
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                        {isEditing && (
                                            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-[#069B93] rounded-full flex items-center justify-center text-xs font-bold">
                                                ✎
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                                        <p className="text-[#B9F3DF] text-lg">Crew Member</p>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-sm text-[#B9F3DF]">Online now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="p-6 space-y-6">
                                {/* Current Assignment */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Assignment</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">Ship</h3>
                                            <p className="text-gray-600">
                                                {currentShip ? currentShip.shipName : 'No ship assigned'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">Port</h3>
                                            <p className="text-gray-600">
                                                {currentShip ? currentShip.port : 'No port assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Information */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Job Information</h2>
                                        <button
                                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                                            className="px-3 py-1 text-sm text-[#069B93] hover:text-[#058a7a] font-medium transition-colors"
                                        >
                                            {isEditingProfile ? 'Cancel' : 'Edit Job Info'}
                                        </button>
                                    </div>
                                    
                                    {isEditingProfile ? (
                                        <ProfileEdit
                                            initialData={{
                                                displayName: profile.displayName,
                                                departmentId: profile.departmentId,
                                                subcategoryId: profile.subcategoryId,
                                                roleId: profile.roleId,
                                                currentShipId: profile.currentShipId,
                                                phoneNumber: profile.contacts.phone,
                                                bio: profile.bio
                                            }}
                                            onSave={handleProfileEditSave}
                                            onCancel={() => setIsEditingProfile(false)}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-medium text-gray-900 mb-1">Department</h3>
                                                <p className="text-gray-600">
                                                    {getDepartmentName(profile.departmentId)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-medium text-gray-900 mb-1">Role</h3>
                                                <p className="text-gray-600">
                                                    {getRoleName(profile.roleId)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                                    {isEditing ? (
                                        <textarea
                                            value={profile.bio}
                                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                            placeholder="Tell other crew members about yourself..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                                            rows={4}
                                        />
                                    ) : (
                                        <p className="text-gray-700 leading-relaxed">
                                            {profile.bio || 'No bio added yet.'}
                                        </p>
                                    )}
                                </div>

                                {/* Photos */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {profile.photos.map((_, index) => (
                                            <div key={index} className="relative">
                                                {isEditing ? (
                                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-500 text-sm">Add Photo</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-500 text-sm">No Photo</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={profile.contacts.email}
                                                    onChange={(e) => setProfile(prev => ({ 
                                                        ...prev, 
                                                        contacts: { ...prev.contacts, email: e.target.value }
                                                    }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-gray-700">{profile.contacts.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={profile.contacts.phone}
                                                    onChange={(e) => setProfile(prev => ({ 
                                                        ...prev, 
                                                        contacts: { ...prev.contacts, phone: e.target.value }
                                                    }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-gray-700">{profile.contacts.phone || 'No phone number'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media Links */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
                                        <button
                                            onClick={() => setIsEditingSocialMedia(!isEditingSocialMedia)}
                                            className="px-3 py-1 text-sm text-[#069B93] hover:text-[#058a7a] font-medium transition-colors"
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

                                {/* Privacy Notice */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs">ℹ</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-blue-900">Privacy Notice</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Your contact information and additional photos are only visible to crewvar users you've connected with. 
                                                Your current ship assignment is only shown for today.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                {isEditing && (
                                    <div className="flex space-x-4 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="flex-1 px-6 py-3 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="px-6 py-3 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
