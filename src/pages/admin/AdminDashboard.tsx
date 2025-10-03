import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextFirebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUsers, banUser, unbanUser, User, getAdminStats, AdminStats, getSupportStats, SupportStats } from '../../firebase/firestore';
import {
  BulkMessagingModal,
  AdminAppBar,
  OverviewTab,
  UsersTab,
  ReportsTab,
  DataManagementTab,
  SupportTab,
  SettingsTab
} from '../../components/admin';

export const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'data-management' | 'support' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [supportStats, setSupportStats] = useState<SupportStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [supportStatsLoading, setSupportStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkMessagingModal, setShowBulkMessagingModal] = useState(false);

  // Load admin data when component mounts
  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load stats
      const statsData = await getAdminStats();
      setStats(statsData);

      // Load support stats
      setSupportStatsLoading(true);
      try {
        const supportStatsData = await getSupportStats();
        setSupportStats(supportStatsData);
      } catch (supportError) {
        console.error('Failed to load support stats:', supportError);
        // Don't fail the entire load if support stats fail
      } finally {
        setSupportStatsLoading(false);
      }

      // Load users
      const usersData = await getUsers(50);
      console.log('Loaded users:', usersData);
      setUsers(usersData);

    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err.message);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      await banUser(userId, reason);

      toast.success('User banned successfully');
      loadAdminData(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to ban user: ' + err.message);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);

      toast.success('User unbanned successfully');
      loadAdminData(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to unban user: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleTabChange = (tab: 'overview' | 'users' | 'reports' | 'data-management' | 'support' | 'settings') => {
    setActiveTab(tab);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl text-white shadow hover:shadow-lg transition-all"
            style={{ backgroundImage: 'linear-gradient(90deg,#069B93,#058a7a)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AdminAppBar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            {activeTab === 'overview' && (
              <OverviewTab
                stats={stats}
                supportStats={supportStats}
                supportStatsLoading={supportStatsLoading}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab
                users={users}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onBanUser={handleBanUser}
                onUnbanUser={handleUnbanUser}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab />
            )}

            {activeTab === 'data-management' && (
              <DataManagementTab />
            )}

            {activeTab === 'support' && (
              <SupportTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>
      </div>

      <BulkMessagingModal
        isOpen={showBulkMessagingModal}
        onClose={() => setShowBulkMessagingModal(false)}
      />
    </div>
  );
};
