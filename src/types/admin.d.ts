/**
 * Admin type definitions
 */

export interface IAdminStats {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalConnections: number;
    totalMessages: number;
    reportsCount: number;
    supportTickets: number;
}

export interface IUser {
    id: string;
    email: string;
    displayName: string;
    profilePhoto?: string;
    isActive: boolean;
    isAdmin: boolean;
    isEmailVerified: boolean;
    createdAt: Date | string;
    lastLogin?: Date | string;
}

export interface IReport {
    id: string;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string;
    status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ISupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: Date | string;
    updatedAt: Date | string;
}
