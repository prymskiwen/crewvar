/**
 * Storage Fallback Utilities
 * 
 * Handles cases where Firebase Storage is not available due to payment issues
 * or other configuration problems.
 */

/**
 * Check if Firebase Storage is available
 */
export const isStorageAvailable = (): boolean => {
    try {
        // Try to access storage from Firebase config
        const { storage } = require('../firebase/config');
        return storage !== null;
    } catch (error) {
        console.warn('Firebase Storage not available:', error);
        return false;
    }
};

/**
 * Create a data URL from a file as a fallback when storage is not available
 */
export const createDataUrlFallback = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Get storage status message for user display
 */
export const getStorageStatusMessage = (): string => {
    if (isStorageAvailable()) {
        return 'Storage available';
    }
    return 'Storage not available - using local preview';
};

/**
 * Check if we should show storage warnings
 */
export const shouldShowStorageWarning = (): boolean => {
    return !isStorageAvailable();
};
