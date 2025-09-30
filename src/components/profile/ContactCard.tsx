import { useState } from 'react';
import { Button, Input } from '../ui';

interface ContactCardProps {
    profile: {
        contacts: {
            email: string;
            phone: string;
        };
    };
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    updateProfileDetails: (data: any) => Promise<void>;
}

export const ContactCard = ({
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    updateProfileDetails
}: ContactCardProps) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            console.log('Saving contact info:', { phone: profile.contacts.phone });
            await updateProfileDetails({
                phone: profile.contacts.phone
            });
            console.log('Contact info saved successfully');
            console.log('Refreshing profile data...');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating contact:', error);
            alert('Failed to save contact information. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Contact</span>
                </h2>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
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
                        {isEditing ? (
                            <Input
                                type="email"
                                value={profile.contacts.email}
                                onChange={(e) => setProfile((prev: any) => ({
                                    ...prev,
                                    contacts: { ...prev.contacts, email: e.target.value }
                                }))}
                                className="bg-transparent border-none p-0"
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
                        {isEditing ? (
                            <Input
                                type="tel"
                                value={profile.contacts.phone}
                                onChange={(e) => setProfile((prev: any) => ({
                                    ...prev,
                                    contacts: { ...prev.contacts, phone: e.target.value }
                                }))}
                                placeholder="Add phone number"
                                className="bg-transparent border-none p-0"
                            />
                        ) : (
                            <p className="text-gray-700 font-medium">{profile.contacts.phone || 'No phone number'}</p>
                        )}
                    </div>
                </div>
            </div>

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
