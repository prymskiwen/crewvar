import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextFirebase';
import { useQuery } from '@tanstack/react-query';
import { getReceivedConnectionRequests } from '../firebase/firestore';
import {
    HiLocationMarker,
    HiChat,
    HiBell,
    HiX,
    HiShieldCheck,
    HiHome,
    HiHeart,
    HiSearch,
    HiUserAdd,
} from 'react-icons/hi';

const DashboardSidebar = ({ isOpen, onToggle, setShowCheckInDialog }: {
    isOpen: boolean;
    onToggle: () => void;
    setShowCheckInDialog: (show: boolean) => void;
}) => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const isAdmin = !!currentUser && (
        currentUser.email === 'admin@crewvar.com' || (currentUser as any).isAdmin === true
    );

    // Fetch pending connection requests count
    const { data: pendingRequests = [] } = useQuery({
        queryKey: ['receivedConnectionRequests', currentUser?.uid],
        queryFn: () => getReceivedConnectionRequests(currentUser!.uid),
        enabled: !!currentUser?.uid
    });

    const sidebarClasses = `
        fixed top-0 left-0 h-full bg-gradient-to-b from-[#069B93] to-[#058a7a] text-white z-[9999] transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        w-72 lg:w-80
        shadow-2xl lg:shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    const menuItems = [
        { name: 'Dashboard', icon: HiHome, path: '/dashboard' },
        { name: 'Update Location', icon: HiLocationMarker, path: '/ship-location' },
        { name: 'Discover Crew', icon: HiSearch, path: '/explore-ships' },
        { name: 'Connection Requests', icon: HiUserAdd, path: '/connections/pending' },
        { name: 'Messages', icon: HiChat, path: '/chat' },
        { name: 'Notifications', icon: HiBell, path: '/all-notifications' },
        { name: 'Favorites', icon: HiHeart, path: '/favorites' },
        // Admin link (only visible to admins)
        ...(isAdmin ? [{ name: 'Admin Panel', icon: HiShieldCheck, path: '/admin' }] : []),
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998] lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={sidebarClasses}>
                {/* Header */}
                <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Crewvar</h2>
                                <p className="text-white/70 text-sm">Crew Connect</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggle}
                            className="lg:hidden text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-4">
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;

                            // Special handling for Update Location - show QuickCheckIn dialog
                            if (item.name === 'Update Location') {
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            setShowCheckInDialog(true);
                                            // Close sidebar on mobile after action
                                            if (window.innerWidth < 1024) {
                                                onToggle();
                                            }
                                        }}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left group ${isActive
                                            ? 'bg-white/20 text-white shadow-lg'
                                            : 'text-white/90 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                );
                            }

                            // Regular navigation items
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-white/20 text-white shadow-lg'
                                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                                        }`}
                                    onClick={() => {
                                        // Close sidebar on mobile after navigation
                                        if (window.innerWidth < 1024) {
                                            onToggle();
                                        }
                                    }}
                                >
                                    <div className="relative">
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                                        {/* Show badge for Connection Requests if there are pending requests */}
                                        {item.name === 'Connection Requests' && pendingRequests.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                {pendingRequests.length}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
                    <div className="text-center">
                        <p className="text-white/60 text-xs">
                            © 2024 Crewvar
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                            Connect with your crew
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardSidebar;