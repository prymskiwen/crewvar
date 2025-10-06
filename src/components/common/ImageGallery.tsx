import React, { useState, useCallback } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAuth } from '../../context/AuthContextFirebase';

interface ImageGalleryProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    uploadType: 'profile' | 'additional' | 'chat';
    roomId?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    onImagesChange,
    maxImages = 6,
    uploadType,
    roomId,
    className = '',
    size = 'md',
    disabled = false
}) => {
    const { currentUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const {
        uploadFile,
        deleteImage,
        isUploading: isUploadingSingle,
        error
    } = useImageUpload({
        uploadType,
        userId: currentUser?.uid,
        roomId,
        onSuccess: (url) => {
            onImagesChange([...images, url]);
            setIsUploading(false);
        },
        onError: (error) => {
            console.error('Upload error:', error);
            setIsUploading(false);
        }
    });

    const sizeClasses = {
        sm: 'w-20 h-20',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    };

    const handleFileSelect = useCallback(async (file: File) => {
        if (disabled || images.length >= maxImages) return;

        setIsUploading(true);
        const uploadedUrl = await uploadFile(file);
        
        if (!uploadedUrl) {
            setIsUploading(false);
        }
    }, [uploadFile, images.length, maxImages, disabled]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDelete = useCallback(async (index: number) => {
        if (disabled) return;

        const imageToDelete = images[index];
        try {
            await deleteImage(imageToDelete);
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
        } catch (error) {
            console.error('Delete error:', error);
        }
    }, [images, deleteImage, onImagesChange, disabled]);

    const canAddMore = images.length < maxImages && !disabled;

    return (
        <div className={`${className}`}>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Existing Images */}
                {images.map((image, index) => (
                    <div key={index} className={`${sizeClasses[size]} relative group`}>
                        <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        
                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            disabled={disabled}
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}

                {/* Add Image Button */}
                {canAddMore && (
                    <label className={`
                        ${sizeClasses[size]}
                        border-2 border-dashed border-gray-300 rounded-lg
                        flex items-center justify-center cursor-pointer
                        hover:border-[#069B93] hover:bg-gray-50 transition-colors
                        ${isUploading || isUploadingSingle ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        <div className="text-center">
                            {isUploading || isUploadingSingle ? (
                                <div className="w-6 h-6 border-2 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <p className="text-xs text-gray-500">Add Image</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={disabled || isUploading || isUploadingSingle}
                        />
                    </label>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Image Count */}
            <p className="mt-2 text-sm text-gray-500">
                {images.length} / {maxImages} images
            </p>
        </div>
    );
};
