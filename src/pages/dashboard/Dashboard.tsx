import { ConnectionPendingCard } from './ConnectionPendingCard';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { TodayOnBoardCard } from './TodayOnBoardCard';
import { WhosInPortCard } from './WhosInPortCard';

const Dashboard = () => {
    return (
        <DashboardLayout>
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">Dashboard</h1>
                            <p className="text-xs text-teal-100">Manage your profile and connections</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Cards */}
            <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Today on Board */}
                    <div>
                        <TodayOnBoardCard onConnectClick={() => console.log('Connect clicked')} />
                    </div>

                    {/* Who's in Your Port */}
                    <div>
                        <WhosInPortCard />
                    </div>

                    {/* New Connections Pending */}
                    <div>
                        <ConnectionPendingCard />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;