/**
 * Image Assets and Utilities
 * 
 * Centralized image imports and utilities for consistent usage across the app
 */

// Default avatar image
import defaultAvatar from "../assets/images/Home/default-avatar.webp";

// Export default avatar
export { defaultAvatar };

// Default avatar URL for fallback
export const DEFAULT_AVATAR_URL = defaultAvatar;

// Image placeholder for loading states
export const IMAGE_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+";

// Common image sizes
export const IMAGE_SIZES = {
    AVATAR_SM: 32,
    AVATAR_MD: 48,
    AVATAR_LG: 64,
    AVATAR_XL: 96,
    PROFILE_SM: 100,
    PROFILE_MD: 150,
    PROFILE_LG: 200,
    THUMBNAIL: 300,
    COVER: 400,
} as const;

// Image quality settings
export const IMAGE_QUALITY = {
    LOW: 0.6,
    MEDIUM: 0.8,
    HIGH: 0.9,
    MAX: 1.0,
} as const;
