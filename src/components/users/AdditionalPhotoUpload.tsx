import { useState, useRef, useCallback } from 'react';
import { uploadAdditionalPhoto, deleteFile } from '../../firebase/storage';
import { useAuth } from '../../context/AuthContextFirebase';
import { Button } from '../ui';

interface AdditionalPhotoUploadProps {
    currentPhoto?: string;
    onPhotoChange: (photoUrl: string) => void;
    onPhotoDelete: () => void;
    className?: string;
    index: number;
}

export const AdditionalPhotoUpload = ({
    currentPhoto,
    onPhotoChange,
    onPhotoDelete,
    className = '',
    index
}: AdditionalPhotoUploadProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAuth();

    const uploadPhoto = async (file: File) => {
        console.log('uploadPhoto called with:', { file: file.name, userId: currentUser?.uid, index });

        if (!currentUser?.uid) {
            console.error('User not authenticated');
            throw new Error('User not authenticated');
        }

        setIsUploading(true);
        setError(null);

        try {
            console.log('Calling uploadAdditionalPhoto...');
            const photoUrl = await uploadAdditionalPhoto(file, currentUser.uid, index);
            console.log('uploadAdditionalPhoto returned:', photoUrl);
            onPhotoChange(photoUrl);
            return photoUrl;
        } catch (error: any) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload photo');
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const deletePhoto = async () => {
        if (!currentPhoto) return;

        setIsDeleting(true);
        setError(null);

        try {
            // Delete from Firebase Storage
            await deleteFile(currentPhoto);
            onPhotoDelete();
        } catch (error: any) {
            setError(error.message || 'Failed to delete photo');
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileSelect = useCallback(async (file: File) => {
        console.log('File selected:', file.name, file.type, file.size);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, or WebP)');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Upload file with specific slot
        try {
            console.log('Starting upload for slot:', index);
            const photoUrl = await uploadPhoto(file);
            console.log('Upload successful, photo URL:', photoUrl);
            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
            setPreview(null);
        } catch (error) {
            console.error('Upload error:', error);
            // Clean up preview on error
            URL.revokeObjectURL(previewUrl);
            setPreview(null);
        }
    }, [uploadPhoto, onPhotoChange, index]);

    const handleDelete = useCallback(async () => {
        try {
            await deletePhoto();
        } catch (error) {
            console.error('Delete error:', error);
        }
    }, [deletePhoto]);

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

    const displayPhoto = preview || currentPhoto;
    const isLoading = isUploading || isDeleting;

    return (
        <div className={`relative group ${className}`}>
            <div
                className={`
                    w-full h-32 rounded-lg border-2 border-dashed 
                    cursor-pointer transition-all duration-200
                    flex items-center justify-center overflow-hidden
                    ${isDragOver
                        ? 'border-[#069B93] bg-[#069B93]/10'
                        : 'border-gray-300 hover:border-[#069B93] hover:bg-gray-50'
                    }
                    ${isLoading ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {displayPhoto ? (
                    <img
                        src={displayPhoto}
                        alt={`Additional photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                    />
                ) : (
                    <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-xs text-gray-500 font-medium">Upload Photo</p>
                        <p className="text-xs text-gray-400">Max 10MB</p>
                    </div>
                )}

                {/* Upload overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Edit icon overlay */}
                {displayPhoto && !isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all duration-200">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Delete button */}
            {displayPhoto && !isLoading && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                    variant="danger"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    title="Delete photo"
                >
                    ×
                </Button>
            )}

            {/* Error message */}
            {error && (
                <p className="text-red-500 text-xs mt-1 text-center">{String(error)}</p>
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
