/**
 * Image Utility Functions
 * 
 * Utility functions for handling images, avatars, and profile photos
 */

import { defaultAvatar } from './images';

/**
 * Get profile photo URL with fallback to default avatar
 * 
 * @param profilePhoto - User's profile photo URL
 * @param userId - User ID for fallback avatar generation
 * @returns Profile photo URL or default avatar
 */
export const getProfilePhotoUrl = (profilePhoto?: string, userId?: string): string => {
    if (profilePhoto && profilePhoto.trim() !== '') {
        return profilePhoto;
    }

    // Return default avatar if no profile photo
    return defaultAvatar;
};

/**
 * Generate avatar initials from name
 * 
 * @param name - Full name or display name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
    if (!name || name.trim() === '') {
        return 'U';
    }

    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Check if image URL is valid
 * 
 * @param url - Image URL to validate
 * @returns True if URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') {
        return false;
    }

    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
};

/**
 * Get optimized image URL with size parameters
 * 
 * @param url - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (url: string, width: number = 200, height: number = 200): string => {
    if (!isValidImageUrl(url)) {
        return defaultAvatar;
    }

    // For Firebase Storage URLs, add size parameters
    if (url.includes('firebasestorage.googleapis.com')) {
        const baseUrl = url.split('?')[0];
        return `${baseUrl}?alt=media&w=${width}&h=${height}`;
    }

    return url;
};

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image file type
 * 
 * @param file - File object to validate
 * @returns True if file is a valid image
 */
export const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
};

/**
 * Validate image file size
 * 
 * @param file - File object to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns True if file size is valid
 */
export const isValidImageSize = (file: File, maxSizeMB: number = 5): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * Compress image file
 * 
 * @param file - Image file to compress
 * @param quality - Compression quality (0-1)
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise with compressed file
 */
export const compressImage = async (
    file: File,
    quality: number = 0.8,
    maxWidth: number = 800,
    maxHeight: number = 600
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};