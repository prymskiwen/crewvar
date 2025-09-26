/**
 * User type definitions
 */

export interface IUser {
    id: string;
    email: string;
    fullName: string;
    role: "USER" | "ADMIN";
    avatar?: string | Blob;
    socialMedia?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        snapchat?: string;
        website?: string;
    };
}

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    profilePhoto?: string;
    bio?: string;
    phone?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    website?: string;
    departmentId?: string;
    roleId?: string;
    currentShipId?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    isAdmin: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}