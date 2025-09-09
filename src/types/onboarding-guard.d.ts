// Onboarding Guard Types for Crewvar

export interface IOnboardingStatus {
    userId: string;
    isEmailVerified: boolean;
    hasProfilePhoto: boolean;
    hasDisplayName: boolean;
    hasDepartment: boolean;
    hasRole: boolean;
    hasShipAssignment: boolean;
    hasCompletedOnboarding: boolean;
    lastOnboardingUpdate: string; // ISO date string
    onboardingProgress: number; // 0-100 percentage
}

export interface IOnboardingGuard {
    onboardingStatus: IOnboardingStatus | null;
    isOnboardingComplete: boolean;
    isOnboardingRequired: boolean;
    missingRequirements: string[];
    checkOnboardingStatus: (userId: string) => Promise<IOnboardingStatus>;
    updateOnboardingProgress: (userId: string, updates: Partial<IOnboardingStatus>) => Promise<void>;
    markOnboardingComplete: (userId: string) => Promise<void>;
    getOnboardingProgress: (userId: string) => number;
    getMissingRequirements: (userId: string) => string[];
}

export interface IOnboardingRequirement {
    id: string;
    name: string;
    description: string;
    isRequired: boolean;
    isCompleted: boolean;
    priority: number; // 1 = highest priority
}

export interface IOnboardingGuardContext {
    onboardingStatus: IOnboardingStatus | null;
    isOnboardingComplete: boolean;
    isOnboardingRequired: boolean;
    missingRequirements: string[];
    checkOnboardingStatus: (userId: string) => Promise<IOnboardingStatus>;
    updateOnboardingProgress: (userId: string, updates: Partial<IOnboardingStatus>) => Promise<void>;
    markOnboardingComplete: (userId: string) => Promise<void>;
    getOnboardingProgress: (userId: string) => number;
    getMissingRequirements: (userId: string) => string[];
    requirements: IOnboardingRequirement[];
}
