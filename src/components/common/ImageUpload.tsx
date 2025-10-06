import React, { useState, useCallback, useRef } from 'react';
import { useImageUpload, UploadType } from '../../hooks/useImageUpload';
import { useAuth } from '../../context/AuthContextFirebase';

interface ImageUploadProps {
    uploadType: UploadType;
    roomId?: string;
    photoSlot?: number;
    currentImage?: string | null;
    onImageChange: (url: string | null) => void;
    onImageDelete?: () => void;
    className?: string;
    variant?: 'avatar' | 'card' | 'banner' | 'gallery';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showProgress?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
    placeholder?: string;
    disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    uploadType,
    roomId,
    photoSlot,
    currentImage,
    onImageChange,
    onImageDelete,
    className = '',
    variant = 'card',
    size = 'md',
    showProgress = true,
    maxSize = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    placeholder = 'Click to upload image',
    disabled = false
}) => {
    const { currentUser } = useAuth();
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        uploadFile,
        deleteImage,
        isUploading,
        uploadProgress,
        error,
        clearError
    } = useImageUpload({
        uploadType,
        userId: currentUser?.uid,
        roomId,
        photoSlot,
        maxSize,
        allowedTypes,
        onSuccess: (url) => {
            onImageChange(url);
            setPreview(null);
        },
        onError: (error) => {
            console.error('Upload error:', error);
        },
        onProgress: (_progress) => {
            // Progress is handled by the hook
        }
    });

    const sizeClasses = {
        sm: {
            container: 'w-16 h-16',
            icon: 'w-6 h-6',
            text: 'text-xs'
        },
        md: {
            container: 'w-24 h-24',
            icon: 'w-8 h-8',
            text: 'text-sm'
        },
        lg: {
            container: 'w-32 h-32',
            icon: 'w-10 h-10',
            text: 'text-base'
        },
        xl: {
            container: 'w-40 h-40',
            icon: 'w-12 h-12',
            text: 'text-lg'
        }
    };

    const variantClasses = {
        avatar: 'rounded-full',
        card: 'rounded-lg',
        banner: 'rounded-lg',
        gallery: 'rounded-lg'
    };

    const handleFileSelect = useCallback(async (file: File) => {
        if (disabled) return;

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Upload file
        const uploadedUrl = await uploadFile(file);
        
        if (uploadedUrl) {
            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
            setPreview(null);
        } else {
            // Clean up preview on error
            URL.revokeObjectURL(previewUrl);
            setPreview(null);
        }
    }, [uploadFile, disabled]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect, disabled]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDelete = useCallback(async () => {
        if (currentImage) {
            try {
                await deleteImage(currentImage);
                onImageChange(null);
                onImageDelete?.();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    }, [currentImage, deleteImage, onImageChange, onImageDelete]);

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const displayImage = preview || currentImage;
    const sizeConfig = sizeClasses[size];

    return (
        <div className={`${className}`}>
            <div
                className={`
                    ${sizeConfig.container}
                    ${variantClasses[variant]}
                    ${isDragOver ? 'border-[#069B93] bg-[#069B93]/10' : 'border-gray-300'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#069B93] hover:bg-gray-50'}
                    border-2 border-dashed transition-all duration-200 flex items-center justify-center relative overflow-hidden
                `}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={allowedTypes.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled}
                />

                {displayImage ? (
                    <div className="relative w-full h-full group">
                        <img
                            src={displayImage}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick();
                                    }}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                    disabled={disabled}
                                >
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                
                                {currentImage && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete();
                                        }}
                                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                        disabled={disabled}
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                        <svg className={`${sizeConfig.icon} text-gray-400 mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className={`${sizeConfig.text} text-gray-500 font-medium`}>
                            {placeholder}
                        </p>
                        {!disabled && (
                            <p className="text-xs text-gray-400 mt-1">
                                Max {maxSize}MB
                            </p>
                        )}
                    </div>
                )}

                {/* Upload Progress */}
                {isUploading && showProgress && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 text-center">
                            <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-700">Uploading... {uploadProgress}%</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={clearError}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
};
