import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';

interface BulkMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkMessagingModal: React.FC<BulkMessagingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'select' | 'compose'>('select');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // TODO: Implement Firebase admin messaging functionality
  const sendBulkMessageMutation = {
    mutateAsync: async (messageData: { subject: string; message: string; targetUsers: string[] }) => {
      // TODO: Implement Firebase bulk messaging functionality
      console.log('Sending bulk message:', messageData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bulk message sent successfully!');
    }
  };
  const usersData = null;
  const isLoading = false;

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((user: any) =>
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.ship_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.cruise_line_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user: any) => user.id));
    }
  };

  const handleNext = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to send a message to.');
      return;
    }
    setStep('compose');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    try {
      await sendBulkMessageMutation.mutateAsync({
        userIds: selectedUsers,
        message: message.trim(),
        subject: subject.trim() || undefined
      });

      // Reset form
      setSelectedUsers([]);
      setMessage('');
      setSubject('');
      setStep('select');
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setMessage('');
    setSubject('');
    setSearchQuery('');
    setCurrentPage(1);
    setStep('select');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-600">
              {step === 'select' ? 'Select Users' : 'Compose Message'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === 'compose' ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === 'compose' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
              2
            </div>
          </div>

          {step === 'select' ? (
            <div className="space-y-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search users by name, email, department, role, ship, or cruise line..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Selection summary */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedUsers.length} user(s) selected
                </div>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Users list */}
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No users found</div>
                ) : (
                  filteredUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {user.display_name || user.email || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {[user.department_name, user.role_name, user.ship_name, user.cruise_line_name]
                              .filter(Boolean)
                              .join(' • ') || 'No details available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={selectedUsers.length === 0}
                >
                  Next ({selectedUsers.length} selected)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Back button */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div className="text-sm text-gray-500">
                  Sending to {selectedUsers.length} user(s)
                </div>
              </div>

              {/* Message composition */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (optional):
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message: *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={1000}
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {message.length}/1000 characters
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={!message.trim() || sendBulkMessageMutation.isLoading}
                >
                  {sendBulkMessageMutation.isLoading ? 'Sending...' : `Send to ${selectedUsers.length} user(s)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
