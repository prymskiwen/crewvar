import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IReport, IModerationAction, ISuspiciousActivity, IModerationStats, IModerationContext } from "../types/moderation";
import { 
    sampleReports,
    sampleModerationActions,
    sampleSuspiciousActivities,
    sampleModerationStats,
    addReport,
    addModerationAction
} from "../data/moderation-data";

const ModerationContext = createContext<IModerationContext | undefined>(undefined);

export const useModeration = () => {
    const context = useContext(ModerationContext);
    if (context === undefined) {
        throw new Error('useModeration must be used within a ModerationProvider');
    }
    return context;
};

interface ModerationProviderProps {
    children: ReactNode;
}

export const ModerationProvider = ({ children }: ModerationProviderProps) => {
    const [reports, setReports] = useState<IReport[]>(sampleReports);
    const [moderationActions, setModerationActions] = useState<IModerationAction[]>(sampleModerationActions);
    const [suspiciousActivities, setSuspiciousActivities] = useState<ISuspiciousActivity[]>(sampleSuspiciousActivities);
    const [stats, setStats] = useState<IModerationStats>(sampleModerationStats);
    const [isAdmin] = useState(true); // In real app, this would come from auth context

    // Load initial data
    useEffect(() => {
        setReports(sampleReports);
        setModerationActions(sampleModerationActions);
        setSuspiciousActivities(sampleSuspiciousActivities);
        setStats(sampleModerationStats);
    }, []);

    const submitReport = async (reportData: Omit<IReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newReport = addReport({
                ...reportData,
                status: 'pending'
            });
            
            setReports(prev => [...prev, newReport]);
            
            // Update stats
            setStats(prev => ({
                ...prev,
                totalReports: prev.totalReports + 1,
                pendingReports: prev.pendingReports + 1,
                reportsThisWeek: prev.reportsThisWeek + 1
            }));
            
            console.log('Report submitted successfully:', newReport);
        } catch (error) {
            console.error('Failed to submit report:', error);
            throw error;
        }
    };

    const updateReportStatus = async (reportId: string, status: IReport['status'], resolution?: string): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update report in local state
            setReports(prev => prev.map(report => {
                if (report.id === reportId) {
                    return {
                        ...report,
                        status,
                        updatedAt: new Date().toISOString(),
                        resolution: resolution || report.resolution
                    };
                }
                return report;
            }));
            
            // Update stats
            setStats(prev => ({
                ...prev,
                pendingReports: status === 'pending' ? prev.pendingReports + 1 : prev.pendingReports - 1,
                resolvedReports: status === 'resolved' ? prev.resolvedReports + 1 : prev.resolvedReports
            }));
            
            console.log('Report status updated');
        } catch (error) {
            console.error('Failed to update report status:', error);
            throw error;
        }
    };

    const performModerationAction = async (actionData: Omit<IModerationAction, 'id' | 'createdAt' | 'performedBy'>): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newAction = addModerationAction(actionData);
            setModerationActions(prev => [...prev, newAction]);
            
            // Update stats based on action type
            if (actionData.actionType === 'permanent_ban' || actionData.actionType === 'temporary_ban') {
                setStats(prev => ({
                    ...prev,
                    activeBans: prev.activeBans + 1
                }));
            }
            
            console.log('Moderation action performed:', newAction);
        } catch (error) {
            console.error('Failed to perform moderation action:', error);
            throw error;
        }
    };

    const getReportsForUser = (userId: string): IReport[] => {
        return reports.filter(report => 
            report.reporterId === userId || report.reportedUserId === userId
        );
    };

    const getModerationActionsForUser = (userId: string): IModerationAction[] => {
        return moderationActions.filter(action => action.targetUserId === userId);
    };

    const getSuspiciousActivities = (): ISuspiciousActivity[] => {
        return suspiciousActivities.filter(activity => !activity.isResolved);
    };

    const getModerationStats = (): IModerationStats => {
        return stats;
    };

    const markSuspiciousActivityResolved = async (activityId: string): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update suspicious activity in local state
            setSuspiciousActivities(prev => prev.map(activity => {
                if (activity.id === activityId) {
                    return {
                        ...activity,
                        isResolved: true
                    };
                }
                return activity;
            }));
            
            // Update stats
            setStats(prev => ({
                ...prev,
                suspiciousUsers: Math.max(0, prev.suspiciousUsers - 1)
            }));
            
            console.log('Suspicious activity marked as resolved');
        } catch (error) {
            console.error('Failed to mark suspicious activity as resolved:', error);
            throw error;
        }
    };

    const value: IModerationContext = {
        reports,
        moderationActions,
        suspiciousActivities,
        stats,
        isAdmin,
        submitReport,
        updateReportStatus,
        performModerationAction,
        getReportsForUser,
        getModerationActionsForUser,
        getSuspiciousActivities,
        getModerationStats,
        markSuspiciousActivityResolved
    };

    return (
        <ModerationContext.Provider value={value}>
            {children}
        </ModerationContext.Provider>
    );
};
