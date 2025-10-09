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

            {/* Community Growth Banner */}
            <div className="mx-4 mt-4 mb-6">
                <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">Hey, we're just getting started!</h3>
                            <p className="text-sm leading-relaxed mb-3">
                                Create your profile, look around, and come back anytime to see who's on your ship or on others nearby!
                            </p>
                            <p className="text-sm font-medium">
                                This only makes sense if we're many, so tell your friends and help us grow this community! <span className="text-lg">💫</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Cards */}
            <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Today on Board */}
                    <div>
                        <TodayOnBoardCard />
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