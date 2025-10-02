import React from 'react';
import { AdditionalPhotoUpload } from '../users/AdditionalPhotoUpload';

interface PhotosCardProps {
    profile: {
        photos: string[];
    };
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
}

export const PhotosCard = ({
    profile,
    setProfile,
    isEditing
}: PhotosCardProps) => {
    return (
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
                        onPhotoChange={(photoUrl: string) => {
                            const newPhotos = [...profile.photos];
                            newPhotos[index] = photoUrl;
                            setProfile((prev: any) => ({ ...prev, photos: newPhotos }));
                        }}
                        onPhotoDelete={() => {
                            const newPhotos = [...profile.photos];
                            newPhotos[index] = '';
                            setProfile((prev: any) => ({ ...prev, photos: newPhotos }));
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
    );
};

export default React.memo(PhotosCard);
