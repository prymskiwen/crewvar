import { IOnboardingStatus, IOnboardingRequirement } from "../types/onboarding-guard";

// Sample Onboarding Status Data
export const sampleOnboardingStatuses: IOnboardingStatus[] = [
    {
        userId: "current_user",
        isEmailVerified: true,
        hasProfilePhoto: false,
        hasDisplayName: false,
        hasDepartment: false,
        hasRole: false,
        hasShipAssignment: false,
        hasCompletedOnboarding: false,
        lastOnboardingUpdate: new Date().toISOString(),
        onboardingProgress: 0
    },
    {
        userId: "1", // Sarah Johnson
        isEmailVerified: true,
        hasProfilePhoto: true,
        hasDisplayName: true,
        hasDepartment: true,
        hasRole: true,
        hasShipAssignment: true,
        hasCompletedOnboarding: true,
        lastOnboardingUpdate: new Date().toISOString(),
        onboardingProgress: 100
    },
    {
        userId: "2", // Mike Rodriguez
        isEmailVerified: false,
        hasProfilePhoto: true,
        hasDisplayName: true,
        hasDepartment: false,
        hasRole: false,
        hasShipAssignment: false,
        hasCompletedOnboarding: false,
        lastOnboardingUpdate: new Date().toISOString(),
        onboardingProgress: 20
    }
];

// Onboarding Requirements Configuration
export const onboardingRequirements: IOnboardingRequirement[] = [
    {
        id: "email_verification",
        name: "Email Verification",
        description: "Verify your email address to ensure account security",
        isRequired: true,
        isCompleted: false,
        priority: 1
    },
    {
        id: "profile_photo",
        name: "Profile Photo",
        description: "Add a profile photo so other crew members can recognize you",
        isRequired: true,
        isCompleted: false,
        priority: 2
    },
    {
        id: "display_name",
        name: "Display Name",
        description: "Set your display name as it will appear to other crew members",
        isRequired: true,
        isCompleted: false,
        priority: 3
    },
    {
        id: "department",
        name: "Department",
        description: "Select your department (Food & Beverage, Entertainment, etc.)",
        isRequired: true,
        isCompleted: false,
        priority: 4
    },
    {
        id: "role",
        name: "Role",
        description: "Specify your specific role within your department",
        isRequired: true,
        isCompleted: false,
        priority: 5
    },
    {
        id: "ship_assignment",
        name: "Current Ship",
        description: "Select your current ship assignment",
        isRequired: true,
        isCompleted: false,
        priority: 6
    }
];

// Helper Functions
export const getOnboardingStatus = (userId: string): IOnboardingStatus | null => {
    return sampleOnboardingStatuses.find(status => status.userId === userId) || null;
};

export const calculateOnboardingProgress = (status: IOnboardingStatus): number => {
    const requirements = [
        status.isEmailVerified,
        status.hasProfilePhoto,
        status.hasDisplayName,
        status.hasDepartment,
        status.hasRole,
        status.hasShipAssignment
    ];
    
    const completedCount = requirements.filter(Boolean).length;
    return Math.round((completedCount / requirements.length) * 100);
};

export const getMissingRequirements = (status: IOnboardingStatus): string[] => {
    const missing: string[] = [];
    
    if (!status.isEmailVerified) missing.push("Email Verification");
    if (!status.hasProfilePhoto) missing.push("Profile Photo");
    if (!status.hasDisplayName) missing.push("Display Name");
    if (!status.hasDepartment) missing.push("Department");
    if (!status.hasRole) missing.push("Role");
    if (!status.hasShipAssignment) missing.push("Current Ship");
    
    return missing;
};

export const isOnboardingComplete = (status: IOnboardingStatus): boolean => {
    return status.hasCompletedOnboarding && 
           status.isEmailVerified &&
           status.hasProfilePhoto &&
           status.hasDisplayName &&
           status.hasDepartment &&
           status.hasRole &&
           status.hasShipAssignment;
};

export const isOnboardingRequired = (status: IOnboardingStatus): boolean => {
    return !isOnboardingComplete(status);
};

export const updateOnboardingStatus = (userId: string, updates: Partial<IOnboardingStatus>): IOnboardingStatus => {
    const existingStatus = getOnboardingStatus(userId);
    
    if (!existingStatus) {
        // Create new status if doesn't exist
        const newStatus: IOnboardingStatus = {
            userId,
            isEmailVerified: false,
            hasProfilePhoto: false,
            hasDisplayName: false,
            hasDepartment: false,
            hasRole: false,
            hasShipAssignment: false,
            hasCompletedOnboarding: false,
            lastOnboardingUpdate: new Date().toISOString(),
            onboardingProgress: 0,
            ...updates
        };
        
        newStatus.onboardingProgress = calculateOnboardingProgress(newStatus);
        sampleOnboardingStatuses.push(newStatus);
        return newStatus;
    }
    
    // Update existing status
    const updatedStatus = {
        ...existingStatus,
        ...updates,
        lastOnboardingUpdate: new Date().toISOString()
    };
    
    updatedStatus.onboardingProgress = calculateOnboardingProgress(updatedStatus);
    
    // Update in array
    const index = sampleOnboardingStatuses.findIndex(s => s.userId === userId);
    if (index > -1) {
        sampleOnboardingStatuses[index] = updatedStatus;
    }
    
    return updatedStatus;
};

export const markOnboardingComplete = (userId: string): IOnboardingStatus => {
    return updateOnboardingStatus(userId, {
        hasCompletedOnboarding: true,
        onboardingProgress: 100
    });
};

export const getRequirementsWithStatus = (userId: string): IOnboardingRequirement[] => {
    const status = getOnboardingStatus(userId);
    if (!status) return onboardingRequirements;
    
    return onboardingRequirements.map(req => ({
        ...req,
        isCompleted: (() => {
            switch (req.id) {
                case 'email_verification': return status.isEmailVerified;
                case 'profile_photo': return status.hasProfilePhoto;
                case 'display_name': return status.hasDisplayName;
                case 'department': return status.hasDepartment;
                case 'role': return status.hasRole;
                case 'ship_assignment': return status.hasShipAssignment;
                default: return false;
            }
        })()
    }));
};
