import { useState } from "react";
// TODO: Implement Firebase privacy functionality

export const BlockedUsersManager = () => {
    // TODO: Implement Firebase privacy functionality
    const blockedUsers: any[] = [];
    const unblockUser = () => {
        // Placeholder function
    };
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

    const handleUnblock = async (blockedUserId: string) => {
        setIsLoading(prev => ({ ...prev, [blockedUserId]: true }));

        try {
            await unblockUser(blockedUserId);
            console.log(`Unblocked user ${blockedUserId}`);
        } catch (error) {
            console.error('Failed to unblock user:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, [blockedUserId]: false }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#069B93]">Blocked Users</h2>
                <p className="text-gray-600 text-sm mt-1">Manage users you've blocked from contacting you</p>
            </div>

            {blockedUsers.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚫</span>
                    </div>
                    <p className="text-gray-500 text-lg">No blocked users</p>
                    <p className="text-gray-400 text-sm mt-2">Users you block will be invisible to you and vice versa</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {blockedUsers.map((block) => (
                        <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-gray-600 font-medium">
                                            {block.blockedUserId.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">User {block.blockedUserId}</h3>
                                        <p className="text-sm text-gray-500">
                                            Blocked on {new Date(block.blockedAt).toLocaleDateString()}
                                        </p>
                                        {block.reason && (
                                            <p className="text-sm text-red-600 mt-1">
                                                Reason: {block.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUnblock(block.blockedUserId)}
                                    disabled={isLoading[block.blockedUserId]}
                                    className="px-4 py-2 text-sm text-[#069B93] border border-[#069B93] rounded-lg hover:bg-[#069B93] hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {isLoading[block.blockedUserId] ? 'Unblocking...' : 'Unblock'}
                                </button>
                            </div>

                            {block.isMutual && (
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-medium">Mutual Block:</span> Both users are invisible to each other
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Blocking Notice */}
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">⚠</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-red-900">Blocking Policy</h4>
                        <p className="text-sm text-red-700 mt-1">
                            When you block a user, they become invisible to you and you become invisible to them.
                            This is a mutual action that cannot be undone by the blocked user.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
