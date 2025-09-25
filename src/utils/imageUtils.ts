import { defaultAvatar } from './images';

/**
 * Constructs a full URL for profile photos from the backend
 * @param photoUrl - The photo URL from the database (can be relative or absolute)
 * @returns Full URL for the image or defaultAvatar if no photo
 */
export const getProfilePhotoUrl = (photoUrl: string | null | undefined): string => {
    if (!photoUrl) return defaultAvatar;
    if (photoUrl.startsWith('http')) return photoUrl; // Already a full URL
    if (photoUrl.startsWith('/uploads/')) {
        // Construct full URL using the API base URL
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return `${baseUrl}${photoUrl}`;
    }
    return photoUrl; // Fallback for other formats
};

/**
 * Constructs a full URL for any image from the backend
 * @param imageUrl - The image URL from the database (can be relative or absolute)
 * @returns Full URL for the image or null if no image
 */
export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl; // Already a full URL
    if (imageUrl.startsWith('/uploads/')) {
        // Construct full URL using the API base URL
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return `${baseUrl}${imageUrl}`;
    }
    return imageUrl; // Fallback for other formats
};
