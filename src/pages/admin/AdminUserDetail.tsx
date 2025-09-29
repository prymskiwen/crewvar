import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../context/AuthContextFirebase';
// Removed old API import - now using Firebase
import { getProfilePhotoUrl } from '../../utils/images';

// Placeholder Firebase functions - to be implemented
const getUserDetails = async (userId: string): Promise<UserDetails> => {
  // TODO: Implement with Firebase Firestore
  console.log('Get user details for:', userId);
  return {
    id: userId,
    email: '',
    display_name: '',
    profile_photo: '',
    bio: '',
    phone: '',
    instagram: '',
    twitter: '',
    facebook: '',
    snapchat: '',
    website: '',
    department_name: '',
    role_name: '',
    ship_name: '',
    is_admin: false,
    is_super_admin: false,
    is_email_verified: false,
    is_active: true,
    is_banned: false,
    ban_reason: '',
    created_at: '',
    updated_at: ''
  };
};

const banUser = async (userId: string, reason: string): Promise<void> => {
  // TODO: Implement with Firebase Firestore
  console.log('Ban user:', userId, 'Reason:', reason);
};

const unbanUser = async (userId: string): Promise<void> => {
  // TODO: Implement with Firebase Firestore
  console.log('Unban user:', userId);
};

const deleteUser = async (userId: string, reason: string): Promise<void> => {
  // TODO: Implement with Firebase Firestore
  console.log('Delete user:', userId, 'Reason:', reason);
};

interface UserDetails {
  id: string;
  email: string;
  display_name: string;
  profile_photo: string;
  bio?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
  website?: string;
  department_name?: string;
  role_name?: string;
  ship_name?: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_email_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  ban_expires_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  delete_reason?: string;
  last_login?: string;
}

export const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userId) {
      loadUserDetails();
    }
  }, [userId, currentUser, navigate]);

  const loadUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        setError('User ID is required');
        return;
      }
      const data = await getUserDetails(userId);
      setUser(data);
    } catch (err: any) {
      console.error('Failed to load user details:', err);
      setError(err.message);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    if (!userId) {
      toast.error('User ID is required');
      return;
    }
    setActionLoading(true);
    try {
      await banUser(userId, reason);

      toast.success('User banned successfully');
      loadUserDetails(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to ban user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }
    setActionLoading(true);
    try {
      await unbanUser(userId);

      toast.success('User unbanned successfully');
      loadUserDetails(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to unban user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const reason = prompt('Enter deletion reason:');
    if (!reason) return;

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    if (!userId) {
      toast.error('User ID is required');
      return;
    }
    setActionLoading(true);
    try {
      await deleteUser(userId, reason);

      toast.success('User deleted successfully');
      navigate('/admin');
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                <p className="text-gray-600">{user.display_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin: {currentUser?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  <img
                    className="h-24 w-24 rounded-full"
                    src={getProfilePhotoUrl(user.profile_photo)}
                    alt={user.display_name}
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{user.display_name}</h4>
                    <p className="text-gray-600">{user.email}</p>
                    {user.bio && (
                      <p className="text-gray-700 mt-2">{user.bio}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</h5>
                    <div className="mt-2 space-y-2">
                      {user.phone && (
                        <p className="text-sm text-gray-900">📞 {user.phone}</p>
                      )}
                      {user.website && (
                        <p className="text-sm text-gray-900">🌐 {user.website}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Social Media</h5>
                    <div className="mt-2 space-y-2">
                      {user.instagram && (
                        <p className="text-sm text-gray-900">📷 Instagram: {user.instagram}</p>
                      )}
                      {user.twitter && (
                        <p className="text-sm text-gray-900">🐦 Twitter: {user.twitter}</p>
                      )}
                      {user.facebook && (
                        <p className="text-sm text-gray-900">📘 Facebook: {user.facebook}</p>
                      )}
                      {user.snapchat && (
                        <p className="text-sm text-gray-900">👻 Snapchat: {user.snapchat}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</h5>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_banned ? 'bg-red-100 text-red-800' :
                          user.is_active ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {user.is_banned ? 'Banned' : user.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {user.is_admin && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                        {user.is_super_admin && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Super Admin
                          </span>
                        )}
                      </div>
                      {!user.is_email_verified && (
                        <p className="text-sm text-yellow-600">⚠️ Email not verified</p>
                      )}
                      {user.is_banned && user.ban_reason && (
                        <p className="text-sm text-red-600">🚫 Ban reason: {user.ban_reason}</p>
                      )}
                      {user.is_banned && user.ban_expires_at && (
                        <p className="text-sm text-red-600">⏰ Ban expires: {new Date(user.ban_expires_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timestamps</h5>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900">📅 Created: {new Date(user.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-900">🔄 Updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                      {user.last_login && (
                        <p className="text-sm text-gray-900">🔐 Last login: {new Date(user.last_login).toLocaleDateString()}</p>
                      )}
                      {user.deleted_at && (
                        <p className="text-sm text-red-600">🗑️ Deleted: {new Date(user.deleted_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                {user.is_banned ? (
                  <button
                    onClick={handleUnbanUser}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Unban User'}
                  </button>
                ) : (
                  <button
                    onClick={handleBanUser}
                    disabled={actionLoading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Ban User'}
                  </button>
                )}

                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Delete User'}
                </button>

                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Public Profile
                </button>

                <button
                  onClick={() => navigate(`/chat/${user.id}`)}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account Age</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email Verified</span>
                    <span className={`text-sm font-medium ${user.is_email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.is_email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Admin Status</span>
                    <span className={`text-sm font-medium ${user.is_admin ? 'text-blue-600' : 'text-gray-600'}`}>
                      {user.is_admin ? 'Admin' : 'Regular User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
