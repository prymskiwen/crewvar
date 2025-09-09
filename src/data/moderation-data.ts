import { IReport, IModerationAction, ISuspiciousActivity, IModerationStats } from "../types/moderation";

// Sample Reports Data
export const sampleReports: IReport[] = [
    {
        id: "report_1",
        reporterId: "current_user",
        reportedUserId: "4",
        reportType: "spam",
        description: "User is sending multiple connection requests without any personal messages",
        evidence: ["screenshot1.png"],
        status: "pending",
        priority: "medium",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "report_2",
        reporterId: "1",
        reportedUserId: "5",
        reportType: "inappropriate_content",
        description: "Profile photo contains inappropriate content",
        evidence: ["profile_photo.png"],
        status: "under_review",
        priority: "high",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        reviewedBy: "admin_1"
    },
    {
        id: "report_3",
        reporterId: "2",
        reportedUserId: "6",
        reportType: "fake_profile",
        description: "Profile appears to be fake with stock photos and generic information",
        evidence: ["profile_analysis.pdf"],
        status: "resolved",
        priority: "medium",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        reviewedBy: "admin_1",
        resolution: "Profile removed and user banned"
    }
];

// Sample Moderation Actions Data
export const sampleModerationActions: IModerationAction[] = [
    {
        id: "action_1",
        reportId: "report_3",
        actionType: "permanent_ban",
        targetUserId: "6",
        reason: "Fake profile with misleading information",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        performedBy: "admin_1",
        isActive: true
    },
    {
        id: "action_2",
        reportId: "report_2",
        actionType: "warning",
        targetUserId: "5",
        reason: "Inappropriate profile photo",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        performedBy: "admin_1",
        isActive: true
    }
];

// Sample Suspicious Activities Data
export const sampleSuspiciousActivities: ISuspiciousActivity[] = [
    {
        id: "suspicious_1",
        userId: "7",
        activityType: "rapid_requests",
        severity: "medium",
        description: "User sent 15 connection requests in 10 minutes",
        detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        isResolved: false,
        autoActions: ["rate_limit_applied"]
    },
    {
        id: "suspicious_2",
        userId: "8",
        activityType: "fake_profile_indicators",
        severity: "high",
        description: "Profile shows signs of being fake: stock photos, generic bio, no ship assignment",
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isResolved: false,
        autoActions: ["profile_flagged"]
    }
];

// Sample Moderation Stats
export const sampleModerationStats: IModerationStats = {
    totalReports: 47,
    pendingReports: 3,
    resolvedReports: 42,
    activeBans: 2,
    suspiciousUsers: 5,
    reportsThisWeek: 8,
    averageResolutionTime: 4.5
};

// Helper Functions
export const getReportsForUser = (userId: string): IReport[] => {
    return sampleReports.filter(report => 
        report.reporterId === userId || report.reportedUserId === userId
    );
};

export const getModerationActionsForUser = (userId: string): IModerationAction[] => {
    return sampleModerationActions.filter(action => action.targetUserId === userId);
};

export const getSuspiciousActivities = (): ISuspiciousActivity[] => {
    return sampleSuspiciousActivities.filter(activity => !activity.isResolved);
};

export const getModerationStats = (): IModerationStats => {
    return sampleModerationStats;
};

export const addReport = (report: Omit<IReport, 'id' | 'createdAt' | 'updatedAt'>): IReport => {
    const newReport: IReport = {
        ...report,
        id: `report_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    sampleReports.push(newReport);
    return newReport;
};

export const updateReportStatus = (reportId: string, status: IReport['status'], resolution?: string): IReport | null => {
    const report = sampleReports.find(r => r.id === reportId);
    if (!report) return null;
    
    report.status = status;
    report.updatedAt = new Date().toISOString();
    if (resolution) report.resolution = resolution;
    
    return report;
};

export const addModerationAction = (action: Omit<IModerationAction, 'id' | 'createdAt' | 'performedBy'>): IModerationAction => {
    const newAction: IModerationAction = {
        ...action,
        id: `action_${Date.now()}`,
        createdAt: new Date().toISOString(),
        performedBy: "current_admin"
    };
    
    sampleModerationActions.push(newAction);
    return newAction;
};

export const markSuspiciousActivityResolved = (activityId: string): ISuspiciousActivity | null => {
    const activity = sampleSuspiciousActivities.find(a => a.id === activityId);
    if (!activity) return null;
    
    activity.isResolved = true;
    return activity;
};

export const detectSuspiciousActivity = (userId: string, activityType: ISuspiciousActivity['activityType'], description: string): ISuspiciousActivity => {
    const newActivity: ISuspiciousActivity = {
        id: `suspicious_${Date.now()}`,
        userId,
        activityType,
        severity: activityType === 'rapid_requests' ? 'medium' : 'high',
        description,
        detectedAt: new Date().toISOString(),
        isResolved: false,
        autoActions: []
    };
    
    sampleSuspiciousActivities.push(newActivity);
    return newActivity;
};

export const getRecentReports = (limit: number = 10): IReport[] => {
    return sampleReports
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
};

export const getReportsByStatus = (status: IReport['status']): IReport[] => {
    return sampleReports.filter(report => report.status === status);
};

export const getReportsByPriority = (priority: IReport['priority']): IReport[] => {
    return sampleReports.filter(report => report.priority === priority);
};
