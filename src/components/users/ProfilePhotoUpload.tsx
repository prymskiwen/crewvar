import { useState, useRef, useCallback } from 'react';
import { uploadProfilePhoto } from '../../firebase/storage';
import { shouldShowStorageWarning } from '../../utils/storageFallback';
import { useAuth } from '../../context/AuthContextFirebase';

interface ProfilePhotoUploadProps {
    currentPhoto?: string;
    onPhotoChange: (photoUrl: string) => void;
    className?: string;
    size?: 'small' | 'medium' | 'large';
    showInstructions?: boolean;
}

export const ProfilePhotoUpload = ({
    currentPhoto,
    onPhotoChange,
    className = '',
    size = 'large',
    showInstructions = true
}: ProfilePhotoUploadProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAuth();

    const sizeClasses = {
        small: 'w-16 h-16',
        medium: 'w-24 h-24',
        large: 'w-24 h-24' // Default large size
    };

    const handleFileSelect = useCallback(async (file: File) => {
        // Clear any previous errors
        setError(null);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError(new Error('Please select a valid image file (JPEG, PNG, or WebP)'));
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError(new Error('File size must be less than 10MB'));
            return;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Upload file with Firebase
        if (!currentUser) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const downloadURL = await uploadProfilePhoto(file, currentUser.uid, (progress: any) => {
                setUploadProgress(Math.round((progress.bytesTransferred / progress.totalBytes) * 100));
            });

            console.log('Upload successful:', downloadURL);
            onPhotoChange(downloadURL);
            setPreview(null);
            setUploadProgress(0);

            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            setError(error instanceof Error ? error : new Error('Upload failed'));
            setPreview(null);
            setUploadProgress(0);

            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
        } finally {
            setIsUploading(false);
        }
    }, [currentUser, onPhotoChange]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    // Construct full URL for the photo
    const getFullPhotoUrl = (photoUrl: string | null) => {
        if (!photoUrl) return null;
        if (photoUrl.startsWith('http')) return photoUrl; // Already a full URL (Firebase Storage URL)
        return photoUrl; // Fallback for relative paths
    };

    const displayPhoto = preview || getFullPhotoUrl(currentPhoto || null);
    console.log('Display photo:', { preview, currentPhoto, displayPhoto });

    const containerClasses = className || sizeClasses[size];
    const borderClasses = className ? 'border-0' : 'border-2 border-dashed';

    return (
        <div>
            <div
                className={`
                    ${containerClasses} 
                    relative rounded-full ${borderClasses}
                    cursor-pointer transition-all duration-200
                    flex items-center justify-center overflow-hidden
                    ${isDragOver
                        ? 'border-[#069B93] bg-[#069B93]/10'
                        : className ? '' : 'border-gray-300 hover:border-[#069B93] hover:bg-gray-50'
                    }
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {displayPhoto ? (
                    <img
                        src={displayPhoto}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover object-center"
                        title="Click to change profile photo"
                        onLoad={() => console.log('Image loaded successfully:', displayPhoto)}
                        onError={(e) => {
                            console.error('Image failed to load:', displayPhoto);
                            console.error('Image error event:', e);
                        }}
                    />
                ) : (
                    <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {showInstructions && (
                            <>
                                <p className="text-xs text-gray-500 font-medium">
                                    {size === 'large' ? 'Click to upload' : 'Upload'}
                                </p>
                                {size === 'large' && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Profile Photo
                                    </p>
                                )}
                            </>
                        )}
                        {!showInstructions && (
                            <p className="text-xs text-white font-medium mt-1">
                                Click to upload
                            </p>
                        )}
                    </div>
                )}

                {/* Upload overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-white text-xs">{uploadProgress}%</p>
                        </div>
                    </div>
                )}

                {/* Edit icon */}
                {displayPhoto && !isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200">
                        <svg className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                )}

                {/* Hover effect for upload area when no photo */}
                {!displayPhoto && !isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full transition-all duration-200"></div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error.message}</p>
            )}

            {/* Upload instructions - only show if enabled */}
            {showInstructions && (
                <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-gray-400">
                        Max 10MB • JPG, PNG, WebP supported
                    </p>
                    {shouldShowStorageWarning() && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                            ⚠️ Storage not available - using local preview
                        </p>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
            />
        </div>
    );
};

