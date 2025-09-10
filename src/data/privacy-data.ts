import { IPrivacySettings, IBlockedUser, IDeclineCooldown } from "../types/privacy";

// Sample Privacy Settings Data
export const samplePrivacySettings: IPrivacySettings[] = [
    {
        userId: "current_user",
        isVerified: true,
        isActive: true,
        showOnlyTodayShip: true,
        allowFutureShipVisibility: false,
        declineRequestsSilently: true,
        blockEnforcesInvisibility: true,
        lastActiveDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'verified',
        verificationDate: new Date().toISOString().split('T')[0]
    },
    {
        userId: "1", // Sarah Johnson
        isVerified: true,
        isActive: true,
        showOnlyTodayShip: true,
        allowFutureShipVisibility: false,
        declineRequestsSilently: true,
        blockEnforcesInvisibility: true,
        lastActiveDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'verified',
        verificationDate: new Date().toISOString().split('T')[0]
    },
    {
        userId: "2", // Mike Rodriguez
        isVerified: false,
        isActive: true,
        showOnlyTodayShip: true,
        allowFutureShipVisibility: false,
        declineRequestsSilently: true,
        blockEnforcesInvisibility: true,
        lastActiveDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'pending'
    },
    {
        userId: "3", // Emma Thompson
        isVerified: true,
        isActive: false,
        showOnlyTodayShip: true,
        allowFutureShipVisibility: false,
        declineRequestsSilently: true,
        blockEnforcesInvisibility: true,
        lastActiveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        verificationStatus: 'verified',
        verificationDate: new Date().toISOString().split('T')[0]
    }
];

// Sample Blocked Users Data
export const sampleBlockedUsers: IBlockedUser[] = [
    {
        id: "block_1",
        blockedUserId: "4",
        blockedByUserId: "current_user",
        blockedAt: new Date().toISOString(),
        reason: "Inappropriate behavior",
        isMutual: true
    }
];

// Sample Decline Cooldowns Data
export const sampleDeclineCooldowns: IDeclineCooldown[] = [
    {
        userId: "5",
        declinedUserId: "current_user",
        declinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        cooldownUntil: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
        cooldownDuration: 24
    }
];

// Helper Functions
export const getPrivacySettings = (userId: string): IPrivacySettings | null => {
    return samplePrivacySettings.find(settings => settings.userId === userId) || null;
};

export const getBlockedUsers = (userId: string): IBlockedUser[] => {
    return sampleBlockedUsers.filter(block => 
        block.blockedByUserId === userId || block.blockedUserId === userId
    );
};

export const getDeclineCooldowns = (userId: string): IDeclineCooldown[] => {
    return sampleDeclineCooldowns.filter(cooldown => 
        cooldown.userId === userId || cooldown.declinedUserId === userId
    );
};

export const isUserBlocked = (userId: string, targetUserId: string): boolean => {
    return sampleBlockedUsers.some(block => 
        (block.blockedByUserId === userId && block.blockedUserId === targetUserId) ||
        (block.blockedByUserId === targetUserId && block.blockedUserId === userId)
    );
};

export const isInDeclineCooldown = (userId: string, targetUserId: string): boolean => {
    const cooldown = sampleDeclineCooldowns.find(c => 
        c.userId === userId && c.declinedUserId === targetUserId
    );
    
    if (!cooldown) return false;
    
    return new Date() < new Date(cooldown.cooldownUntil);
};

export const canUserSeeRoster = (userId: string, targetUserId: string): boolean => {
    const userSettings = getPrivacySettings(userId);
    const targetSettings = getPrivacySettings(targetUserId);
    
    if (!userSettings || !targetSettings) return false;
    
    // Only verified active profiles can see other crew members
    if (!userSettings.isVerified || !userSettings.isActive) return false;
    if (!targetSettings.isVerified || !targetSettings.isActive) return false;
    
    // Check if users are blocked
    if (isUserBlocked(userId, targetUserId)) return false;
    
    return true;
};

export const canUserSeeFutureShips = (userId: string, targetUserId: string): boolean => {
    const userSettings = getPrivacySettings(userId);
    const targetSettings = getPrivacySettings(targetUserId);
    
    if (!userSettings || !targetSettings) return false;
    
    // Calendar shows only today; future hidden
    if (!userSettings.allowFutureShipVisibility) return false;
    if (!targetSettings.allowFutureShipVisibility) return false;
    
    return canUserSeeRoster(userId, targetUserId);
};

export const canUserSeeTodayShip = (userId: string, targetUserId: string): boolean => {
    const userSettings = getPrivacySettings(userId);
    const targetSettings = getPrivacySettings(targetUserId);
    
    if (!userSettings || !targetSettings) return false;
    
    // Only show today's ship
    if (!userSettings.showOnlyTodayShip) return false;
    if (!targetSettings.showOnlyTodayShip) return false;
    
    return canUserSeeRoster(userId, targetUserId);
};

export const addBlockedUser = (blockedByUserId: string, blockedUserId: string, reason?: string): IBlockedUser => {
    const newBlock: IBlockedUser = {
        id: `block_${Date.now()}`,
        blockedUserId,
        blockedByUserId,
        blockedAt: new Date().toISOString(),
        reason,
        isMutual: true // Block enforces invisibility both ways
    };
    
    sampleBlockedUsers.push(newBlock);
    return newBlock;
};

export const removeBlockedUser = (blockedByUserId: string, blockedUserId: string): void => {
    const index = sampleBlockedUsers.findIndex(block => 
        block.blockedByUserId === blockedByUserId && block.blockedUserId === blockedUserId
    );
    
    if (index > -1) {
        sampleBlockedUsers.splice(index, 1);
    }
};

export const addDeclineCooldown = (userId: string, declinedUserId: string, cooldownHours: number = 24): IDeclineCooldown => {
    const newCooldown: IDeclineCooldown = {
        userId,
        declinedUserId,
        declinedAt: new Date().toISOString(),
        cooldownUntil: new Date(Date.now() + cooldownHours * 60 * 60 * 1000).toISOString(),
        cooldownDuration: cooldownHours
    };
    
    sampleDeclineCooldowns.push(newCooldown);
    return newCooldown;
};

export const removeDeclineCooldown = (userId: string, declinedUserId: string): void => {
    const index = sampleDeclineCooldowns.findIndex(cooldown => 
        cooldown.userId === userId && cooldown.declinedUserId === declinedUserId
    );
    
    if (index > -1) {
        sampleDeclineCooldowns.splice(index, 1);
    }
};

export const verifyUser = (userId: string): void => {
    const settings = getPrivacySettings(userId);
    if (settings) {
        settings.isVerified = true;
        settings.verificationStatus = 'verified';
        settings.verificationDate = new Date().toISOString().split('T')[0];
    }
};

export const deactivateUser = (userId: string): void => {
    const settings = getPrivacySettings(userId);
    if (settings) {
        settings.isActive = false;
        settings.lastActiveDate = new Date().toISOString().split('T')[0];
    }
};
