import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IOnboardingStatus, IOnboardingRequirement, IOnboardingGuardContext } from "../types/onboarding-guard";
import { 
    getOnboardingStatus,
    updateOnboardingStatus,
    isOnboardingComplete,
    isOnboardingRequired,
    getRequirementsWithStatus
} from "../data/onboarding-guard-data";

const OnboardingGuardContext = createContext<IOnboardingGuardContext | undefined>(undefined);

export const useOnboardingGuard = () => {
    const context = useContext(OnboardingGuardContext);
    if (context === undefined) {
        throw new Error('useOnboardingGuard must be used within an OnboardingGuardProvider');
    }
    return context;
};

interface OnboardingGuardProviderProps {
    children: ReactNode;
}

export const OnboardingGuardProvider = ({ children }: OnboardingGuardProviderProps) => {
    const [onboardingStatus, setOnboardingStatus] = useState<IOnboardingStatus | null>(null);
    const [requirements, setRequirements] = useState<IOnboardingRequirement[]>([]);

    // Load initial onboarding status
    useEffect(() => {
        const userId = "current_user";
        const status = getOnboardingStatus(userId);
        setOnboardingStatus(status);
        setRequirements(getRequirementsWithStatus(userId));
    }, []);

    const checkOnboardingStatus = async (userId: string): Promise<IOnboardingStatus> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const status = getOnboardingStatus(userId);
            if (status) {
                setOnboardingStatus(status);
                setRequirements(getRequirementsWithStatus(userId));
                return status;
            }
            
            // Create new status if doesn't exist
            const newStatus = updateOnboardingStatus(userId, {});
            setOnboardingStatus(newStatus);
            setRequirements(getRequirementsWithStatus(userId));
            return newStatus;
        } catch (error) {
            console.error('Failed to check onboarding status:', error);
            throw error;
        }
    };

    const updateOnboardingProgress = async (userId: string, updates: Partial<IOnboardingStatus>): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedStatus = updateOnboardingStatus(userId, updates);
            setOnboardingStatus(updatedStatus);
            setRequirements(getRequirementsWithStatus(userId));
            
            console.log('Onboarding progress updated:', updatedStatus);
        } catch (error) {
            console.error('Failed to update onboarding progress:', error);
            throw error;
        }
    };

    const markOnboardingComplete = async (userId: string): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const completedStatus = {
                ...onboardingStatus!,
                onboardingComplete: true,
                onboardingProgress: 100,
                completedAt: new Date().toISOString()
            };
            setOnboardingStatus(completedStatus);
            setRequirements(getRequirementsWithStatus("current_user"));
            
            console.log('Onboarding marked as complete for user:', userId);
        } catch (error) {
            console.error('Failed to mark onboarding complete:', error);
            throw error;
        }
    };

    const getOnboardingProgress = (userId: string): number => {
        const status = getOnboardingStatus(userId);
        return status ? status.onboardingProgress : 0;
    };

    const getMissingRequirements = (userId: string): string[] => {
        const status = getOnboardingStatus(userId);
        if (!status) return [];
        
        const requirements = getRequirementsWithStatus(userId);
        return requirements.filter(req => !req.isCompleted).map(req => req.name);
    };

    const value: IOnboardingGuardContext = {
        onboardingStatus,
        isOnboardingComplete: onboardingStatus ? isOnboardingComplete(onboardingStatus) : false,
        isOnboardingRequired: onboardingStatus ? isOnboardingRequired(onboardingStatus) : true,
        missingRequirements: onboardingStatus ? getMissingRequirements("current_user") : [],
        checkOnboardingStatus,
        updateOnboardingProgress,
        markOnboardingComplete,
        getOnboardingProgress,
        getMissingRequirements,
        requirements
    };

    return (
        <OnboardingGuardContext.Provider value={value}>
            {children}
        </OnboardingGuardContext.Provider>
    );
};
