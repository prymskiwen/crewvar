import React, { useState } from 'react';
import { Button } from '../ui';
import { SocialMediaLinks, SocialMediaDisplay } from '../common';

interface SocialMediaCardProps {
    profile: {
        socialMedia: {
            instagram: string;
            twitter: string;
            facebook: string;
            snapchat: string;
            website: string;
        };
    };
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    updateProfileDetails: (data: any) => Promise<void>;
}

export const SocialMediaCard = ({
    profile,
    setProfile,
    updateProfileDetails
}: SocialMediaCardProps) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Social Media</span>
                </h2>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
            </div>

            {isEditing ? (
                <SocialMediaLinks
                    initialData={profile.socialMedia}
                    onSave={async (data) => {
                        // Update local state
                        setProfile((prev: any) => ({
                            ...prev,
                            socialMedia: data
                        }));
                        
                        // Ensure all social media fields exist with empty strings if undefined
                        const socialMediaData = {
                            instagram: data.instagram || '',
                            twitter: data.twitter || '',
                            facebook: data.facebook || '',
                            snapchat: data.snapchat || '',
                            website: data.website || ''
                        };
                        
                        // Save to database immediately
                        try {
                            await updateProfileDetails(socialMediaData);
                            setIsEditing(false);
                        } catch (error) {
                            console.error('Error updating social media:', error);
                            alert('Failed to save social media links. Please try again.');
                        }
                    }}
                    onCancel={() => setIsEditing(false)}
                    showButtons={true}
                />
            ) : (
                <SocialMediaDisplay socialMedia={profile.socialMedia} />
            )}
        </div>
    );
};

export default React.memo(SocialMediaCard);
