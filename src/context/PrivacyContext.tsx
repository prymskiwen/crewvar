import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IPrivacySettings, IBlockedUser, IDeclineCooldown, IPrivacyContext } from "../types/privacy";
import { 
    getPrivacySettings, 
    getBlockedUsers, 
    getDeclineCooldowns,
    isUserBlocked,
    isInDeclineCooldown,
    canUserSeeRoster,
    canUserSeeFutureShips,
    addBlockedUser,
    removeBlockedUser,
    addDeclineCooldown,
    verifyUser,
    deactivateUser
} from "../data/privacy-data";

const PrivacyContext = createContext<IPrivacyContext | undefined>(undefined);

export const usePrivacy = () => {
    const context = useContext(PrivacyContext);
    if (context === undefined) {
        throw new Error('usePrivacy must be used within a PrivacyProvider');
    }
    return context;
};

interface PrivacyProviderProps {
    children: ReactNode;
}

export const PrivacyProvider = ({ children }: PrivacyProviderProps) => {
    const [privacySettings, setPrivacySettings] = useState<IPrivacySettings | null>(null);
    const [blockedUsers, setBlockedUsers] = useState<IBlockedUser[]>([]);
    const [declineCooldowns, setDeclineCooldowns] = useState<IDeclineCooldown[]>([]);

    // Load initial privacy data
    useEffect(() => {
        const userId = "current_user";
        setPrivacySettings(getPrivacySettings(userId));
        setBlockedUsers(getBlockedUsers(userId));
        setDeclineCooldowns(getDeclineCooldowns(userId));
    }, []);

    const isUserVerified = (userId: string): boolean => {
        const settings = getPrivacySettings(userId);
        return settings?.isVerified || false;
    };

    const isUserActive = (userId: string): boolean => {
        const settings = getPrivacySettings(userId);
        return settings?.isActive || false;
    };

    const canUserSeeRosterCheck = (userId: string, targetUserId: string): boolean => {
        return canUserSeeRoster(userId, targetUserId);
    };

    const canUserSeeFutureShipsCheck = (userId: string, targetUserId: string): boolean => {
        return canUserSeeFutureShips(userId, targetUserId);
    };

    const isUserBlockedCheck = (userId: string, targetUserId: string): boolean => {
        return isUserBlocked(userId, targetUserId);
    };

    const isInDeclineCooldownCheck = (userId: string, targetUserId: string): boolean => {
        return isInDeclineCooldown(userId, targetUserId);
    };

    const blockUser = async (targetUserId: string, reason?: string): Promise<void> => {
        try {
            const userId = "current_user";
            const newBlock = addBlockedUser(userId, targetUserId, reason);
            setBlockedUsers(prev => [...prev, newBlock]);
            console.log(`Blocked user ${targetUserId}`, reason ? `with reason: "${reason}"` : '');
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const unblockUser = async (targetUserId: string): Promise<void> => {
        try {
            const userId = "current_user";
            removeBlockedUser(userId, targetUserId);
            setBlockedUsers(prev => prev.filter(block => 
                !(block.blockedByUserId === userId && block.blockedUserId === targetUserId)
            ));
            console.log(`Unblocked user ${targetUserId}`);
        } catch (error) {
            console.error('Failed to unblock user:', error);
        }
    };

    const declineRequestSilently = async (targetUserId: string): Promise<void> => {
        try {
            const userId = "current_user";
            const cooldown = addDeclineCooldown(targetUserId, userId, 24); // 24 hour cooldown
            setDeclineCooldowns(prev => [...prev, cooldown]);
            console.log(`Declined request from ${targetUserId} silently (24h cooldown)`);
        } catch (error) {
            console.error('Failed to decline request silently:', error);
        }
    };

    const updatePrivacySettings = async (settings: Partial<IPrivacySettings>): Promise<void> => {
        try {
            if (privacySettings) {
                const updatedSettings = { ...privacySettings, ...settings };
                setPrivacySettings(updatedSettings);
                console.log('Privacy settings updated:', updatedSettings);
            }
        } catch (error) {
            console.error('Failed to update privacy settings:', error);
        }
    };

    const verifyUserAccount = async (userId: string): Promise<void> => {
        try {
            verifyUser(userId);
            if (privacySettings && privacySettings.userId === userId) {
                setPrivacySettings(prev => prev ? { ...prev, isVerified: true, verificationStatus: 'verified' } : null);
            }
            console.log(`User ${userId} verified`);
        } catch (error) {
            console.error('Failed to verify user:', error);
        }
    };

    const deactivateUserAccount = async (userId: string): Promise<void> => {
        try {
            deactivateUser(userId);
            if (privacySettings && privacySettings.userId === userId) {
                setPrivacySettings(prev => prev ? { ...prev, isActive: false } : null);
            }
            console.log(`User ${userId} deactivated`);
        } catch (error) {
            console.error('Failed to deactivate user:', error);
        }
    };

    const value: IPrivacyContext = {
        privacySettings: privacySettings || {
            userId: "current_user",
            isVerified: false,
            isActive: false,
            showOnlyTodayShip: true,
            allowFutureShipVisibility: false,
            declineRequestsSilently: true,
            blockEnforcesInvisibility: true,
            lastActiveDate: new Date().toISOString().split('T')[0],
            verificationStatus: 'pending'
        },
        blockedUsers,
        declineCooldowns,
        isUserVerified,
        isUserActive,
        canUserSeeRoster: canUserSeeRosterCheck,
        canUserSeeFutureShips: canUserSeeFutureShipsCheck,
        isUserBlocked: isUserBlockedCheck,
        isInDeclineCooldown: isInDeclineCooldownCheck,
        blockUser,
        unblockUser,
        declineRequestSilently,
        updatePrivacySettings,
        verifyUser: verifyUserAccount,
        deactivateUser: deactivateUserAccount
    };

    return (
        <PrivacyContext.Provider value={value}>
            {children}
        </PrivacyContext.Provider>
    );
};
