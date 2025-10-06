import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
    uploadProfilePhoto, 
    uploadAdditionalPhoto, 
    uploadChatImage, 
    deleteFile,
    UploadProgress 
} from '../firebase/storage';

export type UploadType = 'profile' | 'additional' | 'chat';

export interface UseImageUploadOptions {
    uploadType: UploadType;
    userId?: string;
    roomId?: string;
    photoSlot?: number;
    maxSize?: number; // in MB
    allowedTypes?: string[];
    onSuccess?: (url: string) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: UploadProgress) => void;
}

export interface UseImageUploadReturn {
    uploadFile: (file: File) => Promise<string | null>;
    deleteImage: (url: string) => Promise<void>;
    isUploading: boolean;
    uploadProgress: number;
    error: string | null;
    clearError: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions): UseImageUploadReturn => {
    const {
        uploadType,
        userId,
        roomId,
        photoSlot,
        maxSize = 10, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
        onSuccess,
        onError,
        onProgress
    } = options;

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const validateFile = useCallback((file: File): boolean => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            const errorMsg = `Please select a valid image file. Allowed types: ${allowedTypes.join(', ')}`;
            setError(errorMsg);
            toast.error(errorMsg);
            return false;
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            const errorMsg = `File size must be less than ${maxSize}MB`;
            setError(errorMsg);
            toast.error(errorMsg);
            return false;
        }

        return true;
    }, [allowedTypes, maxSize]);

    const uploadFile = useCallback(async (file: File): Promise<string | null> => {
        if (!validateFile(file)) {
            return null;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            let downloadURL: string;

            const progressCallback = (progress: UploadProgress) => {
                const percentage = Math.round((progress.bytesTransferred / progress.totalBytes) * 100);
                setUploadProgress(percentage);
                onProgress?.(progress);
            };

            switch (uploadType) {
                case 'profile':
                    if (!userId) {
                        throw new Error('User ID is required for profile photo upload');
                    }
                    downloadURL = await uploadProfilePhoto(file, userId, progressCallback);
                    break;

                case 'additional':
                    if (!userId) {
                        throw new Error('User ID is required for additional photo upload');
                    }
                    downloadURL = await uploadAdditionalPhoto(file, userId, photoSlot, progressCallback);
                    break;

                case 'chat':
                    if (!roomId) {
                        throw new Error('Room ID is required for chat image upload');
                    }
                    downloadURL = await uploadChatImage(file, roomId, progressCallback);
                    break;

                default:
                    throw new Error(`Unknown upload type: ${uploadType}`);
            }

            setUploadProgress(100);
            onSuccess?.(downloadURL);
            toast.success('Image uploaded successfully!');
            return downloadURL;

        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMsg = error.message || 'Failed to upload image';
            setError(errorMsg);
            onError?.(error);
            toast.error(errorMsg);
            return null;
        } finally {
            setIsUploading(false);
            // Reset progress after a short delay
            setTimeout(() => setUploadProgress(0), 1000);
        }
    }, [uploadType, userId, roomId, photoSlot, validateFile, onSuccess, onError, onProgress]);

    const deleteImage = useCallback(async (url: string): Promise<void> => {
        try {
            await deleteFile(url);
            toast.success('Image deleted successfully!');
        } catch (error: any) {
            console.error('Delete error:', error);
            const errorMsg = error.message || 'Failed to delete image';
            setError(errorMsg);
            onError?.(error);
            toast.error(errorMsg);
        }
    }, [onError]);

    return {
        uploadFile,
        deleteImage,
        isUploading,
        uploadProgress,
        error,
        clearError
    };
};
