import { useState } from "react";
import { useModeration } from "../context/ModerationContext";
import { IReport } from "../types/moderation";

export const ModerationDashboard = () => {
    const { 
        reports, 
        suspiciousActivities, 
        stats, 
        updateReportStatus, 
        performModerationAction,
        markSuspiciousActivityResolved 
    } = useModeration();
    
    const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'suspicious' | 'actions'>('overview');
    const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
    const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

    const handleUpdateReportStatus = async (reportId: string, status: IReport['status'], resolution?: string) => {
        setIsLoading(prev => ({ ...prev, [reportId]: true }));
        
        try {
            await updateReportStatus(reportId, status, resolution);
            setSelectedReport(null);
        } catch (error) {
            console.error('Failed to update report status:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [reportId]: false }));
        }
    };

    const handlePerformAction = async (reportId: string, actionType: string, targetUserId: string, reason: string) => {
        setIsLoading(prev => ({ ...prev, [reportId]: true }));
        
        try {
            await performModerationAction({
                reportId,
                actionType: actionType as any,
                targetUserId,
                reason,
                isActive: true
            });
            setSelectedReport(null);
        } catch (error) {
            console.error('Failed to perform moderation action:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [reportId]: false }));
        }
    };

    const handleResolveSuspiciousActivity = async (activityId: string) => {
        setIsLoading(prev => ({ ...prev, [activityId]: true }));
        
        try {
            await markSuspiciousActivityResolved(activityId);
        } catch (error) {
            console.error('Failed to resolve suspicious activity:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [activityId]: false }));
        }
    };

    const getPriorityColor = (priority: IReport['priority']) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: IReport['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'under_review': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'dismissed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#069B93] mb-2">Moderation Dashboard</h1>
                    <p className="text-gray-600">Manage community safety and user reports</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'reports', label: 'Reports' },
                                { id: 'suspicious', label: 'Suspicious Activity' },
                                { id: 'actions', label: 'Actions' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-[#069B93] text-[#069B93]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                            <span className="text-red-600 text-xl">🚨</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.pendingReports}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <span className="text-orange-600 text-xl">⚠️</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Suspicious Users</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.suspiciousUsers}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 text-xl">🔒</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Active Bans</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.activeBans}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <span className="text-green-600 text-xl">✅</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Resolved Reports</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.resolvedReports}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Reports */}
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-[#069B93]">Recent Reports</h2>
                                </div>
                                <div className="p-6">
                                    {reports.slice(0, 5).map((report) => (
                                        <div key={report.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(report.priority)}`}>
                                                        {report.priority}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                                                        {report.status}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {report.reportType.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 mt-1">{report.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="px-3 py-1 text-sm text-[#069B93] border border-[#069B93] rounded-lg hover:bg-[#069B93] hover:text-white transition-colors"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-[#069B93]">All Reports</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reports.map((report) => (
                                            <tr key={report.id}>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {report.reportType.replace('_', ' ')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(report.priority)}`}>
                                                        {report.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {report.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        className="text-[#069B93] hover:text-[#058a7a] text-sm font-medium"
                                                    >
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'suspicious' && (
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-[#069B93]">Suspicious Activities</h2>
                            </div>
                            <div className="p-6">
                                {suspiciousActivities.filter(a => !a.isResolved).map((activity) => (
                                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                    activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {activity.severity}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {activity.activityType.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleResolveSuspiciousActivity(activity.id)}
                                                disabled={isLoading[activity.id]}
                                                className="px-3 py-1 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                                            >
                                                {isLoading[activity.id] ? 'Resolving...' : 'Resolve'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                                        <p className="text-xs text-gray-500">
                                            Detected: {new Date(activity.detectedAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Review Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-[#069B93]">Report Review</h3>
                                    <button
                                        onClick={() => setSelectedReport(null)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Type</label>
                                            <p className="text-sm text-gray-900">{selectedReport.reportType.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Priority</label>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                                                {selectedReport.priority}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedReport.description}</p>
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => handleUpdateReportStatus(selectedReport.id, 'resolved', 'Report reviewed and resolved')}
                                            disabled={isLoading[selectedReport.id]}
                                            className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoading[selectedReport.id] ? 'Processing...' : 'Resolve'}
                                        </button>
                                        <button
                                            onClick={() => handlePerformAction(selectedReport.id, 'warning', selectedReport.reportedUserId, 'Warning issued based on report')}
                                            disabled={isLoading[selectedReport.id]}
                                            className="px-4 py-2 text-sm text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Issue Warning
                                        </button>
                                        <button
                                            onClick={() => handlePerformAction(selectedReport.id, 'temporary_ban', selectedReport.reportedUserId, 'Temporary ban based on report')}
                                            disabled={isLoading[selectedReport.id]}
                                            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Temporary Ban
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
