/**
 * Firestore utility functions
 */

/**
 * Removes undefined values from an object to prevent Firestore errors
 * @param obj - Object to clean
 * @returns Object with undefined values removed
 */
export const cleanFirestoreData = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(cleanFirestoreData);
    }

    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                cleaned[key] = cleanFirestoreData(value);
            }
        }
        return cleaned;
    }

    return obj;
};

/**
 * Validates that required fields are present and not undefined
 * @param data - Data to validate
 * @param requiredFields - Array of required field names
 * @throws Error if any required field is missing or undefined
 */
export const validateRequiredFields = (data: any, requiredFields: string[]): void => {
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
            throw new Error(`Required field '${field}' is missing or undefined`);
        }
    }
};

/**
 * Creates a safe user profile object for Firestore
 * @param profileData - Raw profile data
 * @returns Cleaned profile data safe for Firestore
 */
export const createSafeUserProfile = (profileData: any) => {
    const cleaned = cleanFirestoreData(profileData);

    // Ensure required fields have default values
    return {
        ...cleaned,
        isActive: cleaned.isActive ?? true,
        isAdmin: cleaned.isAdmin ?? false,
        isEmailVerified: cleaned.isEmailVerified ?? false,
        createdAt: cleaned.createdAt || new Date(),
        updatedAt: new Date()
    };
};
