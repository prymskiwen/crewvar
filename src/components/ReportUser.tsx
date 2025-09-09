import { useState } from "react";
import { useModeration } from "../context/ModerationContext";
import { IReportFormData } from "../types/moderation";

interface ReportUserProps {
    reportedUserId: string;
    reportedUserName: string;
    onClose: () => void;
}

export const ReportUser = ({ reportedUserId, reportedUserName, onClose }: ReportUserProps) => {
    const { submitReport } = useModeration();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<IReportFormData>({
        reportedUserId,
        reportType: 'spam',
        description: '',
        evidence: []
    });

    const reportTypes = [
        { value: 'spam', label: 'Spam', description: 'Sending unwanted messages or requests' },
        { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or inappropriate behavior' },
        { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive photos, messages, or profile content' },
        { value: 'fake_profile', label: 'Fake Profile', description: 'Profile appears to be fake or misleading' },
        { value: 'other', label: 'Other', description: 'Other violation of community guidelines' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim()) return;

        setIsSubmitting(true);
        
        try {
            await submitReport({
                reporterId: "current_user",
                reportedUserId: formData.reportedUserId,
                reportType: formData.reportType,
                description: formData.description.trim(),
                evidence: formData.evidence,
                priority: formData.reportType === 'harassment' ? 'high' : 'medium'
            });
            
            onClose();
            console.log(`Report submitted for ${reportedUserName}`);
        } catch (error) {
            console.error('Failed to submit report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#069B93]">
                            Report {reportedUserName}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                What is the issue?
                            </label>
                            <div className="space-y-2">
                                {reportTypes.map((type) => (
                                    <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reportType"
                                            value={type.value}
                                            checked={formData.reportType === type.value}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value as any }))}
                                            className="mt-1 w-4 h-4 text-[#069B93] border-gray-300 focus:ring-[#069B93]"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {type.label}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {type.description}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Details
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Please provide more details about the issue..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Evidence Upload (Placeholder) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Evidence (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <div className="text-gray-500 text-sm">
                                    📎 Screenshots or other evidence can be attached here
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    (Feature coming soon)
                                </div>
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">ℹ</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-900">Privacy & Safety</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Your report will be reviewed by our moderation team. 
                                        False reports may result in account restrictions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.description.trim()}
                                className="flex-1 px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
