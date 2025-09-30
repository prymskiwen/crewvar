import { PendingRequests } from "../../components/connections/PendingRequests";
import { DashboardLayout } from "../../layout";

export const PendingRequestsPage = () => {
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Header */}
                <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div>
                                <h1 className="text-base sm:text-lg font-bold">Connection Requests</h1>
                                <p className="text-xs text-teal-100">Manage your incoming connection requests</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <PendingRequests />
                </div>
            </div>
        </DashboardLayout>
    );
};
