import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

// Sample data for demonstration
const sampleCrewOnboard = [
    {
        id: "1",
        name: "Sarah Johnson",
        role: "Head Waiter",
        department: "Food & Beverage",
        avatar: "/src/assets/images/default-avatar.webp",
        shipName: "Royal Caribbean Symphony of the Seas"
    },
    {
        id: "2", 
        name: "Mike Chen",
        role: "Restaurant Manager",
        department: "Food & Beverage",
        avatar: "/src/assets/images/default-avatar.webp",
        shipName: "Royal Caribbean Symphony of the Seas"
    },
    {
        id: "3",
        name: "Emma Rodriguez", 
        role: "Maitre D'",
        department: "Food & Beverage",
        avatar: "/src/assets/images/default-avatar.webp",
        shipName: "Royal Caribbean Symphony of the Seas"
    }
];

const sampleCrewInPort = [
    {
        id: "4",
        name: "David Elseword",
        role: "Bartender",
        department: "Food & Beverage", 
        avatar: "/src/assets/images/default-avatar.webp",
        shipName: "Carnival Mardi Gras"
    },
    {
        id: "5",
        name: "Lisa Wang",
        role: "Chef de Cuisine",
        department: "Food & Beverage",
        avatar: "/src/assets/images/default-avatar.webp", 
        shipName: "Norwegian Encore"
    }
];

const samplePendingConnections = [
    {
        id: "6",
        name: "Alex Thompson",
        role: "Activity Host",
        department: "Entertainment",
        avatar: "/src/assets/images/default-avatar.webp",
        shipName: "Royal Caribbean Symphony of the Seas",
        requestDate: "2 hours ago"
    },
    {
        id: "7", 
        name: "Maria Garcia",
        role: "Guest Services Agent",
        department: "Guest Services",
        avatar: "/src/assets/images/default-avatar.webp",
        shipName: "Royal Caribbean Symphony of the Seas", 
        requestDate: "1 day ago"
    }
];

const DashboardCard = ({ title, count, children, onViewAll }: {
    title: string;
    count: number;
    children: React.ReactNode;
    onViewAll: () => void;
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#069B93]">{title}</h3>
                <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full">
                    {count}
                </span>
            </div>
            
            <div className="space-y-3 mb-4">
                {children}
            </div>
            
            <button
                onClick={onViewAll}
                className="w-full text-center text-[#069B93] hover:text-[#058a7a] font-medium text-sm py-2 border border-[#069B93] rounded-lg hover:bg-[#069B93] hover:text-white transition-colors"
            >
                View All
            </button>
        </div>
    );
};

const CrewMemberCard = ({ member, showRequestDate = false }: {
    member: any;
    showRequestDate?: boolean;
}) => {
    return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                <p className="text-sm text-gray-600 truncate">{member.role}</p>
                <p className="text-xs text-gray-500 truncate">{member.shipName}</p>
                {showRequestDate && (
                    <p className="text-xs text-[#069B93]">{member.requestDate}</p>
                )}
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { currentUser } = useAuth();

    const handleViewAll = (cardType: string) => {
        // In a real app, this would navigate to a full list page
        console.log(`Viewing all ${cardType}`);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <img 
                                src="/src/assets/images/logo.png" 
                                alt="ShipOhana Logo" 
                                className="h-12 w-auto"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-[#069B93]">
                                    Welcome back, {currentUser?.displayName || 'Crew Member'}!
                                </h1>
                                <p className="text-gray-600">
                                    Here's what's happening on your ship today.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Today on Board */}
                    <DashboardCard
                        title="Today on Board"
                        count={sampleCrewOnboard.length}
                        onViewAll={() => handleViewAll('onboard')}
                    >
                        {sampleCrewOnboard.slice(0, 3).map((member) => (
                            <CrewMemberCard key={member.id} member={member} />
                        ))}
                    </DashboardCard>

                    {/* Next to You in Port */}
                    <DashboardCard
                        title="Next to You in Port"
                        count={sampleCrewInPort.length}
                        onViewAll={() => handleViewAll('in-port')}
                    >
                        {sampleCrewInPort.slice(0, 3).map((member) => (
                            <CrewMemberCard key={member.id} member={member} />
                        ))}
                    </DashboardCard>

                    {/* New Connections Pending */}
                    <DashboardCard
                        title="New Connections Pending"
                        count={samplePendingConnections.length}
                        onViewAll={() => handleViewAll('pending')}
                    >
                        {samplePendingConnections.slice(0, 3).map((member) => (
                            <CrewMemberCard 
                                key={member.id} 
                                member={member} 
                                showRequestDate={true}
                            />
                        ))}
                    </DashboardCard>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-[#069B93] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#B9F3DF] transition-colors">
                            <h4 className="font-medium text-gray-900">Update Ship Location</h4>
                            <p className="text-sm text-gray-600">Confirm your current ship</p>
                        </button>
                        <Link to="/explore-ships" className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#B9F3DF] transition-colors block">
                            <h4 className="font-medium text-gray-900">Explore Ships & Categories</h4>
                            <p className="text-sm text-gray-600">Find crew on other ships and ports</p>
                        </Link>
                        <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#B9F3DF] transition-colors">
                            <h4 className="font-medium text-gray-900">My Connections</h4>
                            <p className="text-sm text-gray-600">Manage your crew connections</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
