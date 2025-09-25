import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfilePhotoUrl } from '../utils/imageUtils';
import { 
  useReports, 
  useResolveReport, 
  useFlaggedMessages, 
  useModerateMessage, 
  useRoleRequests, 
  useHandleRoleRequest 
} from '../features/admin/api/adminApi';
import { getSupportStats } from '../features/support/api/supportApi';
import { AddCruiseLineModal } from '../features/admin/components/AddCruiseLineModal';
import { AddShipModal } from '../features/admin/components/AddShipModal';
import { AddDepartmentModal } from '../features/admin/components/AddDepartmentModal';
import { AddRoleModal } from '../features/admin/components/AddRoleModal';
import { DeleteCruiseLineModal } from '../features/admin/components/DeleteCruiseLineModal';
import { DeleteShipModal } from '../features/admin/components/DeleteShipModal';
import { DeleteDepartmentModal } from '../features/admin/components/DeleteDepartmentModal';
import { DeleteRoleModal } from '../features/admin/components/DeleteRoleModal';
import { BulkMessagingModal } from '../features/admin/components/BulkMessagingModal';
import { 
  useCruiseLines,
  useDepartments
} from '../features/admin/api/dataManagementApi';
import { api } from '../app/api';
import logo from '../assets/images/Home/logo.png';

interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    unverified: number;
  };
  messages: {
    total: number;
    today: number;
  };
  connections: {
    total: number;
    pending: number;
  };
  reports: {
    total: number;
    pending: number;
  };
}

interface User {
  id: string;
  email: string;
  display_name: string;
  profile_photo: string;
  is_admin: boolean;
  is_email_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  created_at: string;
  last_login?: string;
}

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'flagged-messages' | 'role-requests' | 'data-management' | 'support' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [supportStats, setSupportStats] = useState<{
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    totalTickets: number;
    resolvedToday: number;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [supportStatsLoading, setSupportStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned' | 'unverified'>('all');
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [isReportStatusOpen, setIsReportStatusOpen] = useState(false);
  const userFilterRef = useRef<HTMLDivElement | null>(null);
  const reportStatusRef = useRef<HTMLDivElement | null>(null);
  
  // Report filters
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    page: 1,
    limit: 20
  });

  // Add Data Modal states
  const [showAddCruiseLineModal, setShowAddCruiseLineModal] = useState(false);
  const [showAddShipModal, setShowAddShipModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  // Delete Modal states
  const [showDeleteCruiseLineModal, setShowDeleteCruiseLineModal] = useState(false);
  const [showDeleteShipModal, setShowDeleteShipModal] = useState(false);
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [showBulkMessagingModal, setShowBulkMessagingModal] = useState(false);
  
  // Admin API hooks
  const { data: reportsData, isLoading: reportsLoading } = useReports(reportFilters);
  const { data: flaggedData, isLoading: flaggedLoading } = useFlaggedMessages();
  const { data: roleRequestsData, isLoading: roleRequestsLoading } = useRoleRequests();
  
  const resolveReportMutation = useResolveReport();
  const moderateMessageMutation = useModerateMessage();
  const handleRoleRequestMutation = useHandleRoleRequest();

  // Data Management hooks
  useCruiseLines();
  useDepartments();

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if user is admin (you might want to add this to the user object)
    const isAdmin = currentUser.email === 'admin@crewvar.com' || 
                   (currentUser as any).isAdmin === true;
    
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    loadAdminData();
  }, [currentUser, navigate]);

  // Close custom dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userFilterRef.current && !userFilterRef.current.contains(e.target as Node)) {
        setIsUserFilterOpen(false);
      }
      if (reportStatusRef.current && !reportStatusRef.current.contains(e.target as Node)) {
        setIsReportStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      // Load stats
      const { data: statsData } = await api.get('/admin/stats');
      setStats(statsData.stats);

      // Load support stats
      setSupportStatsLoading(true);
      try {
        const supportStatsData = await getSupportStats();
        setSupportStats(supportStatsData.stats);
      } catch (supportError) {
        console.error('Failed to load support stats:', supportError);
        // Don't fail the entire load if support stats fail
      } finally {
        setSupportStatsLoading(false);
      }

      // Load users
      const { data: usersData } = await api.get('/admin/users', { params: { limit: 50 } });
      setUsers(usersData.users);

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
      await api.post(`/admin/users/${userId}/ban`, { reason });
      
      toast.success('User banned successfully');
      loadAdminData(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to ban user: ' + err.message);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      
      toast.success('User unbanned successfully');
      loadAdminData(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to unban user: ' + err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = userFilter === 'all' ||
                         (userFilter === 'active' && user.is_active && !user.is_banned) ||
                         (userFilter === 'banned' && user.is_banned) ||
                         (userFilter === 'unverified' && !user.is_email_verified);
    
    return matchesSearch && matchesFilter;
  });

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
      {/* Mobile Header - Matching Other Pages Style */}
      <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-teal-100">Manage users, content, and system settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-teal-100 hidden sm:block">{currentUser?.email}</span>
            <Link to="/dashboard" className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors">
              <img 
                src={logo} 
                alt="Crewvar Logo" 
                className="h-5 sm:h-6 w-auto brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="px-3 sm:px-4 lg:px-8">
          <nav className="flex overflow-x-auto gap-2 py-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: '📊', shortLabel: 'Overview' },
              { id: 'users', label: 'Users', icon: '👥', shortLabel: 'Users' },
              { id: 'reports', label: 'Reports', icon: '🚨', shortLabel: 'Reports' },
              { id: 'flagged-messages', label: 'Flagged', icon: '⚠️', shortLabel: 'Flagged' },
              { id: 'role-requests', label: 'Roles', icon: '🔐', shortLabel: 'Roles' },
              { id: 'data-management', label: 'Data', icon: '📊', shortLabel: 'Data' },
              { id: 'support', label: 'Support', icon: '🎧', shortLabel: 'Support' },
              { id: 'settings', label: 'Settings', icon: '⚙️', shortLabel: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-teal-100 text-teal-800 shadow-sm'
                    : 'text-gray-600 hover:text-teal-800 hover:bg-teal-50'
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm sm:text-lg">👥</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.users.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm sm:text-lg">✅</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Active Users</p>
                      <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.users.active}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm sm:text-lg">🚫</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Banned Users</p>
                      <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.users.banned}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm sm:text-lg">💬</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Total Messages</p>
                      <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.messages.total}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowBulkMessagingModal(true)}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📧</span>
                    </div>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">Bulk Messaging</p>
                    <p className="text-xs text-gray-500">Send messages to multiple users</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">Ban, unban, and manage users</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xl">🚨</span>
                    </div>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">Handle Reports</p>
                    <p className="text-xs text-gray-500">Review and resolve reports</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500 text-center py-8">Recent activity will be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                </div>
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="relative" ref={userFilterRef}>
                    <div
                      className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-[#069B93]"
                      onClick={() => setIsUserFilterOpen((v) => !v)}
                    >
                      <div className="flex items-center justify-between min-w-[10rem]">
                        <span className="text-sm text-gray-700 capitalize">{userFilter}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isUserFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {isUserFilterOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        {(['all','active','banned','unverified'] as const).map((opt) => (
                          <div
                            key={opt}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${userFilter === opt ? 'bg-[#069B93] text-white hover:bg-[#058a7a]' : 'text-gray-700'}`}
                            onClick={() => { setUserFilter(opt); setIsUserFilterOpen(false); }}
                          >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <img
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                                src={getProfilePhotoUrl(user.profile_photo)}
                                alt={user.display_name}
                              />
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{user.display_name}</div>
                              <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                              {/* Mobile status badges */}
                              <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                  user.is_banned ? 'bg-red-100 text-red-800' : 
                                  user.is_active ? 'bg-green-100 text-green-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.is_banned ? 'Banned' : user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {!user.is_email_verified && (
                                  <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Unverified
                                  </span>
                                )}
                                {user.is_admin && (
                                  <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_banned ? 'bg-red-100 text-red-800' : 
                              user.is_active ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.is_banned ? 'Banned' : user.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {!user.is_email_verified && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Unverified
                              </span>
                            )}
                            {user.is_admin && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            {user.is_banned ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-600 hover:text-green-900 text-xs sm:text-sm"
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const reason = prompt('Ban reason:');
                                  if (reason) handleBanUser(user.id, reason);
                                }}
                                className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                              >
                                Ban
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                              className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Reports</h3>
                <p className="text-sm text-gray-500">Review and resolve user reports</p>
              </div>
              
              {/* Date and Status Filters */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={reportFilters.startDate}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={reportFilters.endDate}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative" ref={reportStatusRef}>
                      <div
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-[#069B93]"
                        onClick={() => setIsReportStatusOpen((v) => !v)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{reportFilters.status}</span>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isReportStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {isReportStatusOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          {(['all','pending','resolved','dismissed'] as const).map((opt) => (
                            <div
                              key={opt}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${reportFilters.status === opt ? 'bg-[#069B93] text-white hover:bg-[#058a7a]' : 'text-gray-700'}`}
                              onClick={() => { setReportFilters(prev => ({ ...prev, status: opt as any, page: 1 })); setIsReportStatusOpen(false); }}
                            >
                              {opt === 'all' ? 'All Status' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setReportFilters({ startDate: '', endDate: '', status: 'all', page: 1, limit: 20 })}
                      className="w-full px-4 py-2 rounded-xl text-white shadow hover:shadow-lg transition-all"
                      style={{ backgroundImage: 'linear-gradient(90deg,#069B93,#058a7a)' }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
                
                {/* Results Summary */}
                {reportsData?.pagination && (
                  <div className="mt-4 text-sm text-gray-600">
                    Showing {((reportFilters.page - 1) * reportFilters.limit) + 1} to {Math.min(reportFilters.page * reportFilters.limit, reportsData.pagination.total)} of {reportsData.pagination.total} reports
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading reports...</p>
                  </div>
                ) : reportsData?.reports?.length > 0 ? (
                  <div className="space-y-4">
                    {reportsData.reports.map((report: any) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {report.status}
                              </span>
                              <span className="text-sm text-gray-500">{report.reason}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                            <div className="text-xs text-gray-500">
                              <p>Reporter: {report.reporter_name} ({report.reporter_email})</p>
                              <p>Reported User: {report.reported_user_name} ({report.reported_user_email})</p>
                              <p>Date: {new Date(report.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => resolveReportMutation.mutate({
                                reportId: report.id,
                                status: 'resolved',
                                adminNotes: 'Resolved by admin',
                                action: 'warning',
                                targetUserId: report.reported_user_id
                              })}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => resolveReportMutation.mutate({
                                reportId: report.id,
                                status: 'dismissed',
                                adminNotes: 'Dismissed by admin',
                                action: 'none',
                                targetUserId: report.reported_user_id
                              })}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No reports found</p>
                )}
                
                {/* Pagination */}
                {reportsData?.pagination && reportsData.pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setReportFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={reportFilters.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {reportFilters.page} of {reportsData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setReportFilters(prev => ({ ...prev, page: Math.min(reportsData.pagination.totalPages, prev.page + 1) }))}
                        disabled={reportFilters.page === reportsData.pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flagged-messages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Flagged Messages</h3>
                <p className="text-sm text-gray-500">Review and moderate flagged content</p>
              </div>
              <div className="p-6">
                {flaggedLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading flagged messages...</p>
                  </div>
                ) : flaggedData?.flaggedMessages?.length > 0 ? (
                  <div className="space-y-4">
                    {flaggedData.flaggedMessages.map((flagged: any) => (
                      <div key={flagged.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                flagged.flag_type === 'spam' ? 'bg-red-100 text-red-800' :
                                flagged.flag_type === 'inappropriate' ? 'bg-orange-100 text-orange-800' :
                                flagged.flag_type === 'harassment' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {flagged.flag_type}
                              </span>
                              <span className="text-sm text-gray-500">
                                Confidence: {Math.round(flagged.confidence_score * 100)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{flagged.message_content}</p>
                            <div className="text-xs text-gray-500">
                              <p>From: {flagged.sender_name} ({flagged.sender_email})</p>
                              <p>Date: {new Date(flagged.message_created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => moderateMessageMutation.mutate({
                                messageId: flagged.message_id,
                                action: 'deleted',
                                reason: 'Inappropriate content',
                                targetUserId: flagged.sender_id
                              })}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => moderateMessageMutation.mutate({
                                messageId: flagged.message_id,
                                action: 'hidden',
                                reason: 'Hidden by moderator',
                                targetUserId: flagged.sender_id
                              })}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                            >
                              Hide
                            </button>
                            <button
                              onClick={() => moderateMessageMutation.mutate({
                                messageId: flagged.message_id,
                                action: 'none',
                                reason: 'No action needed',
                                targetUserId: flagged.sender_id
                              })}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No flagged messages found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'role-requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Role Requests</h3>
                <p className="text-sm text-gray-500">Approve or reject role change requests</p>
              </div>
              <div className="p-6">
                {roleRequestsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading role requests...</p>
                  </div>
                ) : roleRequestsData?.requests?.length > 0 ? (
                  <div className="space-y-4">
                    {roleRequestsData.requests.map((request: any) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {request.display_name || request.user_email}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{request.user_email}</p>
                            <div className="text-sm text-gray-500 mb-2">
                              <p><strong>Type:</strong> {request.request_type}</p>
                              <p><strong>Requested:</strong> {request.requested_name}</p>
                              {request.cruise_line && (
                                <p><strong>Cruise Line:</strong> {request.cruise_line}</p>
                              )}
                              <p><strong>Description:</strong> {request.description}</p>
                              <p><strong>Status:</strong> 
                                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {request.status}
                                </span>
                              </p>
                              <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                              {request.admin_notes && (
                                <p><strong>Admin Notes:</strong> {request.admin_notes}</p>
                              )}
                            </div>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleRoleRequestMutation.mutate({
                                  requestId: request.id,
                                  action: 'approve',
                                  reason: 'Approved by admin'
                                })}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                disabled={handleRoleRequestMutation.isLoading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRoleRequestMutation.mutate({
                                  requestId: request.id,
                                  action: 'reject',
                                  reason: 'Rejected by admin'
                                })}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                disabled={handleRoleRequestMutation.isLoading}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No role requests found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data-management' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cruise Line Management */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4">
                  <span className="text-white text-2xl">🚢</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cruise Line</h4>
                <p className="text-sm text-gray-600 mb-4">Manage cruise line companies</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddCruiseLineModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Cruise Line
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteCruiseLineModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Delete Cruise Line
                  </button>
                </div>

              </div>

              {/* Ship Management */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
                  <span className="text-white text-2xl">⛵</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ship</h4>
                <p className="text-sm text-gray-600 mb-4">Manage ships</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddShipModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Ship
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteShipModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Delete Ship
                  </button>
                </div>

              </div>

              {/* Department Management */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mb-4">
                  <span className="text-white text-2xl">🏢</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Department</h4>
                <p className="text-sm text-gray-600 mb-4">Manage departments</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddDepartmentModal(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Department
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteDepartmentModal(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Delete Department
                  </button>
                </div>

              </div>

              {/* Role Management */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-lg mb-4">
                  <span className="text-white text-2xl">👔</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Role</h4>
                <p className="text-sm text-gray-600 mb-4">Manage roles</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddRoleModal(true)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Add Role
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteRoleModal(true)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Delete Role
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Support Management</h3>
                  <p className="text-sm text-gray-500">Manage user support tickets and inquiries</p>
                </div>
                <button
                  onClick={() => navigate('/admin/support')}
                  className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors flex items-center space-x-2"
                >
                  <span>🎧</span>
                  <span>Manage Support</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📝</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Open Tickets</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {supportStatsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-8 rounded"></div>
                        ) : (
                          supportStats?.openTickets ?? '-'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">⏳</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">In Progress</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {supportStatsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-8 rounded"></div>
                        ) : (
                          supportStats?.inProgressTickets ?? '-'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xl">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Resolved Today</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {supportStatsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-8 rounded"></div>
                        ) : (
                          supportStats?.resolvedToday ?? '-'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate('/admin/support')}
                    className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    View All Tickets
                  </button>
                  <button
                    onClick={() => navigate('/admin/support')}
                    className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    High Priority
                  </button>
                  <button
                    onClick={() => navigate('/admin/support')}
                    className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Recent Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <p className="text-gray-500 text-center py-8">System configuration options will be available here</p>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Add Data Modals */}
      <AddCruiseLineModal 
        isOpen={showAddCruiseLineModal} 
        onClose={() => setShowAddCruiseLineModal(false)} 
      />
      <AddShipModal 
        isOpen={showAddShipModal} 
        onClose={() => setShowAddShipModal(false)} 
      />
      <AddDepartmentModal 
        isOpen={showAddDepartmentModal} 
        onClose={() => setShowAddDepartmentModal(false)} 
      />
      <AddRoleModal 
        isOpen={showAddRoleModal} 
        onClose={() => setShowAddRoleModal(false)} 
      />

      {/* Delete Modals */}
      <DeleteCruiseLineModal 
        isOpen={showDeleteCruiseLineModal} 
        onClose={() => setShowDeleteCruiseLineModal(false)} 
      />
      <DeleteShipModal 
        isOpen={showDeleteShipModal} 
        onClose={() => setShowDeleteShipModal(false)} 
      />
      <DeleteDepartmentModal 
        isOpen={showDeleteDepartmentModal} 
        onClose={() => setShowDeleteDepartmentModal(false)} 
      />
      <DeleteRoleModal 
        isOpen={showDeleteRoleModal} 
        onClose={() => setShowDeleteRoleModal(false)} 
      />
      
      <BulkMessagingModal 
        isOpen={showBulkMessagingModal} 
        onClose={() => setShowBulkMessagingModal(false)} 
      />
    </div>
  );
};
