import { useState } from 'react';
import React from 'react';
import { Button, Textarea } from '../ui';

interface BioCardProps {
    profile: {
        bio: string;
    };
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    updateProfileDetails: (data: any) => Promise<void>;
}

export const BioCard = ({
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    updateProfileDetails
}: BioCardProps) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            console.log('Saving bio:', { bio: profile.bio });
            await updateProfileDetails({
                bio: profile.bio
            });
            console.log('Bio saved successfully');
            console.log('Refreshing profile data...');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating bio:', error);
            alert('Failed to save bio. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>About Me</span>
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
                <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell other crew members about yourself, your interests, and what makes you unique..."
                    rows={4}
                />
            ) : (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">
                        {profile.bio || 'No bio added yet. Click "Edit" to add information about yourself.'}
                    </p>
                </div>
            )}

            {isEditing && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        size="sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                    >
                        {isSaving ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default React.memo(BioCard);
