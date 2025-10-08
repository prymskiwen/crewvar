import React, { useState, useRef, useCallback } from 'react';
import { uploadProfilePhoto } from '../../firebase/storage';
import { shouldShowStorageWarning } from '../../utils/storageFallback';
import { useAuth } from '../../context/AuthContextFirebase';

interface ProfilePhotoUploadProps {
    currentPhoto?: string;
    onPhotoChange: (photoUrl: string) => void;
    className?: string;
    size?: 'small' | 'medium' | 'large';
    showInstructions?: boolean;
    onEditClick?: () => void;
}

export const ProfilePhotoUpload = ({
    currentPhoto,
    onPhotoChange,
    className = '',
    size = 'large',
    showInstructions = true,
    onEditClick
}: ProfilePhotoUploadProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAuth();

    const sizeClasses = {
        small: 'w-20 h-20',
        medium: 'w-28 h-28',
        large: 'w-32 h-32' // Increased large size
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

    // Function to trigger file input
    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Expose the trigger function to parent
    React.useEffect(() => {
        if (onEditClick) {
            // Store the trigger function in a way the parent can access it
            (window as any).triggerProfilePhotoUpload = triggerFileInput;
        }
    }, [onEditClick, triggerFileInput]);

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
    const borderClasses = className ? 'border-0' : 'border-2 border-solid';

    return (
        <div>
            <div
                className={`
                    ${containerClasses} 
                    relative rounded-full ${borderClasses}
                    cursor-pointer transition-all duration-200
                    flex items-center justify-center overflow-hidden
                    ${isDragOver
                        ? 'border-teal-500 bg-teal-50'
                        : className ? '' : 'border-teal-300 hover:border-teal-500 hover:bg-teal-50'
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
                    <div className="text-center px-2">
                        <svg className="w-6 h-6 text-teal-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {showInstructions && (
                            <>
                                <p className="text-xs text-teal-600 font-medium leading-tight">
                                    {size === 'large' ? 'Click to upload' : 'Upload'}
                                </p>
                                {size === 'large' && (
                                    <p className="text-xs text-teal-500 mt-1 leading-tight">
                                        Profile Photo
                                    </p>
                                )}
                            </>
                        )}
                        {!showInstructions && (
                            <p className="text-xs text-teal-600 font-medium mt-1 leading-tight">
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

                {/* Add icon (Instagram style) */}
                {displayPhoto && !isUploading && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#069B93] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                    <p className="text-xs text-teal-600 font-medium">
                        Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-teal-500">
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

