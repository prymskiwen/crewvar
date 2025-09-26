import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

const REPORT_REASONS = [
  'Inappropriate behavior',
  'Harassment',
  'Spam',
  'Fake profile',
  'Inappropriate content',
  'Other'
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Implement Firebase report functionality
  const submitReportMutation = {
    mutateAsync: async (reportData: { reportedUserId: string; reason: string; description: string }) => {
      // TODO: Implement Firebase report functionality
      console.log('Submitting report:', reportData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Report submitted successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason || !description.trim()) {
      toast.error('Please select a reason and provide a description');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReportMutation.mutateAsync({
        reportedUserId,
        reason,
        description: description.trim()
      });

      toast.success('Report submitted successfully');
      onClose();
      setReason('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Report User
          </h2>

          <p className="text-gray-600 mb-4">
            You are reporting <span className="font-semibold">{reportedUserName}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((reportReason) => (
                  <option key={reportReason} value={reportReason}>
                    {reportReason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
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
