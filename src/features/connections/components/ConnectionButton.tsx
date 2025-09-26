import { useState } from 'react';
import { toast } from 'react-toastify';

interface ConnectionButtonProps {
    userId: string;
    userName: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const ConnectionButton = ({ userId, userName, className = '', size = 'md' }: ConnectionButtonProps) => {
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');

    // TODO: Implement Firebase connection functionality
    const statusData = null;
    const statusLoading = false;
    const sendRequestMutation = {
        mutateAsync: async (requestData: { receiverId: string; message: string }) => {
            // TODO: Implement Firebase connection request functionality
            console.log('Sending connection request:', requestData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Connection request sent successfully!');
        }
    };

    const handleSendRequest = async () => {
        if (!message.trim()) {
            toast.warning('Please enter a message', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        try {
            await sendRequestMutation.mutateAsync({
                receiverId: userId,
                message: message.trim()
            });
            setShowMessageModal(false);
            setMessage('');
            toast.success('🎉 Connection request sent successfully!', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            toast.error(error.response?.data?.error || 'Failed to send connection request', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const getButtonConfig = () => {
        if (statusLoading) {
            return {
                text: 'Loading...',
                className: 'opacity-50 cursor-not-allowed',
                disabled: true,
                onClick: () => { }
            };
        }

        switch (statusData?.status) {
            case 'connected':
                return {
                    text: 'Connected',
                    className: 'bg-green-600 text-white cursor-not-allowed',
                    disabled: true,
                    onClick: () => { }
                };
            case 'pending':
                return {
                    text: 'Request Sent',
                    className: 'bg-yellow-500 text-white cursor-not-allowed',
                    disabled: true,
                    onClick: () => { }
                };
            case 'declined':
                return {
                    text: 'Quick Connect',
                    className: 'bg-[#069B93] hover:bg-[#058a7a] text-white',
                    disabled: false,
                    onClick: () => setShowMessageModal(true)
                };
            case 'blocked':
                return {
                    text: 'Blocked',
                    className: 'bg-red-500 text-white cursor-not-allowed',
                    disabled: true,
                    onClick: () => { }
                };
            default:
                return {
                    text: 'Quick Connect',
                    className: 'bg-[#069B93] hover:bg-[#058a7a] text-white',
                    disabled: false,
                    onClick: () => setShowMessageModal(true)
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1 text-xs';
            case 'lg':
                return 'px-6 py-3 text-base';
            default:
                return 'px-4 py-2 text-sm';
        }
    };

    const buttonConfig = getButtonConfig();

    return (
        <>
            <button
                onClick={buttonConfig.onClick}
                disabled={buttonConfig.disabled}
                className={`${getSizeClasses()} ${buttonConfig.className} ${className} rounded-lg transition-colors font-medium`}
            >
                {buttonConfig.text}
            </button>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Send Connection Request to {userName}
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hi! I'd like to connect with you..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setMessage('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendRequest}
                                disabled={sendRequestMutation.isLoading}
                                className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {sendRequestMutation.isLoading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
