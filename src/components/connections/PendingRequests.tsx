import { useState } from 'react';
import { toast } from 'react-toastify';

// TODO: Import from utils when module resolution is fixed
const getProfilePhotoUrl = (profilePhoto?: string, _userId?: string): string => {
    if (profilePhoto && profilePhoto.trim() !== '') {
        return profilePhoto;
    }
    return '/default-avatar.webp';
};

export const PendingRequests = () => {
    // TODO: Implement Firebase connections functionality
    const pendingData = { requests: [] as any[] };
    const isLoading = false;
    const error = null;
    const [isResponding, setIsResponding] = useState(false);
    const respondToRequest = {
        mutateAsync: async (requestData: { requestId: string; action: 'accept' | 'decline' }) => {
            // TODO: Implement Firebase connection request response functionality
            console.log('Responding to connection request:', requestData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Connection request ${requestData.action}ed successfully!`);
        },
        isLoading: isResponding
    };

    const requests = pendingData.requests;

    const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
        try {
            setIsResponding(true);
            await respondToRequest.mutateAsync({ requestId, action });

            // Find the request to get the user's name for the notification
            const request = requests.find((req: any) => req.id === requestId);
            const userName = request?.display_name || 'User';

            if (action === 'accept') {
                toast.success(`🎉 Connection accepted! You're now connected with ${userName}`, {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: {
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0'
                    }
                });
            } else {
                toast.info(`Connection request from ${userName} has been declined`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: {
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd'
                    }
                });
            }
        } catch (error: any) {
            console.error(`Failed to ${action} connection request:`, error);
            toast.error(error.response?.data?.error || `Failed to ${action} connection request. Please try again.`, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca'
                }
            });
        } finally {
            setIsResponding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
                <p className="text-gray-600">Failed to load pending connection requests.</p>
            </div>
        );
    }


    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">You don't have any pending connection requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request: any) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start space-x-4">
                        <img
                            src={getProfilePhotoUrl(request.profile_photo)}
                            alt={request.display_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{request.display_name}</h3>
                                    <p className="text-sm text-gray-600">{request.role_name} • {request.department_name}</p>
                                    <p className="text-xs text-gray-500">{request.ship_name} • {request.cruise_line_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {request.message && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                                </div>
                            )}

                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={() => handleRespondToRequest(request.id, 'accept')}
                                    disabled={respondToRequest.isLoading}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {respondToRequest.isLoading ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                    onClick={() => handleRespondToRequest(request.id, 'decline')}
                                    disabled={respondToRequest.isLoading}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {respondToRequest.isLoading ? 'Processing...' : 'Decline'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
