// Privacy and Security Types for Crewvar

export interface IPrivacySettings {
    userId: string;
    isVerified: boolean;
    isActive: boolean;
    showOnlyTodayShip: boolean;
    allowFutureShipVisibility: boolean;
    declineRequestsSilently: boolean;
    blockEnforcesInvisibility: boolean;
    lastActiveDate: string; // YYYY-MM-DD format
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDate?: string;
}

export interface IBlockedUser {
    id: string;
    blockedUserId: string;
    blockedByUserId: string;
    blockedAt: string;
    reason?: string;
    isMutual: boolean; // Both users are invisible to each other
}

export interface IDeclineCooldown {
    userId: string;
    declinedUserId: string;
    declinedAt: string;
    cooldownUntil: string; // When they can send another request
    cooldownDuration: number; // Hours
}

export interface IPrivacyContext {
    privacySettings: IPrivacySettings;
    blockedUsers: IBlockedUser[];
    declineCooldowns: IDeclineCooldown[];
    isUserVerified: (userId: string) => boolean;
    isUserActive: (userId: string) => boolean;
    canUserSeeRoster: (userId: string, targetUserId: string) => boolean;
    canUserSeeFutureShips: (userId: string, targetUserId: string) => boolean;
    isUserBlocked: (userId: string, targetUserId: string) => boolean;
    isInDeclineCooldown: (userId: string, targetUserId: string) => boolean;
    blockUser: (targetUserId: string, reason?: string) => Promise<void>;
    unblockUser: (targetUserId: string) => Promise<void>;
    declineRequestSilently: (targetUserId: string) => Promise<void>;
    updatePrivacySettings: (settings: Partial<IPrivacySettings>) => Promise<void>;
    verifyUser: (userId: string) => Promise<void>;
    deactivateUser: (userId: string) => Promise<void>;
}

export interface IRowLevelSecurity {
    userId: string;
    canAccess: (resource: string, targetUserId: string) => boolean;
    canViewProfile: (targetUserId: string) => boolean;
    canSendRequest: (targetUserId: string) => boolean;
    canSeeShipAssignment: (targetUserId: string) => boolean;
    canSeeContactInfo: (targetUserId: string) => boolean;
}
